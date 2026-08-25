import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || (session.role !== 'TEACHER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { studentId, subject, score, maxScore, remarks } = await request.json();

    if (!studentId || !subject || score === undefined || !maxScore) {
      return NextResponse.json(
        { error: 'Student ID, subject, score, and max score are required.' },
        { status: 400 }
      );
    }

    // Cross-Teacher Privacy Isolation Check
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
          { error: 'Access Denied: You are only authorized to enter marks for students in your assigned class.' },
          { status: 403 }
        );
      }
    }

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subject,
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        remarks,
        teacherId: session.userId,
        assessmentDate: new Date(),
      },
    });

    return NextResponse.json({ success: true, grade });
  } catch (error) {
    console.error('Save grade error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
