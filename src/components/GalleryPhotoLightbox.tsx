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
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isVideo = mediaType === 'VIDEO' && !!videoUrl;
  const youtubeEmbedUrl = isVideo ? getYouTubeEmbedUrl(videoUrl) : null;

  // Determine if title is just default category name or empty
  const displayTitle = (title && title !== category && title !== 'Campus Photo') ? title : null;

  return (
    <div
      className="fixed inset-0 z-[999999] overflow-hidden bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between animate-fadeIn select-none"
      onClick={onClose}
    >
      {/* 🌟 Ambient Soft Color Glow Background from Photo */}
      {photoUrl && !isVideo && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <img
            src={photoUrl}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-125 transition-all duration-700 brightness-75"
          />
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" />
        </div>
      )}

      {/* 💎 Sleek Top Control Bar */}
      <header 
        className="relative z-[1000000] w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 flex items-center justify-between pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2.5">
          {isVideo ? (
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1.5 rounded-full uppercase shadow-xl flex items-center space-x-1.5 backdrop-blur-md">
              <Film className="h-3.5 w-3.5" />
              <span>VIDEO REEL</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-sky-300 bg-sky-950/80 border border-sky-500/40 px-3.5 py-1.5 rounded-full uppercase shadow-xl flex items-center space-x-1.5 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span>{category || 'CAMPUS GALLERY'}</span>
            </span>
          )}

          {date && (
            <span className="text-[10px] sm:text-xs font-mono text-slate-300 bg-slate-900/60 border border-slate-700/60 px-3 py-1.5 rounded-full backdrop-blur-md hidden sm:inline-block">
              {typeof date === 'string' ? date : new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {photoUrl && !isVideo && (
            <a
              href={photoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-2 transition border border-white/20 shadow-xl backdrop-blur-md active:scale-95"
              title="Download Image"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}

          {photoUrl && (
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/20 shadow-xl backdrop-blur-md active:scale-95"
              title="Open full size in new tab"
            >
              <Maximize2 className="h-4 w-4" />
            </a>
          )}

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition border border-white/20 shadow-xl backdrop-blur-md active:scale-95"
            title="Close (ESC)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 🖼️ Main Adaptive Photo Viewer */}
      <main 
        className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[82vh] w-auto max-w-full flex items-center justify-center animate-scaleUp">
          {isVideo ? (
            youtubeEmbedUrl ? (
              <div className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
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
                className="max-h-[80vh] w-auto max-w-full rounded-3xl bg-black shadow-2xl border border-white/10"
              />
            ) : (
              <div className="w-96 h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
                <Play className="h-12 w-12 text-slate-600 mb-2" />
                <p className="text-sm">Video link not available</p>
              </div>
            )
          ) : photoUrl ? (
            <img
              src={photoUrl}
              alt={title || 'Little House Gallery Photo'}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border border-white/15 transition-all duration-300"
            />
          ) : (
            <div className="w-96 h-64 flex items-center justify-center text-slate-400 bg-slate-900 rounded-3xl">
              <p>Image not available</p>
            </div>
          )}
        </div>
      </main>

      {/* 📝 Floating Bottom Caption & Title Bar */}
      <footer 
        className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="min-w-0 flex-1 space-y-0.5">
            {displayTitle ? (
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight">{displayTitle}</h3>
            ) : (
              <h3 className="text-xs sm:text-sm font-bold text-slate-300 truncate flex items-center space-x-2">
                <span className="font-extrabold text-white">LITTLE HOUSE SCHOOL</span>
                <span className="text-slate-500">•</span>
                <span className="text-sky-400 font-mono text-xs">{category || 'Campus Photo'}</span>
              </h3>
            )}

            {description ? (
              <p className="text-xs text-slate-300 font-normal leading-relaxed truncate">
                {description}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 font-light truncate">
                Official Campus Life & Event Gallery • Waiton Lamkhai, Imphal East
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 flex-shrink-0 self-end sm:self-center">
            <span>Press <kbd className="bg-white/15 text-white px-1.5 py-0.5 rounded border border-white/20">ESC</kbd> to exit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
