import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { currentPassword, newPin, confirmPin } = await request.json();

    if (!currentPassword || !newPin || !confirmPin) {
      return NextResponse.json({ error: 'Current password, new PIN, and confirmation PIN are required.' }, { status: 400 });
    }

    const cleanPin = String(newPin).trim();
    const cleanConfirm = String(confirmPin).trim();

    if (cleanPin !== cleanConfirm) {
      return NextResponse.json({ error: 'New PIN and confirmation PIN do not match.' }, { status: 400 });
    }

    if (!/^\d{4,6}$/.test(cleanPin)) {
      return NextResponse.json({ error: 'Security PIN must be a 4-to-6 digit numeric code (e.g. 7951).' }, { status: 400 });
    }

    // Fetch logged-in user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Logged-in admin account not found.' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect current password. Verification failed.' }, { status: 400 });
    }

    // 🔒 ZERO-KNOWLEDGE PIN CONFLICT CHECK (Does not leak who owns the PIN)
    const existingPinOwner = await prisma.user.findFirst({
      where: {
        securityPin: cleanPin,
        id: { not: session.userId },
      },
    });

    if (existingPinOwner) {
      // Return privacy-preserving zero-knowledge error message (never reveal owner identity or PIN existence details)
      return NextResponse.json(
        {
          error: `⚠️ PIN Unavailable: This 4-digit PIN cannot be used. Please choose a different 4-digit PIN.`
        },
        { status: 409 }
      );
    }

    // Update PIN
    await prisma.user.update({
      where: { id: session.userId },
      data: { securityPin: cleanPin },
    });

    return NextResponse.json({
      success: true,
      message: `Your Staff Security PIN has been updated to "${cleanPin}" successfully!`,
    });
  } catch (error: any) {
    console.error('Self PIN update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update PIN.' }, { status: 500 });
  }
}
