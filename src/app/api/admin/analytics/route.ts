import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const monthParam = searchParams.get('month'); // Format "YYYY-MM"
    const presetParam = searchParams.get('preset') || 'ALL_TIME';

    let dateWhereFilter: any = {};
    const now = new Date();

    if (presetParam === 'TODAY') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateWhereFilter = { gte: todayStart };
    } else if (presetParam === 'YESTERDAY') {
      const yestStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yestEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateWhereFilter = { gte: yestStart, lt: yestEnd };
    } else if (presetParam === 'THIS_MONTH') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateWhereFilter = { gte: monthStart };
    } else if (presetParam === 'LAST_MONTH') {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      dateWhereFilter = { gte: lastMonthStart, lt: lastMonthEnd };
    } else if (monthParam) {
      const [yearStr, mStr] = monthParam.split('-');
      const year = Number(yearStr) || now.getFullYear();
      const monthIdx = (Number(mStr) || 1) - 1;
      const mStart = new Date(year, monthIdx, 1);
      const mEnd = new Date(year, monthIdx + 1, 1);
      dateWhereFilter = { gte: mStart, lt: mEnd };
    } else if (startDateParam || endDateParam) {
      dateWhereFilter = {};
      if (startDateParam) dateWhereFilter.gte = new Date(`${startDateParam}T00:00:00.000Z`);
      if (endDateParam) dateWhereFilter.lte = new Date(`${endDateParam}T23:59:59.999Z`);
    }

    const whereClause = Object.keys(dateWhereFilter).length > 0 ? { createdAt: dateWhereFilter } : {};

    const allAnalytics = await prisma.websiteAnalytics.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Core KPIs
    const totalPageviews = allAnalytics.length;
    
    // Unique session IDs
    const uniqueSessionIds = new Set(allAnalytics.map((a) => a.sessionId));
    const totalVisitors = uniqueSessionIds.size;

    const todayAnalytics = allAnalytics.filter((a) => new Date(a.createdAt) >= todayStart);
    const todayVisitors = new Set(todayAnalytics.map((a) => a.sessionId)).size;

    // Average Session Duration
    const totalDurationSeconds = allAnalytics.reduce((sum, a) => sum + (a.durationSeconds || 0), 0);
    const avgDurationSeconds = totalPageviews > 0 ? Math.round(totalDurationSeconds / totalPageviews) : 0;
    
    const durationMinutes = Math.floor(avgDurationSeconds / 60);
    const durationRemSecs = avgDurationSeconds % 60;
    const avgDurationFormatted = `${durationMinutes > 0 ? `${durationMinutes}m ` : ''}${durationRemSecs}s`;

    // 2. Device Type Breakdown (Mobile vs Desktop vs Tablet)
    const deviceCounts: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
    allAnalytics.forEach((a) => {
      const type = a.deviceType || 'Mobile';
      deviceCounts[type] = (deviceCounts[type] || 0) + 1;
    });

    const deviceBreakdown = Object.entries(deviceCounts).map(([type, count]) => ({
      type,
      count,
      percentage: totalPageviews > 0 ? Math.round((count / totalPageviews) * 100) : 0,
    }));

    // 3. Operating System & Browser Breakdown
    const osCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};

    allAnalytics.forEach((a) => {
      const os = a.deviceOs || 'iOS';
      const b = a.browser || 'Safari';
      osCounts[os] = (osCounts[os] || 0) + 1;
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });

    // 4. Geographic Location Breakdown (City & Region)
    const locationCounts: Record<string, { city: string; region: string; country: string; count: number }> = {};
    allAnalytics.forEach((a) => {
      const key = `${a.locationCity}, ${a.locationRegion}`;
      if (!locationCounts[key]) {
        locationCounts[key] = {
          city: a.locationCity,
          region: a.locationRegion,
          country: a.locationCountry,
          count: 0,
        };
      }
      locationCounts[key].count += 1;
    });

    const locationBreakdown = Object.values(locationCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((l) => ({
        ...l,
        percentage: totalPageviews > 0 ? Math.round((l.count / totalPageviews) * 100) : 0,
      }));

    // 5. Visit Frequency & Return Visitor Loyalty
    const frequencyCounts = {
      firstTime: 0,
      returning2to3: 0,
      frequent4to10: 0,
      loyal10Plus: 0,
    };

    allAnalytics.forEach((a) => {
      const visits = a.visitCount || 1;
      if (visits === 1) frequencyCounts.firstTime += 1;
      else if (visits >= 2 && visits <= 3) frequencyCounts.returning2to3 += 1;
      else if (visits >= 4 && visits <= 10) frequencyCounts.frequent4to10 += 1;
      else frequencyCounts.loyal10Plus += 1;
    });

    // 6. Most Popular Visited Pages
    const pageCounts: Record<string, { path: string; title: string; views: number; totalSecs: number }> = {};
    allAnalytics.forEach((a) => {
      const p = a.pagePath || '/';
      if (!pageCounts[p]) {
        pageCounts[p] = { path: p, title: a.pageTitle || p, views: 0, totalSecs: 0 };
      }
      pageCounts[p].views += 1;
      pageCounts[p].totalSecs += a.durationSeconds || 0;
    });

    const popularPages = Object.values(pageCounts)
      .sort((a, b) => b.views - a.views)
      .slice(0, 8)
      .map((pg) => ({
        path: pg.path,
        title: pg.title,
        views: pg.views,
        avgDurationSecs: Math.round(pg.totalSecs / pg.views),
        percentage: totalPageviews > 0 ? Math.round((pg.views / totalPageviews) * 100) : 0,
      }));

    // 7. Recent Live Visitor Activity Log
    const recentActivity = allAnalytics.slice(0, 30).map((a) => ({
      id: a.id,
      sessionId: a.sessionId,
      location: `${a.locationCity}, ${a.locationRegion}`,
      deviceType: a.deviceType,
      deviceOs: a.deviceOs,
      browser: a.browser,
      pagePath: a.pagePath,
      pageTitle: a.pageTitle,
      durationSeconds: a.durationSeconds,
      visitCount: a.visitCount,
      isNewVisitor: a.isNewVisitor,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      success: true,
      appliedFilter: {
        preset: presetParam,
        month: monthParam,
        startDate: startDateParam,
        endDate: endDateParam,
      },
      summary: {
        totalVisitors,
        totalPageviews,
        todayVisitors,
        avgDurationSeconds,
        avgDurationFormatted,
      },
      deviceBreakdown,
      osCounts,
      browserCounts,
      locationBreakdown,
      frequencyCounts,
      popularPages,
      recentActivity,
    });
  } catch (error: any) {
    console.error('Fetch admin analytics error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics.' }, { status: 500 });
  }
}
