'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Edit3, 
  Search, 
  X, 
  Eye, 
  Archive, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle2,
  Calendar,
  History,
  FileSpreadsheet,
  Download,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronRight,
  BookOpen,
  School
} from 'lucide-react';
import EditStudentModal from './EditStudentModal';
import StudentPhotoLightbox from './StudentPhotoLightbox';
import StudentDetailModal, { StudentDetailData } from './StudentDetailModal';
import SecurityPinModal from './SecurityPinModal';

interface StudentItem {
  id: string;
  email: string;
  profile: {
    name: string;
    admissionNo: string | null;
    photoUrl: string | null;
    phone: string | null;
    address: string | null;
    isArchived?: boolean;
    enrollments: {
      class: {
        name: string;
      }
    }[];
    monthlyReports?: any[];
    studentActivityDocs?: any[];
    studentGrades?: any[];
  } | null;
}

interface ClassItem {
  id: string;
  name: string;
}

interface AdminStudentsListProps {
  students: StudentItem[];
  archivedStudents?: StudentItem[];
  classes?: ClassItem[];
}

export default function AdminStudentsList({ 
  students, 
  archivedStudents = [],
  classes = []
}: AdminStudentsListProps) {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  // selectedClass is null initially so user chooses class FIRST
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [purgingId, setPurgingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string | null; name: string; admissionNo: string | null } | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentDetailData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pinPrompt, setPinPrompt] = useState<{ studentId: string; studentName: string; action: 'ARCHIVE' | 'PURGE' } | null>(null);

  const currentList = activeSubTab === 'ACTIVE' ? students : archivedStudents;

  // Extract unique class list from props + existing student enrollments
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    classes.forEach(c => classSet.add(c.name));
    currentList.forEach(s => {
      const clsName = s.profile?.enrollments?.[0]?.class?.name;
      if (clsName) classSet.add(clsName);
    });
    return Array.from(classSet).sort();
  }, [classes, currentList]);

  // Compute student counts per class for badges and cards
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: currentList.length };
    currentList.forEach(s => {
      const clsName = s.profile?.enrollments?.[0]?.class?.name || 'Unassigned';
      counts[clsName] = (counts[clsName] || 0) + 1;
    });
    return counts;
  }, [currentList]);

  // Filter students based on selected class and search term
  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];

    return currentList.filter((s) => {
      const className = s.profile?.enrollments?.[0]?.class?.name || 'Unassigned';
      
      // Class filter check
      if (selectedClass !== 'ALL' && className !== selectedClass) {
        return false;
      }

      // Search query check
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase().trim();
      const name = s.profile?.name?.toLowerCase() || '';
      const email = s.email?.toLowerCase() || '';
      const admissionNo = s.profile?.admissionNo?.toLowerCase() || '';
      const phone = s.profile?.phone?.toLowerCase() || '';
      const address = s.profile?.address?.toLowerCase() || '';

      return (
        name.includes(query) ||
        email.includes(query) ||
        admissionNo.includes(query) ||
        phone.includes(query) ||
        address.includes(query) ||
        className.toLowerCase().includes(query)
      );
    });
  }, [currentList, selectedClass, searchTerm]);

  // Export current class list to Excel / CSV Spreadsheet
  const exportToExcelCSV = () => {
    if (!selectedClass || filteredStudents.length === 0) {
      alert('No student records found to export for this class selection.');
      return;
    }

    const classNameLabel = selectedClass === 'ALL' ? 'All_Classes' : selectedClass.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Little_House_Students_${classNameLabel}_${timestamp}.csv`;

    const headers = [
      'Sl No',
      'Student Name',
      'Admission Number',
      'Class / Grade',
      'Contact Phone',
      'Email Address',
      'Residential Address',
      'Status',
      'Monthly Reports',
      'Average Attendance'
    ];

    const rows = filteredStudents.map((s, index) => {
      const profile = s.profile;
      const className = profile?.enrollments?.[0]?.class?.name || 'Unassigned';
      const reports = profile?.monthlyReports || [];
      const avgAttendance = reports.length > 0
        ? `${(reports.reduce((acc: number, r: any) => acc + (r.attendancePercentage || 0), 0) / reports.length).toFixed(1)}%`
        : 'N/A';

      return [
        `"${index + 1}"`,
        `"${(profile?.name || '').replace(/"/g, '""')}"`,
        `"${(profile?.admissionNo || '').replace(/"/g, '""')}"`,
        `"${className.replace(/"/g, '""')}"`,
        `"${(profile?.phone || '').replace(/"/g, '""')}"`,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(profile?.address || '').replace(/"/g, '""')}"`,
        `"${activeSubTab === 'ACTIVE' ? 'Active' : 'Archived'}"`,
        `"${reports.length}"`,
        `"${avgAttendance}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Soft Delete / Archive Student
  const executeArchive = async (studentId: string, studentName: string) => {
    setDeletingId(studentId);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`/api/admin/students?id=${studentId}&action=archive`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to archive student.');
      }

      setSuccessMsg(`"${studentName}" has been moved to the Archive / Recycle Bin.`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error archiving student.');
    } finally {
      setDeletingId(null);
    }
  };

  // Restore Student from Archive
  const handleRestore = async (studentId: string, studentName: string) => {
    setRestoringId(studentId);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`/api/admin/students?id=${studentId}&action=restore`, {
        method: 'PATCH',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to restore student.');
      }

      setSuccessMsg(`"${studentName}" has been restored to the Active Roster.`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error restoring student.');
    } finally {
      setRestoringId(null);
    }
  };

  // Hard Delete / Permanent Purge
  const executePurge = async (studentId: string, studentName: string) => {
    setPurgingId(studentId);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`/api/admin/students?id=${studentId}&action=purge`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to permanently delete student.');
      }

      setSuccessMsg(`"${studentName}" has been permanently purged from the database.`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error permanently deleting student.');
    } finally {
      setPurgingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2.5">
            <Users className="h-6 w-6 text-sky-600" />
            <span>Student Management & Class Dossiers</span>
          </h3>
          <p className="text-xs text-slate-500 font-light mt-0.5">
            {selectedClass ? `Viewing roster for ${selectedClass === 'ALL' ? 'All Classes' : selectedClass}` : 'Choose a class below to enter and manage students.'}
          </p>
        </div>

        {/* Tab Buttons: Active vs Archive */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-shrink-0">
          <button
            type="button"
            onClick={() => { setActiveSubTab('ACTIVE'); setSearchTerm(''); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeSubTab === 'ACTIVE'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Roster ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('ARCHIVED'); setSearchTerm(''); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              activeSubTab === 'ARCHIVED'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Archive className="h-3.5 w-3.5 text-amber-600" />
            <span>Archive ({archivedStudents.length})</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-xs text-red-700 font-medium flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-800 font-medium flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: INITIAL SCREEN - CHOOSE THE CLASS FIRST BEFORE SHOWING ROSTER     */}
      {/* ========================================================================= */}
      {!selectedClass ? (
        <div className="space-y-6 animate-fadeIn py-2">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-mono font-bold tracking-widest text-sky-600 uppercase bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              STEP 1: SELECT CLASS
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 pt-2">
              Choose a Class to View Students
            </h4>
            <p className="text-xs text-slate-500 font-light">
              Select any class below to enter its student roster and export records to spreadsheet.
            </p>
          </div>

          {/* Grid of Class Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* All Classes Overview Card */}
            <div
              onClick={() => setSelectedClass('ALL')}
              className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <School className="h-6 w-6 text-white" />
                </div>
                <span className="text-[11px] font-mono font-black bg-white text-indigo-900 px-2.5 py-1 rounded-full shadow-sm">
                  {classCounts['ALL'] || 0} STUDENTS
                </span>
              </div>

              <div className="my-6">
                <h5 className="text-xl font-extrabold tracking-tight">All Classes</h5>
                <p className="text-xs text-sky-100 font-light mt-1">
                  Complete school-wide master student directory across all grades.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-sky-100 group-hover:text-white border-t border-white/20 pt-4">
                <span>Enter Master Roster</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Individual Class Cards */}
            {availableClasses.map((clsName) => {
              const count = classCounts[clsName] || 0;
              return (
                <div
                  key={clsName}
                  onClick={() => setSelectedClass(clsName)}
                  className="bg-white border-2 border-slate-200/80 hover:border-indigo-500 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl transition">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-slate-100 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-700 px-2.5 py-1 rounded-full border border-slate-200 group-hover:border-indigo-200 transition">
                      {count} {count === 1 ? 'Student' : 'Students'}
                    </span>
                  </div>

                  <div className="my-6">
                    <h5 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition">
                      {clsName}
                    </h5>
                    <p className="text-xs text-slate-500 font-light mt-1">
                      View full student profiles, monthly reports, marks, and attendance.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-indigo-600 border-t border-slate-100 pt-4">
                    <span>Open Class Roster</span>
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* STEP 2: ENTERED CLASS ROSTER VIEW (WITH HORIZONTAL CLASS SLIDER & EXPORT) */
        /* ========================================================================= */
        <div className="space-y-6 animate-fadeIn">
          {/* Navigation Bar & Horizontal Class Slide Selector */}
          <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-3xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => { setSelectedClass(null); setSearchTerm(''); }}
                  className="flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-extrabold px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Choose Other Class</span>
                </button>

                <div className="h-4 w-[1px] bg-slate-300" />

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Class:</span>
                  <span className="text-sm font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    {selectedClass === 'ALL' ? 'All Classes' : selectedClass}
                  </span>
                </div>
              </div>

              {/* Quick Export Button in top bar */}
              <button
                type="button"
                onClick={exportToExcelCSV}
                disabled={filteredStudents.length === 0}
                className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
                title="Download CSV for Excel"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Export to Excel</span>
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 🛹 Smooth Horizontal Class Slider Bar */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase flex-shrink-0">
                Slide Classes:
              </span>
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 w-full scroll-smooth">
                <button
                  type="button"
                  onClick={() => setSelectedClass('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 flex-shrink-0 ${
                    selectedClass === 'ALL'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  <span>All Classes</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedClass === 'ALL' ? 'bg-sky-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {classCounts['ALL'] || 0}
                  </span>
                </button>

                {availableClasses.map((clsName) => {
                  const isSelected = selectedClass === clsName;
                  const count = classCounts[clsName] || 0;
                  return (
                    <button
                      key={clsName}
                      type="button"
                      onClick={() => setSelectedClass(clsName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 flex-shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                    >
                      <span>{clsName}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search Bar & Count Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${selectedClass === 'ALL' ? '' : selectedClass + ' '}students by name, roll no...`}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900 placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs text-slate-500 font-mono">
              Showing <strong className="text-slate-900">{filteredStudents.length}</strong> of {currentList.length} total students
            </span>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-mono">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Admission No</th>
                  <th className="px-5 py-3.5">Class</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <Users className="h-10 w-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                      <p className="text-sm font-semibold text-slate-600">
                        {searchTerm 
                          ? 'No students matched your search.' 
                          : `No students currently enrolled in "${selectedClass}".`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Use Offline Enrollment to add students into this class.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const profile = student.profile;
                    const className = profile?.enrollments?.[0]?.class?.name || 'Unassigned';
                    const isDeleting = deletingId === student.id;
                    const isRestoring = restoringId === student.id;
                    const isPurging = purgingId === student.id;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs overflow-hidden flex-shrink-0 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-sky-500 transition"
                              onClick={() => setPreviewPhoto({
                                url: profile?.photoUrl || null,
                                name: profile?.name || 'Student',
                                admissionNo: profile?.admissionNo || null,
                              })}
                              title="Click to view full photo"
                            >
                              {profile?.photoUrl ? (
                                <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                              ) : (
                                profile?.name?.slice(0, 2).toUpperCase() || 'ST'
                              )}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => setSelectedStudentDetail({
                                  id: student.id,
                                  name: profile?.name || 'Unknown Student',
                                  email: student.email,
                                  admissionNo: profile?.admissionNo || null,
                                  photoUrl: profile?.photoUrl || null,
                                  phone: profile?.phone || null,
                                  address: profile?.address || null,
                                  className,
                                  monthlyReports: profile?.monthlyReports || [],
                                  activityDocs: profile?.studentActivityDocs || [],
                                  grades: profile?.studentGrades || [],
                                })}
                                className="font-bold text-slate-900 text-xs hover:text-sky-600 text-left block"
                              >
                                {profile?.name || 'Unknown Student'}
                              </button>
                              <span className="text-[10px] text-slate-400 font-mono block">{student.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                          {profile?.admissionNo ? (
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-slate-800 font-semibold">
                              {profile.admissionNo}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not set</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-medium text-xs">
                          <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md border border-sky-100 font-semibold">
                            {className}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-600 font-mono">
                          <div>{profile?.phone || 'No phone'}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px] font-sans">
                            {profile?.address || 'No address'}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          {activeSubTab === 'ACTIVE' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              Archived
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* View Dossier Button */}
                          <button
                            onClick={() => setSelectedStudentDetail({
                              id: student.id,
                              name: profile?.name || 'Unknown Student',
                              email: student.email,
                              admissionNo: profile?.admissionNo || null,
                              photoUrl: profile?.photoUrl || null,
                              phone: profile?.phone || null,
                              address: profile?.address || null,
                              className,
                              monthlyReports: profile?.monthlyReports || [],
                              activityDocs: profile?.studentActivityDocs || [],
                              grades: profile?.studentGrades || [],
                            })}
                            className="p-1.5 hover:bg-sky-50 text-slate-400 hover:text-sky-600 rounded-lg transition"
                            title="View Full Student Dossier"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {activeSubTab === 'ACTIVE' ? (
                            <>
                              {/* Edit Student Profile */}
                              <button
                                onClick={() => setEditingStudent({
                                  id: student.id,
                                  email: student.email,
                                  name: profile?.name || '',
                                  phone: profile?.phone || '',
                                  address: profile?.address || '',
                                  photoUrl: profile?.photoUrl || null,
                                  admissionNo: profile?.admissionNo || null
                                })}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition"
                                title="Edit Student Profile"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              {/* Soft Delete / Archive Student */}
                              <button
                                onClick={() => setPinPrompt({
                                  studentId: student.id,
                                  studentName: profile?.name || 'Student',
                                  action: 'ARCHIVE',
                                })}
                                disabled={isDeleting}
                                className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition disabled:opacity-50"
                                title="Move to Archive"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                                ) : (
                                  <Archive className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Restore Button */}
                              <button
                                onClick={() => handleRestore(student.id, profile?.name || 'Student')}
                                disabled={isRestoring}
                                className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition disabled:opacity-50"
                                title="Restore to Active Roster"
                              >
                                {isRestoring ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                ) : (
                                  <RotateCcw className="h-4 w-4" />
                                )}
                              </button>

                              {/* Permanent Purge Button */}
                              <button
                                onClick={() => setPinPrompt({
                                  studentId: student.id,
                                  studentName: profile?.name || 'Student',
                                  action: 'PURGE',
                                })}
                                disabled={isPurging}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition disabled:opacity-50"
                                title="Permanently Delete"
                              >
                                {isPurging ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 📊 Bottom Export to Excel Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200/80 bg-slate-50/80 p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center space-x-3 text-xs text-slate-600">
              <span className="font-bold text-slate-900">
                {selectedClass === 'ALL' ? 'Master Student Roster' : `Class: ${selectedClass}`}
              </span>
              <span className="text-slate-300">•</span>
              <span>{filteredStudents.length} student records in this export</span>
            </div>

            {/* Prominent Export to Excel Spreadsheet Button */}
            <button
              type="button"
              onClick={exportToExcelCSV}
              disabled={filteredStudents.length === 0}
              className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition shadow-sm hover:shadow-md cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export {selectedClass === 'ALL' ? 'All Students' : selectedClass} to Excel Spreadsheet (.CSV)</span>
              <Download className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>
        </div>
      )}

      <EditStudentModal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        student={editingStudent}
        onSuccess={() => router.refresh()}
      />

      <StudentPhotoLightbox
        isOpen={!!previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        photoUrl={previewPhoto?.url || null}
        name={previewPhoto?.name || ''}
        admissionNo={previewPhoto?.admissionNo}
      />

      <StudentDetailModal
        isOpen={!!selectedStudentDetail}
        onClose={() => setSelectedStudentDetail(null)}
        student={selectedStudentDetail}
        onEdit={(st) => {
          setSelectedStudentDetail(null);
          setEditingStudent({
            id: st.id,
            email: st.email,
            name: st.name,
            phone: st.phone || '',
            address: st.address || '',
            photoUrl: st.photoUrl,
            admissionNo: st.admissionNo
          });
        }}
      />

      {/* 4-Digit Security PIN Verification for Archival & Permanent Purge */}
      <SecurityPinModal
        isOpen={!!pinPrompt}
        onClose={() => setPinPrompt(null)}
        onSuccess={() => {
          if (pinPrompt) {
            if (pinPrompt.action === 'ARCHIVE') {
              executeArchive(pinPrompt.studentId, pinPrompt.studentName);
            } else if (pinPrompt.action === 'PURGE') {
              executePurge(pinPrompt.studentId, pinPrompt.studentName);
            }
          }
        }}
        title={pinPrompt?.action === 'PURGE' ? "Permanent Purge Authorization" : "Confirm Student Archival"}
        description={
          pinPrompt?.action === 'PURGE'
            ? `Enter your 4-digit Security PIN to permanently delete "${pinPrompt?.studentName || 'Student'}" from the database. This action cannot be undone.`
            : `Enter your 4-digit Security PIN to move "${pinPrompt?.studentName || 'Student'}" to the Archive / Recycle Bin. Past marks and reports remain safe.`
        }
        actionName={pinPrompt?.action === 'PURGE' ? "Authorize Permanent Purge" : "Move to Recycle Bin"}
      />
    </div>
  );
}
