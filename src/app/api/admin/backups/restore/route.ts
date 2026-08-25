import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { restoreDatabaseSnapshot, DatabaseSnapshotData } from '@/lib/backupEngine';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { filename, snapshotData } = body;

    let targetData: DatabaseSnapshotData;

    if (snapshotData) {
      targetData = snapshotData;
    } else if (filename) {
      const filepath = path.join(process.cwd(), 'backups', 'snapshots', filename);
      const raw = await readFile(filepath, 'utf-8');
      targetData = JSON.parse(raw);
    } else {
      return NextResponse.json(
        { error: 'Either filename or snapshotData is required to perform restoration.' },
        { status: 400 }
      );
    }

    const result = await restoreDatabaseSnapshot(targetData);

    return NextResponse.json({
      success: true,
      message: result.message,
      restoredRecords: result.restoredRecords,
    });
  } catch (error: any) {
    console.error('Restore backup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to restore database from snapshot.' },
      { status: 500 }
    );
  }
}
