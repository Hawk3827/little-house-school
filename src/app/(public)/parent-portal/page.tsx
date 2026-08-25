'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Search, 
  Lock, 
  User, 
  Calendar, 
  Award, 
  FileText, 
  Download, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Sparkles,
  BookOpen,
  Camera,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import StudentPhotoLightbox from '@/components/StudentPhotoLightbox';
import MonthlyFeePaymentModal from '@/components/MonthlyFeePaymentModal';
import { formatDateSafe } from '@/lib/dateUtils';
import { useAutoReconnect } from '@/lib/useAutoReconnect';
import { CreditCard, Receipt } from 'lucide-react';

export default function ParentPortalPage() {
  const [admissionNo, setAdmissionNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState<any | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'activities' | 'grades'>('reports');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNo.trim() || !password.trim()) {
      setError('Please provide both your child’s Admission Number and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/public/student-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionNo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve student record.');
      }

      setStudent(data.student);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh student dossier when phone wakes from sleep or tab regains focus
  useAutoReconnect(() => {
    if (student && admissionNo && password) {
      fetch('/api/public/student-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admissionNo, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.student) setStudent(data.student);
        })
        .catch(() => {});
    }
  });

  const handleSignOut = () => {
    setStudent(null);
    setAdmissionNo('');
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-bold text-sky-800 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full flex items-center space-x-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Little House Parent Portal</span>
          </span>
        </div>

        {/* Not Logged In: Parent Authentication Card */}
        {!student ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6 text-left animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-sky-600 to-sky-400 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Student Progress Lookup</h1>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Parents can view monthly attendance logs, academic evaluation reports, and download report cards using their child&apos;s Admission Number.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-700 font-medium flex items-start space-x-2 animate-fadeIn">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-slate-600 uppercase tracking-wider text-[10px] font-bold mb-1 font-mono">
                  Admission Number
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="e.g. LHS-2026-7220"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 uppercase tracking-wider text-[10px] font-bold mb-1 font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter student password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition text-slate-800 placeholder-slate-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default password for new enrollments is <span className="font-mono font-bold text-slate-600">student123</span>.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 border border-amber-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Records...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>View Student Report</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center space-y-3">
              <button
                type="button"
                onClick={() => setIsFeeModalOpen(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl transition flex items-center justify-center space-x-2 shadow-md"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay Monthly Tuition Fees Online</span>
              </button>

              <p className="text-[11px] text-slate-400">
                Having trouble accessing your child&apos;s record? Contact the school administration at <span className="font-semibold text-slate-600">info@littlehouse.edu.in</span>
              </p>
            </div>
          </div>
        ) : (
          /* Authenticated: Child Progress Dashboard */
          <div className="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden text-left space-y-6 animate-fadeIn">
            
            {/* Student Header Banner in Royal Navy & Sky Blue */}
            <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-slate-900 text-white p-6 sm:p-8 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Photo with zoom trigger */}
                  <div 
                    onClick={() => setLightboxPhoto(student.photoUrl)}
                    className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/40 shadow-xl bg-black/20 relative group cursor-pointer flex-shrink-0"
                    title="Click to view full photo"
                  >
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-sky-600 text-white flex items-center justify-center font-bold text-3xl uppercase">
                        {student.name.slice(0, 2)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-bold text-white">
                      Full Photo
                    </div>
                  </div>

                  {/* Details */}
                  <div className="text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl font-black text-white">{student.name}</h2>
                      {student.class && (
                        <span className="bg-amber-400 text-slate-950 font-bold text-xs px-3 py-0.5 rounded-full shadow-xs">
                          {student.class.name}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-sky-100">
                      <span className="font-mono bg-white/15 px-3 py-1 rounded-md font-bold text-white">
                        {student.admissionNo}
                      </span>
                      {student.class?.teacherName && (
                        <span>Homeroom Faculty: <strong className="text-white">{student.class.teacherName}</strong></span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-sky-200 pt-1">
                      <span className="flex items-center space-x-1">
                        <Mail className="h-3.5 w-3.5 opacity-70" />
                        <span>{student.email}</span>
                      </span>
                      {student.phone && (
                        <span className="flex items-center space-x-1">
                          <Phone className="h-3.5 w-3.5 opacity-70" />
                          <span>{student.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 border border-white/20 sm:self-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Exit Record</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Swipeable on mobile) */}
            <div className="flex items-center overflow-x-auto border-b border-slate-100 px-4 sm:px-8 gap-1 sm:gap-2 scroll-smooth no-scrollbar max-w-full">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-3.5 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'reports'
                    ? 'border-sky-600 text-sky-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Monthly Reports ({student.monthlyReports?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('activities')}
                className={`py-3.5 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'activities'
                    ? 'border-sky-600 text-sky-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>Activities & Docs ({student.activityDocs?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('grades')}
                className={`py-3.5 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'grades'
                    ? 'border-sky-600 text-sky-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Award className="h-4 w-4" />
                <span>Academic Marks ({student.grades?.length || 0})</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8 space-y-6">
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  {student.monthlyReports?.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-700">No Monthly Reports Available</h4>
                      <p className="text-xs text-slate-400 mt-1">Monthly attendance summaries and evaluation notes will appear here once submitted by your child&apos;s teacher.</p>
                    </div>
                  ) : (
                    student.monthlyReports.map((report: any) => (
                      <div 
                        key={report.id}
                        className="bg-white border border-sky-100 rounded-2xl p-6 shadow-sm space-y-4 hover:border-sky-300 transition"
                      >
                        {/* Report Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-base font-black text-slate-900">{report.month}</span>
                            {report.conduct && (
                              <span className={`text-[10px] px-3 py-0.5 rounded-full font-bold uppercase ${
                                report.conduct.toLowerCase().includes('excellent')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : report.conduct.toLowerCase().includes('good')
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                Conduct: {report.conduct}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            Teacher: <strong>{report.teacherName}</strong>
                          </span>
                        </div>

                        {/* Attendance Statistics */}
                        <div className="bg-gradient-to-r from-slate-50 to-sky-50/40 rounded-xl p-4 space-y-2.5 border border-sky-100">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-700">Monthly Attendance Rate</span>
                            <span className={`${
                              report.attendancePercentage >= 85 
                                ? 'text-emerald-700' 
                                : report.attendancePercentage >= 75 
                                ? 'text-amber-700' 
                                : 'text-red-700'
                            }`}>
                              {report.attendancePercentage}% ({report.daysPresent} of {report.totalDays} Days Present)
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-2.5 rounded-full transition-all ${
                                report.attendancePercentage >= 85 
                                ? 'bg-emerald-500' 
                                : report.attendancePercentage >= 75 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(report.attendancePercentage, 100)}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[11px] text-slate-600 font-mono pt-1">
                            <span>Total Working Days: <strong>{report.totalDays}</strong></span>
                            <span>Days Present: <strong className="text-emerald-700">{report.daysPresent}</strong></span>
                            <span>Days Absent: <strong className="text-red-600">{report.daysAbsent}</strong></span>
                          </div>
                        </div>

                        {/* Teacher Remarks */}
                        {report.remarks && (
                          <div className="space-y-1">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Teacher Assessment Remarks</span>
                            <p className="text-xs text-slate-700 bg-sky-50/50 p-4 rounded-xl border border-sky-100 leading-relaxed italic">
                              &ldquo;{report.remarks}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Downloadable Attachment */}
                        {report.attachmentUrl && (
                          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Attached Report Card / Document</span>
                              <span className="text-xs font-semibold text-slate-800">{report.attachmentName || 'Report Card File'}</span>
                            </div>
                            <a
                              href={report.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download Report Card</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Activities & Documents Tab */}
              {activeTab === 'activities' && (
                <div className="space-y-6">
                  {student.activityDocs?.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Camera className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-700">No Activity Photos or Documents Yet</h4>
                      <p className="text-xs text-slate-400 mt-1">Photos from classroom events, science fairs, sports, and official achievement certificates will be posted here by your child&apos;s teacher.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Photo Activities */}
                      {student.activityDocs.filter((d: any) => d.type === 'PHOTO').length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                            <ImageIcon className="h-4 w-4 text-sky-600" />
                            <span>Classroom & School Activity Photos</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {student.activityDocs.filter((d: any) => d.type === 'PHOTO').map((act: any) => (
                              <div
                                key={act.id}
                                className="bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-sm hover:border-sky-300 transition space-y-3 flex flex-col justify-between"
                              >
                                <div>
                                  <div
                                    onClick={() => setLightboxPhoto(act.fileUrl)}
                                    className="relative aspect-video w-full bg-black/10 overflow-hidden cursor-pointer group"
                                    title="Click to view full photo"
                                  >
                                    <img
                                      src={act.fileUrl}
                                      alt={act.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-white">
                                      Full Size View
                                    </div>
                                  </div>
                                  <div className="p-4 space-y-2">
                                    <h4 className="text-sm font-bold text-slate-900">{act.title}</h4>
                                    {act.remarks && (
                                      <p className="text-xs text-slate-700 bg-sky-50/50 p-3 rounded-xl border border-sky-100 leading-relaxed italic">
                                        &ldquo;{act.remarks}&rdquo;
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                  <span>Faculty: <strong>{act.teacherName}</strong></span>
                                  {act.activityDate && (
                                    <span>Date: {formatDateSafe(act.activityDate, 'medium')}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Official Documents & Certificates */}
                      {student.activityDocs.filter((d: any) => d.type !== 'PHOTO').length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-amber-600" />
                            <span>Certificates & Official PDF Attachments</span>
                          </h3>
                          <div className="space-y-3">
                            {student.activityDocs.filter((d: any) => d.type !== 'PHOTO').map((doc: any) => (
                              <div
                                key={doc.id}
                                className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex items-center justify-between hover:border-sky-300 transition"
                              >
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-slate-900">{doc.title}</h4>
                                  <p className="text-xs text-slate-500">Uploaded by Faculty: {doc.teacherName}</p>
                                </div>
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs border border-amber-300"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download</span>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Grades Tab */}
              {activeTab === 'grades' && (
                <div className="space-y-6">
                  {student.grades?.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Award className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-700">No Assessment Records Yet</h4>
                      <p className="text-xs text-slate-400 mt-1">Periodic test and term examination scores will be recorded here by subject teachers.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-sky-100 rounded-2xl shadow-sm">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold font-mono text-[10px] uppercase tracking-wider">
                            <th className="py-3 px-4">Subject</th>
                            <th className="py-3 px-4">Assessment / Term</th>
                            <th className="py-3 px-4">Score</th>
                            <th className="py-3 px-4">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {student.grades.map((grade: any) => (
                            <tr key={grade.id} className="hover:bg-sky-50/50">
                              <td className="py-3 px-4 font-bold text-slate-900">{grade.subject}</td>
                              <td className="py-3 px-4 text-slate-600">{grade.term || 'FA Assessment'}</td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-800">{grade.score} / {grade.maxScore || 100}</td>
                              <td className="py-3 px-4 font-mono font-bold text-sky-700">{grade.gradeLetter || 'A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lightbox for student and activity photos */}
        {lightboxPhoto && (
          <StudentPhotoLightbox
            isOpen={true}
            photoUrl={lightboxPhoto}
            name={student?.name || 'Student Photo'}
            admissionNo={student?.admissionNo}
            onClose={() => setLightboxPhoto(null)}
          />
        )}

        {/* Monthly Fee Payment Modal */}
        <MonthlyFeePaymentModal
          isOpen={isFeeModalOpen}
          onClose={() => setIsFeeModalOpen(false)}
          initialAdmissionNo={student?.admissionNo || admissionNo}
        />
      </div>
    </div>
  );
}
