/**
 * Bulletproof date parser and formatter designed for 100% compatibility across
 * Apple Safari (iOS/macOS), Android Chrome, Windows, and Linux.
 * 
 * Prevents WebKit "Invalid Date" and "NaN-NaN-0NaN" bugs on iPhones and iPads.
 */

export function parseSafeDate(input: string | number | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // 1. Direct ISO parse test
    let d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    // 2. Fix Safari space-separated format: "2026-08-25 15:30:00" -> "2026-08-25T15:30:00"
    if (trimmed.includes(' ') && !trimmed.includes('T')) {
      const isoCandidate = trimmed.replace(' ', 'T');
      d = new Date(isoCandidate);
      if (!isNaN(d.getTime())) return d;
    }

    // 3. Fix slash format: "2026/08/25" -> "2026-08-25"
    if (trimmed.includes('/')) {
      const normalized = trimmed.replace(/\//g, '-');
      d = new Date(normalized);
      if (!isNaN(d.getTime())) return d;
    }

    // 4. Handle "DD-MM-YYYY" or "DD/MM/YYYY" Indian formats
    const match = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'datetime' | 'time' | 'month-year';

export function formatDateSafe(
  input: string | number | Date | null | undefined,
  style: DateFormatStyle = 'medium',
  fallback: string = 'N/A'
): string {
  const date = parseSafeDate(input);
  if (!date) return fallback;

  try {
    switch (style) {
      case 'short':
        // e.g. "25/08/2026"
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

      case 'medium':
        // e.g. "25 Aug 2026"
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

      case 'long':
        // e.g. "25 August 2026"
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

      case 'datetime':
        // e.g. "25 Aug 2026, 03:45 PM"
        return date.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

      case 'time':
        // e.g. "03:45 PM"
        return date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

      case 'month-year':
        // e.g. "August 2026"
        return date.toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        });

      default:
        return date.toLocaleDateString('en-IN');
    }
  } catch (err) {
    return fallback;
  }
}
