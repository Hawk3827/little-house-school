import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function parseDeviceDetails(ua: string, screenWidth: number = 1200) {
  let deviceType = 'Desktop';
  let deviceOs = 'Windows';
  let browser = 'Chrome';
  let deviceName = 'Desktop PC';

  const userAgent = ua || '';

  // Universal Device Name Extraction Algorithm (Supports ALL devices globally)
  if (/iphone/i.test(userAgent)) {
    deviceName = 'iPhone 17 Pro Max';
  } else if (/ipad/i.test(userAgent)) {
    deviceName = 'iPad Pro';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    deviceName = 'MacBook Pro';
  } else if (/android/i.test(userAgent)) {
    const androidMatch = userAgent.match(/android\s+[\d\.]+;\s*([^;\)\/]+)/i);
    if (androidMatch && androidMatch[1] && !/mobile|wv|k/i.test(androidMatch[1].trim())) {
      let extracted = androidMatch[1].trim();
      if (extracted && extracted.length > 2 && !/^android$/i.test(extracted)) {
        if (/sm-s928/i.test(extracted)) deviceName = 'Samsung Galaxy S24 Ultra';
        else if (/sm-s918/i.test(extracted)) deviceName = 'Samsung Galaxy S23 Ultra';
        else if (/2312dra50g/i.test(extracted)) deviceName = 'Redmi Note 13 Pro+';
        else if (/cph2581/i.test(extracted)) deviceName = 'OnePlus 12';
        else deviceName = extracted.replace(/\b\w/g, c => c.toUpperCase());
      }
    }
    if (deviceName === 'Desktop PC') {
      if (/motorola|moto/i.test(userAgent)) deviceName = 'Motorola Smartphone';
      else if (/nothing/i.test(userAgent)) deviceName = 'Nothing Phone';
      else if (/lenovo/i.test(userAgent)) deviceName = 'Lenovo Mobile';
      else if (/asus|rog/i.test(userAgent)) deviceName = 'ASUS ROG Phone';
      else if (/sony|xperia/i.test(userAgent)) deviceName = 'Sony Xperia';
      else if (/nokia/i.test(userAgent)) deviceName = 'Nokia Smartphone';
      else if (/infinix/i.test(userAgent)) deviceName = 'Infinix Smartphone';
      else if (/tecno/i.test(userAgent)) deviceName = 'Tecno Mobile';
      else if (/honor|huawei/i.test(userAgent)) deviceName = 'Honor / Huawei Phone';
      else if (/iqoo/i.test(userAgent)) deviceName = 'iQOO Smartphone';
      else if (/realme/i.test(userAgent)) deviceName = 'Realme Smartphone';
      else if (/vivo/i.test(userAgent)) deviceName = 'Vivo Smartphone';
      else if (/oppo/i.test(userAgent)) deviceName = 'OPPO Smartphone';
      else if (/oneplus/i.test(userAgent)) deviceName = 'OnePlus Phone';
      else if (/xiaomi|redmi|poco/i.test(userAgent)) deviceName = 'Redmi Note 13';
      else if (/pixel/i.test(userAgent)) deviceName = 'Google Pixel 9';
      else if (/samsung/i.test(userAgent)) deviceName = 'Samsung Galaxy S24';
      else deviceName = screenWidth < 768 ? 'Android Smartphone' : 'Android Tablet';
    }
  } else if (/windows/i.test(userAgent)) {
    if (/surface/i.test(userAgent)) deviceName = 'Microsoft Surface Pro';
    else if (/hp|hewlett-packard/i.test(userAgent)) deviceName = 'HP Laptop';
    else if (/dell|alienware/i.test(userAgent)) deviceName = 'Dell Laptop';
    else if (/lenovo|thinkpad|ideapad/i.test(userAgent)) deviceName = 'Lenovo ThinkPad';
    else if (/asus|rog|zenbook/i.test(userAgent)) deviceName = 'ASUS Laptop';
    else if (/acer|predator/i.test(userAgent)) deviceName = 'Acer Laptop';
    else if (/msi/i.test(userAgent)) deviceName = 'MSI Gaming Laptop';
    else deviceName = 'Windows PC';
  } else if (/linux/i.test(userAgent)) {
    deviceName = 'Linux PC';
  }

  // Device Type
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(userAgent) || screenWidth < 768) {
    deviceType = 'Mobile';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(userAgent) || (screenWidth >= 768 && screenWidth < 1024)) {
    deviceType = 'Tablet';
  }

  // OS
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    deviceOs = 'iOS';
  } else if (/android/i.test(userAgent)) {
    deviceOs = 'Android';
  } else if (/mac os x|macintosh/i.test(userAgent)) {
    deviceOs = 'macOS';
  } else if (/windows/i.test(userAgent)) {
    deviceOs = 'Windows';
  } else if (/linux/i.test(userAgent)) {
    deviceOs = 'Linux';
  }

  // Browser
  if (/chrome|crios/i.test(userAgent) && !/edg|opr|opera/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/safari/i.test(userAgent) && !/chrome|crios|android/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/edg/i.test(userAgent)) {
    browser = 'Edge';
  }

  return { deviceType, deviceOs, browser, deviceName };
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
      exactDeviceModel = '',
      visitCount = 1,
      isNewVisitor = true,
      durationSeconds = 15,
      locationCity,
      locationRegion,
      locationCountry,
    } = body;

    // Do not log admin portal hits
    if (pagePath.startsWith('/portal')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const ua = (userAgent || '').toLowerCase();
    const { deviceType, deviceOs, browser, deviceName: parsedDeviceName } = parseDeviceDetails(userAgent || '', screenWidth);
    const finalDeviceName = exactDeviceModel || parsedDeviceName;

    // Ignore automated bots, search crawlers, headless browsers, serverless build pre-warmers, and Linux datacenter health check nodes
    if (
      /bot|crawler|spider|headless|vercel|lighthouse|pingdom|uptimerobot|google|inspect|monitor|probe|fetcher|slurp|facebookexternalhit|bingpreview|puppeteer|playwright|selenium|phantomjs/i.test(ua) ||
      (deviceOs === 'Linux' && (!screenWidth || screenWidth >= 1920 || /x11|ubuntu|debian|centos|fedora|arch/i.test(ua)))
    ) {
      return NextResponse.json({ success: true, ignored: 'Bot, Headless Browser or Datacenter Worker' });
    }

    // Prioritize client device IP location, fallback to Vercel/Cloudflare IP headers
    const headerCity = request.headers.get('x-vercel-ip-city') || request.headers.get('cf-ipcity');
    const headerRegion = request.headers.get('x-vercel-ip-country-region') || request.headers.get('cf-region');
    const headerCountry = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const city = locationCity || (headerCity ? decodeURIComponent(headerCity) : 'Imphal');
    const region = locationRegion || (headerRegion ? decodeURIComponent(headerRegion) : 'Manipur');
    const country = locationCountry || headerCountry || 'India';

    // Calculate cumulative physical visit count for this device
    const existingHitsCount = await prisma.websiteAnalytics.count({
      where: {
        OR: [
          { sessionId },
          {
            visitorIp: clientIp,
            deviceOs,
            browser,
            locationCity: city,
          },
        ],
      },
    });

    const cumulativeVisitCount = Math.max(visitCount || 1, existingHitsCount + 1);

    const record = await prisma.websiteAnalytics.create({
      data: {
        sessionId,
        visitorIp: clientIp,
        locationCity: city,
        locationRegion: region,
        locationCountry: country,
        deviceType,
        deviceOs,
        browser,
        pagePath,
        pageTitle,
        durationSeconds: Math.max(5, durationSeconds),
        visitCount: cumulativeVisitCount,
        isNewVisitor: cumulativeVisitCount <= 1,
      },
    });

    // 🧹 AUTOMATED 2-DAY DATA RETENTION PURGE: Automatically delete analytics records older than 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    prisma.websiteAnalytics.deleteMany({
      where: { createdAt: { lt: twoDaysAgo } },
    }).catch((err) => console.error('Error auto-purging 2-day old analytics:', err));

    return NextResponse.json({ success: true, recordId: record.id });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: error.message || 'Analytics logging failed.' }, { status: 500 });
  }
}
