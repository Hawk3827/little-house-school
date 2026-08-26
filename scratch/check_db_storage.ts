import prisma from '../src/lib/prisma';

async function checkStorage() {
  try {
    const dbSizeResult: any = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size_pretty, pg_database_size(current_database()) as bytes`;
    
    const tableSizes: any = await prisma.$queryRaw`
      SELECT 
        table_name,
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS total_size,
        pg_total_relation_size(quote_ident(table_name)) AS bytes
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY bytes DESC;
    `;

    const userCount = await prisma.user.count();
    const feeCount = await prisma.feePayment.count();
    const analyticsCount = await prisma.websiteAnalytics.count();
    const galleryCount = await prisma.galleryItem.count();
    const announcementCount = await prisma.announcement.count();

    console.log('--- DATABASE STORAGE METRICS ---');
    console.log('Total DB Size:', dbSizeResult[0]?.size_pretty || 'N/A', `(${dbSizeResult[0]?.bytes} bytes)`);
    console.log('\n--- ROW COUNTS ---');
    console.log(`Users (Admins/Teachers/Students): ${userCount}`);
    console.log(`Fee Payments: ${feeCount}`);
    console.log(`Website Analytics Hits: ${analyticsCount}`);
    console.log(`Gallery Items: ${galleryCount}`);
    console.log(`Announcements: ${announcementCount}`);
    console.log('\n--- TOP TABLE SIZES ---');
    tableSizes.forEach((t: any) => {
      console.log(`- ${t.table_name}: ${t.total_size}`);
    });

  } catch (error) {
    console.error('Error checking storage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStorage();
