/**
 * In-memory brute-force protection and account lockout manager.
 * Limits failed attempts to 5 before enforcing a 15-minute security lock.
 */

interface LockoutRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const lockoutStore = new Map<string, LockoutRecord>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginAttempts(identifier: string): { 
  isLocked: boolean; 
  remainingMinutes?: number; 
  failedAttempts: number;
  attemptsRemaining: number;
} {
  const key = identifier.toLowerCase().trim();
  const record = lockoutStore.get(key);
  const now = Date.now();

  if (!record) {
    return { isLocked: false, failedAttempts: 0, attemptsRemaining: MAX_ATTEMPTS };
  }

  // Check if locked
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingMs = record.lockedUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return {
      isLocked: true,
      remainingMinutes,
      failedAttempts: record.failedAttempts,
      attemptsRemaining: 0,
    };
  }

  // If lockout expired, reset
  if (record.lockedUntil && record.lockedUntil <= now) {
    lockoutStore.delete(key);
    return { isLocked: false, failedAttempts: 0, attemptsRemaining: MAX_ATTEMPTS };
  }

  return {
    isLocked: false,
    failedAttempts: record.failedAttempts,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - record.failedAttempts),
  };
}

export function recordFailedAttempt(identifier: string): { 
  isLocked: boolean; 
  remainingMinutes?: number; 
  failedAttempts: number;
  attemptsRemaining: number;
} {
  const key = identifier.toLowerCase().trim();
  const record = lockoutStore.get(key) || {
    failedAttempts: 0,
    lockedUntil: null,
    lastAttempt: Date.now(),
  };

  record.failedAttempts += 1;
  record.lastAttempt = Date.now();

  if (record.failedAttempts >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    lockoutStore.set(key, record);
    return {
      isLocked: true,
      remainingMinutes: 15,
      failedAttempts: record.failedAttempts,
      attemptsRemaining: 0,
    };
  }

  lockoutStore.set(key, record);
  return {
    isLocked: false,
    failedAttempts: record.failedAttempts,
    attemptsRemaining: MAX_ATTEMPTS - record.failedAttempts,
  };
}

export function resetLoginAttempts(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  lockoutStore.delete(key);
}
