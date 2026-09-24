'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface GalleryPhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  title?: string;
  mediaType?: string | null;
  videoUrl?: string | null;
  category?: string | null;
  description?: string | null;
  date?: Date | string | null;
}

// Helper to parse YouTube embed URL if a video is opened
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
}: GalleryPhotoLightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const isVideo = mediaType === 'VIDEO' && !!videoUrl;
  const youtubeEmbedUrl = isVideo ? getYouTubeEmbedUrl(videoUrl) : null;

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

      <div
        className="relative z-10 max-w-5xl w-full flex flex-col items-center justify-center animate-scaleUp my-auto pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The Photo / Media Container: Pure image with cross sign on top right */}
        <div className="relative inline-flex max-w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black/40 group max-h-[82vh] sm:max-h-[85vh] items-center justify-center pointer-events-auto">
          {isVideo ? (
            youtubeEmbedUrl ? (
              <div className="w-[90vw] sm:w-[85vw] max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black">
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
                playsInline
                className="max-h-[80vh] sm:max-h-[85vh] w-auto max-w-[92vw] sm:max-w-full rounded-2xl"
              />
            ) : null
          ) : photoUrl ? (
            <img
              src={photoUrl}
              alt={title || 'Campus Photo'}
              className="w-auto h-auto max-h-[80vh] sm:max-h-[85vh] max-w-[92vw] sm:max-w-full object-contain block rounded-2xl sm:rounded-3xl"
            />
          ) : null}

          {/* Clean Cross Sign (X) for Exit on top-right corner */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/80 hover:bg-red-600 active:scale-90 text-white flex items-center justify-center transition-all duration-200 shadow-2xl border border-white/40 backdrop-blur-md cursor-pointer group touch-manipulation z-30"
            aria-label="Exit photo"
            title="Close"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
