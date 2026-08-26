import prisma from '@/lib/prisma';

export async function logAdminAction({
  adminEmail = 'admin@school.com',
  adminName = 'Admin Staff',
  actionType = 'UPDATE',
  category = 'GENERAL',
  targetName = '',
  description = '',
}: {
  adminEmail?: string;
  adminName?: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'SECURITY' | 'PAYMENT';
  category: 'STUDENT' | 'TEACHER' | 'FEE_PAYMENT' | 'ANNOUNCEMENT' | 'GALLERY' | 'SECURITY' | 'BACKUP' | 'GENERAL';
  targetName?: string;
  description: string;
}) {
  try {
    if (!description) return;
    await prisma.adminAuditLog.create({
      data: {
        adminEmail,
        adminName,
        actionType,
        category,
        targetName,
        description,
      },
    });
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}
