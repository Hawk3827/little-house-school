import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { BookOpen, Award, Users, ArrowRight, Calendar, User, Sparkles, GraduationCap, ShieldCheck, Heart } from 'lucide-react';
import { AnimatedSection, AnimatedGrid, AnimatedGridItem, HoverCard } from '@/components/AnimatedSection';
import ScrollStorytelling from '@/components/ScrollStorytelling';
import LiveNoticeTicker from '@/components/LiveNoticeTicker';

import { NoticeData } from '@/components/NoticeDetailModal';

export const revalidate = 0; // Disable caching for demo dynamic updates

export default async function HomePage() {
  let announcements: any[] = [];
  let tickerNotices: (NoticeData & { isPinned?: boolean })[] = [];

  try {
    const rawAnnouncements = await prisma.announcement.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 15,
      include: {
        createdBy: {
          select: { name: true },
        },
      },
    });

    announcements = rawAnnouncements.filter(a => a.audience === 'ALL').slice(0, 3);
    tickerNotices = rawAnnouncements.filter(a => a.isTicker !== false).map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      audience: a.audience,
      imageUrl: a.imageUrl,
      isPinned: a.isPinned,
      createdAt: a.createdAt.toISOString(),
      createdBy: {
        name: a.createdBy?.name || 'Administration Office'
      }
    }));
  } catch (error) {
    console.error('Failed to load seeded announcements:', error);
    announcements = [
      {
        id: '1',
        title: 'Welcome to the New Academic Year 2026-2027!',
        content: 'We are thrilled to welcome all new and returning students back to school. Let\'s make this year productive, engaging, and inspiring.',
        createdAt: new Date(),
        createdBy: { name: 'Principal Arthur Vance' },
      },
    ];
  }

  return (
    <div className="space-y-24 sm:space-y-32 pb-32 bg-slate-50 text-slate-900 select-none">
      {/* 🌟 Clear Hero Section with Bottom Notice Marquee (Both fully visible in initial screen before scroll) */}
      <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden border-b border-sky-200/80 bg-sky-50/30">
        {/* Crystal-Clear School Campus & Castle Banner in Background (LCP Optimized) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <picture>
            <source srcSet="/hero-bg.webp" type="image/webp" />
            <img
              src="/hero-bg.jpg"
              alt="Little House School Campus Illustration"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center opacity-85 sm:opacity-90 filter brightness-100 contrast-105"
            />
          </picture>
          {/* Subtle soft gradient overlay to maintain perfect text contrast while keeping illustration vivid */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent sm:from-white/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/30" />
        </div>

        {/* Hero Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 my-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
          {/* Main Hero Typography Card */}
          <AnimatedSection type="slide-in-left" className="space-y-5 text-left lg:col-span-7 bg-white/80 backdrop-blur-md p-6 sm:p-10 rounded-[36px] border border-white/80 shadow-lg">
            {/* Sunny Yellow Admissions Open Badge (High Contrast Accessible Colors) */}
            <div className="inline-flex items-center space-x-2.5 bg-amber-400 text-slate-950 border border-amber-500/50 font-black rounded-full px-4 py-1.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="text-[11px] font-mono tracking-wider uppercase font-black">
                CAMPUS ADMISSION OPEN 2026–2027
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] uppercase">
              SHAPING MINDS.<br />
              <span className="text-sky-700">INSPIRING</span><br />
              CHARACTER.
            </h1>

            <p className="text-sm sm:text-base text-slate-800 max-w-xl font-medium leading-relaxed">
              At <strong className="text-slate-950 font-black">LITTLE HOUSE</strong>, we provide a nurturing, joyful academic ecosystem designed to cultivate tomorrow&apos;s innovators, leaders, and thinkers in Manipur.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                href="/admission"
                className="bg-sky-700 hover:bg-sky-800 text-white text-xs font-black px-7 py-3.5 rounded-full transition shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>ONLINE ADMISSION & ENROLLMENT</span>
              </Link>
              <Link
                href="/about"
                className="bg-white text-slate-900 border-2 border-slate-300 hover:border-sky-400 text-xs font-black px-7 py-3.5 rounded-full hover:bg-sky-50 transition shadow-sm"
              >
                DISCOVER OUR LEGACY
              </Link>
            </div>
          </AnimatedSection>

          {/* Stats Box Bento Panels in Crisp High-Contrast White (Semantic divs for numeric data) */}
          <AnimatedGrid className="grid grid-cols-2 gap-3.5 lg:col-span-5 text-left">
            <AnimatedGridItem>
              <HoverCard className="bg-white/95 backdrop-blur-md p-6 rounded-[24px] border border-sky-200 shadow-md hover:shadow-lg hover:border-sky-400 h-full flex flex-col justify-between transition-all">
                <div className="p-2.5 bg-sky-100 text-sky-800 rounded-xl w-fit mb-3">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">25+</div>
                  <p className="text-[10px] font-mono tracking-wider font-extrabold text-sky-900 uppercase mt-0.5">Subjects & Electives</p>
                </div>
              </HoverCard>
            </AnimatedGridItem>

            <AnimatedGridItem>
              <HoverCard className="bg-white/95 backdrop-blur-md p-6 rounded-[24px] border border-sky-200 shadow-md hover:shadow-lg hover:border-sky-400 h-full flex flex-col justify-between transition-all">
                <div className="p-2.5 bg-amber-100 text-amber-900 rounded-xl w-fit mb-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">1:12</div>
                  <p className="text-[10px] font-mono tracking-wider font-extrabold text-amber-950 uppercase mt-0.5">Student Teacher Ratio</p>
                </div>
              </HoverCard>
            </AnimatedGridItem>

            <AnimatedGridItem>
              <HoverCard className="bg-white/95 backdrop-blur-md p-6 rounded-[24px] border border-sky-200 shadow-md hover:shadow-lg hover:border-sky-400 h-full flex flex-col justify-between transition-all">
                <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl w-fit mb-3">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">98%</div>
                  <p className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-950 uppercase mt-0.5">Academic Success</p>
                </div>
              </HoverCard>
            </AnimatedGridItem>

            <AnimatedGridItem>
              <HoverCard className="bg-white/95 backdrop-blur-md p-6 rounded-[24px] border border-sky-200 shadow-md hover:shadow-lg hover:border-sky-400 h-full flex flex-col justify-between transition-all">
                <div className="p-2.5 bg-purple-100 text-purple-900 rounded-xl w-fit mb-3">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">15+</div>
                  <p className="text-[10px] font-mono tracking-wider font-extrabold text-purple-950 uppercase mt-0.5">Clubs & Sports</p>
                </div>
              </HoverCard>
            </AnimatedGridItem>
          </AnimatedGrid>
        </div>

        {/* 📢 Interactive Live Moving Notice Ticker Banner (Pinned at bottom of initial Hero screen, visible before scrolling) */}
        <div className="relative z-20 w-full shadow-md">
          <LiveNoticeTicker notices={tickerNotices} />
        </div>
      </section>

      {/* 🎬 Interactive Bento Scrolling Storytelling Deck */}
      <div className="!mt-0">
        <ScrollStorytelling />
      </div>

      {/* 🎓 Head Principal Welcome Message */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10">
        <AnimatedSection type="fade-in-up" className="bg-white rounded-[36px] border border-sky-100 shadow-lg p-8 md:p-14 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-4 flex flex-col items-center text-center">
            <div className="w-40 h-40 bg-gradient-to-br from-sky-100 to-sky-200 rounded-[28px] flex items-center justify-center text-sky-800 font-extrabold text-2xl border-2 border-sky-300 overflow-hidden relative shadow-md">
              <User className="h-20 w-20 text-sky-800" />
            </div>
            <div className="font-extrabold text-slate-900 text-lg mt-4 uppercase tracking-tight">Arthur Vance</div>
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-sky-900 bg-sky-100 px-3 py-1 rounded-full border border-sky-300 uppercase mt-1">HEAD PRINCIPAL</span>
          </div>
          <div className="md:col-span-8 space-y-5 text-left">
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-sky-900 uppercase bg-sky-100 px-2.5 py-0.5 rounded-md border border-sky-200">
              LEADERSHIP STATEMENT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Welcome to LITTLE HOUSE</h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
              &quot;Welcome to our school community! At LITTLE HOUSE, we believe that education is more than just textbooks and exams—it is about cultivating character, nurturing talent, and encouraging students to become kind, confident, and active contributors to society.&quot;
            </p>
            <p className="text-slate-700 leading-relaxed text-sm font-normal">
              Our dedicated teachers work passionately to provide an uplifting, safe, and engaging environment. We warmly invite you to explore our campus programs, student achievements, and admissions.
            </p>
          </div>
        </AnimatedSection>
      </section>

      {/* 🏛️ Core Pillars of Education */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
        <AnimatedSection type="fade-in" className="text-left max-w-3xl space-y-3">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-sky-900 uppercase bg-sky-100 px-2.5 py-0.5 rounded-md border border-sky-200">
            OUR CORE PILLARS
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            WHY LITTLE HOUSE.
          </h2>
          <p className="text-base text-slate-700 font-normal max-w-xl">
            We provide a balanced education that supports the intellectual, physical, and personal growth of each child.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatedSection type="fade-in-up" className="h-full">
            <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-sky-100 hover:border-sky-300 hover:shadow-lg transition-all shadow-sm space-y-6 text-left h-full flex flex-col justify-between">
              <div className="w-14 h-14 bg-sky-100 border border-sky-200 rounded-2xl flex items-center justify-center text-sky-800">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Rigorous Academics</h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  Our curriculum is structured to challenge students and prepare them for higher education and future careers with confidence.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection type="fade-in-up" className="h-full">
            <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all shadow-sm space-y-6 text-left h-full flex flex-col justify-between">
              <div className="w-14 h-14 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-800">
                <Award className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Extracurricular Excellence</h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  From athletics and sports to cultural exhibitions, debate clubs, and visual arts, students pursue their true passions.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection type="fade-in-up" className="h-full">
            <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all shadow-sm space-y-6 text-left h-full flex flex-col justify-between">
              <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center text-emerald-800">
                <Users className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Supportive Community</h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  We foster a warm family culture built on mutual respect, student empathy, and close collaboration with parents.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 📰 Announcements & News Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
        <AnimatedSection type="fade-in-up" className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-sky-100 pb-6">
          <div className="text-left space-y-2">
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-sky-900 uppercase bg-sky-100 px-2.5 py-0.5 rounded-md border border-sky-200">
              CAMPUS COMMUNICATIONS
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              NEWS & NOTICES.
            </h2>
          </div>
          <Link href="/admission" className="flex items-center text-xs font-mono font-extrabold tracking-wider text-sky-800 hover:text-sky-900 uppercase transition space-x-1">
            <span>EXPLORE ADMISSIONS</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </AnimatedSection>

        <AnimatedGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {announcements.map((announcement) => (
            <AnimatedGridItem key={announcement.id}>
              <HoverCard className="bg-white rounded-[32px] border border-sky-100 hover:border-sky-300 transition-all shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between p-8 h-full text-left">
                <div className="space-y-4">
                  <div className="flex items-center text-[10px] font-mono font-bold text-slate-600 space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-sky-700" />
                    <span>{new Date(announcement.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }).toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight line-clamp-1">{announcement.title}</h3>
                  <p className="text-slate-700 text-xs sm:text-sm line-clamp-4 leading-relaxed font-normal">{announcement.content}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] font-mono font-bold text-slate-600">
                  <span>BY: {announcement.createdBy?.name?.toUpperCase() || 'ADMINISTRATOR'}</span>
                  <span className="text-sky-900 bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold">PUBLIC</span>
                </div>
              </HoverCard>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      </section>
    </div>
  );
}
