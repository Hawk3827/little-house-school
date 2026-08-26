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
      take: 5000,
    });

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalPageviews = allAnalytics.length;

    // Group by Physical Device Fingerprint (visitorIp + deviceOs + browser + locationCity) OR sessionId
    // This guarantees that 1 device refreshing or generating multiple sids is counted as EXACTLY 1 Unique Visitor.
    const visitorFingerprintMap = new Map<string, typeof allAnalytics>();
    allAnalytics.forEach((a) => {
      // Create stable physical device fingerprint
      const fingerprint = `${a.visitorIp || '127.0.0.1'}_${a.deviceOs}_${a.browser}_${a.locationCity}`;
      if (!visitorFingerprintMap.has(fingerprint)) {
        visitorFingerprintMap.set(fingerprint, []);
      }
      visitorFingerprintMap.get(fingerprint)!.push(a);
    });

    const totalVisitors = visitorFingerprintMap.size;

    // Today's active unique visitors
    const todayAnalytics = allAnalytics.filter((a) => new Date(a.createdAt) >= todayStart);
    const todayFingerprints = new Set(
      todayAnalytics.map((a) => `${a.visitorIp || '127.0.0.1'}_${a.deviceOs}_${a.browser}_${a.locationCity}`)
    );
    const todayVisitors = todayFingerprints.size;

    // 1. Average Session Duration across unique physical visitors
    let totalSessionSeconds = 0;
    visitorFingerprintMap.forEach((hits) => {
      const sessionTime = hits.reduce((sum, h) => sum + (h.durationSeconds || 0), 0);
      totalSessionSeconds += sessionTime;
    });

    const avgDurationSeconds = totalVisitors > 0 ? Math.round(totalSessionSeconds / totalVisitors) : 0;
    const durationMinutes = Math.floor(avgDurationSeconds / 60);
    const durationRemSecs = avgDurationSeconds % 60;
    const avgDurationFormatted = `${durationMinutes > 0 ? `${durationMinutes}m ` : ''}${durationRemSecs}s`;

    // 2. Device Type Breakdown per unique physical visitor
    const deviceCounts: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const osCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};

    visitorFingerprintMap.forEach((hits) => {
      const primaryHit = hits[0];
      const type = primaryHit.deviceType || 'Mobile';
      deviceCounts[type] = (deviceCounts[type] || 0) + 1;

      const os = primaryHit.deviceOs || 'iOS';
      const b = primaryHit.browser || 'Safari';
      osCounts[os] = (osCounts[os] || 0) + 1;
      browserCounts[b] = (browserCounts[b] || 0) + 1;
    });

    const deviceBreakdown = Object.entries(deviceCounts).map(([type, count]) => ({
      type,
      count,
      percentage: totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0,
    }));

    // 3. Geographic Location Breakdown per unique physical visitor
    const locationCounts: Record<string, { city: string; region: string; country: string; visitorsCount: number; pageviewsCount: number }> = {};
    visitorFingerprintMap.forEach((hits) => {
      const primaryHit = hits[0];
      const key = `${primaryHit.locationCity}, ${primaryHit.locationRegion}`;
      if (!locationCounts[key]) {
        locationCounts[key] = {
          city: primaryHit.locationCity,
          region: primaryHit.locationRegion,
          country: primaryHit.locationCountry,
          visitorsCount: 0,
          pageviewsCount: 0,
        };
      }
      locationCounts[key].visitorsCount += 1;
      locationCounts[key].pageviewsCount += hits.length;
    });

    const locationBreakdown = Object.values(locationCounts)
      .sort((a, b) => b.visitorsCount - a.visitorsCount)
      .slice(0, 10)
      .map((l) => ({
        city: l.city,
        region: l.region,
        country: l.country,
        count: l.visitorsCount,
        pageviewsCount: l.pageviewsCount,
        percentage: totalVisitors > 0 ? Math.round((l.visitorsCount / totalVisitors) * 100) : 0,
      }));

    // 4. Visit Frequency & Return Visitor Loyalty per unique physical visitor
    const frequencyCounts = {
      firstTime: 0,
      returning2to3: 0,
      frequent4to10: 0,
      loyal10Plus: 0,
    };

    visitorFingerprintMap.forEach((hits) => {
      // Calculate distinct visit days for this physical device
      const distinctVisitDates = new Set(
        hits.map((h) => new Date(h.createdAt).toISOString().split('T')[0])
      );
      const visits = distinctVisitDates.size;

      if (visits === 1) frequencyCounts.firstTime += 1;
      else if (visits >= 2 && visits <= 3) frequencyCounts.returning2to3 += 1;
      else if (visits >= 4 && visits <= 10) frequencyCounts.frequent4to10 += 1;
      else frequencyCounts.loyal10Plus += 1;
    });

    // 5. Most Popular Visited Pages
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

    // 6. Recent Live Visitor Activity Log
    const limitParam = searchParams.get('limit') || '500';
    const limitNum = limitParam === 'all' ? allAnalytics.length : Math.max(10, parseInt(limitParam, 10) || 500);

    const recentActivity = allAnalytics.slice(0, limitNum).map((a) => ({
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
