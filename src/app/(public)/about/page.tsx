'use client';

import React from 'react';
import { Target, Eye } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 space-y-24 sm:space-y-32 relative bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* 🌟 Header Title Banner */}
      <AnimatedSection type="fade-in" className="text-left max-w-4xl space-y-4">
        <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
          OUR INSTITUTION & ACADEMICS
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
          LEGACY & MISSION.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mt-2 font-normal">
          Discover the heritage, pedagogical leadership, and comprehensive curriculum steering LITTLE HOUSE toward educational excellence in Manipur.
        </p>
      </AnimatedSection>

      {/* 🏛️ History and Vision Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 items-center">
        <AnimatedSection type="slide-in-left" className="space-y-6 md:col-span-7 text-left">
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full uppercase">
            A FAMILY OF LEARNING
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Our Rich Legacy</h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
            LITTLE HOUSE was established with a clear vision: to make foundational learning joyous, empowering, and culturally grounded. Over the decades, our campus at Waiton Lamkhai has grown into a beacon of early childhood and primary education.
          </p>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
            We balance academic rigor with character building, ensuring our students cultivate empathy, intellectual curiosity, and self-confidence at every stage of their educational journey.
          </p>
        </AnimatedSection>
        
        <AnimatedSection type="slide-in-right" className="bg-white text-slate-900 p-8 sm:p-10 rounded-[32px] shadow-md space-y-8 md:col-span-5 border border-sky-100 relative overflow-hidden">
          <div className="flex items-start space-x-5 relative z-10 text-left">
            <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 text-sky-600">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Our Mission</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-normal">
                To nurture students to their highest potential by providing holistic, child-friendly learning environments that foster wisdom and moral integrity.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-5 relative z-10 text-left pt-6 border-t border-slate-100">
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-600">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Our Vision</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-normal">
                To be a pioneering school where every child is celebrated, nurtured, and prepared to thrive in a rapidly advancing modern world.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* 📚 Our Curriculum Philosophy */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
        <AnimatedSection type="slide-in-left" className="space-y-5 lg:col-span-5 text-left">
          <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
            OUR PHILOSOPHY
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
            PLAY & DISCOVERY IN LEARNING.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal mt-4">
            At LITTLE HOUSE, learning is joyful and stimulating. We employ child-centered Montessori activities that spark curiosity, motor dexterity, and active exploration.
          </p>
        </AnimatedSection>
        
        <AnimatedSection type="slide-in-right" className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[32px] border border-sky-100 shadow-md space-y-6 text-left">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            It is through experiential play that young children discover the world around them. Through music, art, collaborative games, numbers, and language, they build foundational social and cognitive agility.
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal">
            Rather than enforcing rigid stress, we customize teaching to each child&apos;s developmental pace so they grow self-assured, joyful, and eager to achieve their fullest capabilities.
          </p>
          <div className="pt-4 border-t border-slate-100 text-xs font-mono font-extrabold text-sky-700 tracking-wider">
            &quot;TRUE EDUCATION PROMOTES PEACE, SECURITY & HAPPINESS.&quot;
          </div>
        </AnimatedSection>
      </section>

      {/* 🎓 Curriculum Programs Bento Grid */}
      <section className="space-y-12">
        <AnimatedSection type="fade-in" className="text-left space-y-3">
          <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
            ACADEMIC PATHWAY
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">CURRICULUM PROGRAMS.</h2>
          <p className="text-base text-slate-600 max-w-xl font-normal">Explore our age-appropriate programs designed with Montessori methodologies and joyful experiential activities.</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Play Group */}
          <AnimatedSection type="fade-in-up" className="h-full">
            <div className="bg-white p-8 rounded-[32px] border border-sky-100 hover:border-sky-300 hover:shadow-lg transition-all shadow-sm text-left flex flex-col justify-between h-full space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase">PLAY GROUP</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">AGE: 2 & ABOVE</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 pt-3">First Step in Preschool</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal mt-2">
                  Focused on exploring and learning through the playway method: &quot;Play is work to the child.&quot; Emphasis is placed on initial motor skills, sensory discovery, and emotional expression.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                <span className="bg-sky-50 border border-sky-200 text-sky-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">PLAYWAY METHOD</span>
                <span className="bg-sky-50 border border-sky-200 text-sky-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">SENSORY DEVELOPMENT</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Nursery */}
          <AnimatedSection type="fade-in-up" className="h-full">
            <div className="bg-white p-8 rounded-[32px] border border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all shadow-sm text-left flex flex-col justify-between h-full space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase">NURSERY</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">AGE: 3 & ABOVE</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 pt-3">Transition to Formal School</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal mt-2">
                  A smooth transition program utilizing Montessori equipment. Designed to improve conceptual clarity, practical life skills, phonics, and early number coordination.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">MONTESSORI TOOLS</span>
                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">CONCEPTUAL PHONICS</span>
              </div>
            </div>
          </AnimatedSection>

          {/* LKG */}
          <AnimatedSection type="fade-in-up" className="h-full">
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all shadow-sm text-left flex flex-col justify-between h-full space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase">LKG</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">AGE: 4 & ABOVE</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 pt-3">Early Reading & Science</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal mt-2">
                  Prepares students for structured reading, writing, and arithmetic. Focuses on sight words, numerical values, general knowledge, storytelling, and beginner science experiments.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">SIGHT READING</span>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">EARLY SCIENCE</span>
              </div>
            </div>
          </AnimatedSection>

          {/* UKG */}
          <AnimatedSection type="fade-in-up" className="h-full">
            <div className="bg-white p-8 rounded-[32px] border border-sky-100 hover:border-sky-300 hover:shadow-lg transition-all shadow-sm text-left flex flex-col justify-between h-full space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase">UKG</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">AGE: 5 & ABOVE</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 pt-3">Formal Prep & Meetei Mayek</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal mt-2">
                  Complete preparation for primary formal education. The curriculum includes English, Math, EVS (Environmental Science), General Knowledge, Hindi, and regional Meetei Mayek.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                <span className="bg-sky-50 border border-sky-200 text-sky-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">MEETEI MAYEK</span>
                <span className="bg-sky-50 border border-sky-200 text-sky-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md">EVS FOUNDATIONS</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
