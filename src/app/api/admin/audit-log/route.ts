import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch Admin Audit & Change Logs (EXCLUSIVE to Master Admin hawk3827@admin)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    const userEmail = (session?.email || (session as any)?.user?.email || '').toLowerCase();

    if (!session || session.role !== 'ADMIN' || !userEmail.includes('hawk3827')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin Audit & Change Log is strictly restricted to Master Administrator hawk3827@admin.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'ALL';
    const limitParam = searchParams.get('limit') || '100';
    const limitNum = limitParam === 'all' ? 1000 : parseInt(limitParam, 10) || 100;

    // 1. Fetch Explicit Audit Logs from database
    const dbAuditLogs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    // 2. Fetch Real Fee Payments recorded across all admins & staff
    const feePayments = await prisma.feePayment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });

    const feeAuditItems = feePayments.map((fp) => {
      const recorder = fp.recordedBy || 'Admin Office';
      let adminEmail = 'admin@school.com';
      if (recorder.toLowerCase().includes('netrajit')) adminEmail = 'netrajit@admin';
      if (recorder.toLowerCase().includes('ranjana')) adminEmail = 'admin@school.com';

      return {
        id: `fee_${fp.id}`,
        adminEmail,
        adminName: recorder,
        actionType: 'PAYMENT',
        category: 'FEE_PAYMENT',
        targetName: `${fp.studentName} (${fp.studentClass})`,
        description: `Issued Fee Receipt #${fp.receiptNo} of ₹${fp.totalAmount.toLocaleString('en-IN')} for ${fp.paidMonths} (${fp.paymentMode})`,
        createdAt: fp.createdAt.toISOString(),
      };
    });

    // 3. Fetch Announcements published by admins
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: {
        id: true,
        title: true,
        audience: true,
        createdAt: true,
        createdBy: { select: { name: true } },
      },
    });

    const announcementAuditItems = announcements.map((ann) => ({
      id: `ann_${ann.id}`,
      adminEmail: 'admin@school.com',
      adminName: ann.createdBy?.name || 'Haobam Chanu Ranjana',
      actionType: 'CREATE',
      category: 'ANNOUNCEMENT',
      targetName: `Notice: ${ann.title}`,
      description: `Published circular notice "${ann.title}" for audience: ${ann.audience}`,
      createdAt: ann.createdAt.toISOString(),
    }));

    // 4. Fetch School Gallery uploads
    const galleryItems = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    const galleryAuditItems = galleryItems.map((g) => ({
      id: `gal_${g.id}`,
      adminEmail: 'admin@school.com',
      adminName: 'Media Admin',
      actionType: 'CREATE',
      category: 'GALLERY',
      targetName: `Gallery: ${g.title}`,
      description: `Uploaded ${g.mediaType.toLowerCase()} "${g.title}" to school campus gallery`,
      createdAt: g.createdAt.toISOString(),
    }));

    // 5. Combine and Sort all administrative change records in descending chronological order
    let allLogs = [
      ...dbAuditLogs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
      ...feeAuditItems,
      ...announcementAuditItems,
      ...galleryAuditItems,
    ];

    // Remove potential duplicate entries by description key
    const seen = new Set();
    allLogs = allLogs.filter((l) => {
      const key = `${l.category}_${l.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply category filter if specified
    if (category !== 'ALL') {
      allLogs = allLogs.filter((l) => l.category === category);
    }

    const finalLogs = allLogs.slice(0, limitNum);

    return NextResponse.json({ success: true, logs: finalLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}

// POST: Add new Admin Audit Log Entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      adminEmail = 'admin@school.com',
      adminName = 'Admin Staff',
      actionType = 'UPDATE',
      category = 'GENERAL',
      targetName,
      description,
    } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const log = await prisma.adminAuditLog.create({
      data: {
        adminEmail,
        adminName,
        actionType,
        category,
        targetName,
        description,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create audit log' }, { status: 500 });
  }
}
