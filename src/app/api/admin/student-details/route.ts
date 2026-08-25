import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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

    const studentProfile = await prisma.profile.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { email: true } },
        enrollments: { include: { class: true } },
        monthlyReports: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { name: true } } },
        },
        studentActivityDocs: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { name: true } } },
        },
        studentGrades: {
          orderBy: { assessmentDate: 'desc' },
          include: { teacher: { select: { name: true } } },
        },
        attendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student: studentProfile });
  } catch (error: any) {
    console.error('Error fetching student details:', error);
    return NextResponse.json({ error: 'Failed to load student details' }, { status: 500 });
  }
}
