import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadSnapshotToGoogleDrive } from '@/lib/googleDriveBackup';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { folderId, serviceAccountEmail, privateKey } = await request.json();

    if (!folderId) {
      return NextResponse.json({ error: 'Google Drive Folder ID or Link is required.' }, { status: 400 });
    }

    // Extract raw folder ID if user pasted full URL
    let cleanFolderId = folderId.trim();
    if (cleanFolderId.includes('/folders/')) {
      const match = cleanFolderId.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        cleanFolderId = match[1];
      }
    }

    // If service account credentials provided, update process.env and test upload
    if (serviceAccountEmail && privateKey) {
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = serviceAccountEmail.trim();
      process.env.GOOGLE_PRIVATE_KEY = privateKey.trim();
    }
    process.env.GOOGLE_DRIVE_FOLDER_ID = cleanFolderId;

    // Run connection test upload
    const testPayload = JSON.stringify({
      status: 'CONNECTED',
      school: 'LITTLE HOUSE School Portal',
      verifiedAt: new Date().toISOString(),
      folderId: cleanFolderId,
    }, null, 2);

    const testResult = await uploadSnapshotToGoogleDrive(
      `lhs-connection-test-${Date.now()}.json`,
      testPayload,
      'application/json'
    );

    if (!testResult.success) {
      return NextResponse.json({
        error: `Google Drive connection test failed: ${testResult.error || 'Check that your folder is shared with the service account.'}`
      }, { status: 400 });
    }

    // Persist to .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = await readFile(envPath, 'utf-8');

    const updateOrAppendEnv = (key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}="${value}"`);
      } else {
        envContent += `\n${key}="${value}"`;
      }
    };

    updateOrAppendEnv('GOOGLE_DRIVE_FOLDER_ID', cleanFolderId);
    if (serviceAccountEmail) updateOrAppendEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', serviceAccountEmail.trim());
    if (privateKey) updateOrAppendEnv('GOOGLE_PRIVATE_KEY', privateKey.trim());

    await writeFile(envPath, envContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Google Drive connected successfully! Test snapshot verified.',
      folderId: cleanFolderId,
      webViewLink: testResult.webViewLink || `https://drive.google.com/drive/folders/${cleanFolderId}`,
      isLiveConnected: !testResult.simulated,
    });
  } catch (error: any) {
    console.error('Google Drive config error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save Google Drive configuration.' }, { status: 500 });
  }
}
