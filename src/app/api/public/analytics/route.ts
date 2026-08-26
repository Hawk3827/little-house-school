import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function parseDeviceDetails(ua: string, screenWidth: number = 1200) {
  let deviceType = 'Desktop';
  let deviceOs = 'Windows';
  let browser = 'Chrome';

  const userAgent = ua.toLowerCase();

  // Device Type
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua) || screenWidth < 768) {
    deviceType = 'Mobile';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua) || (screenWidth >= 768 && screenWidth < 1024)) {
    deviceType = 'Tablet';
  }

  // OS
  if (/iphone|ipad|ipod/i.test(ua)) {
    deviceOs = 'iOS';
  } else if (/android/i.test(ua)) {
    deviceOs = 'Android';
  } else if (/mac os x|macintosh/i.test(ua)) {
    deviceOs = 'macOS';
  } else if (/windows/i.test(ua)) {
    deviceOs = 'Windows';
  } else if (/linux/i.test(ua)) {
    deviceOs = 'Linux';
  }

  // Browser
  if (/chrome|crios/i.test(ua) && !/edg|opr|opera/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/edg/i.test(ua)) {
    browser = 'Edge';
  }

  return { deviceType, deviceOs, browser };
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    const {
      sessionId = `sid_${Date.now()}`,
      pagePath = '/',
      pageTitle = 'Home',
      userAgent = '',
      screenWidth = 1200,
      visitCount = 1,
      isNewVisitor = true,
      durationSeconds = 15,
    } = body;

    // Do not log admin portal hits
    if (pagePath.startsWith('/portal')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const { deviceType, deviceOs, browser } = parseDeviceDetails(userAgent || '', screenWidth);

    // Extract Geo IP headers from Vercel / Cloudflare or default to Manipur region
    const city = request.headers.get('x-vercel-ip-city') || request.headers.get('cf-ipcity') || 'Imphal';
    const region = request.headers.get('x-vercel-ip-country-region') || request.headers.get('cf-region') || 'Manipur';
    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || 'India';
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // Decode URL encoded city names (e.g. Imphal%20East -> Imphal East)
    const decodedCity = decodeURIComponent(city);
    const decodedRegion = decodeURIComponent(region);

    const record = await prisma.websiteAnalytics.create({
      data: {
        sessionId,
        visitorIp: clientIp,
        locationCity: decodedCity,
        locationRegion: decodedRegion,
        locationCountry: country,
        deviceType,
        deviceOs,
        browser,
        pagePath,
        pageTitle,
        durationSeconds: Math.max(5, durationSeconds),
        visitCount: Math.max(1, visitCount),
        isNewVisitor: visitCount <= 1,
      },
    });

    return NextResponse.json({ success: true, recordId: record.id });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: error.message || 'Analytics logging failed.' }, { status: 500 });
  }
}
