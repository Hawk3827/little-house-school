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

    // Do not track admin portal or internal pages
    if (pathname.startsWith('/portal')) return;

    // Generate or retrieve persistent visitor session ID
    let sid = localStorage.getItem('lh_analytics_session_id');
    if (!sid) {
      sid = 'sid_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('lh_analytics_session_id', sid);
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

    // Resolve exact client device location via client-side WAN IP lookup
    const fetchClientDeviceLocation = async (): Promise<ClientGeoLocation | null> => {
      // Return cached location if already fetched in this session
      const cached = sessionStorage.getItem('lh_client_geo');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }

      // Try Provider 1: ip-api.com
      try {
        const res1 = await fetch('https://ip-api.com/json/');
        if (res1.ok) {
          const data1 = await res1.json();
          if (data1.city) {
            const loc1 = {
              city: data1.city,
              region: data1.regionName || 'Manipur',
              country: data1.country || 'India',
            };
            sessionStorage.setItem('lh_client_geo', JSON.stringify(loc1));
            return loc1;
          }
        }
      } catch (e1) {}

      // Try Provider 2: ipapi.co
      try {
        const res2 = await fetch('https://ipapi.co/json/');
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.city) {
            const loc2 = {
              city: data2.city,
              region: data2.region || 'Manipur',
              country: data2.country_name || 'India',
            };
            sessionStorage.setItem('lh_client_geo', JSON.stringify(loc2));
            return loc2;
          }
        }
      } catch (e2) {}

      return null;
    };

    // Function to record pageview telemetry
    const recordPageView = async (durationSec: number = 10) => {
      try {
        const userAgent = navigator.userAgent || '';
        const screenWidth = window.innerWidth || 1200;

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
