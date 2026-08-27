import prisma from '@/lib/prisma';
import { writeFile, readFile, readdir, unlink, mkdir, stat } from 'fs/promises';
import path from 'path';
import { uploadSnapshotToGoogleDrive, GoogleDriveUploadResult } from './googleDriveBackup';

export interface MediaBackupFile {
  relativePath: string; // e.g. 'uploads/seed-123.jpg'
  base64: string;
  sizeBytes: number;
}

export interface DedicatedFeeBackupResult {
  filenameJson: string;
  filenameCsv: string;
  totalFeeRecords: number;
  totalAmountCollected: number;
  cloudBackupJson?: GoogleDriveUploadResult;
  cloudBackupCsv?: GoogleDriveUploadResult;
  timestamp: string;
}

export interface DatabaseSnapshotData {
  version: string;
  timestamp: string;
  school: string;
  tables: {
    users: any[];
    profiles: any[];
    classes: any[];
    enrollments: any[];
    attendance: any[];
    grades: any[];
    monthlyReports: any[];
    studentActivityDocs: any[];
    admissions: any[];
    announcements: any[];
    events: any[];
    galleryItems: any[];
    messages: any[];
    feePayments: any[];
  };
  mediaFiles?: MediaBackupFile[];
  summary: {
    totalRecords: number;
    usersCount: number;
    studentsCount: number;
    teachersCount: number;
    classesCount: number;
    attendanceCount: number;
    gradesCount: number;
    reportsCount: number;
    admissionsCount: number;
    feePaymentsCount?: number;
    mediaFilesCount?: number;
  };
  cloudBackup?: GoogleDriveUploadResult;
  dedicatedFeeBackup?: DedicatedFeeBackupResult;
}

export interface SnapshotMeta {
  filename: string;
  filepath: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  summary: DatabaseSnapshotData['summary'];
  cloudBackup?: GoogleDriveUploadResult;
  dedicatedFeeBackup?: DedicatedFeeBackupResult;
}

const BACKUP_DIR = (process.env.VERCEL || process.env.NODE_ENV === 'production')
  ? path.join('/tmp', 'snapshots')
  : path.join(process.cwd(), 'backups', 'snapshots');

async function ensureBackupDir() {
  try {
    await mkdir(BACKUP_DIR, { recursive: true });
  } catch (err) {
    // Directory already exists or created
  }
}

/**
 * Recursively scans public/uploads to collect all images, student photos, PDFs and media.
 */
async function collectUploadFiles(dir: string, baseDir: string): Promise<MediaBackupFile[]> {
  const files: MediaBackupFile[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await collectUploadFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && !entry.name.startsWith('.')) {
        try {
          const rel = path.relative(baseDir, fullPath);
          const buf = await readFile(fullPath);
          files.push({
            relativePath: rel,
            base64: buf.toString('base64'),
            sizeBytes: buf.length,
          });
        } catch (e) {
          console.warn(`Error reading media file ${fullPath}:`, e);
        }
      }
    }
  } catch (err) {
    // Directory might not exist yet
  }
  return files;
}

/**
 * Creates a standalone dedicated Monthly Fee Payments backup (JSON & CSV),
 * uploads to Google Drive, and auto-rotates (overwriting old fee backups, keeping only the latest new daily backup).
 */
