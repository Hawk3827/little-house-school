'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ClipboardList, 
  GraduationCap, 
  CheckCircle2, 
  User, 
  UserPlus,
  BookOpen, 
  Loader2, 
  Save, 
  AlertCircle,
  UploadCloud,
  FileText,
  Trash2,
  Users,
  Edit3,
  Search,
  X,
  Eye,
  Calendar,
  Download,
  ExternalLink,
  Paperclip,
  Camera,
  Image as ImageIcon,
  Zap,
  Archive,
  RotateCcw
} from 'lucide-react';
import EditStudentModal from './EditStudentModal';
import StudentPhotoLightbox from './StudentPhotoLightbox';
import StudentDetailModal, { StudentDetailData, MonthlyReportData, ActivityDocData } from './StudentDetailModal';
import SecurityPinModal from './SecurityPinModal';
import { validateAndProcessUpload } from '@/lib/fileValidationAndCompression';
import { formatDateSafe } from '@/lib/dateUtils';
import { useAutoReconnect } from '@/lib/useAutoReconnect';

interface StudentData {
  id: string;
  name: string;
  email: string;
  admissionNo: string | null;
  phone: string | null;
  address: string | null;
  photoUrl: string | null;
  monthlyReports?: MonthlyReportData[];
  activityDocs?: ActivityDocData[];
  recentAttendance: { date: string; status: string }[];
  recentGrades: { id: string; subject: string; score: number; maxScore: number; remarks: string | null }[];
}

interface ClassData {
  id: string;
  name: string;
  students: StudentData[];
  archivedStudents?: StudentData[];
}

