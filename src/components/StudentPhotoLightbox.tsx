'use client';

import React, { useEffect } from 'react';
import { X, Download, ShieldCheck } from 'lucide-react';

interface StudentPhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  name: string;
  admissionNo?: string | null;
}

export default function StudentPhotoLightbox({
  isOpen,
  onClose,
  photoUrl,
  name,
  admissionNo,
}: StudentPhotoLightboxProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] overflow-y-auto bg-black/95 backdrop-blur-2xl p-4 sm:p-8 animate-fadeIn scroll-smooth"
      onClick={onClose}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Top Floating Actions Header */}
      <div 
        className="fixed top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-[1000000] pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-indigo-300 bg-indigo-950/90 border border-indigo-500/50 px-3 py-1.5 rounded-full uppercase shadow-xl flex items-center space-x-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>VERIFIED STUDENT PROFILE</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {photoUrl && (
            <a
              href={photoUrl}
              download={`${name.replace(/\s+/g, '_')}_profile.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-4 sm:py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center space-x-2 transition border border-white/20 shadow-lg"
              title="Download full resolution photo"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Photo</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-red-900/80 text-white transition border border-white/20 shadow-lg"
            title="Close preview (ESC)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Full-Size Student Photo Frame */}
      <div
        className="min-h-full flex flex-col items-center justify-center pt-16 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-w-3xl w-full flex flex-col items-center justify-center animate-scaleUp">
          {/* High-Res Photo Container */}
          <div className="w-full flex items-center justify-center overflow-hidden rounded-3xl bg-neutral-950/90 border border-neutral-800 shadow-2xl p-3 sm:p-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-300"
              />
            ) : (
              <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 flex flex-col items-center justify-center font-extrabold text-7xl uppercase shadow-xl space-y-2">
                <span>{name.slice(0, 2)}</span>
                <span className="text-xs font-mono text-indigo-300 tracking-wider">NO PHOTO ON FILE</span>
              </div>
            )}
          </div>

          {/* Student Dossier Information Card */}
          <div className="mt-4 w-full bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">{name}</h3>
              {admissionNo && (
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Admission No: <span className="text-indigo-400 font-semibold">{admissionNo}</span>
                </p>
              )}
            </div>
            <div className="text-[11px] text-neutral-400 font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              Official School Photo Archive
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
