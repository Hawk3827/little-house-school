import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

const databaseUrl = process.env.DATABASE_URL || '';
const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');

function createClient() {
  if (isPostgres) {
    const { PrismaPg } = require('@prisma/adapter-pg');
    const pg = require('pg');
    const pool = new pg.Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  } else {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    const adapter = new PrismaBetterSqlite3({
      url: databaseUrl || 'file:./dev.db',
    });
    return new PrismaClient({ adapter });
  }
}

if (process.env.NODE_ENV === 'production') {
  prisma = createClient();
} else {
  // Prevent multiple instances of Prisma Client in development due to hot reloading
  if (!(global as any).prisma) {
    (global as any).prisma = createClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;
