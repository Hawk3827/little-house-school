import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createDatabaseSnapshot, listDatabaseSnapshots, deleteDatabaseSnapshot } from '@/lib/backupEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const snapshots = await listDatabaseSnapshots();

    const googleDriveConfigured = !!(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
    );

    const googleDriveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1_LITTLE_HOUSE_OFFSITE_BACKUPS';

    return NextResponse.json({
      success: true,
      snapshots,
      config: {
        googleDriveConfigured,
        googleDriveFolderId,
        googleDriveFolderName: 'LITTLE HOUSE DB Backups',
        automatedDailySchedule: '00:00 UTC (05:30 AM IST)',
        totalSnapshots: snapshots.length,
      },
    });
  } catch (error) {
    console.error('List backups error:', error);
    return NextResponse.json({ error: 'Failed to retrieve backups.' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const snapshot = await createDatabaseSnapshot();

    return NextResponse.json({
      success: true,
      message: 'Database snapshot created and synced to Google Drive successfully.',
      snapshot,
    });
  } catch (error: any) {
    console.error('Create backup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create database snapshot.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required.' }, { status: 400 });
    }

    const success = await deleteDatabaseSnapshot(filename);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete backup file.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Backup "${filename}" deleted.` });
  } catch (error) {
    console.error('Delete backup error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
