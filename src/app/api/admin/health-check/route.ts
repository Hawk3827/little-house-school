import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      usersCount,
      studentsCount,
      teachersCount,
      feePaymentsCount,
      announcementsCount,
      galleryItemsCount,
      analyticsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.feePayment.count(),
      prisma.announcement.count(),
      prisma.galleryItem.count(),
      prisma.websiteAnalytics.count(),
    ]);

    // Estimate storage usage in MB based on record counts
    // 1 user/student ~ 0.5KB, 1 fee ~ 0.3KB, 1 analytics ~ 0.2KB, 1 gallery ~ 0.5KB
    const totalRecords = usersCount + feePaymentsCount + announcementsCount + galleryItemsCount + analyticsCount;
    const estimatedDbBytes = (usersCount * 500) + (feePaymentsCount * 300) + (analyticsCount * 200) + (galleryItemsCount * 500) + (announcementsCount * 400);
    
    // Base database overhead ~25MB (Postgres system schemas + Prisma migration indexes)
    const baseSystemOverheadMb = 28;
    const estimatedDbMb = Number((baseSystemOverheadMb + (estimatedDbBytes / (1024 * 1024))).toFixed(2));
    
    const dbStorageLimitMb = 500; // Neon Free Tier Limit
    const storageUsedPercentage = Math.min(100, Number(((estimatedDbMb / dbStorageLimitMb) * 100).toFixed(1)));

    // Warning thresholds
    const isStorageWarning = storageUsedPercentage >= 80; // >80% used
    const isStorageCritical = storageUsedPercentage >= 92; // >92% used

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      health: {
        status: isStorageCritical ? 'CRITICAL' : isStorageWarning ? 'WARNING' : 'HEALTHY',
        estimatedDbMb,
        dbStorageLimitMb,
        storageUsedPercentage,
        isStorageWarning,
        isStorageCritical,
        totalRecords,
        counts: {
          users: usersCount,
          students: studentsCount,
          teachers: teachersCount,
          feePayments: feePaymentsCount,
          announcements: announcementsCount,
          galleryPhotos: galleryItemsCount,
          analyticsLogs: analyticsCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching system health:', error);
    return NextResponse.json({ error: error.message || 'Failed to perform health check' }, { status: 500 });
  }
}
