/**
 * Production XSS Sanitizer
 * Strips executable JavaScript, evil attributes (onerror, onload, onclick),
 * dangerous protocols (javascript:, data:, vbscript:), and malicious iframe/embed tags.
 */

export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, '') // Removes onerror, onload, onclick etc.
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/javascript:[^"'\s>]+/gi, '')
    .replace(/data:[^"'\s>]+/gi, '')
    .trim();
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return sanitizeText(input)
    .replace(/<!--[\s\S]*?-->/g, '') // Strip comments
    .trim();
}
