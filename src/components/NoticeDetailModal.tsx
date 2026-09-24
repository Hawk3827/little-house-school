'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock } from 'lucide-react';
import { formatDateSafe } from '@/lib/dateUtils';

export interface NoticeData {
  id: string;
  title: string;
  content?: string;
  audience: string;
  imageUrl?: string | null;
  createdAt: string | Date;
  createdBy?: {
    name?: string;
  } | null;
}

interface NoticeDetailModalProps {
  notice: NoticeData | null;
  onClose: () => void;
  autoCloseSeconds?: number;
}

export default function NoticeDetailModal({ 
  notice, 
  onClose,
  autoCloseSeconds = 10
}: NoticeDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(autoCloseSeconds);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(autoCloseSeconds);
  }, [notice, autoCloseSeconds]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!notice) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [notice, onClose]);

  // Countdown timer for auto-exit
  useEffect(() => {
    if (!notice || timeLeft <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [notice, timeLeft, isPaused, onClose]);

  if (!mounted || !notice) return null;

  const hasScannedImage = Boolean(notice.imageUrl);
  const progressPercent = (timeLeft / autoCloseSeconds) * 100;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999999] overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none flex items-center justify-center p-3 sm:p-6"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Click outside to dismiss immediately */}
      <div 
        className="fixed inset-0 bg-transparent cursor-pointer" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {hasScannedImage ? (
        /* ========================================================================= */
        /* 🖼️ PURE IMAGE NOTICE DISPLAY: STRICTLY THE IMAGE + EXIT BUTTON (NO WORDS) */
        /* ========================================================================= */
        <div 
          className="relative z-10 max-w-4xl w-full flex flex-col items-center justify-center animate-scaleUp my-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Top Floating Exit Bar right above / aligned with the image */}
          <div className="w-full flex justify-end items-center mb-3 px-1 sm:px-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-2.5 bg-black/80 hover:bg-red-600 text-white px-4 py-2 rounded-full border border-white/20 shadow-2xl backdrop-blur-md transition-all duration-200 cursor-pointer font-extrabold text-xs sm:text-sm group"
              title="Click to Exit (or press Esc)"
            >
              <span>Exit</span>
              <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {isPaused ? 'Paused' : `${timeLeft}s`}
              </span>
              <X className="h-4 w-4 sm:h-4.5 sm:w-4.5 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          {/* The Notice Image (Clean, High-Res, Centered) */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white group max-h-[82vh] flex items-center justify-center">
            <img
              src={notice.imageUrl!}
              alt={notice.title || 'Official School Notice'}
              className="w-auto h-auto max-h-[80vh] max-w-full object-contain block"
            />

            {/* Quick Exit X Icon on top-right corner of the image */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 shadow-xl border border-white/30 cursor-pointer"
              aria-label="Exit notice"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Subtle Auto-Exit Progress Bar at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-red-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 📄 PLAIN TEXT CIRCULAR LETTERHEAD (When no scanned image is attached)     */
        /* ========================================================================= */
        <div 
          className="relative w-full max-w-3xl bg-white text-gray-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-200 space-y-6 text-left z-10 animate-scaleUp my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Exit Button */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex items-center space-x-3">
              <img src="/school-logo.png" alt="Logo" className="h-10 w-10 object-contain" />
              <div>
                <h3 className="font-black text-xl text-slate-900 leading-tight">THE LITTLE HOUSE SCHOOL</h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">WAITON LAMKHAI, PANGEI</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer"
            >
              <span>Exit</span>
              <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{timeLeft}s</span>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded border border-red-100">
              {notice.audience} NOTICE
            </span>
            <h4 className="text-xl font-black text-slate-900">{notice.title}</h4>
            <p className="text-xs text-slate-500 font-mono">Date: {formatDateSafe(notice.createdAt, 'long')}</p>
          </div>

          <div className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap py-2 border-y border-slate-100 min-h-[120px]">
            {notice.content}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] font-mono text-slate-500">Official Notice Desk</span>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
