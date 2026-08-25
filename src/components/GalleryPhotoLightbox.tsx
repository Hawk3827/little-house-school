'use client';

import React, { useEffect } from 'react';
import { X, Download, Maximize2, Tag, Calendar, Play, Film } from 'lucide-react';

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

  return (
    <div
      className="fixed inset-0 z-[999999] overflow-y-auto bg-black/95 backdrop-blur-2xl p-3 sm:p-6 lg:p-8 animate-fadeIn scroll-smooth"
      onClick={onClose}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Top Floating Control Bar */}
      <div 
        className="fixed top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between z-[1000000] pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2.5">
          {isVideo ? (
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-300 bg-amber-950/90 border border-amber-500/50 px-3 py-1.5 rounded-full uppercase shadow-xl flex items-center space-x-1.5">
              <Film className="h-3 w-3" />
              <span>VIDEO REEL</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-indigo-300 bg-indigo-950/90 border border-indigo-500/50 px-3 py-1.5 rounded-full uppercase shadow-xl">
              {category || 'PHOTO'}
            </span>
          )}
          
          {category && isVideo && (
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-neutral-300 bg-neutral-900/90 border border-neutral-700 px-3 py-1.5 rounded-full uppercase">
              {category}
            </span>
          )}

          {date && (
            <span className="text-[10px] sm:text-xs font-mono text-neutral-400 hidden sm:inline-block">
              {typeof date === 'string' ? date : new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {photoUrl && !isVideo && (
            <a
              href={photoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-4 sm:py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center space-x-2 transition border border-white/20 shadow-lg"
              title="Download original image"
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
              className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition border border-white/20 shadow-lg"
              title="Open full size in new tab"
            >
              <Maximize2 className="h-4 w-4" />
            </a>
          )}

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-red-900/80 text-white transition border border-white/20 shadow-lg"
            title="Close viewer (ESC)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div 
        className="min-h-full flex flex-col items-center justify-center pt-16 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-w-5xl w-full flex flex-col items-center justify-center animate-scaleUp">
          {/* Main Media Display */}
          <div className="w-full flex items-center justify-center overflow-hidden rounded-3xl bg-neutral-950/90 border border-neutral-800 shadow-2xl p-2 sm:p-3">
            {isVideo ? (
              youtubeEmbedUrl ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={title}
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
                  className="max-h-[75vh] w-full rounded-2xl bg-black"
                />
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center text-neutral-400 bg-neutral-900 rounded-2xl">
                  <Play className="h-12 w-12 text-neutral-600 mb-2" />
                  <p className="text-sm">Video link not available</p>
                </div>
              )
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt={title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-neutral-400 bg-neutral-900 rounded-2xl">
                <p>Image not available</p>
              </div>
            )}
          </div>

          {/* Title & Caption Card */}
          <div className="mt-4 w-full bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 p-5 rounded-2xl shadow-xl text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <div className="flex items-center space-x-2 text-xs text-neutral-400 font-mono">
                <span>Press <kbd className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> or click outside to exit</span>
              </div>
            </div>

            {description && (
              <p className="text-sm text-neutral-300 mt-2.5 leading-relaxed font-normal">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
