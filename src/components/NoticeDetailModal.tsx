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

  // Background auto-exit countdown timer
  useEffect(() => {
    if (!notice || timeLeft <= 0) return;

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
  }, [notice, timeLeft, onClose]);

  if (!mounted || !notice) return null;

  const hasScannedImage = Boolean(notice.imageUrl);

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
        /* 🖼️ PURE IMAGE NOTICE DISPLAY: STRICTLY THE IMAGE + CIRCULAR CROSS EXIT   */
        /* ========================================================================= */
        <div 
          className="relative z-10 max-w-4xl w-full flex flex-col items-center justify-center animate-scaleUp my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* The Notice Image (Clean, High-Res, Centered) with Cross Sign on Top Right */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-white group max-h-[85vh] flex items-center justify-center">
            <img
              src={notice.imageUrl!}
              alt={notice.title || 'Official School Notice'}
              className="w-auto h-auto max-h-[82vh] max-w-full object-contain block"
            />

            {/* Clean Cross Sign (X) for Exit on top-right corner of the image */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/75 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 shadow-2xl border border-white/40 backdrop-blur-md cursor-pointer group"
              aria-label="Exit notice"
              title="Close Notice"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform" />
            </button>
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
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
              title="Close"
            >
              <X className="h-5 w-5" />
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
