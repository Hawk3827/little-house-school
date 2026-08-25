"use client";

import React, { useState } from 'react';
import { 
  Calendar, 
  Award, 
  User, 
  Megaphone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Search,
  ArrowRight
} from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: Date;
  status: string;
}

interface GradeRecord {
  id: string;
  subject: string;
  score: number;
  maxScore: number;
  remarks: string | null;
  assessmentDate: Date;
  teacher: { name: string };
}

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: { name: string };
}

interface StudentProps {
  studentName: string;
  className: string;
  teacherName: string;
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  announcements: AnnouncementRecord[];
}

export default function StudentDashboardView({
  studentName,
  className,
  teacherName,
  attendance,
  grades,
  announcements,
}: StudentProps) {
  // Calculate attendance rates
  const totalDays = attendance.length;
  const presentDays = attendance.filter(r => r.status === 'PRESENT').length;
  const lateDays = attendance.filter(r => r.status === 'LATE').length;
  const attendanceRate = totalDays > 0 ? Math.round(((presentDays + lateDays * 0.5) / totalDays) * 100) : 100;

  // Calculate grade averages
  const averageGrade = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length)
    : null;

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

  const isClassVI = className.toLowerCase().includes('vi') || className.toLowerCase().includes('6');
  const activeSchedule = isClassVI ? scheduleVI : scheduleItoV;

  const [searchQuery, setSearchQuery] = useState('');

  const searchIndex = [
    {
      category: 'Calendar & Timetable',
      keywords: ['calendar', 'timetable', 'exam', 'test', 'schedule', 'routine', 'date', 'periodic', 'fa ii', 'period', 'class'],
      results: [
        { title: '2nd Periodic Test (FA II) Exam Schedule', desc: 'View the upcoming test schedule for Class I-V and Class VI.', actionLabel: 'Scroll to Timetable', targetId: 'exam-timetable' }
      ]
    },
    {
      category: 'Fees & Payments',
      keywords: ['fee', 'payment', 'money', 'pay', 'charge', 'fare', 'admission', 'monthly', 'transport', 'van', 'omni'],
      results: [
        { title: 'Admission Fee Payment', desc: 'Apply online and pay admission/monthly fee for Play-Group to Class VI.', actionLabel: 'Go to Admissions Page', href: '/admission' },
        { title: 'Transportation & Van Fares', desc: 'Flat monthly van transit charges for Waiton, Pangei, Sawombung etc.', actionLabel: 'Go to Transport Info', href: '/contact#transit-scheduler' }
      ]
    },
    {
      category: 'Notice Board & Announcements',
      keywords: ['notice', 'announcement', 'news', 'update', 'important', 'message', 'alert', 'holiday'],
      results: [
        { title: 'Notice Board Announcements', desc: 'View official board announcements, holidays, and headmaster messages.', actionLabel: 'Scroll to Notices', targetId: 'notice-board' }
      ]
    },
    {
      category: 'Grades & Report Card',
      keywords: ['grade', 'score', 'mark', 'report', 'card', 'result', 'performance', 'assessment'],
      results: [
        { title: 'Grades & Report Card', desc: 'Review graded subject assessments, scores, and teacher remarks.', actionLabel: 'Scroll to Report Card', targetId: 'report-card' }
      ]
    }
  ];

  const lowerQuery = searchQuery.toLowerCase().trim();
  const results: any[] = [];

  if (lowerQuery.length > 0) {
    searchIndex.forEach(cat => {
      const matchCat = cat.category.toLowerCase().includes(lowerQuery) || cat.keywords.some(kw => kw.includes(lowerQuery));
      if (matchCat) {
        cat.results.forEach(res => {
          results.push({ ...res, category: cat.category });
        });
      }
    });

    announcements.forEach(ann => {
      if (ann.title.toLowerCase().includes(lowerQuery) || ann.content.toLowerCase().includes(lowerQuery)) {
        results.push({
          title: ann.title,
          desc: ann.content.substring(0, 100) + (ann.content.length > 100 ? '...' : ''),
          category: 'Notice Board',
          actionLabel: 'Scroll to Notice',
          targetId: 'notice-board'
        });
      }
    });

    grades.forEach(g => {
      if (g.subject.toLowerCase().includes(lowerQuery) || (g.remarks && g.remarks.toLowerCase().includes(lowerQuery))) {
        results.push({
          title: `Grade: ${g.subject}`,
          desc: `Score: ${g.score}/${g.maxScore}. ${g.remarks || ''}`,
          category: 'Grades & Report Card',
          actionLabel: 'Scroll to Report Card',
          targetId: 'report-card'
        });
      }
    });

    activeSchedule.forEach(ex => {
      if (ex.subject.toLowerCase().includes(lowerQuery)) {
        results.push({
          title: `Exam: ${ex.subject}`,
          desc: `Date: ${ex.date} (${ex.day}).`,
          category: 'Calendar & Timetable',
          actionLabel: 'Scroll to Timetable',
          targetId: 'exam-timetable'
        });
      }
    });
  }

  const limitedResults = results.slice(0, 5);

  const handleResultClick = (res: any) => {
    if (res.targetId) {
      const el = document.getElementById(res.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
        }, 2000);
      }
    }
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Search Input block */}
      <div className="relative">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center space-x-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search calendar, exam timetable, fees, notice board, grades..."
            className="flex-grow bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400 font-light"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs text-gray-400 hover:text-gray-600 font-mono"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden divide-y divide-gray-100 text-left">
            {limitedResults.length > 0 ? (
              limitedResults.map((res, index) => (
                <div 
                  key={index} 
                  onClick={() => handleResultClick(res)}
                  className="p-4 hover:bg-gray-50 transition cursor-pointer flex justify-between items-center group"
                >
                  <div className="space-y-1 pr-4">
                    <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                      {res.category}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition">
                      {res.title}
                    </h4>
                    <p className="text-xs text-gray-500 font-light line-clamp-1">{res.desc}</p>
                  </div>
                  {res.href ? (
                    <a 
                      href={res.href}
                      className="flex-shrink-0 flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <span>{res.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <button
                      className="flex-shrink-0 flex items-center space-x-1.5 text-xs font-bold text-blue-600"
                    >
                      <span>{res.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 font-light">
                No matching results found for &quot;{searchQuery}&quot;. Try searching for <span className="font-semibold text-gray-500">exam</span>, <span className="font-semibold text-gray-500">fee</span>, <span className="font-semibold text-gray-500">holiday</span>, or a specific subject.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Class info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Class & Teacher</span>
            <span className="text-base font-extrabold text-gray-900">{className}</span>
            <span className="block text-xs text-gray-500 mt-0.5">Homeroom: {teacherName}</span>
          </div>
        </div>

        {/* Attendance rate */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance Rate</span>
            <span className="text-2xl font-extrabold text-gray-900">{attendanceRate}%</span>
            <span className="block text-xs text-gray-500 mt-0.5">{presentDays} Present / {totalDays} Days</span>
          </div>
        </div>

        {/* Grade average */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Average Grade</span>
            <span className="text-2xl font-extrabold text-gray-900">
              {averageGrade !== null ? `${averageGrade}%` : 'N/A'}
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">{grades.length} Assessments</span>
          </div>
        </div>
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns (Grades & Attendance) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Report Card */}
          <div id="report-card" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 transition-all duration-500">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span>Grades & Report Card</span>
            </h3>

            {grades.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No exam/test scores recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {grades.map((grade) => {
                  const percentage = Math.round((grade.score / grade.maxScore) * 100);
                  return (
                    <div key={grade.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 text-sm">{grade.subject}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(grade.assessmentDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                        {grade.remarks && (
                          <p className="text-xs text-gray-500 italic mt-1">&quot;{grade.remarks}&quot;</p>
                        )}
                        <p className="text-[10px] text-gray-400">Graded by: {grade.teacher.name}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-950 block">{grade.score} / {grade.maxScore}</span>
                          <span className="text-[10px] text-gray-400">Score</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          percentage >= 90 ? 'bg-green-100 text-green-800' :
                          percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                          percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FA II / 2nd Periodic Test Timetable 2026 */}
          <div id="exam-timetable" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 transition-all duration-500">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600 animate-pulse" />
                <span>2nd Periodic Test Timetable (FA II)</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {isClassVI ? 'CLASS VI' : 'CLASS I - V'}
              </span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold font-mono text-[9px] uppercase tracking-wider">
                    <th className="py-2.5">Date / Day</th>
                    <th className="py-2.5 text-right">Scheduled Exam Subject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeSchedule.map((exam) => (
                    <tr key={exam.date} className="hover:bg-gray-50/50">
                      <td className="py-3 font-semibold text-gray-800">
                        {exam.date} <span className="text-[10px] text-gray-400 font-normal">({exam.day})</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          exam.subject.includes('OFF') 
                            ? 'bg-neutral-100 text-neutral-500 border border-neutral-200' 
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100/50'
                        }`}>
                          {exam.subject}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-3 text-[10px] text-neutral-505 leading-relaxed font-light mt-2 border border-gray-100 text-left">
              <span className="font-bold text-gray-700 block mb-0.5">📢 Exam Marking Scheme:</span>
              Periodic Exam Full Marks: 25 / 40 (Internal Assessment: 10 marks) | Pass Marks: 10 / 16. Exams are held between 1st Period and 2nd Period. Regular classes continue on designated OFF days.
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>Attendance History</span>
            </h3>

            {attendance.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No attendance records found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attendance.map((record) => (
                  <div key={record.id} className="border border-gray-100 rounded-lg p-3 flex justify-between items-center bg-gray-50">
                    <span className="text-xs font-bold text-gray-700">
                      {new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                    <span className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      record.status === 'PRESENT' ? 'bg-green-100 text-green-700 border-green-200' :
                      record.status === 'ABSENT' ? 'bg-red-100 text-red-700 border-red-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {record.status === 'PRESENT' && <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                      {record.status === 'ABSENT' && <XCircle className="h-3.5 w-3.5 mr-1" />}
                      {record.status === 'LATE' && <AlertTriangle className="h-3.5 w-3.5 mr-1" />}
                      <span>{record.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Class Notices) */}
        <div className="space-y-8">
          <div id="notice-board" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 transition-all duration-500">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <Megaphone className="h-5 w-5 text-blue-600" />
              <span>Notice Board</span>
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No announcements recorded.</p>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="border border-gray-100 rounded-lg p-4 space-y-2 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-gray-400">
                        {new Date(ann.createdAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{ann.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-4 leading-relaxed">{ann.content}</p>
                    <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-50">
                      By: {ann.createdBy.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
