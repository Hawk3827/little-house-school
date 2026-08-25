'use client';

import React, { useEffect, useState } from 'react';
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
  ArrowDown
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
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!notice) return null;

  const formattedDate = formatDateSafe(notice.createdAt, 'long');

  const handlePrint = () => {
    window.print();
  };

  const hasScannedImage = Boolean(notice.imageUrl);

  return (
    <div 
      className="fixed inset-0 z-[999999] overflow-y-auto bg-black/90 backdrop-blur-xl animate-fadeIn scroll-smooth"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Centered Scrollable Wrapper */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 md:p-10 text-center">
        {/* Backdrop click to dismiss */}
        <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />

        {/* Modal Sheet Container */}
        <div 
          className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 text-white rounded-3xl shadow-2xl overflow-hidden text-left z-10 my-4 sm:my-8 animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Control Header Bar */}
          <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 sticky top-0 z-20 shadow-md">
            <div className="flex items-center space-x-3 min-w-0 pr-3">
              <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider bg-red-950 text-red-400 border border-red-900/60 flex-shrink-0">
                OFFICIAL NOTICE
              </span>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
                  {notice.title}
                </h2>
                <span className="text-xs text-neutral-400 font-mono hidden sm:block mt-0.5">
                  Published: {formattedDate} • Target Audience: <strong className="text-white">{notice.audience}</strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {hasScannedImage && (
                <>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => (prev === 1 ? 1.4 : 1))}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition text-xs flex items-center space-x-1.5"
                    title="Toggle Zoom Size"
                  >
                    {zoomLevel === 1 ? <ZoomIn className="h-4 w-4" /> : <ZoomOut className="h-4 w-4" />}
                    <span className="hidden md:inline font-mono text-[11px]">{zoomLevel === 1 ? 'Zoom In' : 'Reset'}</span>
                  </button>

                  <a
                    href={notice.imageUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition text-xs flex items-center space-x-1.5"
                    title="Open in new tab"
                  >
                    <Maximize2 className="h-4 w-4" />
                    <span className="hidden md:inline font-mono text-[11px]">Full Tab</span>
                  </a>

                  <a
                    href={notice.imageUrl!}
                    download={`school-notice-${notice.id}.jpg`}
                    className="hidden sm:flex items-center space-x-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </a>
                </>
              )}

              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center space-x-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-xl bg-neutral-800 hover:bg-red-900 hover:text-white text-neutral-300 transition flex items-center space-x-1"
                aria-label="Close notice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notice Body Content */}
          <div className="p-4 sm:p-8 md:p-10 bg-neutral-950">
            {hasScannedImage ? (
              /* Scanned Notice Paper Image (Full Width & Natural Height) */
              <div className="w-full flex flex-col items-center space-y-4">
                <div 
                  className="w-full flex justify-center transition-all duration-300 overflow-x-auto"
                  style={{ transform: zoomLevel > 1 ? `scale(${zoomLevel})` : 'none', transformOrigin: 'top center' }}
                >
                  <img
                    src={notice.imageUrl!}
                    alt={notice.title}
                    className="w-full max-w-3xl h-auto object-contain rounded-2xl shadow-2xl border border-neutral-800 bg-white"
                  />
                </div>
              </div>
            ) : (
              /* Fullsize A4 Official Circular Letterhead Paper */
              <div className="w-full bg-white text-gray-900 rounded-3xl p-6 sm:p-12 shadow-2xl border border-gray-200 space-y-6">
                {/* School Official Letterhead Header */}
                <div className="border-b-2 border-gray-900 pb-5 text-center space-y-2">
                  <div className="flex items-center justify-center space-x-3">
                    <img src="/school-logo.png" alt="Logo" className="h-12 w-12 object-contain" />
                    <div className="text-left">
                      <h3 className="font-extrabold text-2xl sm:text-3xl tracking-tight text-gray-900 uppercase leading-none">
                        LITTLE HOUSE
                      </h3>
                      <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block mt-1">
                        A FAMILY OF LEARNING • FOUNDED 2012
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-mono font-semibold text-gray-600 uppercase tracking-widest pt-1">
                    Waiton Lamkhai, Imphal East, Manipur - 795114
                  </p>
                  <div className="inline-block bg-red-600 text-white font-mono font-bold text-xs uppercase px-4 py-1 rounded-full mt-2 shadow-sm">
                    OFFICIAL SCHOOL CIRCULAR
                  </div>
                </div>

                {/* Subject & Date Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Subject / Headline</span>
                    <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">{notice.title}</h4>
                  </div>
                  <div className="sm:text-right flex-shrink-0">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Date of Issue</span>
                    <span className="text-xs font-mono text-gray-700 font-bold">{formattedDate}</span>
                  </div>
                </div>

                {/* Circular Text Body */}
                <div className="text-base sm:text-lg text-gray-800 leading-relaxed whitespace-pre-wrap font-normal py-4 min-h-[140px]">
                  {notice.content || 'Please refer to the school administration desk for complete instructions regarding this announcement.'}
                </div>

                {/* Seal & Signature Footer */}
                <div className="pt-6 border-t-2 border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-gray-600">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-mono uppercase block">Authorized Distribution</span>
                    <span className="font-bold text-gray-800 uppercase px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200">
                      {notice.audience} NOTICE
                    </span>
                  </div>

                  <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto">
                    <div className="font-mono text-[11px] text-indigo-700 font-bold italic mb-1">
                      [Digitally Approved Circular]
                    </div>
                    <span className="font-bold text-gray-900 text-sm block">
                      {notice.createdBy?.name || 'Principal / Administrator'}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono block">
                      Office of Administration, LITTLE HOUSE
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="p-4 border-t border-neutral-850 bg-neutral-900 flex justify-between items-center text-xs text-neutral-400">
            <span className="font-mono text-[11px]">Little House Digital Circular System</span>
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl transition"
            >
              Close Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
