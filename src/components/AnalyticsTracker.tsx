'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface ClientGeoLocation {
  city: string;
  region: string;
  country: string;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const geoRef = useRef<ClientGeoLocation | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Do not track admin portal or automated headless browsers
    if (pathname.startsWith('/portal') || (navigator as any).webdriver) return;

    // Persistent Cookie + LocalStorage Visitor Identifier
    const getOrSetCookie = (name: string, value: string) => {
      try {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
        return value;
      } catch (e) {
        return value;
      }
    };

    let sid = localStorage.getItem('lh_analytics_session_id');
    if (!sid) {
      sid = getOrSetCookie('lh_analytics_vid', 'vid_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9));
      try {
        localStorage.setItem('lh_analytics_session_id', sid);
      } catch (e) {}
    }

    // Track return visit count in localStorage
    let visits = Number(localStorage.getItem('lh_visit_count') || '0');
    const lastVisitDate = localStorage.getItem('lh_last_visit_date');
    const todayStr = new Date().toISOString().split('T')[0];

    if (lastVisitDate !== todayStr) {
      visits += 1;
      localStorage.setItem('lh_visit_count', visits.toString());
      localStorage.setItem('lh_last_visit_date', todayStr);
    }

    const startTime = Date.now();
    startTimeRef.current = startTime;

    // Reverse Geocode Lat/Lon to exact suburb/locality using OpenStreetMap Nominatim API
    const reverseGeocodeLatLon = async (lat: number, lon: number): Promise<ClientGeoLocation | null> => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const locality = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city_district || addr.county || '';
          const cityName = addr.city || addr.town || addr.state_district || addr.county || 'Imphal';
          const fullCity = locality && locality !== cityName ? `${locality}, ${cityName}` : cityName;
          const region = addr.state || 'Manipur';
          const country = addr.country || 'India';
          return { city: fullCity, region, country };
        }
      } catch (e) {}
      return null;
    };

    // Hyper-Precise Client Location Resolver Pipeline
    const fetchClientDeviceLocation = async (): Promise<ClientGeoLocation | null> => {
      // Return cached location if already fetched in this session
      const cached = sessionStorage.getItem('lh_client_geo');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }

      // Tier 1: Try HTML5 Browser GPS / Wi-Fi Triangulation (Hyper Precision)
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        try {
          const gpsPromise = new Promise<GeolocationPosition | null>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve(pos),
              () => resolve(null),
              { timeout: 2500, maximumAge: 300000, enableHighAccuracy: true }
            );
          });
          const position = await gpsPromise;
          if (position && position.coords) {
            const gpsLoc = await reverseGeocodeLatLon(position.coords.latitude, position.coords.longitude);
            if (gpsLoc) {
              sessionStorage.setItem('lh_client_geo', JSON.stringify(gpsLoc));
              return gpsLoc;
            }
          }
        } catch (eGps) {}
      }

      // Tier 2: Try ip-api.com with Lat/Lon Reverse Mapping
      try {
        const res1 = await fetch('https://ip-api.com/json/?fields=status,country,regionName,city,district,zip,lat,lon');
        if (res1.ok) {
          const data1 = await res1.json();
          if (data1.lat && data1.lon) {
            const revLoc = await reverseGeocodeLatLon(data1.lat, data1.lon);
            if (revLoc) {
              sessionStorage.setItem('lh_client_geo', JSON.stringify(revLoc));
              return revLoc;
            }
          }
          if (data1.city) {
            const districtStr = data1.district ? `${data1.district}, ` : '';
            const loc1 = {
              city: `${districtStr}${data1.city}`,
              region: data1.regionName || 'Manipur',
              country: data1.country || 'India',
            };
            sessionStorage.setItem('lh_client_geo', JSON.stringify(loc1));
            return loc1;
          }
        }
      } catch (e1) {}

      // Tier 3: Try ipwho.is provider
      try {
        const res2 = await fetch('https://ipwho.is/');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.success) {
            const cityStr = data2.city || 'Imphal';
            const loc2 = {
              city: cityStr,
              region: data2.region || 'Manipur',
              country: data2.country || 'India',
            };
            sessionStorage.setItem('lh_client_geo', JSON.stringify(loc2));
            return loc2;
          }
        }
      } catch (e2) {}

      return null;
    };

    // Exact Hardware Device Model Detection (Instagram Login History Style)
    const detectExactDeviceModel = (): string => {
      if (typeof window === 'undefined') return '';
      const ua = navigator.userAgent || '';
      const w = window.screen.width;
      const h = window.screen.height;
      const dpr = window.devicePixelRatio || 1;
      const touch = navigator.maxTouchPoints || 0;

      // WebGL GPU Renderer Detection
      let gpu = '';
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            gpu = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
          }
        }
      } catch (e) {}

      // 1. Android Specific Hardware Model Parsing (SM-S928B, Pixel 9, 2312DRA50G, etc.)
      if (/android/i.test(ua)) {
        if (/sm-s928/i.test(ua)) return 'Samsung Galaxy S24 Ultra';
        if (/sm-s926/i.test(ua)) return 'Samsung Galaxy S24+';
        if (/sm-s921/i.test(ua)) return 'Samsung Galaxy S24';
        if (/sm-s918/i.test(ua)) return 'Samsung Galaxy S23 Ultra';
        if (/sm-s916/i.test(ua)) return 'Samsung Galaxy S23+';
        if (/sm-s911/i.test(ua)) return 'Samsung Galaxy S23';
        if (/sm-s908/i.test(ua)) return 'Samsung Galaxy S22 Ultra';
        if (/sm-f946/i.test(ua)) return 'Samsung Galaxy Z Fold 5';
        if (/sm-f731/i.test(ua)) return 'Samsung Galaxy Z Flip 5';
        if (/sm-a556/i.test(ua)) return 'Samsung Galaxy A55 5G';
        if (/sm-a356/i.test(ua)) return 'Samsung Galaxy A35 5G';
        if (/sm-a155|sm-a156/i.test(ua)) return 'Samsung Galaxy A15 5G';
        if (/sm-m346/i.test(ua)) return 'Samsung Galaxy M34 5G';
        if (/samsung/i.test(ua)) return 'Samsung Galaxy';

        if (/pixel 9 pro/i.test(ua)) return 'Google Pixel 9 Pro';
        if (/pixel 9/i.test(ua)) return 'Google Pixel 9';
        if (/pixel 8 pro/i.test(ua)) return 'Google Pixel 8 Pro';
        if (/pixel 8a/i.test(ua)) return 'Google Pixel 8a';
        if (/pixel 8/i.test(ua)) return 'Google Pixel 8';
        if (/pixel 7a/i.test(ua)) return 'Google Pixel 7a';
        if (/pixel 7 pro/i.test(ua)) return 'Google Pixel 7 Pro';
        if (/pixel/i.test(ua)) return 'Google Pixel Phone';

        if (/2312dra50g/i.test(ua)) return 'Xiaomi Redmi Note 13 Pro+';
        if (/23078rn4d/i.test(ua)) return 'Xiaomi Redmi Note 12';
        if (/2201117ti|2201117tg/i.test(ua)) return 'Xiaomi Redmi Note 11';
        if (/xiaomi|redmi|poco/i.test(ua)) return 'Xiaomi Redmi Phone';

        if (/cph2581|cph2449/i.test(ua)) return 'OnePlus 12';
        if (/cph2413/i.test(ua)) return 'OnePlus 11R';
        if (/oneplus/i.test(ua)) return 'OnePlus Phone';

        if (/rmx3710|rmx3840/i.test(ua)) return 'Realme 12 Pro+';
        if (/realme/i.test(ua)) return 'Realme Smartphone';
        if (/vivo/i.test(ua)) return 'Vivo Smartphone';
        if (/oppo/i.test(ua)) return 'OPPO Smartphone';

        return 'Android Smartphone';
      }

      // 2. Apple iPhone Specific Model Detection (Exact Single Model Name)
      if (/iphone/i.test(ua)) {
        const portraitW = Math.min(w, h);
        const portraitH = Math.max(w, h);

        if (portraitW === 440 && portraitH === 956) return 'Apple iPhone 16 Pro Max';
        if (portraitW === 402 && portraitH === 874) return 'Apple iPhone 16 Pro';
        if (portraitW === 430 && portraitH === 932) return 'Apple iPhone 15 Pro Max';
        if (portraitW === 393 && portraitH === 852) return 'Apple iPhone 15 Pro';
        if (portraitW === 390 && portraitH === 844) return 'Apple iPhone 14 Pro';
        if (portraitW === 428 && portraitH === 926) return 'Apple iPhone 15 Plus';
        if (portraitW === 414 && portraitH === 896 && dpr >= 3) return 'Apple iPhone 11 Pro Max';
        if (portraitW === 414 && portraitH === 896 && dpr < 3) return 'Apple iPhone 11';
        if (portraitW === 375 && portraitH === 812) return 'Apple iPhone 11 Pro';
        if (portraitW === 375 && portraitH === 667) return 'Apple iPhone SE';
        if (portraitW === 414 && portraitH === 736) return 'Apple iPhone 8 Plus';

        return 'Apple iPhone';
      }

      // 3. Apple iPad Model Matrix
      if (/ipad/i.test(ua) || (touch > 1 && /macintosh/i.test(ua))) {
        const portraitW = Math.min(w, h);
        if (portraitW >= 1024) return 'Apple iPad Pro 12.9"';
        if (portraitW >= 834) return 'Apple iPad Pro 11"';
        if (portraitW >= 768) return 'Apple iPad mini';
        return 'Apple iPad';
      }

      // 4. Apple Mac Desktop / Laptop Matrix
      if (/macintosh|mac os x/i.test(ua)) {
        if (gpu.includes('Apple M3') || gpu.includes('Apple M2') || gpu.includes('Apple M1') || gpu.includes('Apple M4')) {
          const mChip = gpu.match(/M\d(\s\w+)?/)?.[0] || 'Silicon';
          return `Apple MacBook Pro (${mChip})`;
        }
        return 'Apple MacBook Pro';
      }

      // 5. Windows PC
      if (/windows/i.test(ua)) {
        return 'Windows PC';
      }

      // 6. Linux Workstation
      if (/linux/i.test(ua)) {
        return 'Linux Workstation';
      }

      return 'Desktop PC';
    };

    // Function to record pageview telemetry
    const recordPageView = async (durationSec: number = 10) => {
      try {
        const userAgent = navigator.userAgent || '';
        const screenWidth = window.innerWidth || 1200;
        const exactDeviceModel = detectExactDeviceModel();

        let geo = geoRef.current;
        if (!geo) {
          geo = await fetchClientDeviceLocation();
          geoRef.current = geo;
        }

        await fetch('/api/public/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sid,
            pagePath: pathname || '/',
            pageTitle: document.title || 'Little House School',
            userAgent,
            screenWidth,
            exactDeviceModel,
            visitCount: visits || 1,
            isNewVisitor: visits <= 1,
            durationSeconds: durationSec,
            locationCity: geo?.city,
            locationRegion: geo?.region,
            locationCountry: geo?.country,
          }),
        });
      } catch (err) {
        // Silent catch for telemetry
      }
    };

    recordPageView(12);

    const handleUnload = () => {
      const duration = Math.max(5, Math.round((Date.now() - startTime) / 1000));
      const geo = geoRef.current;
      const payload = JSON.stringify({
        sessionId: sid,
        pagePath: pathname || '/',
        visitCount: visits || 1,
        durationSeconds: duration,
        userAgent: navigator.userAgent || '',
        screenWidth: window.innerWidth || 1200,
        locationCity: geo?.city,
        locationRegion: geo?.region,
        locationCountry: geo?.country,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/public/analytics', new Blob([payload], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      const duration = Math.max(5, Math.round((Date.now() - startTime) / 1000));
      recordPageView(duration);
    };
  }, [pathname]);

  return null;
}
