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
  const name = 'RK Sana Nungtheelchaiba';
  const usernames = ['hawk3827', 'hawk3827@admin', 'hawk3827@school.com'];
  const rawPassword = 'Bluehawk3827@';
  const pin = '3827';

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  for (const username of usernames) {
    const existing = await prisma.user.findUnique({ where: { email: username } });
    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { email: username },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          securityPin: pin,
        },
        include: { profile: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: username,
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

    if (!user.profile) {
      await prisma.profile.create({
        data: {
          id: user.id,
          name: name,
          phone: '+91 98765 43210',
        },
      });
    } else {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: { name: name },
      });
    }
  }

  console.log(`✅ Admin Account successfully created for ${name}!`);
  console.log(`Primary Username: hawk3827`);
  console.log(`Alternative Usernames: hawk3827@admin, hawk3827@school.com`);
  console.log(`Password: ${rawPassword}`);
  console.log(`Security PIN: ${pin}`);
}

main()
  .catch((e) => {
    console.error('Error creating admin RK Sana:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
