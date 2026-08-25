'use client';

import React, { useState } from 'react';
import { getThumbnailUrl } from '@/lib/imageOptimization';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  thumbnailWidth?: number;
  useThumbnail?: boolean;
  containerClassName?: string;
}

export default function OptimizedImage({
  src,
  alt,
  thumbnailWidth = 640,
  useThumbnail = true,
  className = '',
  containerClassName = '',
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const finalSrc = useThumbnail ? getThumbnailUrl(src, thumbnailWidth) : src;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* 3G Low-Bandwidth Shimmer Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin opacity-40" />
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-4 text-center">
          <ImageIcon className="h-6 w-6 text-neutral-600 mb-1" />
          <span className="text-[10px] text-neutral-500 font-mono">Image offline</span>
        </div>
      ) : (
        <img
          src={finalSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
}
