'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { School, BookOpen, Award, ShieldCheck, Globe, Star } from 'lucide-react';

export default function ScrollStorytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smoothed spring physics optimized for 60 FPS GPU rendering
  const smoothedProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.1,
    restDelta: 0.001
  });

  // Section 1: Introduction Title animations (Fully fades out by 0.28)
  const text1Opacity = useTransform(smoothedProgress, [0, 0.2, 0.28], [1, 1, 0]);
  const text1Y = useTransform(smoothedProgress, [0, 0.2, 0.28], [0, 0, -40]);

  // Section 2: Assembly Step animations (Starts at 0.34, fully gone by 0.66)
  const text2Opacity = useTransform(smoothedProgress, [0.34, 0.42, 0.58, 0.66], [0, 1, 1, 0]);
  const text2Y = useTransform(smoothedProgress, [0.34, 0.42, 0.58, 0.66], [40, 0, 0, -40]);

  // Section 3: Final Launch details (Starts at 0.72, well after Section 2 fades out)
  const text3Opacity = useTransform(smoothedProgress, [0.72, 0.8, 0.95, 1], [0, 1, 1, 0]);
  const text3Y = useTransform(smoothedProgress, [0.72, 0.8, 0.95, 1], [40, 0, 0, 0]);

  // Graphic 1: School Emblem (Castle / Shield logo)
  const emblemScale = useTransform(smoothedProgress, [0, 0.35, 0.6, 1], [1, 0.45, 0.4, 0]);
  const emblemRotate = useTransform(smoothedProgress, [0, 0.35], [0, 360]);
  const emblemX = useTransform(smoothedProgress, [0, 0.35], ['0px', '-180px']);
  const emblemY = useTransform(smoothedProgress, [0, 0.35], ['0px', '-180px']);
  const emblemOpacity = useTransform(smoothedProgress, [0, 0.75, 0.85], [1, 1, 0]);

  // Graphic 2: Interactive Open Book (Academics)
  const bookScale = useTransform(smoothedProgress, [0.2, 0.4, 0.6, 0.8], [0.4, 1, 1, 0.4]);
  const bookOpacity = useTransform(smoothedProgress, [0.2, 0.3, 0.65, 0.75], [0, 1, 1, 0]);
  const bookY = useTransform(smoothedProgress, [0.2, 0.4, 0.6, 0.8], ['120px', '0px', '0px', '-120px']);
  const bookRotate = useTransform(smoothedProgress, [0.2, 0.4], [-15, 0]);

  // Graphic 3: Student Portal Laptop Frame
  const laptopScale = useTransform(smoothedProgress, [0.55, 0.75, 0.95], [0.5, 1, 0.95]);
  const laptopOpacity = useTransform(smoothedProgress, [0.55, 0.68], [0, 1]);
  const laptopY = useTransform(smoothedProgress, [0.55, 0.75], ['200px', '0px']);
  const laptopRotate = useTransform(smoothedProgress, [0.55, 0.75], [12, 0]);

  // Gradient background shifts as you scroll
  // Gradient background shifts as you scroll (Sky Blue -> Royal Blue -> Deep Navy)
  const bgGradient = useTransform(
    smoothedProgress,
    [0, 0.5, 1],
    [
      'linear-gradient(to bottom, #0284c7, #0369a1)', // Vibrant Sky Blue
      'linear-gradient(to bottom, #0369a1, #1e3a8a)', // Royal Blue
      'linear-gradient(to bottom, #1e3a8a, #0f172a)'  // Deep Navy
    ]
  );

  return (
    <div ref={containerRef} className="h-[300vh] relative z-20 overflow-visible select-none">
      {/* Sticky viewport container (pins on screen during scroll progress) */}
      <motion.div
        style={{ background: bgGradient }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden transition-all duration-300"
      >
        {/* Subtle geometric dot matrix in background */}
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] bg-[size:24px_24px]" />

        {/* Content Container split into Text panel & Visual panel */}
        <div className="max-w-7xl mx-auto w-full h-full grid grid-cols-1 lg:grid-cols-2 px-6 sm:px-12 items-center relative">
          
          {/* LEFT SIDE: Storytelling Text Layers */}
          <div className="relative h-[250px] w-full flex items-center">
            
            {/* Caption 1: Welcome / Foundation */}
            <motion.div
              style={{ opacity: text1Opacity, y: text1Y }}
              className="absolute left-0 right-0 space-y-4 text-left text-white"
            >
              <span className="text-amber-300 text-xs font-mono font-extrabold uppercase tracking-widest flex items-center space-x-1.5 bg-amber-400/20 border border-amber-300/40 px-3 py-1 rounded-full w-fit">
                <Globe className="h-4 w-4 animate-spin-slow text-amber-300" />
                <span>Legacy of Learning</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Built on a Foundation<br />
                of Character & Wisdom.
              </h2>
              <p className="text-sky-100 text-sm sm:text-base max-w-md leading-relaxed">
                For over 40 years, LITTLE HOUSE has cultivated a curriculum centered around personal integrity, academic curiosity, and community leadership.
              </p>
            </motion.div>

            {/* Caption 2: Rigorous STEM & Arts */}
            <motion.div
              style={{ opacity: text2Opacity, y: text2Y }}
              className="absolute left-0 right-0 space-y-4 text-left text-white"
            >
              <span className="text-amber-300 text-xs font-mono font-extrabold uppercase tracking-widest flex items-center space-x-1.5 bg-amber-400/20 border border-amber-300/40 px-3 py-1 rounded-full w-fit">
                <BookOpen className="h-4 w-4 text-amber-300" />
                <span>Next-Gen STEM & Arts</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Modern Classrooms,<br />
                Infinite Opportunities.
              </h2>
              <p className="text-sky-100 text-sm sm:text-base max-w-md leading-relaxed">
                From high-tech robotic laboratories to award-winning debate stages and visual art programs, students learn by doing.
              </p>
            </motion.div>

            {/* Caption 3: Portal Launch / Digital Campus */}
            <motion.div
              style={{ opacity: text3Opacity, y: text3Y }}
              className="absolute left-0 right-0 space-y-4 text-left text-white"
            >
              <span className="text-amber-300 text-xs font-mono font-extrabold uppercase tracking-widest flex items-center space-x-1.5 bg-amber-400/20 border border-amber-300/40 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                <span>Smart School Management</span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Seamless Digital<br />
                School Ecosystem.
              </h2>
              <p className="text-sky-100 text-sm sm:text-base max-w-md leading-relaxed">
                Experience real-time direct messaging, attendance SMS triggers, online rupee checkouts, and calendar integrations inside the student portal.
              </p>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Dynamic 2D/3D Graphic Canvas */}
          <div className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center">
            
            {/* Object 1: LITTLE HOUSE Castle Shield Emblem */}
            <motion.div
              style={{
                scale: emblemScale,
                rotate: emblemRotate,
                x: emblemX,
                y: emblemY,
                opacity: emblemOpacity,
              }}
              className="absolute w-64 h-64 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white border-opacity-10 z-30"
            >
              <School className="h-28 w-28 text-white drop-shadow-lg" />
            </motion.div>

            {/* Object 2: Open Book Vector Graphic */}
            <motion.div
              style={{
                scale: bookScale,
                opacity: bookOpacity,
                y: bookY,
                rotate: bookRotate,
              }}
              className="absolute w-80 bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 z-20 text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">LITTLE HOUSE Syllabus</span>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-indigo-50 rounded-md w-3/4" />
                <div className="h-3 bg-gray-100 rounded-md w-full" />
                <div className="h-3 bg-gray-100 rounded-md w-5/6" />
                <div className="h-3 bg-gray-100 rounded-md w-2/3" />
              </div>
              <div className="pt-2 flex space-x-2">
                <span className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded font-bold uppercase">STEM</span>
                <span className="bg-purple-50 text-purple-700 text-[9px] px-2 py-0.5 rounded font-bold uppercase">Liberal Arts</span>
              </div>
            </motion.div>

            {/* Object 3: Live Student Portal Laptop Mockup Frame */}
            <motion.div
              style={{
                scale: laptopScale,
                opacity: laptopOpacity,
                y: laptopY,
                rotate: laptopRotate,
              }}
              className="absolute w-[440px] bg-slate-800 rounded-2xl p-3 shadow-2xl border-4 border-slate-700 z-10 flex flex-col"
            >
              {/* Laptop Screen Area */}
              <div className="bg-slate-900 rounded-lg w-full h-[220px] overflow-hidden p-3 space-y-3 relative text-left">
                {/* Simulated Portal Navbar */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[8px] text-gray-500 font-mono">portal.littlehouse.edu/dashboard</span>
                </div>

                {/* Simulated Portal Content */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 bg-slate-800 rounded-lg p-2.5 space-y-1.5">
                    <span className="block text-[8px] text-indigo-300 font-bold uppercase tracking-wider">Student Dashboard</span>
                    <div className="h-3 bg-slate-700 rounded w-1/2" />
                    <div className="h-2 bg-slate-700 rounded w-full" />
                    <div className="h-2 bg-slate-700 rounded w-5/6" />
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2 flex flex-col justify-between items-center">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-[12px] font-bold text-white">Grade A</span>
                    <span className="text-[7px] text-gray-400">Class Average</span>
                  </div>
                </div>

                {/* Chat bubble overlay */}
                <div className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-lg px-2 py-1 text-[8px] shadow flex items-center space-x-1.5 border border-blue-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                  <span>Teacher: Hello Ranjana!</span>
                </div>
              </div>

              {/* Laptop Keyboard Lip reflection */}
              <div className="h-1 bg-slate-600 rounded-b w-full mt-2" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