export default function TeacherDashboardConsole({ 
  classes, 
  teacherId 
}: { 
  classes: ClassData[]; 
  teacherId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'nominal' | 'monthly' | 'activities' | 'attendance' | 'grades' | 'bulk' | 'enroll'>('nominal');
  const [nominalRosterTab, setNominalRosterTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [restoringStudentId, setRestoringStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam) {
      if (['nominal', 'monthly', 'activities', 'attendance', 'grades', 'bulk', 'enroll'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }
  }, [tabParam]);

  // Auto-refresh teacher console on mobile wake up and tab focus
  useAutoReconnect(() => {
    router.refresh();
  });

  // State for single student enrollment (Teacher portal)
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollPassword, setEnrollPassword] = useState('student123');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollAddress, setEnrollAddress] = useState('');
  const [enrollPhoto, setEnrollPhoto] = useState<File | null>(null);
  const [enrollPhotoInfo, setEnrollPhotoInfo] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState<any | null>(null);
  const [enrollError, setEnrollError] = useState('');

  const handleEnrollPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEnrollError('');
    const result = await validateAndProcessUpload(file, { allowedTypes: ['image'], maxDimension: 1200, quality: 0.85 });
    if ('error' in result) {
      setEnrollError(result.error);
      e.target.value = '';
      return;
    }
    setEnrollPhoto(result.file);
    if (result.compressionRatio) {
      setEnrollPhotoInfo(`Optimized: ${(result.originalSize / 1024 / 1024).toFixed(1)}MB → ${(result.compressedSize / 1024).toFixed(0)}KB (${result.compressionRatio})`);
    } else {
      setEnrollPhotoInfo(null);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolling(true);
    setEnrollError('');
    setEnrollSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', enrollName);
      formData.append('email', enrollEmail);
      formData.append('password', enrollPassword);
      formData.append('classId', currentClass.id);
      formData.append('phone', enrollPhone);
      formData.append('address', enrollAddress);
      if (enrollPhoto) {
        formData.append('photo', enrollPhoto);
      }

      const response = await fetch('/api/admin/students', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll student.');
      }

      setEnrollSuccess(data.student);
      setEnrollName('');
      setEnrollEmail('');
      setEnrollPhone('');
      setEnrollAddress('');
      setEnrollPhoto(null);
      setEnrollPhotoInfo(null);
      const photoInput = document.getElementById('enroll-photo') as HTMLInputElement;
      if (photoInput) photoInput.value = '';

      router.refresh();
    } catch (err: any) {
      setEnrollError(err.message || 'Something went wrong.');
    } finally {
      setEnrolling(false);
    }
  };

  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string | null; name: string; admissionNo: string | null } | null>(null);
  const [nominalSearchTerm, setNominalSearchTerm] = useState('');
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [monthlySearchTerm, setMonthlySearchTerm] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentDetailData | null>(null);

  // Monthly report upload state
  const [reportStudentId, setReportStudentId] = useState('');
  const [reportMonth, setReportMonth] = useState('August 2026');
  const [reportTotalDays, setReportTotalDays] = useState('22');
  const [reportDaysPresent, setReportDaysPresent] = useState('20');
  const [reportDaysAbsent, setReportDaysAbsent] = useState('2');
  const [reportConduct, setReportConduct] = useState('Excellent');
  const [reportRemarks, setReportRemarks] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportFileInfo, setReportFileInfo] = useState<string | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');

  const handleReportFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportError('');
    const result = await validateAndProcessUpload(file, { allowedTypes: ['pdf', 'image'], maxSizeMB: 20 });
    if ('error' in result) {
      setReportError(result.error);
      e.target.value = '';
      return;
    }
    setReportFile(result.file);
    if (result.compressionRatio) {
      setReportFileInfo(`Optimized: ${(result.originalSize / 1024 / 1024).toFixed(1)}MB → ${(result.compressedSize / 1024).toFixed(0)}KB (${result.compressionRatio})`);
    } else {
      setReportFileInfo(null);
    }
  };

  const handleMonthlyReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportStudentId || !reportMonth) {
      setReportError('Please select a student and specify the month.');
      return;
    }

    setUploadingReport(true);
    setReportError('');
    setReportSuccess('');

    try {
      const formData = new FormData();
      formData.append('studentId', reportStudentId);
      formData.append('month', reportMonth);
      formData.append('totalDays', reportTotalDays);
      formData.append('daysPresent', reportDaysPresent);
      formData.append('daysAbsent', reportDaysAbsent);
      formData.append('conduct', reportConduct);
      formData.append('remarks', reportRemarks);
      if (reportFile) {
        formData.append('file', reportFile);
      }

      const response = await fetch('/api/teacher/monthly-reports', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit monthly report.');
      }

      setReportSuccess(`Monthly report for ${reportMonth} saved successfully!`);
      setReportRemarks('');
      setReportFile(null);
      const fileInput = document.getElementById('report-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      router.refresh();
    } catch (err: any) {
      setReportError(err.message || 'Something went wrong.');
    } finally {
      setUploadingReport(false);
    }
  };

  const handleDeleteMonthlyReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this monthly report?')) return;

    try {
      const response = await fetch(`/api/teacher/monthly-reports?id=${reportId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete report.');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting report.');
    }
  };

  // Activity Photos & Documents Upload state
  const [activityStudentId, setActivityStudentId] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState<'PHOTO' | 'DOCUMENT'>('PHOTO');
  const [activityRemarks, setActivityRemarks] = useState('');
  const [activityFile, setActivityFile] = useState<File | null>(null);
  const [activityFileInfo, setActivityFileInfo] = useState<string | null>(null);
  const [uploadingActivity, setUploadingActivity] = useState(false);
  const [activitySuccess, setActivitySuccess] = useState('');
  const [activityError, setActivityError] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');

  const handleActivityFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActivityError('');
    const result = await validateAndProcessUpload(file, {
      allowedTypes: activityType === 'PHOTO' ? ['image'] : ['pdf', 'image'],
      maxDimension: 1920,
      quality: 0.82,
      maxSizeMB: 20
    });

    if ('error' in result) {
      setActivityError(result.error);
      e.target.value = '';
      return;
    }

    setActivityFile(result.file);
    if (result.compressionRatio) {
      setActivityFileInfo(`Optimized: ${(result.originalSize / 1024 / 1024).toFixed(1)}MB → ${(result.compressedSize / 1024).toFixed(0)}KB (${result.compressionRatio})`);
    } else {
      setActivityFileInfo(null);
    }
  };

  const handleActivityUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityStudentId || !activityTitle.trim() || !activityFile) {
      setActivityError('Please select a student, provide a title, and choose a file.');
      return;
    }

    setUploadingActivity(true);
    setActivityError('');
    setActivitySuccess('');

    try {
      const formData = new FormData();
      formData.append('studentId', activityStudentId);
      formData.append('title', activityTitle.trim());
      formData.append('type', activityType);
      formData.append('remarks', activityRemarks.trim());
      formData.append('file', activityFile);

      const response = await fetch('/api/teacher/activity-docs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload activity.');
      }

      setActivitySuccess(`${activityType === 'PHOTO' ? 'Activity photo' : 'Document'} uploaded successfully!`);
      setActivityTitle('');
      setActivityRemarks('');
      setActivityFile(null);
      const fileInput = document.getElementById('activity-doc-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      router.refresh();
    } catch (err: any) {
      setActivityError(err.message || 'Something went wrong.');
    } finally {
      setUploadingActivity(false);
    }
  };

  const handleDeleteActivityDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this activity record?')) return;

    try {
      const res = await fetch(`/api/teacher/activity-docs?id=${docId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete.');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting activity record.');
    }
  };

  const [deletePinPrompt, setDeletePinPrompt] = useState<{ studentId: string; studentName: string } | null>(null);

  const executeDeleteStudent = async (studentId: string, studentName: string) => {
    setDeletingStudentId(studentId);

    try {
      const response = await fetch(`/api/admin/students?id=${studentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete student.');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Something went wrong while deleting.');
    } finally {
      setDeletingStudentId(null);
      setDeletePinPrompt(null);
    }
  };
  
  // State for bulk import
  const [importType, setImportType] = useState<'attendance' | 'grades'>('attendance');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const [importError, setImportError] = useState('');

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          setImportError('CSV file must contain a header row and at least one data row.');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const parsedRows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          const rowData: any = {};
          headers.forEach((h, idx) => {
            rowData[h] = cols[idx] || '';
          });
          parsedRows.push(rowData);
        }

        if (importType === 'attendance') {
          const hasRequired = parsedRows.every(r => r.email && r.date && r.status);
          if (!hasRequired) {
            setImportError('Attendance CSV must contain headers: email, date, status');
            return;
          }
        } else {
          const hasRequired = parsedRows.every(r => r.email && r.subject && r.score && r.max_score);
          if (!hasRequired) {
            setImportError('Grades CSV must contain headers: email, subject, score, max_score');
            return;
          }
        }

        setBulkPreview(parsedRows);
      } catch (err) {
        setImportError('Failed to parse CSV file. Ensure it is comma-separated.');
      }
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if (bulkPreview.length === 0) {
      setImportError('No data rows to import.');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportSuccess('');

    try {
      const response = await fetch('/api/teacher/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: importType,
          classId: currentClass.id,
          rows: bulkPreview
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload CSV data.');
      }

      if (data.failedCount > 0) {
        const firstErr = data.failures[0].error;
        setImportError(`Imported ${data.importedCount} records. ${data.failedCount} records failed. First error: ${firstErr}`);
      } else {
        setImportSuccess(`Successfully imported all ${data.importedCount} records!`);
        setBulkPreview([]);
        setCsvFile(null);
      }
      router.refresh();
    } catch (err: any) {
      setImportError(err.message || 'Something went wrong during bulk import.');
    } finally {
      setImporting(false);
    }
  };
  
  // State for attendance
  const [attendanceDate, setAttendanceDate] = useState('');
  useEffect(() => {
    setAttendanceDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [attendanceStatuses, setAttendanceStatuses] = useState<{ [studentId: string]: string }>({});
  const [savingAttendanceId, setSavingAttendanceId] = useState<string | null>(null);
  
  // State for grades
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [remarks, setRemarks] = useState('');
  const [savingGrade, setSavingGrade] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState(false);
  const [gradeError, setGradeError] = useState('');

  const currentClass = classes[selectedClassIndex];

  const handleRestoreStudent = async (studentId: string, studentName: string) => {
    setRestoringStudentId(studentId);
    try {
      const response = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action: 'RESTORE' })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to restore student.');
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Something went wrong while restoring student.');
    } finally {
      setRestoringStudentId(null);
    }
  };

  const filteredNominalStudents = useMemo(() => {
    if (!currentClass) return [];
    const sourceList = nominalRosterTab === 'ACTIVE' 
      ? (currentClass.students || []) 
      : (currentClass.archivedStudents || []);

    if (!nominalSearchTerm.trim()) return sourceList;
    const query = nominalSearchTerm.toLowerCase().trim();

    return sourceList.filter((student) => {
      const name = student.name?.toLowerCase() || '';
      const email = student.email?.toLowerCase() || '';
      const admissionNo = student.admissionNo?.toLowerCase() || '';
      const phone = student.phone?.toLowerCase() || '';
      const address = student.address?.toLowerCase() || '';

      return (
        name.includes(query) ||
        email.includes(query) ||
        admissionNo.includes(query) ||
        phone.includes(query) ||
        address.includes(query)
      );
    });
  }, [currentClass, nominalSearchTerm, nominalRosterTab]);

  const filteredAttendanceStudents = useMemo(() => {
    if (!currentClass) return [];
    if (!attendanceSearchTerm.trim()) return currentClass.students;
    const query = attendanceSearchTerm.toLowerCase().trim();

    return currentClass.students.filter((student) => {
      const name = student.name?.toLowerCase() || '';
      const email = student.email?.toLowerCase() || '';
      const admissionNo = student.admissionNo?.toLowerCase() || '';

      return (
        name.includes(query) ||
        email.includes(query) ||
        admissionNo.includes(query)
      );
    });
  }, [currentClass, attendanceSearchTerm]);

  const allClassMonthlyReports = useMemo(() => {
    if (!currentClass) return [];
    const list: { report: MonthlyReportData; student: StudentData }[] = [];
    currentClass.students.forEach((st) => {
      st.monthlyReports?.forEach((rep) => {
        list.push({ report: rep, student: st });
      });
    });
    return list;
  }, [currentClass]);

  const filteredClassMonthlyReports = useMemo(() => {
    if (!monthlySearchTerm.trim()) return allClassMonthlyReports;
    const q = monthlySearchTerm.toLowerCase().trim();
    return allClassMonthlyReports.filter(
      ({ report, student }) =>
        student.name.toLowerCase().includes(q) ||
        (student.admissionNo && student.admissionNo.toLowerCase().includes(q)) ||
        report.month.toLowerCase().includes(q) ||
        (report.conduct && report.conduct.toLowerCase().includes(q))
    );
  }, [allClassMonthlyReports, monthlySearchTerm]);

  const allClassActivities = useMemo(() => {
    if (!currentClass) return [];
    const list: { activity: ActivityDocData; student: StudentData }[] = [];
    currentClass.students.forEach((st) => {
      st.activityDocs?.forEach((act) => {
        list.push({ activity: act, student: st });
      });
    });
    return list;
  }, [currentClass]);

  const filteredClassActivities = useMemo(() => {
    if (!activitySearchTerm.trim()) return allClassActivities;
    const q = activitySearchTerm.toLowerCase().trim();
    return allClassActivities.filter(
      ({ activity, student }) =>
        student.name.toLowerCase().includes(q) ||
        (student.admissionNo && student.admissionNo.toLowerCase().includes(q)) ||
        activity.title.toLowerCase().includes(q) ||
        (activity.remarks && activity.remarks.toLowerCase().includes(q))
    );
  }, [allClassActivities, activitySearchTerm]);

  // Handle marking single attendance
  const markAttendance = async (studentId: string, status: string) => {
    setSavingAttendanceId(studentId);
    
    // Optimistic UI update
    setAttendanceStatuses(prev => ({
      ...prev,
      [`${studentId}_${attendanceDate}`]: status
    }));

    try {
      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          date: attendanceDate,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record attendance');
      }

      router.refresh();
    } catch (err) {
      alert('Error saving attendance. Please try again.');
      // Revert state
      setAttendanceStatuses(prev => {
        const copy = { ...prev };
        delete copy[`${studentId}_${attendanceDate}`];
        return copy;
      });
    } finally {
      setSavingAttendanceId(null);
    }
  };

  // Handle grade submission
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setGradeError('Please select a student.');
      return;
    }
    
    setSavingGrade(true);
    setGradeError('');
    setGradeSuccess(false);

    try {
      const response = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          subject,
          score: parseFloat(score),
          maxScore: parseFloat(maxScore),
          remarks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit grade.');
      }

      setGradeSuccess(true);
      setScore('');
      setRemarks('');
      router.refresh();
      setTimeout(() => setGradeSuccess(false), 3000);
    } catch (err: any) {
      setGradeError(err.message || 'Something went wrong.');
    } finally {
      setSavingGrade(false);
    }
  };

  if (classes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
        You are not currently assigned as a homeroom teacher to any classes.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Class Selector Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <label htmlFor="class-select" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Select Class</label>
          <select
            id="class-select"
            value={selectedClassIndex}
            onChange={(e) => {
              setSelectedClassIndex(parseInt(e.target.value));
              setSelectedStudentId('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 font-semibold w-48"
          >
            {classes.map((cls, idx) => (
              <option key={cls.id} value={idx}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Buttons (Horizontally scrollable on mobile) */}
        <div className="flex items-center overflow-x-auto max-w-full bg-gray-100 p-1.5 rounded-2xl gap-1.5 scroll-smooth no-scrollbar">
          <button
            onClick={() => setActiveTab('nominal')}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'nominal'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Nominal Roll</span>
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'monthly'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Monthly Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'activities'
                ? 'bg-white text-indigo-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Activities & Docs</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'attendance'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Daily Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'grades'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Upload Grades</span>
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'bulk'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={() => setActiveTab('enroll')}
            className={`flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              activeTab === 'enroll'
                ? 'bg-white text-blue-600 shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Tab 0: Nominal Roll Panel */}
      {activeTab === 'nominal' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900">Class Nominal Roll: {currentClass.name}</h3>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {filteredNominalStudents.length} of {nominalRosterTab === 'ACTIVE' ? (currentClass.students?.length || 0) : (currentClass.archivedStudents?.length || 0)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Master list of enrolled students containing profile and contact details.</p>
            </div>

            {/* Active vs Recycle Bin Sub-Tab Switcher */}
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => { setNominalRosterTab('ACTIVE'); setNominalSearchTerm(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  nominalRosterTab === 'ACTIVE'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Active ({currentClass.students?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => { setNominalRosterTab('ARCHIVED'); setNominalSearchTerm(''); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  nominalRosterTab === 'ARCHIVED'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Archive className="h-3.5 w-3.5 text-amber-600" />
                <span>Recycle Bin ({currentClass.archivedStudents?.length || 0})</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={nominalSearchTerm}
                onChange={(e) => setNominalSearchTerm(e.target.value)}
                placeholder={`Search ${nominalRosterTab === 'ACTIVE' ? 'class' : 'archived'} students...`}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition placeholder-gray-400 text-gray-800"
              />
              {nominalSearchTerm && (
                <button
                  onClick={() => setNominalSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {filteredNominalStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-gray-400 font-light">
                      {nominalSearchTerm ? (
                        `No students in ${currentClass.name} match your search "${nominalSearchTerm}".`
                      ) : nominalRosterTab === 'ACTIVE' ? (
                        'No active students currently enrolled in this class.'
                      ) : (
                        <div className="space-y-1">
                          <Archive className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                          <p className="font-semibold text-gray-600">Recycle Bin is Empty for {currentClass.name}</p>
                          <p className="text-[11px] text-gray-400">Archived or soft-deleted students will appear here safely preserving their past grades and attendance.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredNominalStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900 flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto({
                            url: student.photoUrl,
                            name: student.name,
                            admissionNo: student.admissionNo
                          })}
                          className="relative group focus:outline-none cursor-pointer"
                          title="Click to view full photo"
                        >
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-250 group-hover:ring-2 group-hover:ring-indigo-500 transition transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase border border-blue-150 group-hover:ring-2 group-hover:ring-indigo-500 transition transform group-hover:scale-105">
                              {student.name.slice(0, 2)}
                            </div>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentDetail({
                            id: student.id,
                            name: student.name,
                            email: student.email,
                            admissionNo: student.admissionNo,
                            photoUrl: student.photoUrl,
                            phone: student.phone,
                            address: student.address,
                            className: currentClass.name,
                            monthlyReports: student.monthlyReports || [],
                            activityDocs: student.activityDocs || [],
                            grades: student.recentGrades || []
                          })}
                          className="font-semibold text-gray-900 hover:text-indigo-600 hover:underline transition text-left"
                          title="Click to view full student report & dossier"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-bold text-indigo-650">{student.admissionNo || '-'}</td>
                      <td className="py-3 px-4 text-xs font-mono">{student.email}</td>
                      <td className="py-3 px-4 text-xs">{student.phone || '-'}</td>
                      <td className="py-3 px-4 text-xs max-w-xs truncate" title={student.address || ''}>
                        {student.address || '-'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {/* View Full History & Report Cards */}
                        <button
                          onClick={() => setSelectedStudentDetail({
                            id: student.id,
                            name: student.name,
                            email: student.email,
                            admissionNo: student.admissionNo,
                            photoUrl: student.photoUrl,
                            phone: student.phone,
                            address: student.address,
                            className: currentClass.name,
                            monthlyReports: student.monthlyReports || [],
                            activityDocs: student.activityDocs || [],
                            grades: student.recentGrades || []
                          })}
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-lg transition inline-flex items-center"
                          title="View Full Profile, Grades & Monthly Reports"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {nominalRosterTab === 'ACTIVE' ? (
                          <>
                            <button
                              onClick={() => setEditingStudent({
                                id: student.id,
                                email: student.email,
                                name: student.name,
                                phone: student.phone || '',
                                address: student.address || '',
                                photoUrl: student.photoUrl || null,
                                admissionNo: student.admissionNo
                              })}
                              className="text-blue-500 hover:text-blue-750 hover:bg-blue-50 p-1.5 rounded-lg transition inline-flex items-center"
                              title="Edit Student details"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletePinPrompt({ studentId: student.id, studentName: student.name })}
                              disabled={deletingStudentId === student.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition disabled:opacity-50 inline-flex items-center"
                              title="Move to Recycle Bin / Archive (Requires Security PIN)"
                            >
                              {deletingStudentId === student.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        ) : (
                          /* Archived Student Actions: 1-Click Restore */
                          <button
                            onClick={() => handleRestoreStudent(student.id, student.name)}
                            disabled={restoringStudentId === student.id}
                            className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition font-bold text-xs inline-flex items-center space-x-1 border border-emerald-200"
                            title="Restore student to Active Class Roster"
                          >
                            {restoringStudentId === student.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                            <span>Restore</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Monthly Reports & Consolidated Attendance Panel */}
      {activeTab === 'monthly' && (
        <div className="space-y-8">
          {/* Top Form: Upload / Save Monthly Report */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Upload Monthly Attendance & Student Evaluation Report</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Consolidate student working days, attendance, conduct evaluation, and attach report cards (PDF/Images) once per month.
              </p>
            </div>

            {reportError && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-700 font-medium flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{reportError}</span>
              </div>
            )}

            {reportSuccess && (
              <div className="bg-green-50 border border-green-200 p-3.5 rounded-xl text-xs text-green-700 font-medium flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{reportSuccess}</span>
              </div>
            )}

            <form onSubmit={handleMonthlyReportSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Select Student */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Student *
                  </label>
                  <select
                    required
                    value={reportStudentId}
                    onChange={(e) => setReportStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
                  >
                    <option value="">-- Choose Student --</option>
                    {currentClass.students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.admissionNo || 'No ID'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select / Enter Month */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Report Month *
                  </label>
                  <input
                    type="text"
                    required
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    placeholder="e.g. August 2026"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
                  />
                </div>

                {/* Conduct */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Student Conduct
                  </label>
                  <select
                    value={reportConduct}
                    onChange={(e) => setReportConduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Satisfactory">Satisfactory</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>

              {/* Attendance Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Total Working Days *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={reportTotalDays}
                    onChange={(e) => {
                      const total = parseInt(e.target.value || '0', 10);
                      setReportTotalDays(e.target.value);
                      const pres = parseInt(reportDaysPresent || '0', 10);
                      if (pres > total) setReportDaysPresent(String(total));
                      setReportDaysAbsent(String(Math.max(0, total - pres)));
                    }}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Days Present *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={reportTotalDays || '31'}
                    required
                    value={reportDaysPresent}
                    onChange={(e) => {
                      const pres = parseInt(e.target.value || '0', 10);
                      setReportDaysPresent(e.target.value);
                      const total = parseInt(reportTotalDays || '0', 10);
                      setReportDaysAbsent(String(Math.max(0, total - pres)));
                    }}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Days Absent
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reportDaysAbsent}
                    onChange={(e) => setReportDaysAbsent(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                  />
                </div>
              </div>

              {/* Evaluation Remarks */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teacher Remarks & Academic Evaluation
                </label>
                <textarea
                  rows={3}
                  value={reportRemarks}
                  onChange={(e) => setReportRemarks(e.target.value)}
                  placeholder="e.g. Excellent progress in Mathematics and Science. Demonstrates proactive participation in class discussions."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Attach Report Card / Document (PDF, JPG, PNG)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    id="report-file-input"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={handleReportFileSelect}
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {reportFile && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{reportFile.name}</span>
                      </span>
                      {reportFileInfo && (
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono font-medium flex items-center space-x-1">
                          <Zap className="h-3 w-3 text-indigo-600 animate-pulse" />
                          <span>{reportFileInfo}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-mono">Supported formats: PDF, JPG, PNG, WEBP (Smartphone photos auto-compressed)</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploadingReport}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
                >
                  {uploadingReport ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading Report...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Monthly Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Table: Submitted Monthly Reports Log */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-gray-900">Submitted Monthly Reports Log: {currentClass.name}</h3>
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    {filteredClassMonthlyReports.length} reports
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Review all monthly attendance submissions and uploaded report documents for this class.</p>
              </div>

              {/* Search input */}
              <div className="relative max-w-xs w-full">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={monthlySearchTerm}
                  onChange={(e) => setMonthlySearchTerm(e.target.value)}
                  placeholder="Filter monthly reports..."
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition placeholder-gray-400 text-gray-800"
                />
                {monthlySearchTerm && (
                  <button
                    onClick={() => setMonthlySearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    title="Clear filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Attendance Rate</th>
                    <th className="py-3 px-4">Conduct</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4">Report File</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-600">
                  {filteredClassMonthlyReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-gray-400 font-light">
                        {monthlySearchTerm
                          ? `No monthly reports match "${monthlySearchTerm}".`
                          : 'No monthly reports uploaded for this class yet. Use the form above to submit.'}
                      </td>
                    </tr>
                  ) : (
                    filteredClassMonthlyReports.map(({ report, student }) => {
                      const pct = report.totalDays > 0 ? Math.round((report.daysPresent / report.totalDays) * 100) : 0;
                      return (
                        <tr key={report.id} className="hover:bg-gray-50 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2.5">
                              <button
                                type="button"
                                onClick={() => setSelectedStudentDetail({
                                  id: student.id,
                                  name: student.name,
                                  email: student.email,
                                  admissionNo: student.admissionNo,
                                  photoUrl: student.photoUrl,
                                  phone: student.phone,
                                  address: student.address,
                                  className: currentClass.name,
                                  monthlyReports: student.monthlyReports || [],
                                  grades: student.recentGrades || []
                                })}
                                className="font-bold text-xs text-gray-900 hover:text-indigo-600 hover:underline text-left"
                              >
                                {student.name}
                              </button>
                              <span className="text-[10px] font-mono text-gray-400">({student.admissionNo || '-'})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-xs text-gray-800">{report.month}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-bold ${pct >= 85 ? 'text-green-600' : pct >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {pct}%
                              </span>
                              <span className="text-[10px] text-gray-400">({report.daysPresent}/{report.totalDays} days)</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {report.conduct && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {report.conduct}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate" title={report.remarks || ''}>
                            {report.remarks || '-'}
                          </td>
                          <td className="py-3 px-4">
                            {report.attachmentUrl ? (
                              <a
                                href={report.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
                              >
                                <Paperclip className="h-3.5 w-3.5" />
                                <span>{report.attachmentName || 'View'}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => setSelectedStudentDetail({
                                id: student.id,
                                name: student.name,
                                email: student.email,
                                admissionNo: student.admissionNo,
                                photoUrl: student.photoUrl,
                                phone: student.phone,
                                address: student.address,
                                className: currentClass.name,
                                monthlyReports: student.monthlyReports || [],
                                activityDocs: student.activityDocs || [],
                                grades: student.recentGrades || []
                              })}
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1.5 rounded-lg transition inline-flex items-center"
                              title="View Full Profile & Reports"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMonthlyReport(report.id)}
                              className="text-red-500 hover:text-red-750 hover:bg-red-50 p-1.5 rounded-lg transition inline-flex items-center"
                              title="Delete Monthly Report"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Student Activities & Documents Upload Panel */}
      {activeTab === 'activities' && (
        <div className="space-y-8">
          {/* Top Form: Upload Student Activity / Document */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Upload Student Activity Photos & Related Documents</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload photos of student classroom activities, event participation, certificates, or documents with evaluation remarks to their profile.
              </p>
            </div>

            {activityError && (
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-700 font-medium flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{activityError}</span>
              </div>
            )}

            {activitySuccess && (
              <div className="bg-green-50 border border-green-200 p-3.5 rounded-xl text-xs text-green-700 font-medium flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{activitySuccess}</span>
              </div>
            )}

            <form onSubmit={handleActivityUpload} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Select Student */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Student *
                  </label>
                  <select
                    required
                    value={activityStudentId}
                    onChange={(e) => setActivityStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
                  >
                    <option value="">-- Choose Student --</option>
                    {currentClass.students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.admissionNo || 'No ID'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upload Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Upload Type *
                  </label>
                  <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActivityType('PHOTO')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                        activityType === 'PHOTO'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Activity Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityType('DOCUMENT')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                        activityType === 'DOCUMENT'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Document</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Activity Title / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    placeholder={activityType === 'PHOTO' ? "e.g. Science Exhibition Model" : "e.g. Math Olympiad Certificate"}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
                  />
                </div>
              </div>

              {/* Teacher Remarks / Assessment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Teacher Remarks & Performance Notes
                </label>
                <textarea
                  rows={3}
                  value={activityRemarks}
                  onChange={(e) => setActivityRemarks(e.target.value)}
                  placeholder="e.g. Aarav demonstrated exceptional scientific curiosity while presenting the renewable energy project."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-gray-800"
                />
              </div>

              {/* File input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Choose File ({activityType === 'PHOTO' ? 'Image: JPG, PNG, WEBP' : 'Document: PDF, JPG, PNG'}) *
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    id="activity-doc-file-input"
                    type="file"
                    required
                    accept={activityType === 'PHOTO' ? "image/jpeg,image/png,image/webp" : "application/pdf,image/jpeg,image/png,image/webp"}
                    onChange={handleActivityFileSelect}
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {activityFile && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{activityFile.name}</span>
                      </span>
                      {activityFileInfo && (
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono font-medium flex items-center space-x-1">
                          <Zap className="h-3 w-3 text-indigo-600 animate-pulse" />
                          <span>{activityFileInfo}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-mono">
                  {activityType === 'PHOTO' ? 'Standard photo formats (Smartphone photos auto-compressed)' : 'PDF documents or photo scans (Word .docx not supported)'}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploadingActivity}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
                >
                  {uploadingActivity ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading to Profile...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>Upload to Student Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom List: Uploaded Activities & Documents Log */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-gray-900">Student Activities & Documents: {currentClass.name}</h3>
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    {filteredClassActivities.length} items
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Classroom photos and uploaded student documents visible in student profile and parent portal.</p>
              </div>

              {/* Search input */}
              <div className="relative max-w-xs w-full">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  placeholder="Filter activities..."
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition placeholder-gray-400 text-gray-800"
                />
                {activitySearchTerm && (
                  <button
                    onClick={() => setActivitySearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    title="Clear filter"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {filteredClassActivities.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Camera className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No activity photos or documents uploaded yet.</p>
                <p className="text-xs text-gray-400 mt-1">Use the upload form above to add photos or documents with remarks for your students.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClassActivities.map(({ activity, student }) => (
                  <div 
                    key={activity.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-200 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Media header */}
                      {activity.type === 'PHOTO' ? (
                        <div 
                          onClick={() => setPreviewPhoto({
                            url: activity.fileUrl,
                            name: student.name,
                            admissionNo: student.admissionNo
                          })}
                          className="relative aspect-video w-full bg-black/10 overflow-hidden cursor-pointer group"
                        >
                          <img
                            src={activity.fileUrl}
                            alt={activity.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs font-bold text-white">
                            Zoom Photo
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-indigo-50/60 border-b border-indigo-100/50 flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Document</span>
                            <h4 className="text-xs font-bold text-gray-900 truncate">{activity.title}</h4>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentDetail({
                              id: student.id,
                              name: student.name,
                              email: student.email,
                              admissionNo: student.admissionNo,
                              photoUrl: student.photoUrl,
                              phone: student.phone,
                              address: student.address,
                              className: currentClass.name,
                              monthlyReports: student.monthlyReports || [],
                              activityDocs: student.activityDocs || [],
                              grades: student.recentGrades || []
                            })}
                            className="font-bold text-xs text-gray-900 hover:text-indigo-600 hover:underline text-left"
                          >
                            {student.name}
                          </button>
                          <span className="text-[10px] font-mono text-gray-400">({student.admissionNo || '-'})</span>
                        </div>

                        {activity.type === 'PHOTO' && (
                          <h5 className="text-xs font-semibold text-gray-800">{activity.title}</h5>
                        )}

                        {activity.remarks && (
                          <p className="text-[11px] text-gray-600 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            &ldquo;{activity.remarks}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                      <a
                        href={activity.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>

                      <button
                        onClick={() => handleDeleteActivityDoc(activity.id)}
                        className="text-red-500 hover:text-red-750 p-1 rounded-lg hover:bg-red-50 transition"
                        title="Delete Activity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Attendance Panel */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-gray-900">Attendance Register: {currentClass.name}</h3>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {filteredAttendanceStudents.length} of {currentClass.students.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Attendance states update in real-time as you select options.</p>
            </div>
            
            {/* Search & Date Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative w-48 sm:w-56">
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={attendanceSearchTerm}
                  onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                  placeholder="Filter students..."
                  className="w-full pl-8 pr-7 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
                />
                {attendanceSearchTerm && (
                  <button
                    onClick={() => setAttendanceSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    title="Clear filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Date input */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-500">Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Status Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {filteredAttendanceStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-gray-400 font-light">
                      {attendanceSearchTerm
                        ? `No students match your filter "${attendanceSearchTerm}".`
                        : 'No students enrolled in this class.'}
                    </td>
                  </tr>
                ) : (
                  filteredAttendanceStudents.map((student) => {
                  // Find current selected date attendance in local state or fall back to mock database history
                  const storedRecord = student.recentAttendance.find(
                    r => new Date(r.date).toISOString().split('T')[0] === attendanceDate
                  );
                  const currentStatus = attendanceStatuses[`${student.id}_${attendanceDate}`] || storedRecord?.status || '';

                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900 flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setPreviewPhoto({
                            url: student.photoUrl,
                            name: student.name,
                            admissionNo: student.admissionNo
                          })}
                          className="relative group focus:outline-none cursor-pointer"
                          title="Click to view full photo"
                        >
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-250 group-hover:ring-2 group-hover:ring-indigo-500 transition transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase border border-blue-150 group-hover:ring-2 group-hover:ring-indigo-500 transition transform group-hover:scale-105">
                              {student.name.slice(0, 2)}
                            </div>
                          )}
                        </button>
                        <span>{student.name}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-bold text-indigo-600">{student.admissionNo || '-'}</td>
                      <td className="py-3 px-4 text-xs font-mono">{student.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-4">
                          {savingAttendanceId === student.id ? (
                            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          ) : (
                            <>
                              <button
                                onClick={() => markAttendance(student.id, 'PRESENT')}
                                className={`px-3 py-1 rounded text-xs font-bold transition border ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-600'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => markAttendance(student.id, 'ABSENT')}
                                className={`px-3 py-1 rounded text-xs font-bold transition border ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-600'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => markAttendance(student.id, 'LATE')}
                                className={`px-3 py-1 rounded text-xs font-bold transition border ${
                                  currentStatus === 'LATE'
                                    ? 'bg-yellow-100 text-yellow-850 border-yellow-200'
                                    : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-600'
                                }`}
                              >
                                Late
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Grades Upload Panel */}
      {activeTab === 'grades' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grade submission form */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <span>Input Grades</span>
            </h3>

            {gradeSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center space-x-2 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Grade recorded successfully!</span>
              </div>
            )}

            {gradeError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 text-xs text-red-700">
                {gradeError}
              </div>
            )}

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label htmlFor="student-select" className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Student</label>
                <select
                  id="student-select"
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select student --</option>
                  {currentClass.students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="grade-subject" className="block text-xs font-bold text-gray-700 uppercase mb-1">Subject</label>
                <select
                  id="grade-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English Literature">English Literature</option>
                  <option value="History">History</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="grade-score" className="block text-xs font-bold text-gray-700 uppercase mb-1">Score Obtained</label>
                  <input
                    id="grade-score"
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 85"
                  />
                </div>
                <div>
                  <label htmlFor="grade-max" className="block text-xs font-bold text-gray-700 uppercase mb-1">Max Score</label>
                  <input
                    id="grade-max"
                    type="number"
                    required
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="grade-remarks" className="block text-xs font-bold text-gray-700 uppercase mb-1">Remarks</label>
                <textarea
                  id="grade-remarks"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Excellent work on midterms"
                />
              </div>

              <button
                type="submit"
                disabled={savingGrade}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
              >
                {savingGrade ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Record Grade</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Student grade lists overview */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span>Recent Student Performance Logs</span>
            </h3>

            <div className="space-y-6">
              {currentClass.students.map((student) => (
                <div key={student.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-[10px] uppercase">
                        {student.name.slice(0, 2)}
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{student.name}</h4>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                      {student.admissionNo || 'No ADM #'}
                    </span>
                  </div>

                  {student.recentGrades.length === 0 ? (
                    <p className="text-xs text-gray-400">No grades registered yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {student.recentGrades.slice(0, 4).map((grade) => (
                        <div key={grade.id} className="bg-gray-50 border border-gray-100 p-2.5 rounded-lg space-y-1">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-gray-700">{grade.subject}</span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                              {grade.score}/{grade.maxScore}
                            </span>
                          </div>
                          {grade.remarks && (
                            <p className="text-[10px] text-gray-500 italic mt-1 font-medium">
                              &quot;{grade.remarks}&quot;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bulk CSV Import Panel */}
      {activeTab === 'bulk' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Bulk CSV Importer</h3>
            <p className="text-xs text-gray-500 mt-1">Upload records in bulk using a CSV file. Select what data you want to import below.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-6 text-left h-fit">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Import Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImportType('attendance');
                      setBulkPreview([]);
                      setCsvFile(null);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      importType === 'attendance'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportType('grades');
                      setBulkPreview([]);
                      setCsvFile(null);
                    }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      importType === 'grades'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Grades
                  </button>
                </div>
              </div>

              {/* Template Guidelines */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-gray-800 block">📄 CSV Template Requirements:</span>
                <div className="text-gray-500 leading-relaxed font-light">
                  {importType === 'attendance' ? (
                    <>
                      Headers must be: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-[10px]">email,date,status</code>
                      <br /><br />
                      Example:<br />
                      <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px] block mt-1 whitespace-pre">
                        email,date,status{"\n"}
                        student1@school.com,2026-09-09,PRESENT{"\n"}
                        student2@school.com,2026-09-09,ABSENT
                      </code>
                    </>
                  ) : (
                    <>
                      Headers must be: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">email,subject,score,max_score,remarks</code>
                      <br /><br />
                      Example:<br />
                      <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px] block mt-1 whitespace-pre">
                        email,subject,score,max_score,remarks{"\n"}
                        student1@school.com,Mathematics,24,25,Excellent progress!{"\n"}
                        student2@school.com,Science,19,25,Needs more focus.
                      </code>
                    </>
                  )}
                </div>
              </div>

              {/* File input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase">Select CSV File</label>
                <div className="border border-dashed border-gray-300 rounded-xl p-4 bg-white hover:bg-gray-50 transition cursor-pointer text-center relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center space-y-1 text-gray-500">
                    <UploadCloud className="h-6 w-6 text-gray-400" />
                    <span className="text-xs font-semibold">{csvFile ? csvFile.name : 'Choose a CSV file...'}</span>
                    <span className="text-[10px] text-gray-400 font-light">Max size 2MB</span>
                  </div>
                </div>
              </div>

              {importError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 text-xs text-red-700 font-medium">
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="bg-green-50 border-l-4 border-green-400 p-3 text-xs text-green-700 font-medium">
                  {importSuccess}
                </div>
              )}

              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={importing || bulkPreview.length === 0}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Upload & Import</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-4 text-left">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span>Import Preview ({bulkPreview.length} rows detected)</span>
              </h3>

              {bulkPreview.length === 0 ? (
                <div className="py-24 text-center text-xs text-gray-400 font-light">
                  Select a CSV file to preview your data before importing.
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="min-w-full divide-y divide-gray-100 text-xs">
                    <thead>
                      <tr className="bg-gray-50 font-bold text-gray-500 uppercase">
                        {Object.keys(bulkPreview[0]).map((key) => (
                          <th key={key} className="py-2.5 px-4">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-600">
                      {bulkPreview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          {Object.values(row).map((val: any, colIdx) => (
                            <td key={colIdx} className="py-2.5 px-4 font-medium">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Enroll Student Panel */}
      {activeTab === 'enroll' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900">Offline Class Enrollment: {currentClass.name}</h3>
            <p className="text-xs text-gray-500 mt-1">Register a new student directly into your homeroom class roster.</p>
          </div>

          <div className="max-w-2xl mx-auto bg-gray-50 border border-gray-150 p-6 rounded-2xl space-y-6 text-left">
            {enrollSuccess && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-green-700 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Student Enrolled Successfully!</span>
                </div>
                <div className="text-xs text-green-600 font-medium space-y-1">
                  <p>🎓 <strong className="text-green-800">Admission Number:</strong> {enrollSuccess.admissionNo}</p>
                  <p>👤 <strong>Name:</strong> {enrollSuccess.name}</p>
                  <p>📧 <strong>Email (Login):</strong> {enrollSuccess.email}</p>
                  <p>🏫 <strong>Assigned Class:</strong> {enrollSuccess.className}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEnrollSuccess(null)}
                  className="text-[10px] text-green-700 font-bold underline hover:text-green-800"
                >
                  Dismiss
                </button>
              </div>
            )}

            {enrollError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 text-xs text-red-700 font-medium flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{enrollError}</span>
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="teacher-student-name" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Student Full Name</label>
                  <input
                    id="teacher-student-name"
                    type="text"
                    required
                    value={enrollName}
                    onChange={(e) => setEnrollName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="teacher-student-email" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Email Address (Login ID)</label>
                  <input
                    id="teacher-student-email"
                    type="email"
                    required
                    value={enrollEmail}
                    onChange={(e) => setEnrollEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                    placeholder="e.g. student@school.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Class Roster</label>
                  <input
                    type="text"
                    disabled
                    value={currentClass.name}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-150 font-bold text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="teacher-student-password" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Login Password</label>
                  <input
                    id="teacher-student-password"
                    type="text"
                    required
                    value={enrollPassword}
                    onChange={(e) => setEnrollPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="teacher-student-phone" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Parent Contact Number (Optional)</label>
                  <input
                    id="teacher-student-phone"
                    type="tel"
                    value={enrollPhone}
                    onChange={(e) => setEnrollPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label htmlFor="teacher-student-address" className="block text-gray-400 uppercase tracking-wider mb-1 text-[10px]">Home Address (Optional)</label>
                  <input
                    id="teacher-student-address"
                    type="text"
                    value={enrollAddress}
                    onChange={(e) => setEnrollAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                    placeholder="e.g. Imphal, Manipur"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="enroll-photo" className="block text-gray-700 uppercase tracking-wider mb-1 text-[10px] font-bold">Student Photo (Optional)</label>
                <div className="space-y-1.5">
                  <input
                    id="enroll-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleEnrollPhotoSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800"
                  />
                  {enrollPhoto && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{enrollPhoto.name}</span>
                      </span>
                      {enrollPhotoInfo && (
                        <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono font-medium flex items-center space-x-1">
                          <Zap className="h-3 w-3 text-indigo-600 animate-pulse" />
                          <span>{enrollPhotoInfo}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">JPG, PNG, WEBP (Smartphone photos auto-compressed)</p>
              </div>

              <button
                type="submit"
                disabled={enrolling}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition disabled:opacity-50"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Register Student to Class</span>
                  </>
                )}
              </button>
            </form>
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

      {/* 4-Digit Security PIN Verification for Student Deletion in Teacher Console */}
      <SecurityPinModal
        isOpen={!!deletePinPrompt}
        onClose={() => setDeletePinPrompt(null)}
        onSuccess={() => {
          if (deletePinPrompt) {
            executeDeleteStudent(deletePinPrompt.studentId, deletePinPrompt.studentName);
          }
        }}
        title="Confirm Student Deletion"
        description={`To protect classroom records from accidental deletion, enter your 4-digit Security PIN to permanently delete "${deletePinPrompt?.studentName || 'Student'}".`}
        actionName="Authorize & Delete"
      />
    </div>
  );
}
