'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());

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

    // Function to record pageview telemetry
    const recordPageView = async (durationSec: number = 10) => {
      try {
        const userAgent = navigator.userAgent || '';
        const screenWidth = window.innerWidth || 1200;

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
          }),
        });
      } catch (err) {
        // Silent catch for telemetry
      }
    };

    recordPageView(12);

    const handleUnload = () => {
      const duration = Math.max(5, Math.round((Date.now() - startTime) / 1000));
      const payload = JSON.stringify({
        sessionId: sid,
        pagePath: pathname || '/',
        visitCount: visits || 1,
        durationSeconds: duration,
        userAgent: navigator.userAgent || '',
        screenWidth: window.innerWidth || 1200,
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
