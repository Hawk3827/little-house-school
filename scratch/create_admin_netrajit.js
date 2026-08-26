require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const databaseUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const name = 'Netrajit Potshangbam';
  const email1 = 'netrajit@admin';
  const email2 = 'netrajit@school.com';
  const rawPassword = 'littlehouse795114';
  const pin = '7951';

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // 1. Create or Update netrajit@admin
  const existing1 = await prisma.user.findUnique({ where: { email: email1 } });
  let user1;
  if (existing1) {
    user1 = await prisma.user.update({
      where: { email: email1 },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        securityPin: pin,
      },
      include: { profile: true },
    });
  } else {
    user1 = await prisma.user.create({
      data: {
        email: email1,
        password: hashedPassword,
        role: 'ADMIN',
        securityPin: pin,
        profile: {
          create: {
            name: name,
            phone: '+91 98765 43210',
          },
        },
      },
      include: { profile: true },
    });
  }

  if (!user1.profile) {
    await prisma.profile.create({
      data: {
        id: user1.id,
        name: name,
        phone: '+91 98765 43210',
      },
    });
  } else {
    await prisma.profile.update({
      where: { id: user1.profile.id },
      data: { name: name },
    });
  }

  // 2. Create or Update netrajit@school.com as alias
  const existing2 = await prisma.user.findUnique({ where: { email: email2 } });
  let user2;
  if (existing2) {
    user2 = await prisma.user.update({
      where: { email: email2 },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        securityPin: pin,
      },
      include: { profile: true },
    });
  } else {
    user2 = await prisma.user.create({
      data: {
        email: email2,
        password: hashedPassword,
        role: 'ADMIN',
        securityPin: pin,
        profile: {
          create: {
            name: name,
            phone: '+91 98765 43210',
          },
        },
      },
      include: { profile: true },
    });
  }

  if (!user2.profile) {
    await prisma.profile.create({
      data: {
        id: user2.id,
        name: name,
        phone: '+91 98765 43210',
      },
    });
  } else {
    await prisma.profile.update({
      where: { id: user2.profile.id },
      data: { name: name },
    });
  }

  console.log(`✅ Admin Account successfully created for ${name}!`);
  console.log(`Username 1: ${email1}`);
  console.log(`Username 2: ${email2}`);
  console.log(`Password: ${rawPassword}`);
  console.log(`Security PIN: ${pin}`);
}

main()
  .catch((e) => {
    console.error('Error creating admin Netrajit:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
