import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { validateFileMagicBytes } from '@/lib/serverFileValidation';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'TEACHER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const studentId = formData.get('studentId') as string;
    const title = formData.get('title') as string;
    const type = (formData.get('type') as string) || 'PHOTO'; // "PHOTO" | "DOCUMENT"
    const remarks = (formData.get('remarks') as string) || null;
    const file = formData.get('file') as File | null;

    if (!studentId || !title || !file || file.size === 0) {
      return NextResponse.json(
        { error: 'Student, Title, and a valid File are required.' },
        { status: 400 }
      );
    }

    // Verify teacher authorization for the student's class
    if (session.role === 'TEACHER') {
      const authorizedClass = await prisma.class.findFirst({
        where: {
          teacherId: session.userId,
          enrollments: {
            some: { studentId }
          }
        }
      });

      if (!authorizedClass) {
        return NextResponse.json(
          { error: 'You are only authorized to upload activities for students in your assigned classes.' },
          { status: 403 }
        );
      }
    }

    // Save uploaded file with strict binary magic-byte inspection
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const magicCheck = validateFileMagicBytes(
      buffer,
      file.name,
      type === 'PHOTO' ? ['image/jpeg', 'image/png', 'image/webp'] : ['application/pdf', 'image/jpeg', 'image/png']
    );

    if (!magicCheck.isValid) {
      return NextResponse.json({ error: magicCheck.error || 'Invalid file signature.' }, { status: 400 });
    }

    const sanitizedFilename = `activity-${Date.now()}-${Math.random().toString(36).substring(2, 7)}_${magicCheck.sanitizedFilename}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'activities', sanitizedFilename);

    await writeFile(uploadPath, buffer);
    const fileUrl = `/uploads/activities/${sanitizedFilename}`;

    const activityDoc = await prisma.studentActivityDocument.create({
      data: {
        studentId,
        title,
        type,
        fileUrl,
        fileName: file.name,
        fileType: file.type || magicCheck.mimeType || 'application/octet-stream',
        remarks,
        uploadedById: session.userId,
      },
      include: {
        uploadedBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, activityDoc });
  } catch (error: any) {
    console.error('Activity upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'TEACHER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('id');

    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
    }

    const doc = await prisma.studentActivityDocument.findUnique({
      where: { id: docId }
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    if (session.role === 'TEACHER' && doc.uploadedById !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this record.' }, { status: 403 });
    }

    // Remove file from disk
    if (doc.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', doc.fileUrl);
        await unlink(filePath).catch(() => {});
      } catch (e) {
        // ignore
      }
    }

    await prisma.studentActivityDocument.delete({
      where: { id: docId }
    });

    return NextResponse.json({ success: true, message: 'Record deleted successfully.' });
  } catch (error: any) {
    console.error('Delete activity error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
