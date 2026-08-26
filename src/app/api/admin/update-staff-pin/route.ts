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

    if (!newPin || String(newPin).trim().length < 4) {
      return NextResponse.json({ error: 'Security PIN must be at least 4 digits.' }, { status: 400 });
    }

    const targetUserId = userId || session.userId;

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { securityPin: String(newPin).trim() },
    });

    return NextResponse.json({
      success: true,
      message: `Security PIN updated successfully for ${updatedUser.email}!`,
    });
  } catch (error: any) {
    console.error('Error updating staff PIN:', error);
    return NextResponse.json({ error: error.message || 'Failed to update PIN.' }, { status: 500 });
  }
}
