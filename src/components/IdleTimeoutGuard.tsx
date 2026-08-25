'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

interface IdleTimeoutGuardProps {
  idleMinutes?: number; // default: 20 mins
  warningMinutes?: number; // default: 18 mins (2 mins before logout)
}

export default function IdleTimeoutGuard({
  idleMinutes = 20,
  warningMinutes = 18,
}: IdleTimeoutGuardProps) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState((idleMinutes - warningMinutes) * 60);

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn("Logout request failed:", e);
    }
    router.push('/portal/login?reason=idle_timeout');
  }, [router]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining((idleMinutes - warningMinutes) * 60);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [showWarning, idleMinutes, warningMinutes]);

  useEffect(() => {
    const warningMs = warningMinutes * 60 * 1000;
    const idleMs = idleMinutes * 60 * 1000;

    const checkInactivity = () => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= idleMs) {
        handleLogout();
      } else if (elapsed >= warningMs && !showWarning) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.floor((idleMs - elapsed) / 1000));
        setSecondsRemaining(remaining);

        if (!countdownIntervalRef.current) {
          countdownIntervalRef.current = setInterval(() => {
            setSecondsRemaining((prev) => {
              if (prev <= 1) {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                handleLogout();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    };

    const interval = setInterval(checkInactivity, 15000); // check every 15s

    // User activity listeners
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handleUserActivity = () => {
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      clearInterval(interval);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, [idleMinutes, warningMinutes, showWarning, handleLogout]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl border-2 border-amber-400 p-8 max-w-md w-full shadow-2xl space-y-6 text-slate-900 animate-slideDown">
        <div className="flex items-center space-x-3 text-amber-600">
          <div className="p-3 bg-amber-100 rounded-2xl border border-amber-300">
            <ShieldAlert className="h-8 w-8 text-amber-700 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-700 block">
              STAFF ROOM SECURITY
            </span>
            <h3 className="text-xl font-bold text-slate-900">Session Idle Warning</h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          You have been inactive for over <strong className="text-slate-900">{warningMinutes} minutes</strong>. To safeguard student records on shared staff-room computers, your session will automatically terminate in:
        </p>

        <div className="text-center py-4 bg-amber-50 rounded-2xl border border-amber-200">
          <span className="text-3xl font-mono font-black text-amber-900">
            {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
          </span>
          <span className="block text-[10px] text-amber-700 uppercase font-mono mt-1 font-bold">
            Seconds until automatic sign out
          </span>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={resetActivity}
            className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Stay Logged In</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border border-slate-300 flex items-center space-x-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
