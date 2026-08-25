import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Lookup student fee status & existing payments by Admission Number
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admissionNo = searchParams.get('admissionNo')?.trim();

    if (!admissionNo) {
      return NextResponse.json({ error: 'Admission Number is required.' }, { status: 400 });
    }

    if (admissionNo === 'ALL_RECORDS') {
      const allStudents = await prisma.profile.findMany({
        where: { 
          isArchived: false,
          user: { role: 'STUDENT' }
        },
        include: {
          enrollments: {
            include: { class: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      const payments = await prisma.feePayment.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const formattedStudents = allStudents.map((s) => ({
        id: s.id,
        name: s.name,
        admissionNo: s.admissionNo || `LHS-2026-${s.id.slice(-4).toUpperCase()}`,
        phone: s.phone || '',
        class: s.enrollments[0]?.class?.name || 'Class I',
      }));

      return NextResponse.json({
        success: true,
        students: formattedStudents,
        payments,
      });
    }

    const studentProfile = await prisma.profile.findFirst({
      where: { admissionNo, isArchived: false },
      include: {
        enrollments: {
          include: { class: true },
        },
      },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: 'No active student record found for this Admission Number.' }, { status: 404 });
    }

    const studentClass = studentProfile.enrollments[0]?.class?.name || 'Primary School';

    // Fetch existing fee payments
    const payments = await prisma.feePayment.findMany({
      where: { admissionNo },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      student: {
        name: studentProfile.name,
        admissionNo: studentProfile.admissionNo,
        class: studentClass,
        phone: studentProfile.phone || '',
      },
      payments,
    });
  } catch (error: any) {
    console.error('Error looking up student fee info:', error);
    return NextResponse.json({ error: 'Failed to retrieve fee records.' }, { status: 500 });
  }
}

// POST: Record new monthly fee payment and issue receipt
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentName,
      admissionNo,
      studentClass,
      parentPhone,
      paidMonths,
      tuitionFee,
      transportFee,
      totalAmount,
      paymentMode,
      paymentRef,
    } = body;

    if (!admissionNo || !paidMonths || !paymentRef || !totalAmount) {
      return NextResponse.json({ error: 'Please provide all required payment details and UTR reference.' }, { status: 400 });
    }

    // Generate unique Receipt Number (e.g. LHS-FEE-2026-9482)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNo = `LHS-FEE-2026-${randomSuffix}`;

    const newPayment = await prisma.feePayment.create({
      data: {
        receiptNo,
        studentName: studentName || 'Student',
        admissionNo: admissionNo.trim(),
        studentClass: studentClass || 'Primary School',
        parentPhone: parentPhone || '',
        paidMonths: Array.isArray(paidMonths) ? paidMonths.join(', ') : paidMonths,
        tuitionFee: Number(tuitionFee) || 0,
        transportFee: Number(transportFee) || 0,
        totalAmount: Number(totalAmount),
        paymentMode: paymentMode || 'UPI_ONLINE',
        paymentRef: paymentRef.trim(),
        paymentStatus: 'PAID',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Monthly fee payment recorded successfully!',
      payment: newPayment,
    });
  } catch (error: any) {
    console.error('Error recording fee payment:', error);
    return NextResponse.json({ error: 'Failed to record fee payment.' }, { status: 500 });
  }
}
