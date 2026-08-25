import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename || !filename.endsWith('.json')) {
      return NextResponse.json({ error: 'Valid snapshot filename is required.' }, { status: 400 });
    }

    const safeFilename = path.basename(filename);
    const filepath = path.join(process.cwd(), 'backups', 'snapshots', safeFilename);

    const fileBuffer = await readFile(filepath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error) {
    console.error('Download backup error:', error);
    return NextResponse.json({ error: 'Backup file not found or inaccessible.' }, { status: 404 });
  }
}
