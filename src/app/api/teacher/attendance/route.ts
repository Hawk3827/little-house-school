import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { studentId, date, status } = await request.json();

    if (!studentId || !date || !status) {
      return NextResponse.json(
        { error: 'Student ID, date, and status are required.' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

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
          { error: 'Access Denied: You are only authorized to mark attendance for students in your assigned class.' },
          { status: 403 }
        );
      }
    }

    // Upsert attendance record
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: parsedDate,
        },
      },
      update: {
        status,
        markedById: session.userId,
      },
      create: {
        studentId,
        date: parsedDate,
        status,
        markedById: session.userId,
      },
    });

    // If marked ABSENT or LATE, trigger the parent notification
    if (status === 'ABSENT' || status === 'LATE') {
      try {
        const studentProfile = await prisma.profile.findUnique({
          where: { id: studentId },
          include: {
            asStudentParents: {
              include: {
                parent: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        });

        if (studentProfile) {
          const { sendAbsenceAlert } = await import('@/lib/alerts');
          for (const sp of studentProfile.asStudentParents) {
            await sendAbsenceAlert({
              studentName: studentProfile.name,
              parentName: sp.parent.name,
              parentEmail: sp.parent.user.email,
              date,
              status,
            });
          }
        }
      } catch (alertError) {
        console.error('Failed to trigger absence alert:', alertError);
        // Do not block the attendance submit if alert fails
      }
    }

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error('Save attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
