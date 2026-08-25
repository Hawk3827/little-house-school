import { NextResponse } from 'next/server';

/**
 * Validates Content-Length and parses JSON safely with a strict 1MB ceiling.
 * Protects against Node.js heap memory exhaustion and Denial-of-Service attacks.
 */
export async function parseSafeJson<T = any>(
  request: Request,
  maxBytes: number = 1024 * 1024 // 1 MB default
): Promise<{ data?: T; errorResponse?: NextResponse }> {
  // 1. Check Content-Length header
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Payload Too Large: Request body exceeds the 1MB security limit.' },
        { status: 413 }
      ),
    };
  }

  // 2. Read and enforce size limit on raw text
  try {
    const rawText = await request.text();
    if (rawText.length > maxBytes) {
      return {
        errorResponse: NextResponse.json(
          { error: 'Payload Too Large: Request body exceeds the 1MB security limit.' },
          { status: 413 }
        ),
      };
    }

    const data = JSON.parse(rawText) as T;
    return { data };
  } catch (err) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Malformed JSON payload structure.' },
        { status: 400 }
      ),
    };
  }
}
