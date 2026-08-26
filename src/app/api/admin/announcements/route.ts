import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { sanitizeText, sanitizeHtml } from '@/lib/sanitize';
import { validateFileMagicBytes } from '@/lib/serverFileValidation';
import { saveUploadedFile } from '@/lib/uploadHelper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const audience = searchParams.get('audience');
    const tickerOnly = searchParams.get('tickerOnly') === 'true';

    const where: any = {};
    if (audience && audience !== 'ALL') {
      where.OR = [
        { audience: 'ALL' },
        { audience: audience }
      ];
    }
    if (tickerOnly) {
      where.isTicker = true;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Fetch announcements error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    
    let title = '';
    let content = '';
    let audience = 'ALL';
    let classId: string | null = null;
    let isTicker = true;
    let isPinned = false;
    let imageUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') as string)?.trim();
      content = (formData.get('content') as string)?.trim();
      audience = (formData.get('audience') as string) || 'ALL';
      classId = (formData.get('classId') as string) || null;
      isTicker = formData.get('isTicker') !== 'false';
      isPinned = formData.get('isPinned') === 'true';
      
      const photoFile = formData.get('photo') as File | null;
      if (photoFile && photoFile.size > 0) {
        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const magicCheck = validateFileMagicBytes(buffer, photoFile.name, ['image/jpeg', 'image/png', 'image/webp']);
        
        if (!magicCheck.isValid) {
          return NextResponse.json({ error: magicCheck.error || 'Invalid notice image signature.' }, { status: 400 });
        }

        imageUrl = await saveUploadedFile(
          buffer,
          photoFile.name,
          'notices',
          photoFile.type || 'image/jpeg'
        );
      }
    } else {
      const body = await request.json();
      title = body.title?.trim();
      content = body.content?.trim();
      audience = body.audience || 'ALL';
      classId = body.classId || null;
      isTicker = body.isTicker ?? true;
      isPinned = body.isPinned ?? false;
      imageUrl = body.imageUrl || null;
    }

    // XSS Sanitization
    title = sanitizeText(title);
    content = sanitizeHtml(content);

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required.' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        audience,
        classId: classId || null,
        imageUrl,
        isTicker,
        isPinned,
        createdById: session.userId,
      },
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// PATCH: 1-Click Pin / Unpin or edit ticker status
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id, isPinned, isTicker } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required.' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (typeof isPinned === 'boolean') dataToUpdate.isPinned = isPinned;
    if (typeof isTicker === 'boolean') dataToUpdate.isTicker = isTicker;

    const updated = await prisma.announcement.update({
      where: { id },
      data: dataToUpdate,
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    console.error('Update announcement error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update announcement.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required.' }, { status: 400 });
    }

    const existing = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Announcement not found.' }, { status: 404 });
    }

    // Clean up photo file if exists on disk
    if (existing.imageUrl && existing.imageUrl.startsWith('/uploads/notices/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existing.imageUrl);
        await unlink(filePath);
      } catch (err) {
        console.warn('Could not delete notice photo file from disk:', err);
      }
    }

    await prisma.announcement.delete({
      where: { id }
    });

    try {
      await prisma.adminAuditLog.create({
        data: {
          adminEmail: session.email || 'admin@school.com',
          adminName: session.name || session.email || 'Admin Staff',
          actionType: 'DELETE',
          category: 'ANNOUNCEMENT',
          targetName: `Notice: ${existing.title}`,
          description: `Deleted notice circular "${existing.title}"`,
        },
      });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement.' }, { status: 500 });
  }
}
