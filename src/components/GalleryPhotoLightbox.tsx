'use client';

import React, { useEffect } from 'react';
import { X, Download, Maximize2, Tag, Calendar, Play, Film, Sparkles, Image as ImageIcon } from 'lucide-react';

interface GalleryPhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  title: string;
  mediaType?: string | null;
  videoUrl?: string | null;
  category?: string | null;
  description?: string | null;
  date?: Date | string | null;
}

// Helper to parse YouTube embed URL
function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
  }
  return null;
}

export default function GalleryPhotoLightbox({
  isOpen,
  onClose,
  photoUrl,
  title,
  mediaType = 'PHOTO',
  videoUrl,
  category,
  description,
  date,
}: GalleryPhotoLightboxProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isVideo = mediaType === 'VIDEO' && !!videoUrl;
  const youtubeEmbedUrl = isVideo ? getYouTubeEmbedUrl(videoUrl) : null;

  // Determine if title is custom or fallback
  const displayTitle = (title && title !== category && title !== 'Campus Photo') ? title : null;

  return (
    <div
      className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-900/40 backdrop-blur-xl animate-fadeIn select-none scroll-smooth flex flex-col items-center py-6 sm:py-10 px-4 sm:px-8"
      onClick={onClose}
    >
      {/* 🌟 Soft Light Sky Ambient Glow Background */}
      {photoUrl && !isVideo && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
          <img
            src={photoUrl}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-125 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-50/80 via-white/80 to-sky-100/80 backdrop-blur-2xl" />
        </div>
      )}

      {/* 💎 Floating Light Control Bar */}
      <header 
        className="sticky top-0 z-[1000000] w-full max-w-5xl mx-auto px-4 py-3 bg-white/90 backdrop-blur-xl border border-sky-100/80 rounded-full shadow-lg flex items-center justify-between pointer-events-auto mb-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2.5">
          {isVideo ? (
            <span className="text-[10px] sm:text-xs font-mono font-extrabold tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase shadow-xs flex items-center space-x-1.5">
              <Film className="h-3.5 w-3.5 text-amber-700" />
              <span>VIDEO REEL</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-mono font-extrabold tracking-wider text-sky-900 bg-sky-100 border border-sky-300 px-3.5 py-1 rounded-full uppercase shadow-xs flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span>{category || 'CAMPUS GALLERY'}</span>
            </span>
          )}

          {date && (
            <span className="text-[10px] sm:text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full hidden sm:inline-block font-semibold">
              {typeof date === 'string' ? date : new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Light Header Buttons */}
        <div className="flex items-center space-x-2">
          {photoUrl && !isVideo && (
            <a
              href={photoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm active:scale-95"
              title="Download Image"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}

          {photoUrl && (
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition border border-slate-200 shadow-xs active:scale-95"
              title="Open full size in new tab"
            >
              <Maximize2 className="h-4 w-4" />
            </a>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 transition border border-slate-200 shadow-xs active:scale-95"
            title="Close (ESC)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 🖼️ Main Adaptive Scrollable Photo Container */}
      <main 
        className="relative z-10 w-full max-w-5xl flex flex-col items-center pointer-events-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo Display Card */}
        <div className="w-full flex items-center justify-center p-2 sm:p-4 bg-white/95 rounded-[36px] border border-sky-100/90 shadow-[0_20px_60px_rgba(2,132,199,0.15)] animate-scaleUp">
          {isVideo ? (
            youtubeEmbedUrl ? (
              <div className="w-full aspect-video rounded-[28px] overflow-hidden bg-slate-900 shadow-md">
                <iframe
                  src={youtubeEmbedUrl}
                  title={title || 'School Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="max-h-[72vh] w-auto max-w-full rounded-[28px] bg-slate-950 shadow-md"
              />
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-[28px]">
                <Play className="h-12 w-12 text-slate-400 mb-2" />
                <p className="text-sm font-semibold">Video link not available</p>
              </div>
            )
          ) : photoUrl ? (
            <img
              src={photoUrl}
              alt={title || 'Little House Gallery Photo'}
              className="max-h-[74vh] w-auto max-w-full object-contain rounded-[28px] shadow-sm transition-all duration-300"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-slate-400 bg-slate-100 rounded-[28px]">
              <p className="text-sm font-semibold">Image not available</p>
            </div>
          )}
        </div>

        {/* 📜 High-Readability Scrollable Light Caption Card */}
        <div className="w-full bg-white/95 backdrop-blur-xl border border-sky-100/90 p-6 sm:p-8 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.06)] text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-extrabold tracking-widest text-sky-700 uppercase bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
                {category || 'CAMPUS LIFE'}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {displayTitle || 'LITTLE HOUSE SCHOOL'}
              </h2>
            </div>

            {date && (
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/80">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{typeof date === 'string' ? date : new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {description ? (
            <div className="pt-2 text-sm sm:text-base text-slate-700 font-normal leading-relaxed whitespace-pre-wrap">
              {description}
            </div>
          ) : (
            <p className="pt-2 text-xs text-slate-500 font-normal italic">
              Campus Life & Activity Photo • Waiton Lamkhai, Imphal East, Manipur.
            </p>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1">
              <span>Scroll down to read • Click anywhere outside or press</span>
              <kbd className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-bold">ESC</kbd>
              <span>to exit</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
