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

    // Calculate date boundaries in Indian Standard Time (IST / UTC+5:30)
    const now = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffsetMs);

    const year = istNow.getUTCFullYear();
    const month = istNow.getUTCMonth();
    const date = istNow.getUTCDate();

    const todayStart = new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - istOffsetMs);
    const yestStart = new Date(Date.UTC(year, month, date - 1, 0, 0, 0, 0) - istOffsetMs);
    const yestEnd = todayStart;
    const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - istOffsetMs);
    const lastMonthStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0) - istOffsetMs);
    const lastMonthEnd = monthStart;

    let dateWhereFilter: any = {};

    if (presetParam === 'TODAY') {
      dateWhereFilter = { gte: todayStart };
    } else if (presetParam === 'YESTERDAY') {
      dateWhereFilter = { gte: yestStart, lt: yestEnd };
    } else if (presetParam === 'THIS_MONTH') {
      dateWhereFilter = { gte: monthStart };
    } else if (presetParam === 'LAST_MONTH') {
      dateWhereFilter = { gte: lastMonthStart, lt: lastMonthEnd };
    } else if (monthParam) {
      const [yearStr, mStr] = monthParam.split('-');
      const y = Number(yearStr) || year;
      const mIdx = (Number(mStr) || 1) - 1;
      const mStart = new Date(Date.UTC(y, mIdx, 1, 0, 0, 0, 0) - istOffsetMs);
      const mEnd = new Date(Date.UTC(y, mIdx + 1, 1, 0, 0, 0, 0) - istOffsetMs);
      dateWhereFilter = { gte: mStart, lt: mEnd };
    } else if (startDateParam || endDateParam) {
      dateWhereFilter = {};
      if (startDateParam) dateWhereFilter.gte = new Date(`${startDateParam}T00:00:00.000+05:30`);
      if (endDateParam) dateWhereFilter.lte = new Date(`${endDateParam}T23:59:59.999+05:30`);
    }

    const whereClause = Object.keys(dateWhereFilter).length > 0 ? { createdAt: dateWhereFilter } : {};

    const allAnalytics = await prisma.websiteAnalytics.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

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
      // Calculate max visit count for this physical device across sessions and hits
      const maxVisitCountRecord = Math.max(...hits.map((h) => h.visitCount || 1));
      const visits = Math.max(hits.length, maxVisitCountRecord);

      if (visits <= 1) frequencyCounts.firstTime += 1;
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

    // Map cumulative hits per physical device fingerprint
    const fingerprintVisitCounts: Record<string, number> = {};
    visitorFingerprintMap.forEach((hits, fp) => {
      fingerprintVisitCounts[fp] = hits.length;
    });

    const recentActivity = allAnalytics.slice(0, limitNum).map((a) => {
      const fp = `${a.visitorIp || '127.0.0.1'}_${a.deviceOs}_${a.browser}_${a.locationCity}`;
      const deviceTotalHits = fingerprintVisitCounts[fp] || 1;
      const computedVisitCount = Math.max(a.visitCount || 1, deviceTotalHits);

      // Determine Instagram-style device model name
      let deviceName = 'Desktop PC';
      if (a.deviceOs === 'iOS') {
        deviceName = a.deviceType === 'Tablet' ? 'Apple iPad' : 'Apple iPhone';
      } else if (a.deviceOs === 'macOS') {
        deviceName = 'Apple Mac';
      } else if (a.deviceOs === 'Android') {
        deviceName = a.deviceType === 'Tablet' ? 'Android Tablet' : 'Android Smartphone';
      } else if (a.deviceOs === 'Windows') {
        deviceName = 'Windows PC';
      } else if (a.deviceOs === 'Linux') {
        deviceName = 'Linux Workstation';
      }

      return {
        id: a.id,
        sessionId: a.sessionId,
        location: `${a.locationCity}, ${a.locationRegion}`,
        deviceType: a.deviceType,
        deviceOs: a.deviceOs,
        deviceName: deviceName,
        browser: a.browser,
        pagePath: a.pagePath,
        pageTitle: a.pageTitle,
        durationSeconds: a.durationSeconds,
        visitCount: computedVisitCount,
        isNewVisitor: computedVisitCount <= 1,
        createdAt: a.createdAt,
      };
    });

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
