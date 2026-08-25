'use client';

import React, { useState } from 'react';
import { Target, Eye, Calendar, Award, Sun, BookOpen, Sparkles, GraduationCap, Users } from 'lucide-react';
import { AnimatedSection, AnimatedGrid, AnimatedGridItem, HoverCard } from '@/components/AnimatedSection';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'ACADEMIC' | 'HOLIDAYS' | 'EXAMS'>('ACADEMIC');

  const scheduleItoV = [
    { date: "09/09/2026", day: "Wednesday", subject: "DICTATION" },
    { date: "10/09/2026", day: "Thursday", subject: "ENGLISH" },
    { date: "11/09/2026", day: "Friday", subject: "CONVERSATION" },
    { date: "12/09/2026", day: "Saturday", subject: "MANIPURI" },
    { date: "13/09/2026", day: "Sunday", subject: "OFF" },
    { date: "14/09/2026", day: "Monday", subject: "MATHS" },
    { date: "15/09/2026", day: "Tuesday", subject: "DRAWING" },
    { date: "16/09/2026", day: "Wednesday", subject: "EVS" },
    { date: "17/09/2026", day: "Thursday", subject: "GRAMMAR" },
    { date: "18/09/2026", day: "Friday", subject: "OFF (Regular Class)" },
    { date: "19/09/2026", day: "Saturday", subject: "HINDI" },
    { date: "20/09/2026", day: "Sunday", subject: "OFF" },
    { date: "21/09/2026", day: "Monday", subject: "GK" }
  ];

  const scheduleVI = [
    { date: "09/09/2026", day: "Wednesday", subject: "ENGLISH" },
    { date: "10/09/2026", day: "Thursday", subject: "GRAMMAR" },
    { date: "11/09/2026", day: "Friday", subject: "OFF (Regular Class)" },
    { date: "12/09/2026", day: "Saturday", subject: "MATHS" },
    { date: "13/09/2026", day: "Sunday", subject: "OFF" },
    { date: "14/09/2026", day: "Monday", subject: "SCIENCE" },
    { date: "15/09/2026", day: "Tuesday", subject: "OFF (Regular Class)" },
    { date: "16/09/2026", day: "Wednesday", subject: "Sc. SCIENCE" },
    { date: "17/09/2026", day: "Thursday", subject: "OFF (Regular Class)" },
    { date: "18/09/2026", day: "Friday", subject: "MANIPURI" },
    { date: "19/09/2026", day: "Saturday", subject: "OFF (Regular Class)" },
    { date: "20/09/2026", day: "Sunday", subject: "OFF" },
    { date: "21/09/2026", day: "Monday", subject: "HINDI" }
  ];

  const holidays = [
    { name: "New Year Day / Gaan-Ngai", date: "1st January", day: "Thursday" },
    { name: "Republic Day", date: "26th January", day: "Monday" },
    { name: "Lui-Ngai-Ni", date: "15th February", day: "Sunday" },
    { name: "Yaoshang Festival", date: "3rd to 7th March", day: "Tue to Sat (5 Days)" },
    { name: "Shajibu Nongma Panba Cheiraoba", date: "19th March", day: "Thursday" },
    { name: "Id-ul-Fitr", date: "21st March", day: "Saturday" },
    { name: "Good Friday", date: "3rd April", day: "Friday" },
    { name: "Cheiraoba", date: "14th April", day: "Tuesday" },
    { name: "Khongjom Day", date: "23rd April", day: "Thursday" },
    { name: "May Day (Labour Day)", date: "1st May", day: "Friday" },
    { name: "Id-ul-Zuha", date: "27th May", day: "Wednesday" },
    { name: "Kang (Rath-Yatra)", date: "16th July", day: "Thursday" },
    { name: "Patriot's Day", date: "13th August", day: "Thursday" },
    { name: "Independence Day", date: "15th August", day: "Saturday" },
    { name: "Gandhi Jayanti", date: "2nd October", day: "Friday" },
    { name: "Mera Chaoren Houba", date: "11th October", day: "Sunday" },
    { name: "Durga Puja / Panthoibi Iratpa", date: "19th & 20th October", day: "Mon & Tue" },
    { name: "Diwali", date: "9th November", day: "Monday" },
    { name: "Ningol Chakkouba", date: "11th November", day: "Wednesday" },
    { name: "Nupi Lal", date: "12th December", day: "Saturday" },
    { name: "Christmas Day", date: "25th December", day: "Friday" }
  ];

  const milestones = [
    { 
      title: "Formative Assessment I (FA I) / 1st Periodic Test", 
      dates: "1st April 2026 to 13th April 2026", 
      results: "Monday, 27th April 2026",
      details: "Class I-V (25 Marks) & Class VI (50 Marks). Note: Play Group to UKG runs with normal regular classes.",
      icon: BookOpen 
    },
    { 
      title: "Summer Vacation Break", 
      dates: "17th May 2026 to 31st May 2026", 
      results: null,
      details: "School remains closed for all sessions. Re-opens on June 1, 2026.",
      icon: Sun 
    },
    { 
      title: "Summative Assessment I / 1st Term (Half Yearly)", 
      dates: "25th June 2026 to 11th July 2026", 
      results: "Saturday, 25th July 2026",
      details: "Class PG to UKG (100 Marks: 80 Written/20 Oral), Class I-V (50 Marks), Class VI (100 Marks).",
      icon: Award 
    },
    { 
      title: "Formative Assessment II (FA II) / 2nd Periodic Test", 
      dates: "9th September 2026 to 21st September 2026", 
      results: "Saturday, 3rd October 2026",
      details: "Class I-V (25 Marks) & Class VI (50 Marks). Play Group to UKG runs with normal regular classes.",
      icon: BookOpen 
    },
    { 
      title: "Summative Assessment II / 2nd Term (Final Exam)", 
      dates: "2nd December 2026 to 19th December 2026", 
      results: "Monday, 28th December 2026",
      details: "Class PG to UKG (100 Marks), Class I-V (50 Marks), Class VI (100 Marks). Promoted lists declared.",
      icon: Calendar 
    }
  ];

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

      {/* 📅 Academic Calendar, Holidays & Exam Routines */}
      <section id="academic-calendar" className="space-y-12">
        <AnimatedSection type="fade-in" className="text-left space-y-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-sky-100 pb-8">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
              SCHOOL TIMELINE
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">CALENDAR & HOLIDAYS.</h2>
          </div>
          {/* Custom tab switcher capsules in Sky Blue & Sunny Yellow */}
          <div className="flex flex-wrap gap-2 bg-slate-200/80 p-1.5 rounded-full border border-slate-300">
            <button
              onClick={() => setActiveTab('ACADEMIC')}
              className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition ${
                activeTab === 'ACADEMIC' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Academic Milestones 2026
            </button>
            <button
              onClick={() => setActiveTab('HOLIDAYS')}
              className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition ${
                activeTab === 'HOLIDAYS' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Holiday List 2026
            </button>
            <button
              onClick={() => setActiveTab('EXAMS')}
              className={`px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition ${
                activeTab === 'EXAMS' 
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold' 
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Exam Timetable (FA II)
            </button>
          </div>
        </AnimatedSection>

        {activeTab === 'ACADEMIC' ? (
          /* Academic Calendar Milestones */
          <div className="space-y-8 max-w-4xl text-left">
            {milestones.map((milestone, idx) => {
              const Icon = milestone.icon;
              return (
                <div key={idx} className="relative pl-12 border-l-2 border-sky-200 ml-4 space-y-2">
                  <div className="absolute -left-4 top-1.5 w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-md">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-extrabold text-sky-800 tracking-wider bg-sky-100 border border-sky-200 px-3 py-0.5 rounded-full uppercase">
                      {milestone.dates}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 tracking-tight">{milestone.title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed mt-1">{milestone.details}</p>
                    {milestone.results && (
                      <p className="text-[11px] font-mono font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md w-fit mt-2">
                        📅 RESULTS DECLARED: {milestone.results.toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'HOLIDAYS' ? (
          /* Holiday List */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {holidays.map((holiday, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[24px] border border-sky-100 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-sky-700 tracking-wider bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full uppercase">
                    {holiday.date}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight pt-2">{holiday.name}</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block pt-2 border-t border-slate-100">
                  DAY: {holiday.day}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Exam Timetable */
          <div id="exam-schedule" className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left transition-all duration-500">
            {/* Class I - V */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-sky-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-sky-700 tracking-wider font-mono border-b border-sky-100 pb-3 uppercase flex items-center justify-between">
                <span>Class I - V Exam Schedule</span>
                <span className="text-[10px] bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-bold">25 MARKS</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-2.5">Date / Day</th>
                      <th className="py-2.5 text-right">Subject</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scheduleItoV.map((exam) => (
                      <tr key={exam.date} className="hover:bg-sky-50/60">
                        <td className="py-3 text-slate-700 font-medium">{exam.date} <span className="text-[10px] text-slate-400">({exam.day})</span></td>
                        <td className="py-3 text-right">
                          <span className={`px-2.5 py-1 rounded font-bold text-[10px] font-mono ${
                            exam.subject.includes('OFF') 
                              ? 'text-slate-400 bg-slate-100' 
                              : 'text-sky-800 bg-sky-100 border border-sky-200'
                          }`}>
                            {exam.subject}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Class VI */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-sky-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-amber-700 tracking-wider font-mono border-b border-sky-100 pb-3 uppercase flex items-center justify-between">
                <span>Class VI Exam Schedule</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">50 MARKS</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-bold font-mono text-[10px] uppercase tracking-wider">
                      <th className="py-2.5">Date / Day</th>
                      <th className="py-2.5 text-right">Subject</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scheduleVI.map((exam) => (
                      <tr key={exam.date} className="hover:bg-amber-50/60">
                        <td className="py-3 text-slate-700 font-medium">{exam.date} <span className="text-[10px] text-slate-400">({exam.day})</span></td>
                        <td className="py-3 text-right">
                          <span className={`px-2.5 py-1 rounded font-bold text-[10px] font-mono ${
                            exam.subject.includes('OFF') 
                              ? 'text-slate-400 bg-slate-100' 
                              : 'text-amber-800 bg-amber-100 border border-amber-200'
                          }`}>
                            {exam.subject}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
