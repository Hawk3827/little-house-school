'use client';

import React from 'react';
import { 
  Users, 
  Sparkles, 
  Check, 
  HeartHandshake, 
  ShieldCheck, 
  Clock, 
  GraduationCap, 
  Compass, 
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export default function ApproachAndPartnershipSection() {
  const approachPoints = [
    'Learn at their own pace',
    'Explore their unique interests',
    'Ask questions with curiosity',
    'Express themselves openly',
    'Make lifelong friends',
    'Develop deep self-confidence',
    'Discover their innate talents',
    'Learn from hands-on experiences',
  ];

  const parentPartnershipPoints = [
    { title: 'Regular Attendance', desc: 'Consistent daily presence fosters steady academic rhythm.' },
    { title: 'Punctuality', desc: 'Arriving on time instills lifelong discipline and respect.' },
    { title: 'Academic Progress', desc: 'Reviewing monthly report cards and celebrating milestones.' },
    { title: 'Good Habits & Values', desc: 'Reinforcing cleanliness, politeness, and empathy at home.' },
    { title: 'Open Communication', desc: 'Active dialogue between parents and class teachers.' },
    { title: 'Active Participation', desc: 'Engaging warmly in campus events and sports meets.' },
  ];

  const whyChooseUsPoints = [
    'Strong Academic Foundation',
    'Activity-Based Learning',
    'Communication Development',
    'Co-Curricular & Cultural Activities',
    'Leadership Development',
    'Character Building',
    'Essential Life Skills',
    'Holistic Child Development',
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-10 space-y-12">
      {/* 2-Column Bento: Approach & Partnership with Parents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
        
        {/* Left Column: Our Child-Centric Approach (7 cols) */}
        <AnimatedSection type="slide-in-left" className="lg:col-span-7 bg-white rounded-[36px] p-8 sm:p-12 border border-sky-100 shadow-lg flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-sky-100 border border-sky-200 text-sky-800 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              <Compass className="h-4 w-4 text-sky-700" />
              <span>OUR CHILD-CENTRIC PHILOSOPHY</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Educational Approach.
            </h3>
            
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Every child is wonderfully different. At Little House, we do not believe in one-size-fits-all education. We create a supportive environment where children flourish naturally:
            </p>

            {/* Approach Points 2-col Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {approachPoints.map((pt, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-sky-50/60 border border-sky-100 p-3 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-sky-50 border border-sky-100 rounded-2xl p-5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900">
                &quot;A child&apos;s early years are the foundation of a bright future.&quot;
              </p>
              <span className="text-[10px] font-mono font-bold text-sky-800 uppercase tracking-widest">
                LITTLE HOUSE GUIDING PRINCIPLE
              </span>
            </div>
          </div>
        </AnimatedSection>

        {/* Right Column: Why Choose Us (5 cols) */}
        <AnimatedSection type="slide-in-right" className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white rounded-[36px] p-8 sm:p-10 border border-sky-500/20 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              <span>THE LITTLE HOUSE ADVANTAGE</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Why Choose Us?
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Proven dedication to nurturing well-rounded leaders with strong academic and moral foundations:
            </p>

            <div className="space-y-2 pt-2">
              {whyChooseUsPoints.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2.5 bg-white/5 border border-white/10 p-2.5 rounded-xl hover:bg-white/10 transition">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-white tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Full-Width Card: Partnership with Parents */}
      <AnimatedSection type="fade-in-up" className="bg-gradient-to-r from-pink-50 via-white to-sky-50 rounded-[36px] p-8 sm:p-12 border border-pink-200/60 shadow-md text-left space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-pink-100 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-pink-100 border border-pink-200 text-pink-800 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
              <HeartHandshake className="h-4 w-4 text-pink-700" />
              <span>COMMUNITY COOPERATION</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Partnership with Parents & Guardians.
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              We believe a child thrives best when the school and home work together with mutual trust, open communication, and shared encouragement.
            </p>
          </div>

          <div className="bg-pink-600 text-white rounded-2xl px-6 py-4 text-center shrink-0 shadow-sm">
            <span className="text-sm sm:text-base font-black block">
              &quot;Together, we can give every child a stronger beginning.&quot;
            </span>
          </div>
        </div>

        {/* 6 Collaborative Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parentPartnershipPoints.map((pt, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-1.5 hover:border-pink-200 transition">
              <div className="flex items-center space-x-2 text-pink-700 font-extrabold text-sm">
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-xs">
                  {idx + 1}
                </div>
                <span>{pt.title}</span>
              </div>
              <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                {pt.desc}
              </p>
            </div>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}
