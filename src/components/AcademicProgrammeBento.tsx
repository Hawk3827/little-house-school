'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Palette, 
  Trophy, 
  Sparkles, 
  Compass, 
  Flame, 
  Music, 
  Activity, 
  HeartHandshake,
  CheckCircle2,
  Calendar,
  Smile
} from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export default function AcademicProgrammeBento() {
  const [activeTab, setActiveTab] = useState<'all' | 'academics' | 'cocurricular' | 'lifeskills'>('all');

  const categories = [
    { id: 'all', label: 'Complete Curriculum' },
    { id: 'academics', label: 'Foundations & Core Subjects' },
    { id: 'cocurricular', label: 'Thang-Ta, Sports & Arts' },
    { id: 'lifeskills', label: 'Life Skills & Celebrations' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-10 space-y-10">
      {/* Section Header */}
      <AnimatedSection type="fade-in" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left border-b border-sky-100 pb-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-sky-100 border border-sky-200 text-sky-800 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
            <GraduationCap className="h-4 w-4 text-sky-700" />
            <span>OFFICIAL ACADEMIC CURRICULUM</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Our Academic & Holistic Programme.
          </h2>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            Education at The Little House School goes far beyond textbooks. We nurture intellect, creative expression, cultural roots, and moral character in every student.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </AnimatedSection>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        
        {/* Card 1: Foundational Skills */}
        {(activeTab === 'all' || activeTab === 'academics') && (
          <AnimatedSection type="fade-in-up" className="bg-white rounded-[32px] p-7 sm:p-8 border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-800">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase">
                  EARLY FOUNDATIONS
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Foundational Skills</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Building the vital cognitive, linguistic, and numeric building blocks in early childhood.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {['Reading', 'Phonics Mastery', 'Writing', 'Vocabulary', 'Numeracy', 'Conversation'].map((skill, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-sky-800">
              Interactive & phonics-led pedagogy
            </div>
          </AnimatedSection>
        )}

        {/* Card 2: Core Learning Subjects */}
        {(activeTab === 'all' || activeTab === 'academics') && (
          <AnimatedSection type="fade-in-up" className="bg-white rounded-[32px] p-7 sm:p-8 border border-amber-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">
                  ACADEMIC EXCELLENCE
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Core Learning</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Rigorous syllabus balancing modern STEM with local Manipuri language & cultural literacy.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { name: 'English', tag: 'Core' },
                  { name: 'Mathematics', tag: 'STEM' },
                  { name: 'Manipuri (ꯂꯤꯇꯜ)', tag: 'Language' },
                  { name: 'Grammar', tag: 'Language' },
                  { name: 'Environmental Studies', tag: 'Science' },
                  { name: 'General Knowledge', tag: 'General' },
                  { name: 'Hindi', tag: 'Language' },
                ].map((subject, i) => (
                  <span key={i} className="text-xs font-bold bg-amber-50/80 border border-amber-200/80 text-amber-950 px-3 py-1.5 rounded-xl">
                    {subject.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-900">
              Manipuri language & Meitei script integrated
            </div>
          </AnimatedSection>
        )}

        {/* Card 3: Creative Development & Projects */}
        {(activeTab === 'all' || activeTab === 'academics') && (
          <AnimatedSection type="fade-in-up" className="bg-white rounded-[32px] p-7 sm:p-8 border border-purple-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase">
                  CREATIVITY & INNOVATION
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Creative Development</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Encouraging imagination, spatial design, and eco-consciousness through experiential art.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  'Drawing & Sketching',
                  'Art & Craft Workshops',
                  'Waste-to-Wealth Eco Projects',
                  'Sensory Play & Pre-Writing',
                  'Hands-on Project Work',
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-purple-50/50 p-2 rounded-xl border border-purple-100/60">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-purple-800">
              Eco-friendly & sensory experiential learning
            </div>
          </AnimatedSection>
        )}

        {/* Card 4: Co-Curricular & Manipur Cultural Heritage */}
        {(activeTab === 'all' || activeTab === 'cocurricular') && (
          <AnimatedSection type="fade-in-up" className="bg-white rounded-[32px] p-7 sm:p-8 border border-emerald-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Flame className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
                  CULTURE & ATHLETICS
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Co-Curricular, Sports & Indigenous Arts</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  We take pride in indigenous Manipuri martial arts and holistic mind-body disciplines:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { title: 'Thang-Ta', sub: 'Traditional Martial Art', badge: 'Indigenous' },
                  { title: 'Yoga & Mindfulness', sub: 'Inner Calm & Posture', badge: 'Wellness' },
                  { title: 'Music & Dance', sub: 'Rhythm & Self-Expression', badge: 'Arts' },
                  { title: 'Sports & Games', sub: 'Teamwork & Physical Fitness', badge: 'Athletics' },
                  { title: 'Storytelling & Recitation', sub: 'Voice & Public Speaking', badge: 'Literary' },
                  { title: 'Safety & First Aid', sub: 'Safe & Unsafe Awareness', badge: 'Life Skills' },
                ].map((act, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/80 space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      {act.badge}
                    </span>
                    <div className="font-extrabold text-slate-900 text-xs sm:text-sm mt-1">{act.title}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{act.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
              <span>Preserving indigenous Manipuri sports alongside modern education</span>
              <span className="hidden sm:inline text-slate-400">Weekly Scheduled Periods</span>
            </div>
          </AnimatedSection>
        )}

        {/* Card 5: Life Skills & Personal Development */}
        {(activeTab === 'all' || activeTab === 'lifeskills') && (
          <AnimatedSection type="fade-in-up" className="bg-white rounded-[32px] p-7 sm:p-8 border border-sky-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-800">
                <Smile className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase">
                  CHARACTER FORMATION
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Life Skills & Growth</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed italic">
                  &quot;Growing Good People for a Brighter Tomorrow&quot;
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { name: 'Confidence Building', desc: 'Overcoming stage fright & shyness' },
                  { name: 'Leadership Qualities', desc: 'Classroom monitors & team leads' },
                  { name: 'Discipline & Good Manners', desc: 'Respect for peers, teachers & elders' },
                  { name: 'Teamwork & Cooperation', desc: 'Collaborative group projects' },
                  { name: 'Civic & Environmental Awareness', desc: 'Conscious stewardship of surroundings' },
                ].map((skill, i) => (
                  <div key={i} className="text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <span className="font-extrabold text-slate-900 block">{skill.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{skill.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-sky-800">
              Values-driven daily mentoring
            </div>
          </AnimatedSection>
        )}

        {/* Card 6: Celebrations & Special Activities */}
        {(activeTab === 'all' || activeTab === 'lifeskills') && (
          <AnimatedSection type="fade-in-up" className="bg-white rounded-[32px] p-7 sm:p-8 border border-pink-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 lg:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-700">
                  <Calendar className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono font-bold text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-200 uppercase">
                  VIBRANT CAMPUS LIFE
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Celebrations & Special Activities</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Every season brings joy, shared laughter, and rich cultural observances at Little House School:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[
                  'National Observances',
                  "Teachers' Day",
                  "Mother's Day",
                  'Cultural Festivals',
                  'Sports Programmes',
                  'Poetry & Recitation',
                  'Creative Competitions',
                  'Awareness Drives',
                  'Classroom Celebrations',
                  'Special Activity Days',
                ].map((act, i) => (
                  <div key={i} className="text-center p-3 rounded-2xl bg-pink-50/40 border border-pink-100/70">
                    <span className="text-xs font-extrabold text-slate-800 block">{act}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-pink-700">
              Joyful memories fostering lifelong friendship and school pride
            </div>
          </AnimatedSection>
        )}

      </div>
    </section>
  );
}
