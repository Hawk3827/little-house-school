import fs from 'fs';
import path from 'path';

/**
 * Universal Serverless-Safe File Saver
 * - On Local Node.js: saves file to public/uploads/... and returns static relative URL (/uploads/...)
 * - On Vercel / Read-Only Cloud: converts buffer to Base64 Data URL so uploads work 100% reliably without read-only filesystem errors!
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalFilename: string,
  subFolder: string,
  mimeType: string
): Promise<string> {
  const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';

  if (isServerless) {
    // Return Base64 Data URL for serverless environments
    const base64Data = buffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(originalFilename) || (mimeType.includes('pdf') ? '.pdf' : '.jpg');
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const fullPath = path.join(uploadDir, safeName);

    fs.writeFileSync(fullPath, buffer);
    return `/uploads/${subFolder}/${safeName}`;
  } catch (err) {
    console.warn('Fallback to Base64 Data URL due to filesystem restrictions:', err);
    const base64Data = buffer.toString('base64');
    return `data:${mimeType};base64,${base64Data}`;
  }
}
