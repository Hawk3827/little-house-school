import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { validateFileMagicBytes } from '@/lib/serverFileValidation';
import { saveUploadedFile } from '@/lib/uploadHelper';
import { handleApiError } from '@/lib/errorHandler';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const classId = formData.get('classId') as string;
    const phone = formData.get('phone') as string || '';
    const address = formData.get('address') as string || '';
    const photo = formData.get('photo') as File | null;

    if (!name || !email || !password || !classId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
    }

    // Verify class exists
    const targetClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!targetClass) {
      return NextResponse.json({ error: 'Selected class does not exist.' }, { status: 400 });
    }

    // If teacher, verify class belongs to them
    if (session.role === 'TEACHER' && targetClass.teacherId !== session.userId) {
      return NextResponse.json({ error: 'You are only authorized to enroll students in your own class.' }, { status: 403 });
    }

    // Write photo file if provided with strict binary magic-byte inspection
    let photoUrl: string | null = null;
    if (photo && photo.size > 0) {
      try {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const magicCheck = validateFileMagicBytes(buffer, photo.name, ['image/jpeg', 'image/png', 'image/webp']);
        
        if (!magicCheck.isValid) {
          return NextResponse.json({ error: magicCheck.error || 'Invalid image file signature.' }, { status: 400 });
        }

        photoUrl = await saveUploadedFile(
          buffer,
          photo.name,
          'avatars',
          photo.type || 'image/jpeg'
        );
      } catch (uploadErr) {
        console.error('Photo save error:', uploadErr);
      }
    }

    // Generate unique Admission Number
    // Format: LHS-2026-XXXX where XXXX is a random 4-digit number
    let admissionNo = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 100) {
      attempts++;
      const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
      const candidateNo = `LHS-2026-${randomDigits}`;

      const existingProfile = await prisma.profile.findUnique({
        where: { admissionNo: candidateNo }
      });

      if (!existingProfile) {
        admissionNo = candidateNo;
        isUnique = true;
      }
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate a unique Admission Number. Try again.' }, { status: 500 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User, Profile, and Enrollment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'STUDENT',
        }
      });

      const newProfile = await tx.profile.create({
        data: {
          id: newUser.id,
          name: name.trim(),
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          admissionNo,
          photoUrl,
        }
      });

      const enrollment = await tx.enrollment.create({
        data: {
          studentId: newUser.id,
          classId: classId,
        }
      });

      return {
        id: newUser.id,
        email: newUser.email,
        name: newProfile.name,
        admissionNo: newProfile.admissionNo,
        className: targetClass.name
      };
    });

    return NextResponse.json({ success: true, student: result });
  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
    }

    // If teacher, check if the student belongs to one of their classes
    if (session.role === 'TEACHER') {
      const studentClass = await prisma.class.findFirst({
        where: {
          teacherId: session.userId,
          enrollments: {
            some: { studentId: studentId }
          }
        }
      });

      if (!studentClass) {
        return NextResponse.json({ error: 'You are only authorized to delete students from your own classes.' }, { status: 403 });
      }
    }

    // Soft Delete: Archive the student profile so historical grades and reports are preserved
    await prisma.profile.update({
      where: { id: studentId },
      data: { isArchived: true }
    });

    return NextResponse.json({ success: true, message: 'Student account archived successfully. Historical records preserved.' });
  } catch (error) {
    console.error('Archive student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string || '';
    const address = formData.get('address') as string || '';
    const photo = formData.get('photo') as File | null;

    if (!id || !name || !email) {
      return NextResponse.json({ error: 'ID, name, and email are required.' }, { status: 400 });
    }

    // Verify student exists
    const targetStudent = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!targetStudent || targetStudent.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    // If teacher, check if the student belongs to one of their classes
    if (session.role === 'TEACHER') {
      const studentClass = await prisma.class.findFirst({
        where: {
          teacherId: session.userId,
          enrollments: {
            some: { studentId: id }
          }
        }
      });

      if (!studentClass) {
        return NextResponse.json({ error: 'You are only authorized to modify students in your own classes.' }, { status: 403 });
      }
    }

    // Check email uniqueness if changed
    if (email.toLowerCase().trim() !== targetStudent.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use by another user.' }, { status: 400 });
      }
    }

    // Save photo if uploaded
    let photoUrl = targetStudent.profile?.photoUrl || null;
    if (photo && photo.size > 0) {
      try {
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = path.extname(photo.name) || '.jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
        await writeFile(uploadPath, buffer);
        photoUrl = `/uploads/${filename}`;
      } catch (uploadErr) {
        console.error('Photo save error:', uploadErr);
      }
    }

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          email: email.toLowerCase().trim()
        }
      });

      await tx.profile.update({
        where: { id },
        data: {
          name: name.trim(),
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          photoUrl
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Student details updated successfully.' });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, action } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required.' }, { status: 400 });
    }

    if (action === 'RESTORE') {
      const restored = await prisma.profile.update({
        where: { id: studentId },
        data: { isArchived: false }
      });

      try {
        await prisma.adminAuditLog.create({
          data: {
            adminEmail: session.email || 'admin@school.com',
            adminName: session.name || session.email || 'Admin Staff',
            actionType: 'UPDATE',
            category: 'STUDENT',
            targetName: `Student: ${restored.name}`,
            description: `Restored archived student profile for ${restored.name}`,
          },
        });
      } catch (e) {}

      return NextResponse.json({ success: true, message: 'Student restored successfully to active nominal roster.' });
    }

    if (action === 'PURGE') {
      if (session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only Administrators can permanently purge records.' }, { status: 403 });
      }
      const userToPurge = await prisma.user.findUnique({
        where: { id: studentId },
        include: { profile: true },
      });

      await prisma.user.delete({
        where: { id: studentId }
      });

      try {
        await prisma.adminAuditLog.create({
          data: {
            adminEmail: session.email || 'admin@school.com',
            adminName: session.name || session.email || 'Admin Staff',
            actionType: 'DELETE',
            category: 'STUDENT',
            targetName: `Student: ${userToPurge?.profile?.name || userToPurge?.email || 'Student'}`,
            description: `Permanently purged student account for ${userToPurge?.profile?.name || userToPurge?.email}`,
          },
        });
      } catch (e) {}

      return NextResponse.json({ success: true, message: 'Student record permanently purged.' });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (error) {
    console.error('Student action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
