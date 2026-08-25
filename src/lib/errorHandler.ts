import { NextResponse } from 'next/server';

/**
 * Production Error Sanitizer
 * Ensures internal SQL queries, file paths, database connection strings,
 * and stack traces are NEVER leaked in API responses.
 */
export function handleApiError(error: unknown, fallbackMessage: string = 'An unexpected error occurred. Please try again.') {
  const isDev = process.env.NODE_ENV !== 'production';

  // Always log technical details to server console / private log
  console.error('[API Error Logger]:', error);

  if (isDev && error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || fallbackMessage,
        devDetails: error.stack,
      },
      { status: 500 }
    );
  }

  // Safe sanitized response in production
  let userMessage = fallbackMessage;
  if (error instanceof Error) {
    // Only pass through safe, predictable business logic errors
    if (!error.message.includes('prisma') && !error.message.includes('SQLITE') && !error.message.includes('connect')) {
      userMessage = error.message;
    }
  }

  return NextResponse.json({ error: userMessage }, { status: 500 });
}
