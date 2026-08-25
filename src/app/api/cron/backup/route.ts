import { NextResponse } from 'next/server';
import { createDatabaseSnapshot } from '@/lib/backupEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Optional Authorization header for Vercel Cron or external cron bots
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron trigger.' }, { status: 401 });
    }

    const snapshot = await createDatabaseSnapshot();

    return NextResponse.json({
      success: true,
      message: 'Automated daily backup completed and synced to Google Drive.',
      timestamp: new Date().toISOString(),
      snapshot: {
        filename: snapshot.filename,
        sizeFormatted: snapshot.sizeFormatted,
        totalRecords: snapshot.summary.totalRecords,
        mediaFilesCount: snapshot.summary.mediaFilesCount,
        cloudBackup: snapshot.cloudBackup,
      },
    });
  } catch (error: any) {
    console.error('Automated cron backup failed:', error);
    return NextResponse.json({ error: error.message || 'Cron backup failed.' }, { status: 500 });
  }
}
