'use client';

import React, { useState, useEffect } from 'react';
import NoticeDetailModal, { NoticeData } from './NoticeDetailModal';
import { Megaphone, Sparkles, Image as ImageIcon, ChevronRight, Bell, ArrowUpRight } from 'lucide-react';

interface LiveNoticeTickerProps {
  notices?: (NoticeData & { isPinned?: boolean })[];
}

export default function LiveNoticeTicker({ notices: initialNotices = [] }: LiveNoticeTickerProps) {
  const [selectedNotice, setSelectedNotice] = useState<NoticeData | null>(null);
  const [liveNotices, setLiveNotices] = useState<(NoticeData & { isPinned?: boolean })[]>(initialNotices);

  useEffect(() => {
    // Asynchronously fetch fresh notices on client without delaying initial server HTML response
    let isMounted = true;
    async function fetchLiveNotices() {
      try {
        const res = await fetch('/api/admin/announcements?tickerOnly=true');
        if (res.ok) {
          const data = await res.json();
          if (data.announcements && data.announcements.length > 0 && isMounted) {
            setLiveNotices(data.announcements.map((a: any) => ({
              id: a.id,
              title: a.title,
              content: a.content,
              audience: a.audience,
              imageUrl: a.imageUrl,
              isPinned: a.isPinned,
              createdAt: typeof a.createdAt === 'string' ? a.createdAt : new Date(a.createdAt).toISOString(),
              createdBy: {
                name: a.createdBy?.name || 'Administration Office'
              }
            })));
          }
        }
      } catch (err) {
        console.warn('Client notice fetch fallback:', err);
      }
    }

    fetchLiveNotices();
    return () => { isMounted = false; };
  }, []);

  // Fallback default notices if none exist yet in DB
  const defaultNotices: (NoticeData & { isPinned?: boolean })[] = [
    {
      id: 'default-1',
      title: 'Admissions Open for Academic Session 2026-2027',
      content: 'Online registration and offline forms are now available for Play-Group, Nursery, Lower KG, Upper KG, and Classes I through VI. Limited seats available.',
      audience: 'ALL',
      isPinned: true,
      createdAt: new Date().toISOString(),
      createdBy: { name: 'School Administration' }
    },
    {
      id: 'default-2',
      title: 'Class I - VI Periodic Assessment FA-II Routine',
      content: 'The 2nd Periodic FA-II assessments will commence on schedule. Please verify subject-wise dates on the Academic Calendar.',
      audience: 'ALL',
      isPinned: false,
      createdAt: new Date().toISOString(),
      createdBy: { name: 'Examination Committee' }
    },
    {
      id: 'default-3',
      title: 'School Transport & Van Routes 2026',
      content: 'Daily transportation van service is operational across Pukhao, Pangei, Sawombung, Khurai, Waiton, and adjacent localities.',
      audience: 'PARENTS',
      isPinned: false,
      createdAt: new Date().toISOString(),
      createdBy: { name: 'Logistics Desk' }
    }
  ];

  const activeNotices = liveNotices.length > 0 ? liveNotices : defaultNotices;

  // Separate pinned notice vs moving notices
  const pinnedNotice = activeNotices.find((n) => n.isPinned);
  const scrollingNotices = activeNotices.filter((n) => !n.isPinned);

  // If all are pinned, duplicate active notices so ticker still scrolls smoothly
  const streamNotices = scrollingNotices.length > 0 ? scrollingNotices : activeNotices;
  const loopedNotices = [...streamNotices, ...streamNotices, ...streamNotices, ...streamNotices];

  return (
    <>
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-sky-50 to-indigo-50/40 border-y-2 border-amber-300/80 overflow-hidden select-none relative group shadow-sm">
        
        {pinnedNotice ? (
          /* ========================================================================= */
          /* 📱 DUAL-TIER RESPONSIVE LAYOUT (Mobile: 2 Rows, Desktop: 1 Seamless Line) */
          /* ========================================================================= */
          <div className="flex flex-col md:flex-row md:items-center">
            {/* Top Row on Mobile / Left Section on Desktop: Badge + Static Pinned Notice */}
            <div className="flex items-center justify-between md:justify-start px-3 py-2 md:py-2.5 border-b md:border-b-0 md:border-r border-amber-300/90 flex-shrink-0 bg-amber-500/15 md:bg-transparent">
              {/* Left Badge */}
              <div className="flex items-center space-x-2 mr-2.5 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <div className="flex items-center space-x-1 text-xs font-black text-slate-950 font-mono tracking-wider uppercase">
                  <Bell className="h-3.5 w-3.5 text-slate-950 fill-current" />
                  <span>NOTICES:</span>
                </div>
              </div>

              {/* Static Highlighted Notice Card */}
              <div 
                onClick={() => setSelectedNotice(pinnedNotice)}
                className="flex-1 md:flex-initial flex items-center justify-between md:justify-start border-2 border-amber-400 bg-white hover:bg-amber-50/80 pl-2.5 pr-3 py-1.5 rounded-xl shadow-xs cursor-pointer space-x-2.5 animate-noticeBlink hover:scale-[1.01] transition"
                title="Click to view full circular"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase bg-amber-400 text-slate-950 shadow-2xs flex-shrink-0">
                    {pinnedNotice.audience}
                  </span>

                  <span className="font-extrabold text-xs text-slate-900 tracking-tight truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs lg:max-w-sm">
                    {pinnedNotice.title}
                  </span>
                </div>

                {/* Read Action Button */}
                <span className="inline-flex items-center space-x-1 text-[9px] font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md shadow-2xs flex-shrink-0">
                  <span>View</span>
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>

            {/* Bottom Row on Mobile / Right Section on Desktop: FULL WIDTH MOVING NOTICE TRACK */}
            <div className="flex overflow-hidden relative w-full py-1.5 md:py-2.5 pl-3">
              <div className="flex items-center space-x-6 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] cursor-pointer">
                {loopedNotices.map((notice, idx) => (
                  <div
                    key={`${notice.id}-${idx}`}
                    onClick={() => setSelectedNotice(notice)}
                    className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-800 hover:text-indigo-700 transition-all bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 px-3 py-1 rounded-xl shadow-2xs flex-shrink-0"
                  >
                    <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded uppercase bg-sky-100 text-sky-800 border border-sky-200">
                      {notice.audience}
                    </span>

                    <span className="font-bold text-slate-900 tracking-tight hover:underline">
                      {notice.title}
                    </span>

                    {notice.imageUrl && (
                      <span className="inline-flex items-center space-x-1 text-[8px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1 py-0.2 rounded">
                        <ImageIcon className="h-2 w-2" />
                        <span>CIRCULAR</span>
                      </span>
                    )}

                    <span className="text-[10px] text-indigo-600 font-mono font-bold">
                      (View)
                    </span>

                    <span className="text-amber-400 font-black ml-1">•</span>
                  </div>
                ))}
              </div>
              {/* Right edge smooth fade mask */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
            </div>
          </div>
        ) : (
          /* Single Line layout when no notice is pinned */
          <div className="flex items-center py-2.5">
            {/* Left Sticky Ticker Badge */}
            <div className="z-10 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 pl-4 sm:pl-7 pr-4 py-1.5 flex items-center space-x-2 border-r border-amber-600 flex-shrink-0 shadow-sm rounded-r-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <div className="flex items-center space-x-1.5 text-xs font-mono font-extrabold text-slate-950 tracking-wider uppercase">
                <Bell className="h-3.5 w-3.5 text-slate-950 fill-current" />
                <span className="hidden sm:inline">SCHOOL</span>
                <span>NOTICES</span>
              </div>
            </div>

            {/* Scrolling Moving Track */}
            <div className="flex overflow-hidden relative w-full pl-3">
              <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] cursor-pointer">
                {loopedNotices.map((notice, idx) => (
                  <div
                    key={`${notice.id}-${idx}`}
                    onClick={() => setSelectedNotice(notice)}
                    className="inline-flex items-center space-x-2.5 text-xs font-semibold text-slate-800 hover:text-indigo-700 transition-all bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 px-4 py-1.5 rounded-2xl shadow-2xs hover:shadow-xs flex-shrink-0"
                  >
                    <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md uppercase bg-sky-100 text-sky-800 border border-sky-200">
                      {notice.audience}
                    </span>

                    <span className="font-bold text-slate-900 tracking-tight hover:underline">
                      {notice.title}
                    </span>

                    {notice.imageUrl && (
                      <span className="inline-flex items-center space-x-1 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                        <ImageIcon className="h-2.5 w-2.5" />
                        <span>CIRCULAR</span>
                      </span>
                    )}

                    <span className="text-[10px] text-indigo-600 font-mono font-bold hover:underline flex items-center space-x-0.5">
                      <span>(View)</span>
                      <ChevronRight className="h-3 w-3 inline" />
                    </span>

                    <span className="text-amber-400 font-black">•</span>
                  </div>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
            </div>
          </div>
        )}
      </div>

      {/* Notice Detail Lightbox Modal */}
      {selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}
    </>
  );
}
