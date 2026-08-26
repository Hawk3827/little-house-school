'use client';

import React, { useState } from 'react';
import { Calendar, Award, Sun, BookOpen, Clock, Sparkles } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';

export default function AnnualProgramPage() {
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
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 space-y-16 relative bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* 🌟 Header Title Banner */}
      <AnimatedSection type="fade-in" className="text-left max-w-4xl space-y-4">
        <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
          ACADEMIC TIMELINE & EVENTS
        </span>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
          ANNUAL PROGRAM.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mt-2 font-normal">
          Explore the official academic calendar, official holiday schedule, and examination routines for LITTLE HOUSE SCHOOL session 2026.
        </p>
      </AnimatedSection>

      {/* 📅 Academic Calendar, Holidays & Exam Routines */}
      <section id="academic-calendar" className="space-y-12">
        <AnimatedSection type="fade-in" className="text-left space-y-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-sky-100 pb-8">
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full uppercase">
              SESSION 2026
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Calendar, Holidays & Exam Timetables</h2>
          </div>
          
          {/* Modern Responsive Segmented Control */}
          <div className="w-full md:w-auto bg-slate-200/80 p-1.5 rounded-2xl sm:rounded-full border border-slate-300/80 grid grid-cols-1 sm:grid-cols-3 gap-1.5 shadow-xs">
            <button
              onClick={() => setActiveTab('ACADEMIC')}
              className={`flex items-center justify-center space-x-2 px-5 py-3 rounded-xl sm:rounded-full text-xs font-bold transition-all duration-200 ${
                activeTab === 'ACADEMIC' 
                  ? 'bg-sky-600 text-white shadow-md font-extrabold' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Academic Milestones</span>
            </button>

            <button
              onClick={() => setActiveTab('HOLIDAYS')}
              className={`flex items-center justify-center space-x-2 px-5 py-3 rounded-xl sm:rounded-full text-xs font-bold transition-all duration-200 ${
                activeTab === 'HOLIDAYS' 
                  ? 'bg-sky-600 text-white shadow-md font-extrabold' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Holiday List 2026</span>
            </button>

            <button
              onClick={() => setActiveTab('EXAMS')}
              className={`flex items-center justify-center space-x-2 px-5 py-3 rounded-xl sm:rounded-full text-xs font-bold transition-all duration-200 ${
                activeTab === 'EXAMS' 
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md font-black' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Exam Schedule (FA II)</span>
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
