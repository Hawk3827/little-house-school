import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// POST: Change password for the currently logged-in Admin only
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin session required.' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'Current password, new password, and confirmation are required.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirmation do not match.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    // Fetch ONLY the currently authenticated logged-in admin user record
    const adminUser = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Logged-in user record not found.' }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, adminUser.password);
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Incorrect current password. Password change denied.' }, { status: 401 });
    }

    // Hash new password and update ONLY the logged-in admin's own user record
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedNewPassword },
    });

    const adminName = adminUser.profile?.name || adminUser.email;

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for logged-in admin "${adminName}"!`,
    });
  } catch (error: any) {
    console.error('Error changing admin password:', error);
    return NextResponse.json({ error: error.message || 'Failed to update password.' }, { status: 500 });
  }
}
