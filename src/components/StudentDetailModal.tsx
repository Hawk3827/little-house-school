'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Award, 
  FileText, 
  Download, 
  Phone, 
  MapPin, 
  Mail, 
  GraduationCap, 
  ExternalLink,
  Edit3,
  CheckCircle,
  Clock,
  Camera,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';
import StudentPhotoLightbox from './StudentPhotoLightbox';
import { formatDateSafe } from '@/lib/dateUtils';

export interface MonthlyReportData {
  id: string;
  month: string;
  totalDays: number;
  daysPresent: number;
  daysAbsent: number;
  attendancePercentage?: number;
  conduct: string | null;
  remarks: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  teacherName?: string;
  updatedAt?: string | Date;
}

export interface ActivityDocData {
  id: string;
  title: string;
  type: string; // "PHOTO" | "DOCUMENT"
  fileUrl: string;
  fileName: string | null;
  fileType: string | null;
  remarks: string | null;
  activityDate: string | Date | null;
  teacherName?: string;
  createdAt: string | Date;
}

export interface StudentDetailData {
  id: string;
  name: string;
  email: string;
  admissionNo: string | null;
  photoUrl: string | null;
  phone: string | null;
  address: string | null;
  className?: string;
  monthlyReports?: MonthlyReportData[];
  activityDocs?: ActivityDocData[];
  grades?: { id: string; subject: string; score: number; maxScore: number; remarks: string | null }[];
}

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDetailData | null;
  onEdit?: (student: StudentDetailData) => void;
}

