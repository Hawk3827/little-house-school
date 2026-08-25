import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createDatabaseSnapshot } from '@/lib/backupEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const secretKey = process.env.NEXTAUTH_SECRET || 'lh_secret_school_production_2026_super_secure_key_waiton';

    const session = await getSession();
    const isAuthorized = (session && session.role === 'ADMIN') || (token && token === secretKey);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized backup request.' }, { status: 401 });
    }

    const snapshot = await createDatabaseSnapshot();

    const response = new NextResponse(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="LittleHouse_Latest_Backup.json"',
      },
    });

    return response;
  } catch (error: any) {
    console.error('Error fetching latest backup:', error);
    return NextResponse.json({ error: 'Failed to generate latest backup.' }, { status: 500 });
  }
}
