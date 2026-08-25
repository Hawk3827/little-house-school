import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const revalidate = 0;

// POST: Create application & process payment (simulated / Razorpay integration)
export async function POST(request: Request) {
  try {
    const {
      studentName,
      grade,
      parentName,
      parentEmail,
      parentPhone,
      paymentMethod, // "UPI" | "CARD" | "NETBANKING"
      upiId,
      cardNumber,
      paymentId, // Razorpay payment ID from client-side if live
      website_code_val, // Honeypot trap
      _formLoadTime, // Bot speed trap
    } = await request.json();

    // 1. Bot Honeypot & Submission Speed Defense
    if (website_code_val) {
      // Invisible field filled by spambot; silently discard
      return NextResponse.json({
        success: true,
        message: 'Application received.',
        admission: { id: 'bot-discarded', studentName, status: 'PAID' },
      });
    }

    if (_formLoadTime && Date.now() - Number(_formLoadTime) < 1000) {
      // Form submitted in under 1 second (superhuman speed / bot script)
      return NextResponse.json({
        success: true,
        message: 'Application received.',
        admission: { id: 'bot-discarded', studentName, status: 'PAID' },
      });
    }

    if (!studentName || !grade || !parentName || !parentEmail) {
      return NextResponse.json(
        { error: 'All student and parent details are required.' },
        { status: 400 }
      );
    }

    const feeChart: Record<string, number> = {
      'Play-Group': 6500,
      'Nursery': 7500,
      'Lower KG': 7500,
      'Upper KG': 7900,
      'Class I': 8600,
      'Class II': 8800,
      'Class III': 9000,
      'Class IV': 9200,
      'Class V': 9400,
      'Class VI': 4800
    };

    const applicationFee = feeChart[grade] || 6500.0;
    
    // Generate a simulated Razorpay-style payment ID if not provided by live Razorpay modal
    let finalPaymentId = paymentId || `pay_LH_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && !paymentId) {
      // If live keys exist but frontend didn't perform payment, we notify to fetch order first
      try {
        const req = eval('require');
        const Razorpay = req('razorpay');
        const rzp = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });
        const order = await rzp.orders.create({
          amount: applicationFee * 100, // in paise
          currency: 'INR',
          receipt: `receipt_lh_${Date.now()}`,
        });
        // Return order details for live frontend Razorpay Checkout invocation
        return NextResponse.json({ success: true, orderId: order.id, amount: applicationFee });
      } catch (rzpErr) {
        console.error('[RAZORPAY] Error generating order:', rzpErr);
      }
    }

    // Local / fallback mockup path logger
    console.log(`\n======================================================`);
    console.log(`[RAZORPAY/UPI PAYMENT] Processing ₹${applicationFee.toFixed(2)} Admission Application Fee`);
    console.log(`Student: ${studentName}`);
    console.log(`Method: ${paymentMethod}`);
    if (paymentMethod === 'UPI') {
      console.log(`UPI ID / VPA: ${upiId || 'Paid via QR Code scan'}`);
    } else {
      console.log(`Card Number ending in: ${cardNumber?.slice(-4) || 'XXXX'}`);
    }
    console.log(`Razorpay Payment ID: ${finalPaymentId}`);
    console.log(`======================================================\n`);

    // Insert record in Database
    const admission = await prisma.admission.create({
      data: {
        studentName,
        grade,
        parentName,
        parentEmail,
        parentPhone,
        amount: applicationFee,
        status: 'PAID',
        paymentReference: finalPaymentId,
      },
    });

    // Trigger confirmation email
    try {
      const { sendAdmissionPaymentConfirmation } = await import('@/lib/alerts');
      await sendAdmissionPaymentConfirmation({
        studentName,
        parentName,
        parentEmail,
        grade,
        paymentReference: finalPaymentId,
        amount: applicationFee,
      });
    } catch (emailErr) {
      console.error('Failed to trigger admission confirmation email:', emailErr);
      // Don't block the API success response if email triggers fail
    }

    // Trigger WhatsApp confirmation
    if (parentPhone) {
      try {
        const { sendWhatsAppConfirmation } = await import('@/lib/alerts');
        await sendWhatsAppConfirmation({
          studentName,
          parentName,
          parentPhone,
          paymentReference: finalPaymentId,
          amount: applicationFee,
        });
      } catch (wsErr) {
        console.error('Failed to trigger WhatsApp confirmation:', wsErr);
      }
    }

    return NextResponse.json({ success: true, admission });
  } catch (error) {
    console.error('Admission API error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// GET: Fetch admissions (Admin only)
export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const admissions = await prisma.admission.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ admissions });
  } catch (error) {
    console.error('Fetch admissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// PATCH: Office Verification of Admission & Reference Number (Admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 401 });
    }

    const { id, verificationStatus, verificationNotes } = await request.json();

    if (!id || !verificationStatus) {
      return NextResponse.json({ error: 'Admission ID and Verification Status are required.' }, { status: 400 });
    }

    const validStatuses = ['VERIFIED', 'PENDING_VERIFICATION', 'REJECTED'];
    if (!validStatuses.includes(verificationStatus)) {
      return NextResponse.json({ error: 'Invalid verification status.' }, { status: 400 });
    }

    const updated = await prisma.admission.update({
      where: { id },
      data: {
        verificationStatus,
        verificationNotes: verificationNotes || null,
        verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null,
        verifiedBy: verificationStatus === 'VERIFIED' ? (session.name || session.email) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Admission receipt ${verificationStatus === 'VERIFIED' ? 'verified successfully' : 'status updated'}.`,
      admission: updated,
    });
  } catch (error: any) {
    console.error('Verify admission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update admission verification.' },
      { status: 500 }
    );
  }
}
