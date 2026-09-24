'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  Globe, 
  Star, 
  Utensils, 
  Flame, 
  Heart, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

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

  // Section 1: Vision & Mission (Active 0 to 0.22)
  const text1Opacity = useTransform(smoothedProgress, [0, 0.16, 0.22], [1, 1, 0]);
  const text1Y = useTransform(smoothedProgress, [0, 0.16, 0.22], [0, 0, -40]);

  // Section 2: Academic Programme & Core Subjects (Active 0.25 to 0.47)
  const text2Opacity = useTransform(smoothedProgress, [0.24, 0.30, 0.42, 0.48], [0, 1, 1, 0]);
  const text2Y = useTransform(smoothedProgress, [0.24, 0.30, 0.42, 0.48], [40, 0, 0, -40]);

  // Section 3: Co-Curricular & Manipur Heritage / Thang-Ta (Active 0.50 to 0.72)
  const text3Opacity = useTransform(smoothedProgress, [0.50, 0.56, 0.67, 0.73], [0, 1, 1, 0]);
  const text3Y = useTransform(smoothedProgress, [0.50, 0.56, 0.67, 0.73], [40, 0, 0, -40]);

  // Section 4: Fresh & Healthy Tiffin Programme (Active 0.75 to 1.0)
  const text4Opacity = useTransform(smoothedProgress, [0.75, 0.82, 0.96, 1], [0, 1, 1, 1]);
  const text4Y = useTransform(smoothedProgress, [0.75, 0.82, 0.96, 1], [40, 0, 0, 0]);

  // Graphic 1: School Crest & Values Emblem
  const emblemScale = useTransform(smoothedProgress, [0, 0.22, 0.30], [1, 0.8, 0]);
  const emblemOpacity = useTransform(smoothedProgress, [0, 0.18, 0.25], [1, 1, 0]);
  const emblemRotate = useTransform(smoothedProgress, [0, 0.25], [0, 15]);

  // Graphic 2: Interactive Open Syllabus Book (Foundational & Core Learning)
  const bookScale = useTransform(smoothedProgress, [0.22, 0.30, 0.43, 0.50], [0.5, 1, 1, 0.4]);
  const bookOpacity = useTransform(smoothedProgress, [0.22, 0.28, 0.44, 0.50], [0, 1, 1, 0]);
  const bookY = useTransform(smoothedProgress, [0.22, 0.30, 0.43, 0.50], ['100px', '0px', '0px', '-100px']);

  // Graphic 3: Culture & Athletics Showcase Card (Thang-Ta & Arts)
  const cultureScale = useTransform(smoothedProgress, [0.48, 0.55, 0.68, 0.75], [0.5, 1, 1, 0.4]);
  const cultureOpacity = useTransform(smoothedProgress, [0.48, 0.54, 0.69, 0.75], [0, 1, 1, 0]);
  const cultureY = useTransform(smoothedProgress, [0.48, 0.55, 0.68, 0.75], ['100px', '0px', '0px', '-100px']);

  // Graphic 4: Fresh & Healthy Tiffin Lunchbox Showcase Card
  const tiffinScale = useTransform(smoothedProgress, [0.72, 0.80, 0.95], [0.5, 1, 0.95]);
  const tiffinOpacity = useTransform(smoothedProgress, [0.72, 0.78], [0, 1]);
  const tiffinY = useTransform(smoothedProgress, [0.72, 0.80], ['120px', '0px']);

  // Gradient background shifts as you scroll through the 4 brochure themes
  const bgGradient = useTransform(
    smoothedProgress,
    [0, 0.33, 0.66, 1],
    [
      'linear-gradient(to bottom, #0284c7, #0369a1)', // Sky Blue (Foundation)
      'linear-gradient(to bottom, #0369a1, #1e3a8a)', // Deep Blue (Academics)
      'linear-gradient(to bottom, #1e3a8a, #065f46)', // Emerald Teal (Thang-Ta & Athletics)
      'linear-gradient(to bottom, #065f46, #0f172a)'  // Rich Forest to Dark Slate (Tiffin & Wellness)
    ]
  );

  return (
    <div ref={containerRef} className="h-[400vh] relative z-20 overflow-visible select-none">
      {/* Sticky viewport container (pins on screen during scroll progress) */}
      <motion.div
        style={{ background: bgGradient }}
        className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden transition-all duration-300"
      >
        {/* Subtle geometric dot matrix in background */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] bg-[size:24px_24px]" />

        {/* Content Container split into Text panel & Visual panel */}
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col justify-center lg:grid lg:grid-cols-2 px-5 sm:px-12 items-center relative gap-4 lg:gap-0">
          
          {/* LEFT SIDE: Storytelling Text Layers */}
          <div className="relative h-[210px] sm:h-[240px] lg:h-[320px] w-full flex items-center">
            
            {/* Beat 1: Vision & Mission */}
            <motion.div
              style={{ opacity: text1Opacity, y: text1Y }}
              className="absolute left-0 right-0 space-y-3 sm:space-y-4 text-left text-white"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-amber-300 text-xs font-mono font-extrabold uppercase tracking-widest flex items-center space-x-1.5 bg-amber-400/20 border border-amber-300/40 px-3.5 py-1 rounded-full w-fit">
                  <Globe className="h-4 w-4 animate-spin-slow text-amber-300" />
                  <span>ꯂꯤꯇꯜ ꯍꯥꯎꯁ ꯁ꯭ꯀꯨꯜ</span>
                </span>
                <span className="text-sky-200 text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full">
                  Waiton Lamkhai, Pangei
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Built on a Foundation<br />
                of Character & Wisdom.
              </h2>
              
              <p className="text-sky-100 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed font-normal">
                At The Little House School, education is not merely about academic achievement. It is about developing confident, responsible, creative, and compassionate individuals prepared to face the future with knowledge, discipline, and courage.
              </p>
            </motion.div>

            {/* Beat 2: Foundational & Core Academic Curriculum */}
            <motion.div
              style={{ opacity: text2Opacity, y: text2Y }}
              className="absolute left-0 right-0 space-y-3 sm:space-y-4 text-left text-white"
            >
              <span className="text-amber-300 text-xs font-mono font-extrabold uppercase tracking-widest flex items-center space-x-1.5 bg-amber-400/20 border border-amber-300/40 px-3.5 py-1 rounded-full w-fit">
                <BookOpen className="h-4 w-4 text-amber-300" />
                <span>Academic Programme</span>
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Phonics, Numeracy,<br />
                Manipuri & Core STEM.
              </h2>

              <p className="text-sky-100 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed font-normal">
                Structured early foundational skills in Phonics, Vocabulary, and Conversation combined with rigorous core learning in Mathematics, Environmental Studies, English Grammar, and traditional Manipuri language literacy.
              </p>
            </motion.div>

            {/* Beat 3: Co-Curricular & Manipur Cultural Heritage */}
            <motion.div
              style={{ opacity: text3Opacity, y: text3Y }}
              className="absolute left-0 right-0 space-y-3 sm:space-y-4 text-left text-white"
            >
              <span className="text-emerald-300 text-xs font-mono font-extrabold uppercase tracking-widest flex items-center space-x-1.5 bg-emerald-400/20 border border-emerald-300/40 px-3.5 py-1 rounded-full w-fit">
                <Flame className="h-4 w-4 text-emerald-300" />
                <span>Indigenous Heritage & Arts</span>
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Thang-Ta, Yoga,<br />
                Sports & Creative Arts.
              </h2>

              <p className="text-emerald-100 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed font-normal">
                Nurturing the whole child through indigenous Manipuri martial arts (Thang-Ta), Yoga for mental poise, athletics, Music & Dance, and experiential Waste-to-Wealth eco-projects.
              </p>
            </motion.div>

            {/* Beat 4: Fresh & Healthy Tiffin Programme */}
            <motion.div
              style={{ opacity: text4Opacity, y: text4Y }}
              className="absolute left-0 right-0 space-y-3 sm:space-y-4 text-left text-white"
            >
              <span className="text-amber-300 text-xs font-mono font-extrabold uppercase tracking-widest flex items-center space-x-1.5 bg-amber-400/20 border border-amber-300/40 px-3.5 py-1 rounded-full w-fit">
                <Utensils className="h-4 w-4 text-amber-300" />
                <span>Healthy Food • Happy Children</span>
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Fresh & Healthy<br />
                Daily Tiffin Programme.
              </h2>

              <p className="text-emerald-100 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed font-normal">
                Freshly cooked, hygienically prepared nutritious meals every day with a rotating menu. A common campus menu promotes equality, sharing, and healthy eating while completely eliminating tiffin envy.
              </p>
            </motion.div>

          </div>

          {/* RIGHT SIDE: Dynamic 2D/3D Graphic Canvas */}
          <div className="relative w-full h-[270px] sm:h-[350px] lg:h-[500px] flex items-center justify-center scale-[0.84] sm:scale-95 lg:scale-100 origin-center">
            
            {/* Object 1: LITTLE HOUSE School Crest Orb */}
            <motion.div
              style={{
                scale: emblemScale,
                rotate: emblemRotate,
                opacity: emblemOpacity,
              }}
              className="absolute w-72 sm:w-80 bg-white/10 backdrop-blur-md rounded-[36px] p-6 sm:p-8 shadow-2xl border-2 border-white/20 text-center space-y-4 z-30"
            >
              <div className="w-24 h-24 mx-auto rounded-3xl bg-white p-3 shadow-lg flex items-center justify-center">
                {/* School Crest Logo */}
                <img 
                  src="/school-logo.png" 
                  alt="Little House School Crest" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest block">
                  FOUNDED IN IMPHAL EAST
                </span>
                <h3 className="text-xl font-black text-white mt-1">THE LITTLE HOUSE SCHOOL</h3>
                <p className="text-xs text-sky-200 mt-1">Waiton Lamkhai, Pangei (795114)</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[10px] font-bold text-amber-200 uppercase">
                <div className="bg-white/10 py-1.5 rounded-lg">Knowledge</div>
                <div className="bg-white/10 py-1.5 rounded-lg">Discipline</div>
                <div className="bg-white/10 py-1.5 rounded-lg">Courage</div>
              </div>
            </motion.div>

            {/* Object 2: Interactive Open Syllabus Book Graphic */}
            <motion.div
              style={{
                scale: bookScale,
                opacity: bookOpacity,
                y: bookY,
              }}
              className="absolute w-80 sm:w-96 bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-sky-100 z-20 text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-700 uppercase tracking-wider block">CURRICULUM SYLLABUS</span>
                  <h4 className="text-base font-black text-slate-900">Foundational & Core</h4>
                </div>
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold bg-sky-50 text-sky-900 p-2 rounded-xl">
                  <span>Phonics & Early Reading</span>
                  <span className="text-[10px] bg-sky-200 px-2 py-0.5 rounded">Core</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold bg-amber-50 text-amber-900 p-2 rounded-xl">
                  <span>Mathematics & Numeracy</span>
                  <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded">STEM</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold bg-emerald-50 text-emerald-900 p-2 rounded-xl">
                  <span>Manipuri Language (ꯂꯤꯇꯜ)</span>
                  <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded">Native</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold bg-purple-50 text-purple-900 p-2 rounded-xl">
                  <span>Environmental Studies (EVS)</span>
                  <span className="text-[10px] bg-purple-200 px-2 py-0.5 rounded">Science</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-1.5 text-[9px] font-bold text-slate-600">
                <span className="bg-slate-100 px-2 py-1 rounded-md">Hindi</span>
                <span className="bg-slate-100 px-2 py-1 rounded-md">English Grammar</span>
                <span className="bg-slate-100 px-2 py-1 rounded-md">General Knowledge</span>
              </div>
            </motion.div>

            {/* Object 3: Indigenous Thang-Ta, Sports & Arts Card */}
            <motion.div
              style={{
                scale: cultureScale,
                opacity: cultureOpacity,
                y: cultureY,
              }}
              className="absolute w-80 sm:w-96 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-emerald-500/30 z-20 text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">CO-CURRICULAR LIFE</span>
                  <h4 className="text-base font-black text-white">Culture, Sports & Arts</h4>
                </div>
                <Flame className="h-5 w-5 text-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-emerald-950/60 border border-emerald-500/30 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">INDIGENOUS</span>
                  <div className="text-xs font-black text-white">Thang-Ta Martial Art</div>
                  <div className="text-[10px] text-slate-400">Courage & Discipline</div>
                </div>

                <div className="bg-sky-950/60 border border-sky-500/30 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-sky-400 font-bold uppercase">WELLNESS</span>
                  <div className="text-xs font-black text-white">Yoga & Posture</div>
                  <div className="text-[10px] text-slate-400">Mindfulness</div>
                </div>

                <div className="bg-purple-950/60 border border-purple-500/30 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-purple-400 font-bold uppercase">CREATIVE</span>
                  <div className="text-xs font-black text-white">Waste-to-Wealth</div>
                  <div className="text-[10px] text-slate-400">Eco Projects & Craft</div>
                </div>

                <div className="bg-amber-950/60 border border-amber-500/30 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase">EXPRESSION</span>
                  <div className="text-xs font-black text-white">Music & Dance</div>
                  <div className="text-[10px] text-slate-400">Rhythm & Stage Confidence</div>
                </div>
              </div>

              <div className="pt-1 text-[10px] text-emerald-300 font-mono flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Scheduled periods in weekly school timetable</span>
              </div>
            </motion.div>

            {/* Object 4: Fresh & Healthy Tiffin Lunchbox Card */}
            <motion.div
              style={{
                scale: tiffinScale,
                opacity: tiffinOpacity,
                y: tiffinY,
              }}
              className="absolute w-80 sm:w-96 bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-emerald-400/40 z-20 text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-emerald-100">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">TIFFIN PROGRAMME</span>
                  <h4 className="text-base font-black text-slate-900">Campus Cooked Daily</h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Utensils className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center space-x-3 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">Nutritious Rotating Daily Menu</span>
                </div>
                <div className="flex items-center space-x-3 bg-teal-50 p-2.5 rounded-2xl border border-teal-100">
                  <div className="w-2 h-2 rounded-full bg-teal-600" />
                  <span className="text-xs font-bold text-teal-950">100% Hygienically Prepared on Campus</span>
                </div>
                <div className="flex items-center space-x-3 bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
                  <div className="w-2 h-2 rounded-full bg-amber-600" />
                  <span className="text-xs font-bold text-amber-950">Promotes Equality & Sharing</span>
                </div>
                <div className="flex items-center space-x-3 bg-purple-50 p-2.5 rounded-2xl border border-purple-100">
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                  <span className="text-xs font-bold text-purple-950">Zero Tiffin Envy • No Outside Food</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] font-extrabold text-emerald-800 text-center">
                Healthy Food • Happy Children • Brighter Future
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
