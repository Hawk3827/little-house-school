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

    const { days } = await request.json().catch(() => ({ days: 2 }));
    const retentionDays = Math.max(1, parseInt(days, 10) || 2);

    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const deleteResult = await prisma.websiteAnalytics.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Successfully purged ${deleteResult.count} analytics logs older than ${retentionDays} days (before ${cutoffDate.toLocaleString('en-IN')})!`,
    });
  } catch (error: any) {
    console.error('Error purging old analytics:', error);
    return NextResponse.json({ error: error.message || 'Failed to purge analytics.' }, { status: 500 });
  }
}
