import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { validateFileMagicBytes } from '@/lib/serverFileValidation';

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

    const galleryUploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
    const videoUploadDir = path.join(galleryUploadDir, 'videos');

    if (!fs.existsSync(galleryUploadDir)) fs.mkdirSync(galleryUploadDir, { recursive: true });
    if (!fs.existsSync(videoUploadDir)) fs.mkdirSync(videoUploadDir, { recursive: true });

    // Handle Photo upload / Poster image
    if (photoFile && photoFile.size > 0) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const magicCheck = validateFileMagicBytes(buffer, photoFile.name, ['image/jpeg', 'image/png', 'image/webp']);
      
      if (!magicCheck.isValid) {
        return NextResponse.json({ error: magicCheck.error || 'Invalid image signature.' }, { status: 400 });
      }

      const timestamp = Date.now();
      const fileName = `img_${timestamp}_${magicCheck.sanitizedFilename}`;
      const filePath = path.join(galleryUploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      imageUrl = `/uploads/gallery/${fileName}`;
    }

    // Handle Video Media
    if (mediaType === 'VIDEO') {
      if (videoFile && videoFile.size > 0) {
        // Uploaded video file
        const timestamp = Date.now();
        const cleanFileName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `vid_${timestamp}_${cleanFileName}`;
        const filePath = path.join(videoUploadDir, fileName);

        const buffer = Buffer.from(await videoFile.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        videoUrl = `/uploads/gallery/videos/${fileName}`;
      } else if (videoLink && videoLink.trim()) {
        // Video URL (YouTube, Vimeo, direct MP4)
        videoUrl = videoLink.trim();
      } else {
        return NextResponse.json({ 
          error: 'Please upload a video file or provide a video link (YouTube/MP4).' 
        }, { status: 400 });
      }
    } else {
      // Photo media
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
      item: galleryItem,
      message: `${mediaType === 'VIDEO' ? 'Video' : 'Photo'} published successfully to school gallery!`
    });
  } catch (error) {
    console.error('Error uploading gallery item:', error);
    return NextResponse.json({ error: 'Failed to upload media to gallery' }, { status: 500 });
  }
}

// DELETE: Admin remove photo or video from gallery
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }

    const item = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    // Delete record from database
    await prisma.galleryItem.delete({
      where: { id },
    });

    // Remove local image file if present
    try {
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        const fullLocalPath = path.join(process.cwd(), 'public', item.imageUrl.replace(/^\//, ''));
        if (fs.existsSync(fullLocalPath)) fs.unlinkSync(fullLocalPath);
      }
    } catch (fsErr) {
      console.warn('Could not delete image file from disk:', fsErr);
    }

    // Remove local video file if present
    try {
      if (item.videoUrl && item.videoUrl.startsWith('/uploads/')) {
        const fullLocalPath = path.join(process.cwd(), 'public', item.videoUrl.replace(/^\//, ''));
        if (fs.existsSync(fullLocalPath)) fs.unlinkSync(fullLocalPath);
      }
    } catch (fsErr) {
      console.warn('Could not delete video file from disk:', fsErr);
    }

    return NextResponse.json({ success: true, message: 'Media item deleted from gallery' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}