export async function createDedicatedFeeBackup(): Promise<DedicatedFeeBackupResult> {
  await ensureBackupDir();

  const feePayments = await prisma.feePayment.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const timestamp = new Date().toISOString();
  const totalAmountCollected = feePayments.reduce((sum, f) => sum + f.totalAmount, 0);

  // 1. JSON Dedicated Fee Backup
  const feeBackupJsonData = {
    version: '2.0-FEES-DEDICATED',
    timestamp,
    school: 'LITTLE HOUSE (Waiton Lamkhai, Imphal East, Manipur)',
    backupType: 'DEDICATED_MONTHLY_FEE_PAYMENTS_REGISTER',
    summary: {
      totalFeeRecords: feePayments.length,
      totalAmountCollected,
    },
    feePayments,
  };

  const filenameJson = 'LHS_Fee_Payments_Backup_Latest.json';
  const filepathJson = path.join(BACKUP_DIR, filenameJson);
  const jsonContent = JSON.stringify(feeBackupJsonData, null, 2);

  // Upload JSON to Google Drive
  const cloudJsonResult = await uploadSnapshotToGoogleDrive(
    filenameJson,
    jsonContent,
    'application/json'
  );

  await writeFile(filepathJson, jsonContent, 'utf-8');

  // 2. CSV Dedicated Fee Backup
  const csvHeader = 'Receipt No,Student Name,Admission No,Class,Parent Phone,Paid Months,Tuition Fee,Transport Fee,Total Amount,Payment Mode,Payment Ref,Status,Date\n';
  const csvRows = feePayments.map((f) => 
    `"${f.receiptNo}","${f.studentName}","${f.admissionNo}","${f.studentClass}","${f.parentPhone || ''}","${f.paidMonths}",${f.tuitionFee},${f.transportFee},${f.totalAmount},"${f.paymentMode}","${f.paymentRef}","${f.paymentStatus}","${new Date(f.createdAt).toISOString()}"`
  ).join('\n');

  const filenameCsv = 'LHS_Fee_Payments_Backup_Latest.csv';
  const filepathCsv = path.join(BACKUP_DIR, filenameCsv);
  const csvContent = csvHeader + csvRows;

  // Upload CSV to Google Drive
  const cloudCsvResult = await uploadSnapshotToGoogleDrive(
    filenameCsv,
    csvContent,
    'text/csv'
  );

  await writeFile(filepathCsv, csvContent, 'utf-8');

  // Auto-prune old fee backups in local folder
  try {
    const existingFiles = await readdir(BACKUP_DIR);
    const oldFeeFiles = existingFiles.filter(
      (f) => f.startsWith('LHS_Fee_Payments_Backup_') && f !== filenameJson && f !== filenameCsv
    );
    for (const oldFile of oldFeeFiles) {
      try {
        await unlink(path.join(BACKUP_DIR, oldFile));
      } catch (err) {
        // ignore
      }
    }
  } catch (err) {
    // ignore
  }

  return {
    filenameJson,
    filenameCsv,
    totalFeeRecords: feePayments.length,
    totalAmountCollected,
    cloudBackupJson: cloudJsonResult,
    cloudBackupCsv: cloudCsvResult,
    timestamp,
  };
}

/**
 * Creates a complete database + media snapshot, saves locally, and uploads to Google Drive.
 */
