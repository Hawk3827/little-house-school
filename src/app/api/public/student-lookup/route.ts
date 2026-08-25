import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`student_lookup_${clientIp}`, {
      maxAttempts: 10,
      windowMs: 60 * 1000,
      lockoutMs: 5 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `⚠️ Rate limit exceeded. Too many lookup requests from your network. Please wait ${rateLimit.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { admissionNo, password } = body;

    if (!admissionNo || !password) {
      return NextResponse.json(
        { error: 'Please provide both your Admission Number and Password.' },
        { status: 400 }
      );
    }

    const rawInput = admissionNo.trim();
    const normalizedInput = rawInput.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Query profiles and match with fuzzy normalization (handles lowercase, spaces, dashes)
    const allProfiles = await prisma.profile.findMany({
      where: {
        admissionNo: { not: null }
      },
      include: {
        user: true,
        enrollments: {
          include: {
            class: {
              include: {
                teacher: {
                  select: { name: true, phone: true }
                }
              }
            }
          }
        },
        monthlyReports: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: {
              select: { name: true }
            }
          }
        },
        studentActivityDocs: {
          orderBy: { createdAt: 'desc' },
          include: {
            uploadedBy: {
              select: { name: true }
            }
          }
        },
        studentGrades: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const profile = allProfiles.find((p) => {
      if (!p.admissionNo) return false;
      const cleanDbNo = p.admissionNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return (
        p.admissionNo.toLowerCase() === rawInput.toLowerCase() ||
        cleanDbNo === normalizedInput
      );
    });

    if (!profile || !profile.user) {
      return NextResponse.json(
        { error: 'Invalid Admission Number or student record not found.' },
        { status: 401 }
      );
    }

    // Verify password against User account
    const isPasswordValid = await bcrypt.compare(password, profile.user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password. Please verify your login credentials.' },
        { status: 401 }
      );
    }

    // Sanitize response object
    const studentData = {
      id: profile.id,
      name: profile.name,
      admissionNo: profile.admissionNo,
      photoUrl: profile.photoUrl,
      email: profile.user.email,
      phone: profile.phone,
      address: profile.address,
      class: profile.enrollments?.[0]?.class ? {
        name: profile.enrollments[0].class.name,
        teacherName: profile.enrollments[0].class.teacher?.name || 'Assigned Faculty',
      } : null,
      monthlyReports: profile.monthlyReports.map((rep) => ({
        id: rep.id,
        month: rep.month,
        totalDays: rep.totalDays,
        daysPresent: rep.daysPresent,
        daysAbsent: rep.daysAbsent,
        attendancePercentage: rep.totalDays > 0 ? Math.round((rep.daysPresent / rep.totalDays) * 100) : 0,
        conduct: rep.conduct,
        remarks: rep.remarks,
        attachmentUrl: rep.attachmentUrl,
        attachmentName: rep.attachmentName,
        teacherName: rep.uploadedBy?.name || 'Faculty',
        createdAt: rep.createdAt.toISOString(),
      })),
      activityDocs: profile.studentActivityDocs.map((act) => ({
        id: act.id,
        title: act.title,
        type: act.type,
        fileUrl: act.fileUrl,
        remarks: act.remarks,
        activityDate: act.activityDate ? act.activityDate.toISOString().split('T')[0] : null,
        teacherName: act.uploadedBy?.name || 'Faculty',
        createdAt: act.createdAt.toISOString(),
      })),
      grades: profile.studentGrades.map((g) => ({
        id: g.id,
        subject: g.subject,
        score: g.score,
        maxScore: g.maxScore,
        remarks: g.remarks,
        assessmentDate: g.assessmentDate.toISOString().split('T')[0],
      })),
    };

    return NextResponse.json({
      success: true,
      student: studentData,
    });
  } catch (error) {
    console.error('Student lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred while retrieving student records.' },
      { status: 500 }
    );
  }
}
