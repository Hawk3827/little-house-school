'use client';

import { useEffect, useRef } from 'react';

/**
 * Reconnects and refetches live feeds when:
 * 1. Mobile phone wakes up from sleep / screen lock (`visibilitychange`)
 * 2. User switches back to browser tab (`focus`)
 * 3. Device reconnects to network after a Wi-Fi or 4G dropout (`online`)
 */
export function useAutoReconnect(onReconnect: () => void | Promise<void>, debounceMs: number = 500) {
  const callbackRef = useRef(onReconnect);
  const lastTriggerRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    const trigger = () => {
      const now = Date.now();
      if (now - lastTriggerRef.current > debounceMs) {
        lastTriggerRef.current = now;
        try {
          callbackRef.current();
        } catch (err) {
          console.warn('Auto-reconnect refetch error:', err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trigger();
      }
    };

    const handleFocus = () => {
      trigger();
    };

    const handleOnline = () => {
      trigger();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [debounceMs]);
}
