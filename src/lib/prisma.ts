import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL || '';
const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');

function createClient() {
  if (isPostgres) {
    const { PrismaPg } = require('@prisma/adapter-pg');
    const pg = require('pg');
    // Configure connection pool limits for serverless cloud environments
    const pool = new pg.Pool({ 
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
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

// Global caching for both Production and Development to reuse DB connection pools
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // Store client globally in production serverless runtimes to prevent connection pool exhaustion
  globalForPrisma.prisma = prisma;
}

export default prisma;
