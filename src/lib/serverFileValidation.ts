/**
 * Server-Side Binary Magic Byte & Safe Filename Validator
 * Prevents Web Shells, Polyglots, Path Traversal, and Remote Code Execution (RCE).
 */

export interface MagicByteValidationResult {
  isValid: boolean;
  mimeType: string | null;
  sanitizedFilename: string;
  error?: string;
}

export function validateFileMagicBytes(
  buffer: Buffer | Uint8Array,
  originalFilename: string,
  allowedMimes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
): MagicByteValidationResult {
  // 1. Sanitize filename (remove path traversal '../', null bytes '%00', and dangerous characters)
  let cleanName = originalFilename.replace(/(\.\.[\/\\]|[\x00-\x1f\x7f])/g, '');
  cleanName = cleanName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  
  if (!cleanName || cleanName === '.' || cleanName === '..') {
    cleanName = `upload_${Date.now()}`;
  }

  // 2. Reject executable extensions
  const dangerousExtensions = /\.(php|phtml|php5|py|rb|sh|bash|exe|bat|cmd|com|js|mjs|cjs|ts|jsx|tsx|html|htm|shtml|svg|dll|so|vbs)$/i;
  if (dangerousExtensions.test(cleanName)) {
    return {
      isValid: false,
      mimeType: null,
      sanitizedFilename: cleanName,
      error: 'Dangerous file type detected. Executable scripts and code files are strictly prohibited.',
    };
  }

  // 3. Inspect binary magic byte header
  const bytes = buffer.slice(0, 12);
  let detectedMime: string | null = null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    detectedMime = 'image/jpeg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  else if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    detectedMime = 'image/png';
  }
  // PDF: 25 50 44 46 (%PDF)
  else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    detectedMime = 'application/pdf';
  }
  // WEBP: 52 49 46 46 (RIFF) .... 57 45 42 50 (WEBP)
  else if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    detectedMime = 'image/webp';
  }

  if (!detectedMime) {
    return {
      isValid: false,
      mimeType: null,
      sanitizedFilename: cleanName,
      error: 'Invalid file signature. The file contents do not match genuine JPG, PNG, WEBP, or PDF binary headers.',
    };
  }

  if (!allowedMimes.includes(detectedMime)) {
    return {
      isValid: false,
      mimeType: detectedMime,
      sanitizedFilename: cleanName,
      error: `File type ${detectedMime} is not permitted for this upload.`,
    };
  }

  return {
    isValid: true,
    mimeType: detectedMime,
    sanitizedFilename: cleanName,
  };
}
