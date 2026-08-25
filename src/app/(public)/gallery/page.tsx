import React from 'react';
import prisma from '@/lib/prisma';
import { Camera, Sparkles } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import PublicGalleryGrid from '@/components/PublicGalleryGrid';

export const revalidate = 0; // Always serve fresh photos on upload

export default async function GalleryPage() {
  let items: any[] = [];
  try {
    items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to load gallery items:', error);
    items = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 space-y-12 relative bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <AnimatedSection type="fade-in" className="text-left max-w-4xl space-y-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
          VISUAL ARCHIVE & REELS
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
          <Camera className="h-9 w-9 text-sky-600 animate-pulse" />
          <span>CAMPUS LIFE.</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
          A visual chronicle of classroom projects, sports tournaments, festival celebrations, and student milestones at LITTLE HOUSE.
        </p>
      </AnimatedSection>

      {/* Dynamic Gallery Grid with Filter Pills & Lightbox Zoom */}
      <PublicGalleryGrid items={items} />
    </div>
  );
}
