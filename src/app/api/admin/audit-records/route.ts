import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch Admin Audit & Change Logs
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin portal access required.' },
        { status: 401 }
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
      if (recorder.toLowerCase().includes('hawk')) adminEmail = 'hawk3827@admin';
      if (recorder.toLowerCase().includes('ranjana')) adminEmail = 'admin@school.com';

      return {
        id: `fee_${fp.id}`,
        adminEmail,
        adminName: recorder,
        actionType: 'PAYMENT',
        category: 'FEE_PAYMENT',
        targetName: `${fp.studentName} (${fp.studentClass})`,
        description: `Issued & Updated Fee Receipt #${fp.receiptNo} of ₹${fp.totalAmount.toLocaleString('en-IN')} for ${fp.paidMonths} (${fp.paymentMode})`,
        createdAt: fp.createdAt.toISOString(),
      };
    });

    // 3. Fetch Student Roster & Teacher Additions
    const userRecords = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            admissionNo: true,
          },
        },
      },
    });

    const userAuditItems = userRecords.map((u) => {
      const nameStr = u.profile?.name || u.email;
      const isStudent = u.role === 'STUDENT';
      const isTeacher = u.role === 'TEACHER';

      return {
        id: `usr_${u.id}`,
        adminEmail: 'admin@school.com',
        adminName: 'Admin Office',
        actionType: 'CREATE',
        category: isStudent ? 'STUDENT' : isTeacher ? 'TEACHER' : 'SECURITY',
        targetName: `${isStudent ? 'Student' : isTeacher ? 'Teacher' : 'Admin'}: ${nameStr}`,
        description: isStudent
          ? `Enrolled new student ${nameStr} (Adm #${u.profile?.admissionNo || 'Auto'}) into school roster`
          : `Created new ${u.role.toLowerCase()} account for ${nameStr} (${u.email})`,
        createdAt: u.createdAt.toISOString(),
      };
    });

    // 4. Fetch Online Admission Applications & Verifications
    const admissions = await prisma.admission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const admissionAuditItems = admissions.map((adm) => ({
      id: `adm_${adm.id}`,
      adminEmail: 'admin@school.com',
      adminName: adm.verifiedBy || 'Admin Admissions Desk',
      actionType: adm.verificationStatus === 'VERIFIED' ? 'UPDATE' : 'CREATE',
      category: 'STUDENT',
      targetName: `Admission: ${adm.studentName} (${adm.grade})`,
      description: `Processed online admission for ${adm.studentName} (${adm.grade}) - Status: ${adm.verificationStatus} (${adm.verificationNotes || 'Application received'})`,
      createdAt: adm.createdAt.toISOString(),
    }));

    // 5. Fetch Announcements published by admins
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
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

    // 6. Fetch School Gallery uploads
    const galleryItems = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
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

    // 7. Combine and Sort all administrative change records in descending chronological order
    let allLogs = [
      ...dbAuditLogs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
      ...feeAuditItems,
      ...userAuditItems,
      ...admissionAuditItems,
      ...announcementAuditItems,
      ...galleryAuditItems,
    ];

    // Deduplicate by unique record ID
    const seen = new Set();
    allLogs = allLogs.filter((l) => {
      const key = l.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Flexible Case-Insensitive Category Filtering
    if (category !== 'ALL') {
      const catUpper = category.toUpperCase().trim();
      allLogs = allLogs.filter((l) => {
        const itemCat = (l.category || '').toUpperCase().trim();
        if (catUpper.startsWith('FEE') && itemCat.startsWith('FEE')) return true;
        if (catUpper.startsWith('STUDENT') && itemCat.startsWith('STUDENT')) return true;
        if (catUpper.startsWith('TEACHER') && itemCat.startsWith('TEACHER')) return true;
        if (catUpper.startsWith('ANNOUNCE') && itemCat.startsWith('ANNOUNCE')) return true;
        if (catUpper.startsWith('GALLERY') && itemCat.startsWith('GALLERY')) return true;
        if (catUpper.startsWith('SECUR') && itemCat.startsWith('SECUR')) return true;
        if (catUpper.startsWith('BACKUP') && itemCat.startsWith('BACKUP')) return true;
        return itemCat === catUpper;
      });
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

// DELETE: Remove individual audit entry OR purge audit logs by timeline
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const timeline = searchParams.get('timeline'); // '7_DAYS' | '30_DAYS' | '90_DAYS' | 'PURGE_ALL'

    if (id) {
      // If deleting a specific AdminAuditLog row
      if (!id.startsWith('fee_') && !id.startsWith('usr_') && !id.startsWith('gal_') && !id.startsWith('ann_')) {
        await prisma.adminAuditLog.delete({ where: { id } }).catch(() => {});
      }
      return NextResponse.json({ success: true, message: 'Audit entry removed successfully.' });
    }

    if (timeline) {
      let cutoffDate: Date | null = null;
      const now = new Date();

      if (timeline === '7_DAYS') {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeline === '30_DAYS') {
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (timeline === '90_DAYS') {
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else if (timeline === 'PURGE_ALL') {
        await prisma.adminAuditLog.deleteMany({});
        return NextResponse.json({ success: true, message: 'All audit log records purged successfully.' });
      }

      if (cutoffDate) {
        await prisma.adminAuditLog.deleteMany({
          where: {
            createdAt: { lt: cutoffDate },
          },
        });
        return NextResponse.json({ success: true, message: `Audit logs older than ${timeline.replace('_', ' ')} purged successfully.` });
      }
    }

    return NextResponse.json({ error: 'Specify an entry ID or timeline parameter to delete.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete audit log entry' }, { status: 500 });
  }
}