export default function StudentDetailModal({
  isOpen,
  onClose,
  student: initialStudent,
  onEdit,
}: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'activities' | 'grades'>('reports');
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [detailedStudent, setDetailedStudent] = useState<StudentDetailData | null>(initialStudent);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    setDetailedStudent(initialStudent);
    let isMounted = true;

    async function fetchFullDetails() {
      if (initialStudent?.id && (!initialStudent.monthlyReports || initialStudent.monthlyReports.length === 0)) {
        setLoadingDetails(true);
        try {
          const res = await fetch(`/api/admin/student-details?id=${initialStudent.id}`);
          if (res.ok && isMounted) {
            const data = await res.json();
            if (data.student) {
              setDetailedStudent((prev) => ({
                ...prev!,
                monthlyReports: data.student.monthlyReports?.map((r: any) => ({
                  id: r.id,
                  month: r.month,
                  totalDays: r.totalDays,
                  daysPresent: r.daysPresent,
                  daysAbsent: r.daysAbsent,
                  conduct: r.conduct,
                  remarks: r.remarks,
                  attachmentUrl: r.attachmentUrl,
                  attachmentName: r.attachmentName,
                  teacherName: r.uploadedBy?.name || 'Class Teacher',
                  updatedAt: r.updatedAt,
                })) || [],
                activityDocs: data.student.studentActivityDocs?.map((d: any) => ({
                  id: d.id,
                  title: d.title,
                  type: d.type,
                  fileUrl: d.fileUrl,
                  fileName: d.fileName,
                  fileType: d.fileType,
                  remarks: d.remarks,
                  activityDate: d.activityDate,
                  teacherName: d.uploadedBy?.name || 'Class Teacher',
                })) || [],
                grades: data.student.studentGrades?.map((g: any) => ({
                  id: g.id,
                  subject: g.subject,
                  score: g.score,
                  maxScore: g.maxScore,
                  remarks: g.remarks,
                })) || [],
              }));
            }
          }
        } catch (err) {
          console.warn('On-demand student detail fetch fallback:', err);
        } finally {
          if (isMounted) setLoadingDetails(false);
        }
      }
    }

    if (isOpen && initialStudent) {
      fetchFullDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialStudent]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !detailedStudent) return null;

  const student = detailedStudent;
  const reports = student.monthlyReports || [];
  const activityDocs = student.activityDocs || [];
  const grades = student.grades || [];

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-3xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden text-left relative flex flex-col max-h-[90vh] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Profile Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Photo */}
              <div 
                className="relative group cursor-pointer w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-black/20 flex-shrink-0"
                onClick={() => setLightboxPhoto(student.photoUrl)}
                title="Click to view full photo"
              >
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-700/50 text-white flex items-center justify-center font-bold text-2xl uppercase">
                    {student.name.slice(0, 2)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-bold text-white">
                  Zoom
                </div>
              </div>

              {/* Identity & Basic Details */}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-white">{student.name}</h2>
                  {student.className && (
                    <span className="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {student.className}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-indigo-200">
                  <span className="font-mono bg-white/15 px-2.5 py-0.5 rounded-md font-bold text-white">
                    {student.admissionNo || 'No Admission No'}
                  </span>
                  <span className="flex items-center space-x-1">
                    <Mail className="h-3.5 w-3.5 opacity-70" />
                    <span>{student.email}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-indigo-300 pt-1">
                  {student.phone && (
                    <span className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 opacity-70" />
                      <span>{student.phone}</span>
                    </span>
                  )}
                  {student.address && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 opacity-70" />
                      <span>{student.address}</span>
                    </span>
                  )}
                </div>
              </div>

              {onEdit && (
                <button
                  onClick={() => onEdit(student)}
                  className="sm:self-end bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 border border-white/20"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Swipeable on mobile) */}
          <div className="flex items-center overflow-x-auto border-b border-gray-100 px-4 sm:px-6 bg-gray-50/50 gap-1 scroll-smooth no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'reports'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Monthly Reports ({reports.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'activities'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Activities & Docs ({activityDocs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('grades')}
              className={`py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'grades'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm -mb-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Academic Marks ({grades.length})</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Tab 1: Monthly Reports */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No monthly reports recorded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Teachers upload monthly consolidated attendance and evaluation reports.</p>
                  </div>
                ) : (
                  reports.map((report) => {
                    const percentage = report.totalDays > 0 
                      ? Math.round((report.daysPresent / report.totalDays) * 100) 
                      : 0;

                    return (
                      <div 
                        key={report.id}
                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-indigo-200 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-extrabold text-gray-900">{report.month}</span>
                            {report.conduct && (
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                report.conduct.toLowerCase().includes('excellent')
                                  ? 'bg-green-100 text-green-800'
                                  : report.conduct.toLowerCase().includes('good')
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                Conduct: {report.conduct}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-gray-400">
                            Evaluated by {report.teacherName || 'Homeroom Teacher'}
                          </span>
                        </div>

                        {/* Attendance Stats Bar */}
                        <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-gray-600">Monthly Attendance Rate</span>
                            <span className={`font-bold ${percentage >= 85 ? 'text-green-600' : percentage >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {percentage}% ({report.daysPresent} of {report.totalDays} Days Present)
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                percentage >= 85 ? 'bg-green-500' : percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                            <span>Working Days: {report.totalDays}</span>
                            <span>Present: {report.daysPresent}</span>
                            <span>Absent: {report.daysAbsent}</span>
                          </div>
                        </div>

                        {/* Teacher Evaluation Remarks */}
                        {report.remarks && (
                          <div className="space-y-1">
                            <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Teacher Remarks</span>
                            <p className="text-xs text-gray-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60 leading-relaxed">
                              &ldquo;{report.remarks}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Attached Report File / Image */}
                        {report.attachmentUrl && (
                          <div className="pt-2">
                            <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Attached Report File</span>
                            <a
                              href={report.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-xl border border-indigo-200 transition"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="truncate max-w-xs">{report.attachmentName || 'View Attached Report File'}</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-70 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Tab: Activity Photos & Documents */}
            {activeTab === 'activities' && (
              <div className="space-y-6">
                {activityDocs.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Camera className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No activity photos or documents uploaded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Teachers can upload classroom activity photos, event participation, and official certificates.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Activity Photos Section */}
                    {activityDocs.filter(d => d.type === 'PHOTO').length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Student Activity Photos</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activityDocs.filter(d => d.type === 'PHOTO').map((item) => (
                            <div 
                              key={item.id}
                              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-200 transition space-y-2 flex flex-col"
                            >
                              <div 
                                onClick={() => setLightboxPhoto(item.fileUrl)}
                                className="relative aspect-video w-full bg-black/10 overflow-hidden cursor-pointer group"
                                title="Click to view full photo"
                              >
                                <img
                                  src={item.fileUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-white">
                                  Full Photo
                                </div>
                              </div>
                              <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                                <div>
                                  <h5 className="text-xs font-bold text-gray-900">{item.title}</h5>
                                  {item.remarks && (
                                    <p className="text-[11px] text-gray-600 italic bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100">
                                      &ldquo;{item.remarks}&rdquo;
                                    </p>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center justify-between pt-1 border-t border-gray-100">
                                  <span>{item.teacherName || 'Faculty'}</span>
                                  {item.activityDate && (
                                    <span>{formatDateSafe(item.activityDate, 'medium')}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Documents Section */}
                    {activityDocs.filter(d => d.type === 'DOCUMENT').length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                          <FileText className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Related Documents & Certificates</span>
                        </h4>
                        <div className="space-y-2.5">
                          {activityDocs.filter(d => d.type === 'DOCUMENT').map((doc) => (
                            <div 
                              key={doc.id}
                              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-indigo-200 transition"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                                  <span className="text-xs font-bold text-gray-900">{doc.title}</span>
                                </div>
                                {doc.remarks && (
                                  <p className="text-[11px] text-gray-600 pl-6 italic">
                                    &ldquo;{doc.remarks}&rdquo;
                                  </p>
                                )}
                                <p className="text-[10px] text-gray-400 pl-6">
                                  Uploaded by {doc.teacherName || 'Teacher'}
                                </p>
                              </div>
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3.5 py-2 rounded-xl transition border border-indigo-200 flex-shrink-0 self-start sm:self-center"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Download Document</span>
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

            {/* Tab 3: Grades & Academic Marks */}
            {activeTab === 'grades' && (
              <div className="space-y-4">
                {grades.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No grades recorded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Grades uploaded by teachers will appear here.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                      <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Score</th>
                          <th className="py-3 px-4">Percentage</th>
                          <th className="py-3 px-4">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {grades.map((grade) => {
                          const pct = grade.maxScore > 0 ? Math.round((grade.score / grade.maxScore) * 100) : 0;
                          return (
                            <tr key={grade.id} className="hover:bg-gray-50 transition">
                              <td className="py-3 px-4 font-bold text-gray-900">{grade.subject}</td>
                              <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                                {grade.score} / {grade.maxScore}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  pct >= 80 ? 'bg-green-100 text-green-800' : pct >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {pct}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-500">{grade.remarks || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <StudentPhotoLightbox
        isOpen={!!lightboxPhoto}
        onClose={() => setLightboxPhoto(null)}
        photoUrl={lightboxPhoto}
        name={student.name}
        admissionNo={student.admissionNo}
      />
    </>
  );
}
