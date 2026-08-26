import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { userId, newPin } = await request.json();

    const cleanPin = String(newPin || '').trim();

    if (!cleanPin || !/^\d{4,6}$/.test(cleanPin)) {
      return NextResponse.json({ error: 'Security PIN must be a 4-to-6 digit numeric code (e.g. 7951).' }, { status: 400 });
    }

    const targetUserId = userId || session.userId;

    // Check PIN uniqueness
    const existingPinOwner = await prisma.user.findFirst({
      where: {
        securityPin: cleanPin,
        id: { not: targetUserId },
      },
    });

    if (existingPinOwner) {
      // Zero-knowledge privacy error message (does not reveal owner name)
      return NextResponse.json(
        {
          error: `⚠️ PIN Unavailable: This 4-digit PIN cannot be assigned. Please choose a different PIN.`
        },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { securityPin: cleanPin },
    });

    return NextResponse.json({
      success: true,
      message: `Security PIN updated to "${cleanPin}" successfully for ${updatedUser.email}!`,
    });
  } catch (error: any) {
    console.error('Error updating staff PIN:', error);
    return NextResponse.json({ error: error.message || 'Failed to update PIN.' }, { status: 500 });
  }
}
