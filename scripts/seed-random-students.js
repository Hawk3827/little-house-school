require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Error: DATABASE_URL environment variable is missing.');
  process.exit(1);
}
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SAMPLE_STUDENTS = [
  // Class I
  { name: 'Khuman Tomba', class: 'Class I', admNo: 'LHS-2026-101', phone: '+91 98621 11201' },
  { name: 'Ningthouja Linthoingambi', class: 'Class I', admNo: 'LHS-2026-102', phone: '+91 98621 11202' },
  { name: 'Leishangthem Yaiphaba', class: 'Class I', admNo: 'LHS-2026-103', phone: '+91 98621 11203' },

  // Class II
  { name: 'Thokchom Priyobrata', class: 'Class II', admNo: 'LHS-2026-201', phone: '+91 98621 11204' },
  { name: 'Sanabam Bembem', class: 'Class II', admNo: 'LHS-2026-202', phone: '+91 98621 11205' },
  { name: 'Yumkham Rohit', class: 'Class II', admNo: 'LHS-2026-203', phone: '+91 98621 11206' },

  // Class III
  { name: 'Chanu Nungshiba', class: 'Class III', admNo: 'LHS-2026-7220', phone: '+91 98621 11207' },
  { name: 'Laishram Prem', class: 'Class III', admNo: 'LHS-2026-301', phone: '+91 98621 11208' },
  { name: 'Salam Sanatombi', class: 'Class III', admNo: 'LHS-2026-302', phone: '+91 98621 11209' },

  // Class IV
  { name: 'Konsam Devendra', class: 'Class IV', admNo: 'LHS-2026-401', phone: '+91 98621 11210' },
  { name: 'Mutum Roshini', class: 'Class IV', admNo: 'LHS-2026-402', phone: '+91 98621 11211' },
  { name: 'Heikrujam Bikram', class: 'Class IV', admNo: 'LHS-2026-403', phone: '+91 98621 11212' },

  // Class V
  { name: 'Soraisam Lanchenba', class: 'Class V', admNo: 'LHS-2026-501', phone: '+91 98621 11213' },
  { name: 'Pukhrambam Elizabeth', class: 'Class V', admNo: 'LHS-2026-502', phone: '+91 98621 11214' },

  // Class VI
  { name: 'Hijam Malemnganba', class: 'Class VI', admNo: 'LHS-2026-601', phone: '+91 98621 11215' },
  { name: 'Wangkhem Thoi', class: 'Class VI', admNo: 'LHS-2026-602', phone: '+91 98621 11216' },

  // Lower KG
  { name: 'Naorem Thouba', class: 'Lower KG', admNo: 'LHS-2026-001', phone: '+91 98621 11217' },
  { name: 'Irom Radharani', class: 'Lower KG', admNo: 'LHS-2026-002', phone: '+91 98621 11218' },

  // Upper KG
  { name: 'Kshetrimayum Amarjit', class: 'Upper KG', admNo: 'LHS-2026-003', phone: '+91 98621 11219' },
  { name: 'Chungkham Chingkhei', class: 'Upper KG', admNo: 'LHS-2026-004', phone: '+91 98621 11220' },

  // Nursery
  { name: 'Phuritsabam Yaiphabi', class: 'Nursery', admNo: 'LHS-2026-005', phone: '+91 98621 11221' },

  // Play-Group
  { name: 'Oinam Henba', class: 'Play-Group', admNo: 'LHS-2026-006', phone: '+91 98621 11222' }
];

const MONTHS = ['April 2026', 'May 2026', 'June 2026', 'July 2026', 'August 2026'];

async function seedRandomStudents() {
  console.log('🌱 Generating random student enrollment data and fee payments...');

  const studentPassword = await bcrypt.hash('student123', 10);

  // Fetch or create classes
  const classesMap = {};
  for (const s of SAMPLE_STUDENTS) {
    if (!classesMap[s.class]) {
      let cls = await prisma.class.findFirst({ where: { name: s.class } });
      if (!cls) {
        cls = await prisma.class.create({ data: { name: s.class, description: `${s.class} Section A` } });
      }
      classesMap[s.class] = cls;
    }
  }

  // Create Students & Enrollments
  for (const s of SAMPLE_STUDENTS) {
    const email = `${s.admNo.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.littlehouse.edu.in`;
    
    // Check if profile exists by admissionNo
    let profile = await prisma.profile.findFirst({ where: { admissionNo: s.admNo } });

    if (!profile) {
      const user = await prisma.user.create({
        data: {
          email,
          password: studentPassword,
          role: 'STUDENT',
          profile: {
            create: {
              name: s.name,
              phone: s.phone,
              admissionNo: s.admNo,
              address: 'Waiton Lamkhai, Imphal East, Manipur',
            },
          },
        },
        include: { profile: true },
      });
      profile = user.profile;
    }

    const classObj = classesMap[s.class];

    if (profile && classObj) {
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: { studentId: profile.id, classId: classObj.id },
      });
      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: { studentId: profile.id, classId: classObj.id },
        });
      }
    }

    // Seed Random Fee Payments for 2-4 months per student
    const paidMonthsCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 months
    const studentPaidMonths = MONTHS.slice(0, paidMonthsCount);

    for (const month of studentPaidMonths) {
      const existingFee = await prisma.feePayment.findFirst({
        where: { admissionNo: s.admNo, paidMonths: { contains: month } },
      });

      if (!existingFee) {
        const isOnline = Math.random() > 0.3;
        const mode = isOnline ? 'UPI_ONLINE' : 'CASH_OFFLINE';
        const refId = isOnline 
          ? `42${Math.floor(1000000000 + Math.random() * 9000000000)}` 
          : `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        await prisma.feePayment.create({
          data: {
            receiptNo: `LHS-FEE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            studentName: s.name,
            admissionNo: s.admNo,
            studentClass: s.class,
            parentPhone: s.phone,
            paidMonths: month,
            tuitionFee: 1200,
            transportFee: 0,
            totalAmount: 1200,
            paymentMode: mode,
            paymentRef: refId,
            paymentStatus: 'PAID',
          },
        });
      }
    }
  }

  console.log('✅ Successfully seeded 22+ random students and fee records across all classes!');
}

seedRandomStudents()
  .catch((e) => {
    console.error('Seeding error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
