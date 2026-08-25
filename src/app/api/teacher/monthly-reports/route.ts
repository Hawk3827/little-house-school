import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'TEACHER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const studentId = formData.get('studentId') as string;
    const month = formData.get('month') as string;
    const totalDays = parseInt(formData.get('totalDays') as string || '0', 10);
    const daysPresent = parseInt(formData.get('daysPresent') as string || '0', 10);
    const daysAbsent = parseInt(formData.get('daysAbsent') as string || '0', 10);
    const conduct = (formData.get('conduct') as string) || null;
    const remarks = (formData.get('remarks') as string) || null;
    const file = formData.get('file') as File | null;

    if (!studentId || !month) {
      return NextResponse.json({ error: 'Student ID and Month are required.' }, { status: 400 });
    }

    if (daysPresent + daysAbsent > totalDays && totalDays > 0) {
      return NextResponse.json(
        { error: 'Days present and absent combined cannot exceed total working days.' },
        { status: 400 }
      );
    }

    // If teacher, verify authorization for this student's class
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
          { error: 'You are only authorized to submit reports for students in your assigned classes.' },
          { status: 403 }
        );
      }
    }

    // Check existing report for previous attachment
    const existingReport = await prisma.monthlyReport.findUnique({
      where: {
        studentId_month: {
          studentId,
          month
        }
      }
    });

    let attachmentUrl = existingReport?.attachmentUrl || null;
    let attachmentName = existingReport?.attachmentName || null;

    // Handle file upload if provided
    if (file && file.size > 0) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(file.name) || '.pdf';
        const sanitizedFilename = `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'reports', sanitizedFilename);
        
        await writeFile(uploadPath, buffer);
        attachmentUrl = `/uploads/reports/${sanitizedFilename}`;
        attachmentName = file.name;
      } catch (uploadErr) {
        console.error('Report file upload error:', uploadErr);
      }
    }

    // Upsert the monthly report
    const report = await prisma.monthlyReport.upsert({
      where: {
        studentId_month: {
          studentId,
          month
        }
      },
      update: {
        totalDays,
        daysPresent,
        daysAbsent,
        conduct,
        remarks,
        attachmentUrl,
        attachmentName,
        uploadedById: session.userId,
      },
      create: {
        studentId,
        month,
        totalDays,
        daysPresent,
        daysAbsent,
        conduct,
        remarks,
        attachmentUrl,
        attachmentName,
        uploadedById: session.userId,
      },
      include: {
        uploadedBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error('Monthly report upload error:', error);
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
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required.' }, { status: 400 });
    }

    const report = await prisma.monthlyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
    }

    // If teacher, check if authorized
    if (session.role === 'TEACHER' && report.uploadedById !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this report.' }, { status: 403 });
    }

    // Delete attached file if present
    if (report.attachmentUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', report.attachmentUrl);
        await unlink(filePath).catch(() => {});
      } catch (e) {
        // Ignore file delete errors
      }
    }

    await prisma.monthlyReport.delete({
      where: { id: reportId }
    });

    return NextResponse.json({ success: true, message: 'Monthly report deleted successfully.' });
  } catch (error: any) {
    console.error('Delete monthly report error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