export async function createDatabaseSnapshot(): Promise<SnapshotMeta> {
  await ensureBackupDir();

  // 1. Fetch all data across all tables (including feePayments)
  const [
    users,
    profiles,
    classes,
    enrollments,
    attendance,
    grades,
    monthlyReports,
    studentActivityDocs,
    admissions,
    announcements,
    events,
    galleryItems,
    messages,
    feePayments
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.profile.findMany(),
    prisma.class.findMany(),
    prisma.enrollment.findMany(),
    prisma.attendance.findMany(),
    prisma.grade.findMany(),
    prisma.monthlyReport.findMany(),
    prisma.studentActivityDocument.findMany(),
    prisma.admission.findMany(),
    prisma.announcement.findMany(),
    prisma.event.findMany(),
    prisma.galleryItem.findMany(),
    prisma.message.findMany(),
    prisma.feePayment.findMany(),
  ]);

  // 2. Scan and bundle all uploaded media (Student photos, gallery photos, notices, certificates)
  const publicDir = path.join(process.cwd(), 'public');
  const uploadsDir = path.join(publicDir, 'uploads');
  const mediaFiles = await collectUploadFiles(uploadsDir, publicDir);

  const studentsCount = users.filter((u) => u.role === 'STUDENT').length;
  const teachersCount = users.filter((u) => u.role === 'TEACHER').length;

  const totalRecords =
    users.length +
    profiles.length +
    classes.length +
    enrollments.length +
    attendance.length +
    grades.length +
    monthlyReports.length +
    studentActivityDocs.length +
    admissions.length +
    announcements.length +
    events.length +
    galleryItems.length +
    messages.length +
    feePayments.length;

  const summary = {
    totalRecords,
    usersCount: users.length,
    studentsCount,
    teachersCount,
    classesCount: classes.length,
    attendanceCount: attendance.length,
    gradesCount: grades.length,
    reportsCount: monthlyReports.length,
    admissionsCount: admissions.length,
    feePaymentsCount: feePayments.length,
    mediaFilesCount: mediaFiles.length,
  };

  const timestamp = new Date().toISOString();
  
  // Format clean date and time string in IST (Asia/Kolkata) for human readability in Google Drive
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  parts.forEach((p) => (map[p.type] = p.value));

  const day = map.day || '01';
  const month = map.month || 'Jan';
  const year = map.year || '2026';
  const hour = map.hour || '12';
  const minute = map.minute || '00';
  const second = map.second || '00';
  const dayPeriod = (map.dayPeriod || 'AM').toUpperCase();

  const filename = `LittleHouse_Backup_${day}-${month}-${year}_${hour}-${minute}-${second}-${dayPeriod}.json`;
  const filepath = path.join(BACKUP_DIR, filename);

  // Generate dedicated fee backup automatically
  let dedicatedFeeBackup: DedicatedFeeBackupResult | undefined;
  try {
    dedicatedFeeBackup = await createDedicatedFeeBackup();
  } catch (err) {
    console.warn('Dedicated fee backup generation error:', err);
  }

  const snapshotData: DatabaseSnapshotData = {
    version: '2.0',
    timestamp,
    school: 'LITTLE HOUSE (Waiton Lamkhai, Imphal East, Manipur)',
    tables: {
      users,
      profiles,
      classes,
      enrollments,
      attendance,
      grades,
      monthlyReports,
      studentActivityDocs,
      admissions,
      announcements,
      events,
      galleryItems,
      messages,
      feePayments,
    },
    mediaFiles,
    summary,
    dedicatedFeeBackup,
  };

  // 3. Upload full snapshot to Google Drive
  const jsonContent = JSON.stringify(snapshotData, null, 2);
  const cloudResult = await uploadSnapshotToGoogleDrive(filename, jsonContent, 'application/json');
  snapshotData.cloudBackup = cloudResult;

  // 4. Write locally to disk
  await writeFile(filepath, JSON.stringify(snapshotData, null, 2), 'utf-8');

  // 5. Automatically delete older local snapshot files (keep latest active snapshot)
  try {
    const existingFiles = await readdir(BACKUP_DIR);
    const oldSnapshots = existingFiles.filter(
      (f) => (f.startsWith('LittleHouse_Backup_') || f.startsWith('lhs-backup-')) && f.endsWith('.json') && f !== filename
    );
    for (const oldFile of oldSnapshots) {
      try {
        await unlink(path.join(BACKUP_DIR, oldFile));
      } catch (err) {
        console.warn(`Failed to prune old local snapshot ${oldFile}:`, err);
      }
    }
  } catch (err) {
    console.warn('Auto-pruning local backups error:', err);
  }

  const fileStat = await stat(filepath);
  const sizeFormatted = fileStat.size > 1024 * 1024
    ? `${(fileStat.size / (1024 * 1024)).toFixed(2)} MB`
    : `${(fileStat.size / 1024).toFixed(1)} KB`;

  // Log backup event in AdminAuditLog for tracking in Admin Audit tab
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminEmail: 'cron@thelittlehouseschool.in',
        adminName: 'Automated Nightly System Cron',
        actionType: 'CREATE',
        category: 'BACKUP',
        targetName: `Nightly Snapshot: ${filename}`,
        description: `Automated nightly database snapshot completed (${summary.totalRecords} records, ${summary.mediaFilesCount} media files, ${sizeFormatted}). Cloud Sync: ${cloudResult.success ? 'Google Drive Synced' : 'Completed'}`,
      },
    });
  } catch (e) {}

  return {
    filename,
    filepath,
    sizeBytes: fileStat.size,
    sizeFormatted,
    createdAt: timestamp,
    summary,
    cloudBackup: cloudResult,
  };
}

/**
 * Lists all existing database snapshots.
 */
