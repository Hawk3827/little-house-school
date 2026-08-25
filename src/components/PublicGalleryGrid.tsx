'use client';

import React, { useState } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Eye, 
  Sparkles, 
  Calendar,
  Layers,
  Play,
  Film,
  Video
} from 'lucide-react';
import GalleryPhotoLightbox from '@/components/GalleryPhotoLightbox';
import OptimizedImage from '@/components/OptimizedImage';
import { getFullResolutionUrl } from '@/lib/imageOptimization';

interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  mediaType?: string | null; // 'PHOTO' | 'VIDEO'
  videoUrl?: string | null;
  category?: string | null;
  description?: string | null;
  createdAt: Date | string;
}

interface PublicGalleryGridProps {
  items: GalleryItem[];
}

export default function PublicGalleryGrid({ items }: PublicGalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [mediaFilter, setMediaFilter] = useState<'ALL' | 'PHOTO' | 'VIDEO'>('ALL');
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(null);

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category || 'Events').filter(Boolean)))];

  const totalPhotos = items.filter(i => (i.mediaType || 'PHOTO') === 'PHOTO').length;
  const totalVideos = items.filter(i => i.mediaType === 'VIDEO').length;

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || (item.category || 'Events').toLowerCase() === selectedCategory.toLowerCase();
    const itemMediaType = item.mediaType || 'PHOTO';
    const matchesMedia = mediaFilter === 'ALL' || itemMediaType === mediaFilter;
    return matchesCategory && matchesMedia;
  });

  return (
    <div className="space-y-10 text-left">
      {/* Immersive Full-Screen Lightbox / Video Player */}
      {activeLightbox && (
        <GalleryPhotoLightbox
          isOpen={true}
          photoUrl={activeLightbox.imageUrl}
          mediaType={activeLightbox.mediaType || 'PHOTO'}
          videoUrl={activeLightbox.videoUrl}
          title={activeLightbox.title}
          category={activeLightbox.category}
          description={activeLightbox.description}
          date={activeLightbox.createdAt}
          onClose={() => setActiveLightbox(null)}
        />
      )}

      {/* Filter Toolbar (Media Type + Categories) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-100 pb-6">
        {/* Media Type Switcher (Photos / Videos) */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-2xl border border-neutral-200/80 self-start">
          <button
            onClick={() => setMediaFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-1.5 ${
              mediaFilter === 'ALL'
                ? 'bg-white text-black shadow-xs'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>ALL MEDIA ({items.length})</span>
          </button>

          <button
            onClick={() => setMediaFilter('PHOTO')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-1.5 ${
              mediaFilter === 'PHOTO'
                ? 'bg-white text-black shadow-xs'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>PHOTOS ({totalPhotos})</span>
          </button>

          <button
            onClick={() => setMediaFilter('VIDEO')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-1.5 ${
              mediaFilter === 'VIDEO'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <Film className="h-3.5 w-3.5 text-amber-500" />
            <span>VIDEOS ({totalVideos})</span>
          </button>
        </div>

        {/* Category Filter Pills (Swipeable on mobile) */}
        {categories.length > 1 && (
          <div className="flex items-center overflow-x-auto gap-2 pb-1 scroll-smooth no-scrollbar max-w-full">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-black text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Gallery Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-28 bg-neutral-50 rounded-[32px] border border-neutral-100 flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-white rounded-2xl shadow-xs text-neutral-300">
            {mediaFilter === 'VIDEO' ? (
              <Film className="h-10 w-10 text-amber-400" />
            ) : (
              <ImageIcon className="h-10 w-10 text-neutral-300" />
            )}
          </div>
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            No {mediaFilter === 'VIDEO' ? 'Videos' : mediaFilter === 'PHOTO' ? 'Photos' : 'Media'} Found
          </h3>
          <p className="text-neutral-500 text-xs font-light">
            Try switching filters or check back soon for updates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const isItemVideo = item.mediaType === 'VIDEO';

            return (
              <div
                key={item.id}
                onClick={() => setActiveLightbox(item)}
                className="bg-white rounded-[32px] overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Media Thumbnail Container */}
                  <div className="h-72 bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden">
                    <OptimizedImage
                      src={item.imageUrl || '/hero-bg.jpg'}
                      alt={item.title}
                      thumbnailWidth={640}
                      useThumbnail={true}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
                      {isItemVideo ? (
                        <span className="text-[9px] font-mono font-bold tracking-widest text-amber-300 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/40 uppercase shadow-sm flex items-center space-x-1.5">
                          <Play className="h-2.5 w-2.5 fill-amber-300" />
                          <span>VIDEO REEL</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-300 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/30 uppercase shadow-sm">
                          {item.category || 'PHOTO'}
                        </span>
                      )}

                      {/* Zoom / Play Icon */}
                      <div className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white opacity-0 group-hover:opacity-100 transition duration-300">
                        {isItemVideo ? <Play className="h-3.5 w-3.5 fill-white" /> : <Eye className="h-3.5 w-3.5" />}
                      </div>
                    </div>

                    {/* Centered Glowing Play Button for Videos */}
                    {isItemVideo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-md border-2 border-amber-400/80 text-amber-300 flex items-center justify-center shadow-2xl group-hover:scale-115 group-hover:bg-amber-500 group-hover:text-black group-hover:border-white transition-all duration-300 pl-1">
                          <Play className="h-7 w-7 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Bottom overlay title */}
                    <div className="absolute bottom-5 left-6 right-6 text-left z-10 space-y-1">
                      <div className="flex items-center space-x-1.5 text-[10px] font-mono text-neutral-300">
                        <Calendar className="h-3 w-3 text-indigo-400" />
                        <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h4 className="text-white font-bold text-base tracking-tight leading-snug group-hover:text-indigo-200 transition line-clamp-1">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  {/* Description & Caption */}
                  {item.description && (
                    <div className="p-6 text-left">
                      <p className="text-neutral-600 text-xs leading-relaxed font-light line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between text-[10px] font-mono font-semibold text-indigo-600 border-t border-neutral-50 mt-auto">
                  <span className="group-hover:underline">
                    {isItemVideo ? 'WATCH VIDEO FULL SCREEN' : 'VIEW FULL SIZE'}
                  </span>
                  {isItemVideo ? (
                    <Play className="h-3.5 w-3.5 fill-current text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
