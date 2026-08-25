import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { saveUploadedFile } from '@/lib/uploadHelper';

// GET all teachers
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: {
        profile: {
          include: {
            taughtClasses: true,
            uploadedReports: true,
            uploadedActivityDocs: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, teachers });
  } catch (error: any) {
    console.error('Fetch teachers error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST create new teacher
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = (formData.get('phone') as string) || '';
    const address = (formData.get('address') as string) || '';
    const classId = formData.get('classId') as string; // Optional class assignment
    const photo = formData.get('photo') as File | null;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, Email, and Password are required fields.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 });
    }

    // Save photo if provided
    let photoUrl: string | null = null;
    if (photo && photo.size > 0) {
      try {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        photoUrl = await saveUploadedFile(
          buffer,
          photo.name,
          'avatars',
          photo.type || 'image/jpeg'
        );
      } catch (uploadErr) {
        console.error('Teacher photo save error:', uploadErr);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User & Profile
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'TEACHER',
        profile: {
          create: {
            name: name.trim(),
            phone: phone.trim() || null,
            address: address.trim() || null,
            photoUrl: photoUrl,
          }
        }
      },
      include: {
        profile: true
      }
    });

    // If classId is provided, assign teacher to class
    if (classId && classId !== 'none') {
      await prisma.class.update({
        where: { id: classId },
        data: { teacherId: newUser.id }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Teacher account created successfully.',
      teacher: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.profile?.name,
        phone: newUser.profile?.phone,
        address: newUser.profile?.address,
        photoUrl: newUser.profile?.photoUrl,
      }
    });
  } catch (error: any) {
    console.error('Create teacher error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PUT update teacher
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = (formData.get('phone') as string) || '';
    const address = (formData.get('address') as string) || '';
    const classId = formData.get('classId') as string; // 'none' or specific class ID or empty
    const photo = formData.get('photo') as File | null;

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, Name, and Email are required.' }, { status: 400 });
    }

    const teacherUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!teacherUser || teacherUser.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness if changed
    if (normalizedEmail !== teacherUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already in use by another account.' }, { status: 400 });
      }
    }

    // Process photo if new one uploaded
    let photoUrl = teacherUser.profile?.photoUrl;
    if (photo && photo.size > 0) {
      try {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(photo.name) || '.jpg';
        const filename = `teacher-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
        await writeFile(uploadPath, buffer);
        photoUrl = `/uploads/${filename}`;
      } catch (uploadErr) {
        console.error('Teacher photo update error:', uploadErr);
      }
    }

    // Prepare User update data
    const userUpdateData: any = {
      email: normalizedEmail,
    };

    if (password && password.trim().length > 0) {
      userUpdateData.password = await bcrypt.hash(password.trim(), 10);
    }

    await prisma.user.update({
      where: { id },
      data: userUpdateData,
    });

    // Update Profile
    await prisma.profile.update({
      where: { id },
      data: {
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        photoUrl: photoUrl,
      }
    });

    // Handle class assignment update
    if (classId !== undefined) {
      if (classId === 'none') {
        // Unassign all classes currently taught by this teacher
        await prisma.class.updateMany({
          where: { teacherId: id },
          data: { teacherId: null }
        });
      } else if (classId && classId.trim().length > 0) {
        // Unassign other classes
        await prisma.class.updateMany({
          where: { teacherId: id },
          data: { teacherId: null }
        });
        // Assign new class
        await prisma.class.update({
          where: { id: classId },
          data: { teacherId: id }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Teacher details updated successfully.' });
  } catch (error: any) {
    console.error('Update teacher error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE teacher
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required.' }, { status: 400 });
    }

    const teacherUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!teacherUser || teacherUser.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Teacher not found.' }, { status: 404 });
    }

    // Unassign all classes taught by this teacher
    await prisma.class.updateMany({
      where: { teacherId: id },
      data: { teacherId: null }
    });

    // Delete photo file if present
    if (teacherUser.profile?.photoUrl) {
      try {
        const photoPath = path.join(process.cwd(), 'public', teacherUser.profile.photoUrl);
        await unlink(photoPath).catch(() => {});
      } catch (e) {}
    }

    // Delete user (cascade will delete Profile)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Teacher account deleted successfully.' });
  } catch (error: any) {
    console.error('Delete teacher error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