export async function listDatabaseSnapshots(): Promise<SnapshotMeta[]> {
  await ensureBackupDir();

  try {
    const files = await readdir(BACKUP_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const snapshots: SnapshotMeta[] = [];

    for (const file of jsonFiles) {
      try {
        const filepath = path.join(BACKUP_DIR, file);
        const fileStat = await stat(filepath);
        const raw = await readFile(filepath, 'utf-8');
        const data: DatabaseSnapshotData = JSON.parse(raw);

        snapshots.push({
          filename: file,
          filepath,
          sizeBytes: fileStat.size,
          sizeFormatted:
            fileStat.size > 1024 * 1024
              ? `${(fileStat.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(fileStat.size / 1024).toFixed(1)} KB`,
          createdAt: data.timestamp || fileStat.birthtime.toISOString(),
          summary: data.summary || {
            totalRecords: 0,
            usersCount: 0,
            studentsCount: 0,
            teachersCount: 0,
            classesCount: 0,
            attendanceCount: 0,
            gradesCount: 0,
            reportsCount: 0,
            admissionsCount: 0,
            mediaFilesCount: 0,
          },
          cloudBackup: data.cloudBackup,
        });
      } catch (e) {
        console.warn(`Error parsing backup file ${file}:`, e);
      }
    }

    // Sort newest first
    return snapshots.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error listing snapshots:', error);
    return [];
  }
}

/**
 * Restores the database and all media images/PDFs from a snapshot data object.
 */
export async function restoreDatabaseSnapshot(
  snapshotData: DatabaseSnapshotData
): Promise<{ success: boolean; restoredRecords: number; restoredMediaCount: number; message: string }> {
  const { tables, mediaFiles } = snapshotData;

  if (!tables || !tables.users || !tables.profiles) {
    throw new Error('Invalid snapshot structure. Required tables missing.');
  }

  // 1. Clear existing database tables in dependency order & restore
  await prisma.$transaction(async (tx) => {
    await tx.message.deleteMany({});
    await tx.event.deleteMany({});
    await tx.galleryItem.deleteMany({});
    await tx.announcement.deleteMany({});
    await tx.grade.deleteMany({});
    await tx.attendance.deleteMany({});
    await tx.studentActivityDocument.deleteMany({});
    await tx.monthlyReport.deleteMany({});
    await tx.admission.deleteMany({});
    await tx.studentParent.deleteMany({});
    await tx.enrollment.deleteMany({});
    await tx.class.deleteMany({});
    await tx.profile.deleteMany({});
    await tx.user.deleteMany({});

    // 1. Restore Users
    for (const u of tables.users) {
      await tx.user.create({
        data: {
          id: u.id,
          email: u.email,
          password: u.password,
          role: u.role,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        },
      });
    }

    // 2. Restore Profiles
    for (const p of tables.profiles) {
      await tx.profile.create({
        data: {
          id: p.id,
          name: p.name,
          phone: p.phone,
          address: p.address,
          admissionNo: p.admissionNo,
          photoUrl: p.photoUrl,
          isArchived: p.isArchived ?? false,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        },
      });
    }

    // 3. Restore Classes
    for (const c of tables.classes) {
      await tx.class.create({
        data: {
          id: c.id,
          name: c.name,
          description: c.description,
          teacherId: c.teacherId,
          createdAt: new Date(c.createdAt),
        },
      });
    }

    // 4. Restore Enrollments
    for (const e of tables.enrollments) {
      await tx.enrollment.create({
        data: {
          id: e.id,
          studentId: e.studentId,
          classId: e.classId,
          createdAt: new Date(e.createdAt || e.enrolledAt || Date.now()),
        },
      });
    }

    // 5. Restore Attendance
    for (const a of tables.attendance) {
      await tx.attendance.create({
        data: {
          id: a.id,
          studentId: a.studentId,
          date: new Date(a.date),
          status: a.status,
          markedById: a.markedById,
          createdAt: new Date(a.createdAt),
        },
      });
    }

    // 6. Restore Grades
    for (const g of tables.grades) {
      await tx.grade.create({
        data: {
          id: g.id,
          studentId: g.studentId,
          subject: g.subject,
          score: g.score,
          maxScore: g.maxScore,
          remarks: g.remarks,
          teacherId: g.teacherId,
          assessmentDate: new Date(g.assessmentDate),
          createdAt: new Date(g.createdAt),
        },
      });
    }

    // 7. Restore Monthly Reports
    if (tables.monthlyReports) {
      for (const m of tables.monthlyReports) {
        await tx.monthlyReport.create({
          data: {
            id: m.id,
            studentId: m.studentId,
            month: m.month,
            totalDays: m.totalDays,
            daysPresent: m.daysPresent,
            daysAbsent: m.daysAbsent,
            conduct: m.conduct,
            remarks: m.remarks,
            attachmentUrl: m.attachmentUrl,
            attachmentName: m.attachmentName,
            uploadedById: m.uploadedById,
            createdAt: new Date(m.createdAt),
            updatedAt: new Date(m.updatedAt),
          },
        });
      }
    }

    // 8. Restore Activity Docs
    if (tables.studentActivityDocs) {
      for (const act of tables.studentActivityDocs) {
        await tx.studentActivityDocument.create({
          data: {
            id: act.id,
            studentId: act.studentId,
            title: act.title,
            type: act.type,
            fileUrl: act.fileUrl,
            fileName: act.fileName,
            fileType: act.fileType,
            remarks: act.remarks,
            activityDate: act.activityDate ? new Date(act.activityDate) : null,
            uploadedById: act.uploadedById,
            createdAt: new Date(act.createdAt),
          },
        });
      }
    }

    // 9. Restore Admissions
    if (tables.admissions) {
      for (const adm of tables.admissions) {
        await tx.admission.create({
          data: {
            id: adm.id,
            studentName: adm.studentName,
            grade: adm.grade,
            parentName: adm.parentName,
            parentEmail: adm.parentEmail,
            parentPhone: adm.parentPhone || null,
            amount: adm.amount,
            status: adm.status,
            paymentReference: adm.paymentReference || null,
            createdAt: new Date(adm.createdAt),
          },
        });
      }
    }

    // 10. Restore Announcements, Events, Gallery & Messages
    if (tables.announcements) {
      for (const ann of tables.announcements) {
        await tx.announcement.create({
          data: {
            id: ann.id,
            title: ann.title,
            content: ann.content,
            audience: ann.audience || 'ALL',
            imageUrl: ann.imageUrl || null,
            isTicker: ann.isTicker ?? true,
            classId: ann.classId || null,
            createdById: ann.createdById || ann.authorId,
            createdAt: new Date(ann.createdAt),
          },
        });
      }
    }

    if (tables.events) {
      for (const ev of tables.events) {
        await tx.event.create({
          data: {
            id: ev.id,
            title: ev.title,
            description: ev.description || null,
            date: new Date(ev.date),
            type: ev.type || 'OTHER',
            createdAt: new Date(ev.createdAt),
          },
        });
      }
    }

    if (tables.galleryItems) {
      for (const gal of tables.galleryItems) {
        await tx.galleryItem.create({
          data: {
            id: gal.id,
            title: gal.title,
            imageUrl: gal.imageUrl || gal.url || '',
            mediaType: gal.mediaType || 'PHOTO',
            videoUrl: gal.videoUrl || null,
            description: gal.description || gal.caption || null,
            category: gal.category || 'CAMPUS',
            createdAt: new Date(gal.createdAt),
          },
        });
      }
    }

    if (tables.messages) {
      for (const msg of tables.messages) {
        await tx.message.create({
          data: {
            id: msg.id,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            read: msg.read ?? false,
            createdAt: new Date(msg.createdAt),
          },
        });
      }
    }
  });

  // 2. Restore all media files (Photos, Certificates, PDFs) onto disk with Zip-Slip defense
  let restoredMediaCount = 0;
  if (mediaFiles && Array.isArray(mediaFiles)) {
    const publicDir = path.resolve(process.cwd(), 'public');
    for (const m of mediaFiles) {
      try {
        if (!m.relativePath || typeof m.relativePath !== 'string') continue;

        // Strip path traversal sequences ('../', '..\', null bytes)
        const sanitizedRel = m.relativePath
          .replace(/(\.\.[\/\\]|[\x00-\x1f\x7f])/g, '')
          .replace(/^[\\\/]+/, '');

        const destPath = path.resolve(publicDir, sanitizedRel);

        // Strictly verify resolved path remains safely inside public directory
        if (!destPath.startsWith(publicDir)) {
          console.warn(`[Security Alert] Blocked Zip-Slip path traversal attempt in backup: ${m.relativePath}`);
          continue;
        }

        await mkdir(path.dirname(destPath), { recursive: true });
        const buf = Buffer.from(m.base64, 'base64');
        await writeFile(destPath, buf);
        restoredMediaCount++;
      } catch (err) {
        console.warn(`Failed to restore media file ${m.relativePath}:`, err);
      }
    }
  }

  return {
    success: true,
    restoredRecords: snapshotData.summary?.totalRecords || 0,
    restoredMediaCount,
    message: `Database & Media successfully restored (${snapshotData.summary?.totalRecords || 0} records + ${restoredMediaCount} photos/documents restored).`,
  };
}

/**
 * Deletes a snapshot file locally.
 */
export async function deleteDatabaseSnapshot(filename: string): Promise<boolean> {
  const filepath = path.join(BACKUP_DIR, filename);
  try {
    await unlink(filepath);
    return true;
  } catch (err) {
    console.error(`Failed to delete snapshot ${filename}:`, err);
    return false;
  }
}
