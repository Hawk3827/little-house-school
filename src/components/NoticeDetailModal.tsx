'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Printer, 
  Calendar, 
  Megaphone, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  FileText,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
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
}

export default function NoticeDetailModal({ notice, onClose }: NoticeDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key when notice modal is open
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

  if (!mounted || !notice) return null;

  const formattedDate = formatDateSafe(notice.createdAt, 'long');

  const handlePrint = () => {
    window.print();
  };

  const hasScannedImage = Boolean(notice.imageUrl);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999999] overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Centered Scrollable Wrapper */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 md:p-8 text-center">
        {/* Backdrop click to dismiss */}
        <div 
          className="fixed inset-0 bg-transparent cursor-pointer" 
          onClick={onClose} 
          aria-hidden="true" 
        />

        {/* Modal Container */}
        <div 
          className="relative w-full max-w-4xl bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl border border-sky-100 overflow-hidden text-left z-10 my-6 animate-scaleUp flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Control Header Bar */}
          <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white sticky top-0 z-20 shadow-sm shrink-0">
            <div className="flex items-center space-x-3 min-w-0 pr-3">
              <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-md uppercase tracking-wider bg-red-600/90 text-white shrink-0 shadow-xs">
                OFFICIAL NOTICE
              </span>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-tight truncate">
                  {notice.title}
                </h2>
                <div className="text-[11px] text-slate-300 font-mono hidden sm:flex items-center space-x-2 mt-0.5">
                  <span>Published: {formattedDate}</span>
                  <span>•</span>
                  <span>Audience: <strong className="text-amber-300 uppercase">{notice.audience}</strong></span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {hasScannedImage && (
                <>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => (prev === 1 ? 1.35 : 1))}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs flex items-center space-x-1.5 cursor-pointer"
                    title="Toggle Zoom Size"
                  >
                    {zoomLevel === 1 ? <ZoomIn className="h-4 w-4" /> : <ZoomOut className="h-4 w-4" />}
                    <span className="hidden md:inline font-mono text-[11px] font-bold">
                      {zoomLevel === 1 ? 'Zoom' : 'Reset'}
                    </span>
                  </button>

                  <a
                    href={notice.imageUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs flex items-center space-x-1.5 cursor-pointer"
                    title="Open in new tab"
                  >
                    <Maximize2 className="h-4 w-4" />
                    <span className="hidden md:inline font-mono text-[11px] font-bold">Full Tab</span>
                  </a>

                  <a
                    href={notice.imageUrl!}
                    download={`little-house-notice-${notice.id}.jpg`}
                    className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </a>
                </>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white transition flex items-center justify-center cursor-pointer shadow-xs"
                aria-label="Close notice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body Content (Scrollable) */}
          <div className="p-3 sm:p-5 md:p-6 overflow-y-auto bg-slate-100/90 flex-1 flex flex-col items-center justify-center">
            {hasScannedImage ? (
              /* Poster / Scanned Image Display - Pure Image Focus */
              <div className="w-full flex flex-col items-center justify-center py-2">
                <div 
                  className="w-full flex justify-center transition-transform duration-300"
                  style={{ transform: zoomLevel > 1 ? `scale(${zoomLevel})` : 'none', transformOrigin: 'top center' }}
                >
                  <img
                    src={notice.imageUrl!}
                    alt={notice.title}
                    className="w-full max-w-3xl h-auto max-h-[76vh] object-contain rounded-2xl shadow-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            ) : (
              /* Official Circular Letterhead Paper */
              <div className="w-full bg-white text-gray-900 rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 space-y-6">
                {/* School Official Letterhead Header */}
                <div className="border-b-2 border-slate-900 pb-5 text-center space-y-2">
                  <div className="flex items-center justify-center space-x-3">
                    <img src="/school-logo.png" alt="Logo" className="h-12 w-12 object-contain" />
                    <div className="text-left">
                      <h3 className="font-black text-2xl tracking-tight text-slate-900 uppercase leading-none">
                        LITTLE HOUSE SCHOOL
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mt-1">
                        A FAMILY OF LEARNING • WAITON LAMKHAI, PANGEI
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] font-mono font-semibold text-slate-600 uppercase tracking-widest pt-1">
                    Imphal East, Manipur - 795114
                  </p>
                  <div className="inline-block bg-red-600 text-white font-mono font-bold text-xs uppercase px-4 py-1 rounded-full mt-2 shadow-xs">
                    OFFICIAL SCHOOL CIRCULAR
                  </div>
                </div>

                {/* Subject & Date Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Subject / Headline</span>
                    <h4 className="text-xl font-black text-slate-900 leading-snug">{notice.title}</h4>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Date of Issue</span>
                    <span className="text-xs font-mono text-slate-700 font-bold">{formattedDate}</span>
                  </div>
                </div>

                {/* Circular Text Body */}
                <div className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap font-normal py-4 min-h-[140px]">
                  {notice.content || 'Please refer to the school administration desk for complete instructions regarding this announcement.'}
                </div>

                {/* Seal & Signature Footer */}
                <div className="pt-6 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-600">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Authorized Distribution</span>
                    <span className="font-bold text-slate-800 uppercase px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200">
                      {notice.audience} NOTICE
                    </span>
                  </div>

                  <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto">
                    <div className="font-mono text-[11px] text-sky-700 font-bold italic mb-0.5">
                      [Digitally Approved Circular]
                    </div>
                    <span className="font-black text-slate-900 text-sm block">
                      {notice.createdBy?.name || 'Principal / Administrator'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      Office of Administration, LITTLE HOUSE
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 shrink-0">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-mono text-[11px] font-bold text-slate-600">
                Official Little House Circular Desk • Verified Campus Publication
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-6 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
            >
              Close Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
