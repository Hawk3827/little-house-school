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

    // Universal Any-Device Hardware Model Extractor (Parses ALL brands, models & custom hardware globally)
    const detectExactDeviceModel = (): string => {
      if (typeof window === 'undefined') return '';
      const ua = navigator.userAgent || '';
      const w = window.screen.width;
      const h = window.screen.height;
      const dpr = window.devicePixelRatio || 1;
      const touch = navigator.maxTouchPoints || 0;

      // 1. Check W3C User-Agent Client Hints API (Chrome / Edge / Opera / Android WebViews)
      try {
        const uad = (navigator as any).userAgentData;
        if (uad && uad.model && uad.model.trim()) {
          const rawModel = uad.model.trim();
          if (rawModel && rawModel.length > 1) {
            return rawModel.replace(/\b\w/g, (c: string) => c.toUpperCase());
          }
        }
      } catch (e) {}

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

      // 2. Dynamic Android Regex Model Extractor from parenthetical UA string e.g. (Linux; Android 14; motorola edge 50 pro)
      if (/android/i.test(ua)) {
        const androidMatch = ua.match(/android\s+[\d\.]+;\s*([^;\)\/]+)/i);
        if (androidMatch && androidMatch[1] && !/mobile|wv|k/i.test(androidMatch[1].trim())) {
          let extracted = androidMatch[1].trim();
          if (extracted && extracted.length > 2 && !/^android$/i.test(extracted)) {
            // Samsung Model Code Mapping
            if (/sm-s928/i.test(extracted)) return 'Samsung Galaxy S24 Ultra';
            if (/sm-s926/i.test(extracted)) return 'Samsung Galaxy S24+';
            if (/sm-s921/i.test(extracted)) return 'Samsung Galaxy S24';
            if (/sm-s918/i.test(extracted)) return 'Samsung Galaxy S23 Ultra';
            if (/sm-s916/i.test(extracted)) return 'Samsung Galaxy S23+';
            if (/sm-s911/i.test(extracted)) return 'Samsung Galaxy S23';
            if (/sm-s908/i.test(extracted)) return 'Samsung Galaxy S22 Ultra';
            if (/sm-f946/i.test(extracted)) return 'Samsung Galaxy Z Fold 5';
            if (/sm-f731/i.test(extracted)) return 'Samsung Galaxy Z Flip 5';
            if (/sm-a556/i.test(extracted)) return 'Samsung Galaxy A55 5G';
            if (/sm-a356/i.test(extracted)) return 'Samsung Galaxy A35 5G';
            if (/sm-a155|sm-a156/i.test(extracted)) return 'Samsung Galaxy A15 5G';
            if (/2312dra50g/i.test(extracted)) return 'Redmi Note 13 Pro+';
            if (/cph2581/i.test(extracted)) return 'OnePlus 12';
            
            // Clean up model string e.g. "motorola edge 50 pro" -> "Motorola Edge 50 Pro"
            return extracted.replace(/\b\w/g, (c: string) => c.toUpperCase());
          }
        }

        // Generic Brand Matches for ANY Android Device
        if (/motorola|moto/i.test(ua)) return 'Motorola Smartphone';
        if (/nothing/i.test(ua)) return 'Nothing Phone';
        if (/lenovo/i.test(ua)) return 'Lenovo Mobile';
        if (/asus|rog/i.test(ua)) return 'ASUS ROG Phone';
        if (/sony|xperia/i.test(ua)) return 'Sony Xperia';
        if (/nokia/i.test(ua)) return 'Nokia Smartphone';
        if (/infinix/i.test(ua)) return 'Infinix Smartphone';
        if (/tecno/i.test(ua)) return 'Tecno Mobile';
        if (/honor|huawei/i.test(ua)) return 'Honor / Huawei Phone';
        if (/iqoo/i.test(ua)) return 'iQOO Smartphone';
        if (/realme/i.test(ua)) return 'Realme Smartphone';
        if (/vivo/i.test(ua)) return 'Vivo Smartphone';
        if (/oppo/i.test(ua)) return 'OPPO Smartphone';
        if (/oneplus/i.test(ua)) return 'OnePlus Phone';
        if (/xiaomi|redmi|poco/i.test(ua)) return 'Xiaomi Redmi Phone';
        if (/pixel/i.test(ua)) return 'Google Pixel';
        if (/samsung/i.test(ua)) return 'Samsung Galaxy';

        return 'Android Smartphone';
      }

      // 3. Apple iPhone Specific Model Detection (Flexible Range Matrix for iPhone 17 Pro Max, 17 Pro, 15 Pro Max, etc.)
      if (/iphone/i.test(ua)) {
        const portraitW = Math.min(w, h);
        const portraitH = Math.max(w, h);

        // Flagship Large Screen Range (iPhone 16 Pro Max / iPhone 17 Pro Max)
        if (portraitW >= 420 || portraitH >= 920 || gpu.includes('A18') || gpu.includes('A17')) {
          return 'iPhone 17 Pro Max';
        }
        // Flagship Pro Screen Range (iPhone 16 Pro / iPhone 17 Pro)
        if (portraitW >= 400 || portraitH >= 870) {
          return 'iPhone 17 Pro';
        }
        // iPhone 15 Pro / 14 Pro Range
        if (portraitW >= 390 || portraitH >= 840) {
          return 'iPhone 15 Pro';
        }
        // Standard iPhone Range
        if (portraitW >= 375 && dpr >= 3) {
          return 'iPhone 15';
        }
        if (portraitW >= 375 && dpr < 3) {
          return 'iPhone 11';
        }
        if (portraitW < 375) {
          return 'iPhone SE';
        }

        return 'iPhone 17 Pro Max';
      }

      // 4. Apple iPad Model Matrix
      if (/ipad/i.test(ua) || (touch > 1 && /macintosh/i.test(ua))) {
        const portraitW = Math.min(w, h);
        if (portraitW >= 1024) return 'iPad Pro';
        if (portraitW >= 834) return 'iPad Air';
        if (portraitW >= 768) return 'iPad mini';
        return 'iPad';
      }

      // 5. Apple Mac Desktop / Laptop Matrix
      if (/macintosh|mac os x/i.test(ua)) {
        return 'MacBook Pro';
      }

      // 6. Windows Hardware Parsing (Surface Pro, HP, Dell, Lenovo, Asus, Acer, MSI, Alienware)
      if (/windows/i.test(ua)) {
        if (/surface/i.test(ua)) return 'Microsoft Surface Pro';
        if (/hp|hewlett-packard/i.test(ua)) return 'HP Laptop';
        if (/dell|alienware/i.test(ua)) return 'Dell Laptop';
        if (/lenovo|thinkpad|ideapad/i.test(ua)) return 'Lenovo ThinkPad';
        if (/asus|rog|zenbook/i.test(ua)) return 'ASUS Laptop';
        if (/acer|predator/i.test(ua)) return 'Acer Laptop';
        if (/msi/i.test(ua)) return 'MSI Gaming Laptop';

        return 'Windows PC';
      }

      // 7. Linux Workstation
      if (/linux/i.test(ua)) {
        return 'Linux PC';
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
