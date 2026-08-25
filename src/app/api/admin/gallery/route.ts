import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { validateFileMagicBytes } from '@/lib/serverFileValidation';
import { saveUploadedFile } from '@/lib/uploadHelper';

export const dynamic = 'force-dynamic';

// GET: Fetch all gallery items
export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery items' }, { status: 500 });
  }
}

// POST: Admin upload new photo or video to gallery
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const category = (formData.get('category') as string) || 'Campus Events';
    const description = (formData.get('description') as string) || '';
    const mediaType = (formData.get('mediaType') as string) || 'PHOTO'; // 'PHOTO' | 'VIDEO'
    const videoLink = formData.get('videoLink') as string || '';
    const photoFile = formData.get('photo') as File | null;
    const videoFile = formData.get('video') as File | null;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    let imageUrl = '/hero-bg.jpg';
    let videoUrl: string | null = null;

    // Handle Photo upload / Poster image
    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const magicCheck = validateFileMagicBytes(buffer, photoFile.name, ['image/jpeg', 'image/png', 'image/webp']);
      
      if (!magicCheck.isValid) {
        return NextResponse.json({ error: magicCheck.error || 'Invalid image signature.' }, { status: 400 });
      }

      imageUrl = await saveUploadedFile(
        buffer,
        photoFile.name,
        'gallery',
        photoFile.type || 'image/jpeg'
      );
    }

    // Handle Video Media
    if (mediaType === 'VIDEO') {
      if (videoFile && videoFile.size > 0) {
        const buffer = Buffer.from(await videoFile.arrayBuffer());
        videoUrl = await saveUploadedFile(
          buffer,
          videoFile.name,
          'gallery/videos',
          videoFile.type || 'video/mp4'
        );
      } else if (videoLink && videoLink.trim()) {
        videoUrl = videoLink.trim();
      } else {
        return NextResponse.json({ 
          error: 'Please upload a video file or provide a video link (YouTube/MP4).' 
        }, { status: 400 });
      }
    } else {
      if (!photoFile || photoFile.size === 0) {
        return NextResponse.json({ error: 'Please choose an image file to upload.' }, { status: 400 });
      }
    }

    // Create database record
    const galleryItem = await prisma.galleryItem.create({
      data: {
        title: title.trim(),
        category: category.trim(),
        description: description.trim() || null,
        mediaType: mediaType === 'VIDEO' ? 'VIDEO' : 'PHOTO',
        imageUrl,
        videoUrl,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `${mediaType === 'VIDEO' ? 'Video' : 'Photo'} published to website gallery successfully!`,
      item: galleryItem 
    });
  } catch (error: any) {
    console.error('Error uploading gallery item:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media to gallery' }, { status: 500 });
  }
}

// DELETE: Remove gallery item
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing gallery item ID' }, { status: 400 });
    }

    await prisma.galleryItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Gallery item deleted successfully.' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
