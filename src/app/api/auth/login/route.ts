import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { checkLoginAttempts, recordFailedAttempt, resetLoginAttempts } from '@/lib/authLockout';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const ipRateLimit = checkRateLimit(`login_ip_${clientIp}`, {
      maxAttempts: 15,
      windowMs: 15 * 60 * 1000,
      lockoutMs: 15 * 60 * 1000,
    });

    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: `⚠️ Too many login attempts from this IP address. For security, please wait ${ipRateLimit.retryAfterSeconds} seconds before retrying.` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if account is currently locked out
    const lockoutStatus = checkLoginAttempts(normalizedEmail);
    if (lockoutStatus.isLocked) {
      return NextResponse.json(
        {
          error: `⚠️ Security Lockout: Too many failed login attempts (5/5). For your protection, this account is locked for ${lockoutStatus.remainingMinutes} minutes. Please try again later or contact the administrator.`
        },
        { status: 429 }
      );
    }

    // 2. Find user in database (supporting login alias mappings)
    let lookupEmail = normalizedEmail;
    if (lookupEmail === 'teacher@school.com') {
      const directTeacher = await prisma.user.findUnique({ where: { email: 'teacher@school.com' } });
      if (!directTeacher) {
        lookupEmail = 'teacher1@school.com';
      }
    } else if (lookupEmail === 'hawk3827@admin' || lookupEmail === 'hawk3827@school.com') {
      lookupEmail = 'hawk3827';
    } else if (lookupEmail === 'netrajit@school.com' || lookupEmail === 'netrajit') {
      lookupEmail = 'netrajit@admin';
    }

    const user = await prisma.user.findUnique({
      where: { email: lookupEmail },
      include: { profile: true },
    });

    if (!user) {
      const attemptResult = recordFailedAttempt(normalizedEmail);
      if (attemptResult.isLocked) {
        return NextResponse.json(
          {
            error: `⚠️ Security Lockout: Too many failed login attempts (5/5). This account is locked for 15 minutes.`
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error: `Invalid email or password. Warning: Attempt ${attemptResult.failedAttempts} of 5 before 15-minute account lockout.`
        },
        { status: 401 }
      );
    }

    // 3. Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const attemptResult = recordFailedAttempt(normalizedEmail);
      if (attemptResult.isLocked) {
        return NextResponse.json(
          {
            error: `⚠️ Security Lockout: Too many failed login attempts (5/5). This account is locked for 15 minutes.`
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error: `Invalid email or password. Warning: Attempt ${attemptResult.failedAttempts} of 5 before 15-minute account lockout.`
        },
        { status: 401 }
      );
    }

    // 4. Restrict access to Teacher and Admin only
    if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Access denied. Only Teacher and Admin portals are supported.' },
        { status: 403 }
      );
    }

    // 5. Successful login: Reset failed attempts counter
    resetLoginAttempts(normalizedEmail);

    // Create session cookie
    const sessionUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.name || 'User',
      passwordUpdatedAt: user.updatedAt.getTime(),
    };

    await createSession(sessionUser);

    return NextResponse.json({
      success: true,
      role: user.role,
      name: sessionUser.name,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred during login.' },
      { status: 500 }
    );
  }
}
