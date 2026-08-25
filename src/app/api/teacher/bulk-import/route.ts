import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseSafeJson } from '@/lib/payloadGuard';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: body, errorResponse } = await parseSafeJson(request, 1024 * 1024);
    if (errorResponse) return errorResponse;

    const { type, classId, rows } = body || {};

    if (!type || !classId || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid payload structure.' }, { status: 400 });
    }

    if (rows.length > 150) {
      return NextResponse.json(
        { error: 'Batch size too large: Maximum 150 rows allowed per import.' },
        { status: 400 }
      );
    }

    // Verify class belongs to the teacher
    const targetClass = await prisma.class.findFirst({
      where: { id: classId, teacherId: session.userId },
      include: {
        enrollments: {
          include: {
            student: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!targetClass) {
      return NextResponse.json({ error: 'Class not found or unauthorized' }, { status: 403 });
    }

    // Build a map of student email -> student ID for quick lookup
    const studentMap: { [email: string]: string } = {};
    const studentNameMap: { [email: string]: string } = {};
    
    targetClass.enrollments.forEach(enr => {
      studentMap[enr.student.user.email.toLowerCase()] = enr.student.id;
      studentNameMap[enr.student.user.email.toLowerCase()] = enr.student.name;
    });

    const successes: any[] = [];
    const failures: any[] = [];

    if (type === 'attendance') {
      for (const row of rows) {
        const { email, date, status } = row;
        const studentId = studentMap[email?.toLowerCase()?.trim()];

        if (!studentId) {
          failures.push({ row, error: `Student email '${email}' not enrolled in this class.` });
          continue;
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          failures.push({ row, error: `Invalid date format: ${date}. Use YYYY-MM-DD.` });
          continue;
        }

        const validStatuses = ['PRESENT', 'ABSENT', 'LATE'];
        const normalizedStatus = status?.toUpperCase()?.trim();
        if (!validStatuses.includes(normalizedStatus)) {
          failures.push({ row, error: `Invalid status: ${status}. Must be PRESENT, ABSENT, or LATE.` });
          continue;
        }

        // Set hours to midnight UTC
        const utcDate = new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()));

        const attRecord = await prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId,
              date: utcDate
            }
          },
          update: { 
            status: normalizedStatus,
            markedById: session.userId
          },
          create: {
            studentId,
            date: utcDate,
            status: normalizedStatus,
            markedById: session.userId
          }
        });

        // Trigger email alerts if student is ABSENT or LATE
        if (normalizedStatus === 'ABSENT' || normalizedStatus === 'LATE') {
          try {
            // Find student parents to send notifications
            const parentLinks = await prisma.studentParent.findMany({
              where: { studentId },
              include: { parent: { include: { user: true } } }
            });

            const { sendAbsenceAlert } = await import('@/lib/alerts');
            for (const link of parentLinks) {
              await sendAbsenceAlert({
                studentName: studentNameMap[email.toLowerCase()],
                parentName: link.parent.name || 'Parent',
                parentEmail: link.parent.user.email,
                date: utcDate.toISOString(),
                status: normalizedStatus
              });
            }
          } catch (alertErr) {
            console.error('Failed to trigger bulk attendance email notification:', alertErr);
          }
        }

        successes.push(attRecord);
      }
    } else if (type === 'grades') {
      for (const row of rows) {
        const { email, subject, score, max_score, remarks } = row;
        const studentId = studentMap[email?.toLowerCase()?.trim()];

        if (!studentId) {
          failures.push({ row, error: `Student email '${email}' not enrolled in this class.` });
          continue;
        }

        const parsedScore = parseFloat(score);
        const parsedMaxScore = parseFloat(max_score);

        if (isNaN(parsedScore) || isNaN(parsedMaxScore) || parsedScore < 0 || parsedMaxScore <= 0 || parsedScore > parsedMaxScore) {
          failures.push({ row, error: `Invalid scores: ${score}/${max_score}. Score must be positive and less than Max Score.` });
          continue;
        }

        const gradeRecord = await prisma.grade.create({
          data: {
            studentId,
            subject: subject?.trim() || 'General Subject',
            score: parsedScore,
            maxScore: parsedMaxScore,
            remarks: remarks?.trim() || null,
            assessmentDate: new Date(),
            teacherId: session.userId
          }
        });

        successes.push(gradeRecord);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: successes.length,
      failedCount: failures.length,
      failures
    });
  } catch (error) {
    console.error('Bulk import API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
