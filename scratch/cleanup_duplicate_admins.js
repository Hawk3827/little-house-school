require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete redundant alias rows
  const emailsToDelete = [
    'hawk3827@admin',
    'hawk3827@school.com',
    'netrajit@school.com'
  ];

  for (const email of emailsToDelete) {
    try {
      await prisma.user.deleteMany({
        where: { email }
      });
      console.log(`Deleted redundant alias user: ${email}`);
    } catch (e) {
      console.log(`Could not delete ${email}: ${e.message}`);
    }
  }

  // Verify remaining Admin users
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    include: { profile: true }
  });

  console.log('\n✅ Clean Primary Admin Accounts in Database:');
  admins.forEach((a) => {
    console.log(`- ${a.profile?.name || 'Admin'} (${a.email})`);
  });
}

main()
  .catch((e) => {
    console.error('Error during admin cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
