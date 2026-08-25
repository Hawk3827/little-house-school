import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, studentName, admissionNo, studentClass, paidMonths } = body;

    if (!amount || !admissionNo || !paidMonths) {
      return NextResponse.json({ error: 'Missing required order details.' }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay keys are configured, create live Razorpay order
    if (keyId && keySecret) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount: Math.round(Number(amount) * 100), // Amount in paise
        currency: 'INR',
        receipt: `LHS-ORD-${Date.now().toString().slice(-6)}`,
        notes: {
          studentName,
          admissionNo,
          studentClass,
          paidMonths: Array.isArray(paidMonths) ? paidMonths.join(', ') : paidMonths,
        },
      };

      const order = await razorpay.orders.create(options);
      return NextResponse.json({
        success: true,
        isLiveGateway: true,
        keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    }

    // Universal Gateway simulation order when API keys are not yet set in .env
    const simulatedOrderId = `order_LHS_${Date.now().toString().slice(-8)}`;
    return NextResponse.json({
      success: true,
      isLiveGateway: false,
      keyId: 'rzp_test_school_fee_counter',
      orderId: simulatedOrderId,
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
    });
  } catch (error: any) {
    console.error('Error creating gateway order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment gateway order.' }, { status: 500 });
  }
}
