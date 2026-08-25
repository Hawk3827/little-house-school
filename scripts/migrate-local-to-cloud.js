const betterSqlite3 = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const path = require('path');

// 1. Connect to local SQLite database (dev.db)
const dbPath = path.join(__dirname, '..', 'dev.db');
const localDb = betterSqlite3(dbPath);

console.log('📦 Reading local database from:', dbPath);

// 2. Connect to Neon Cloud PostgreSQL database
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
  console.error('❌ Error: DATABASE_URL environment variable is missing or invalid.');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prismaCloud = new PrismaClient({ adapter });

async function migrateData() {
  try {
    console.log('⚡ Connected to Neon Cloud PostgreSQL Database!');
    console.log('🚀 Starting local-to-cloud data migration...\n');

    // Read local records
    const users = localDb.prepare('SELECT * FROM User').all();
    const profiles = localDb.prepare('SELECT * FROM Profile').all();
    const classes = localDb.prepare('SELECT * FROM Class').all();
    const enrollments = localDb.prepare('SELECT * FROM Enrollment').all();
    const studentParents = localDb.prepare('SELECT * FROM StudentParent').all();
    const attendances = localDb.prepare('SELECT * FROM Attendance').all();
    const grades = localDb.prepare('SELECT * FROM Grade').all();
    const announcements = localDb.prepare('SELECT * FROM Announcement').all();
    const galleryItems = localDb.prepare('SELECT * FROM GalleryItem').all();
    const messages = localDb.prepare('SELECT * FROM Message').all();
    const events = localDb.prepare('SELECT * FROM Event').all();
    const admissions = localDb.prepare('SELECT * FROM Admission').all();
    const monthlyReports = localDb.prepare('SELECT * FROM MonthlyReport').all();
    const activityDocs = localDb.prepare('SELECT * FROM StudentActivityDocument').all();

    console.log(`Summary of local records to push:`);
    console.log(` - Users: ${users.length}`);
    console.log(` - Profiles: ${profiles.length}`);
    console.log(` - Classes: ${classes.length}`);
    console.log(` - Announcements: ${announcements.length}`);
    console.log(` - Gallery Items: ${galleryItems.length}`);
    console.log(` - Admissions: ${admissions.length}`);
    console.log(` - Monthly Reports: ${monthlyReports.length}`);
    console.log(` - Activity Docs: ${activityDocs.length}\n`);

    // Clear existing cloud tables in dependency order
    console.log('🧹 Clearing sample cloud data...');
    await prismaCloud.studentActivityDocument.deleteMany({});
    await prismaCloud.monthlyReport.deleteMany({});
    await prismaCloud.admission.deleteMany({});
    await prismaCloud.message.deleteMany({});
    await prismaCloud.event.deleteMany({});
    await prismaCloud.galleryItem.deleteMany({});
    await prismaCloud.announcement.deleteMany({});
    await prismaCloud.grade.deleteMany({});
    await prismaCloud.attendance.deleteMany({});
    await prismaCloud.studentParent.deleteMany({});
    await prismaCloud.enrollment.deleteMany({});
    await prismaCloud.class.deleteMany({});
    await prismaCloud.profile.deleteMany({});
    await prismaCloud.user.deleteMany({});

    // 1. Users
    console.log('📥 Migrating Users...');
    for (const u of users) {
      await prismaCloud.user.create({
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

    // 2. Profiles
    console.log('📥 Migrating Profiles...');
    for (const p of profiles) {
      await prismaCloud.profile.create({
        data: {
          id: p.id,
          name: p.name,
          phone: p.phone,
          address: p.address,
          admissionNo: p.admissionNo,
          photoUrl: p.photoUrl,
          isArchived: p.isArchived === 1 || p.isArchived === true,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        },
      });
    }

    // 3. Classes
    console.log('📥 Migrating Classes...');
    for (const c of classes) {
      await prismaCloud.class.create({
        data: {
          id: c.id,
          name: c.name,
          description: c.description,
          teacherId: c.teacherId,
          createdAt: new Date(c.createdAt),
        },
      });
    }

    // 4. Enrollments
    console.log('📥 Migrating Student Enrollments...');
    for (const e of enrollments) {
      await prismaCloud.enrollment.create({
        data: {
          id: e.id,
          studentId: e.studentId,
          classId: e.classId,
          createdAt: new Date(e.createdAt),
        },
      });
    }

    // 5. Announcements / Notices
    console.log('📥 Migrating Announcements & Notices...');
    for (const a of announcements) {
      await prismaCloud.announcement.create({
        data: {
          id: a.id,
          title: a.title,
          content: a.content,
          audience: a.audience,
          imageUrl: a.imageUrl,
          isTicker: a.isTicker === 1 || a.isTicker === true,
          isPinned: a.isPinned === 1 || a.isPinned === true,
          classId: a.classId,
          createdById: a.createdById,
          createdAt: new Date(a.createdAt),
        },
      });
    }

    // 6. Gallery Items
    console.log('📥 Migrating Gallery Photos & Videos...');
    for (const g of galleryItems) {
      await prismaCloud.galleryItem.create({
        data: {
          id: g.id,
          title: g.title,
          imageUrl: g.imageUrl,
          mediaType: g.mediaType || 'PHOTO',
          videoUrl: g.videoUrl,
          description: g.description,
          category: g.category || 'CAMPUS',
          createdAt: new Date(g.createdAt),
        },
      });
    }

    // 7. Admissions
    console.log('📥 Migrating Online Paid Admissions...');
    for (const adm of admissions) {
      await prismaCloud.admission.create({
        data: {
          id: adm.id,
          studentName: adm.studentName,
          grade: adm.grade,
          parentName: adm.parentName,
          parentEmail: adm.parentEmail,
          parentPhone: adm.parentPhone,
          amount: adm.amount,
          status: adm.status,
          paymentReference: adm.paymentReference,
          verificationStatus: adm.verificationStatus || 'PENDING_VERIFICATION',
          verifiedAt: adm.verifiedAt ? new Date(adm.verifiedAt) : null,
          verifiedBy: adm.verifiedBy,
          verificationNotes: adm.verificationNotes,
          createdAt: new Date(adm.createdAt),
        },
      });
    }

    // 8. Monthly Reports
    if (monthlyReports.length > 0) {
      console.log('📥 Migrating Monthly Reports...');
      for (const mr of monthlyReports) {
        await prismaCloud.monthlyReport.create({
          data: {
            id: mr.id,
            studentId: mr.studentId,
            month: mr.month,
            totalDays: mr.totalDays || 0,
            daysPresent: mr.daysPresent || 0,
            daysAbsent: mr.daysAbsent || 0,
            conduct: mr.conduct,
            remarks: mr.remarks,
            attachmentUrl: mr.attachmentUrl,
            attachmentName: mr.attachmentName,
            uploadedById: mr.uploadedById,
            createdAt: new Date(mr.createdAt),
            updatedAt: new Date(mr.updatedAt),
          },
        });
      }
    }

    // 9. Activity Docs
    if (activityDocs.length > 0) {
      console.log('📥 Migrating Student Activity Documents...');
      for (const ad of activityDocs) {
        await prismaCloud.studentActivityDocument.create({
          data: {
            id: ad.id,
            studentId: ad.studentId,
            title: ad.title,
            type: ad.type || 'PHOTO',
            fileUrl: ad.fileUrl,
            fileName: ad.fileName,
            fileType: ad.fileType,
            remarks: ad.remarks,
            activityDate: ad.activityDate ? new Date(ad.activityDate) : null,
            uploadedById: ad.uploadedById,
            createdAt: new Date(ad.createdAt),
            updatedAt: new Date(ad.updatedAt),
          },
        });
      }
    }

    console.log('\n🎉 SUCCESS! All local students, paid admissions, notices, and gallery photos migrated to Neon Cloud!');
  } catch (error) {
    console.error('❌ Migration Error:', error);
  } finally {
    await prismaCloud.$disconnect();
    await pool.end();
  }
}

migrateData();
