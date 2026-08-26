'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminAnnouncementForm from '@/components/AdminAnnouncementForm';
import AdminStudentEnrollForm from '@/components/AdminStudentEnrollForm';
import AdminTeacherManagement from '@/components/AdminTeacherManagement';
import AdminStudentsList from '@/components/AdminStudentsList';
import AdminAdmissionsList from '@/components/AdminAdmissionsList';
import AdminGalleryManagement from '@/components/AdminGalleryManagement';
import AdminBackupManagement from '@/components/AdminBackupManagement';
import AdminFeeManagement from '@/components/AdminFeeManagement';
import AdminOnlinePayments from '@/components/AdminOnlinePayments';
import AdminAnalyticsManagement from '@/components/AdminAnalyticsManagement';
import { 
  LayoutDashboard,
  Users, 
  UserCheck, 
  UserPlus, 
  CreditCard, 
  DollarSign, 
  Camera, 
  Megaphone, 
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  School,
  Database,
  Trash2,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { formatDateSafe } from '@/lib/dateUtils';
import { useAutoReconnect } from '@/lib/useAutoReconnect';

interface AdminDashboardConsoleProps {
  studentsCount: number;
  teachersCount: number;
  classes: any[];
  teachers: any[];
  students: any[];
  archivedStudents?: any[];
  admissions: any[];
  announcements: any[];
  galleryItems: any[];
}

export default function AdminDashboardConsole({
  studentsCount,
  teachersCount,
  classes,
  teachers,
  students,
  archivedStudents = [],
  admissions,
  announcements: initialAnnouncements,
  galleryItems,
}: AdminDashboardConsoleProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(tabParam || 'overview');
  const [announcements, setAnnouncements] = useState<any[]>(initialAnnouncements);

  useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);

  // Keep in sync with URL search parameter
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('overview');
    }
  }, [tabParam]);

  // Auto-refresh console on mobile device wake-up or tab focus
  useAutoReconnect(() => {
    router.refresh();
  });

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/portal/admin?tab=${tabId}`, { scroll: false });
  };

  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    try {
      setAnnouncements(prev =>
        prev.map(a => (a.id === id ? { ...a, isPinned: !currentStatus } : a))
      );
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPinned: !currentStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete notice "${title}"?\nIt will be permanently removed from the website and homepage moving ticker.`)) {
      return;
    }
    try {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: '📈 Traffic & Analytics', icon: Activity },
    { id: 'faculty', label: 'Faculty & Teachers', icon: UserCheck, count: teachersCount },
    { id: 'students', label: 'Student Roster', icon: Users, count: studentsCount },
    { id: 'enroll', label: 'Offline Enrollment', icon: UserPlus },
    { id: 'admissions', label: 'Online Admissions', icon: CreditCard, count: admissions.length },
    { id: 'fees', label: 'Monthly Fee Payments', icon: DollarSign },
    { id: 'online-payments', label: '💳 Online Razorpay Ledger', icon: CreditCard },
    { id: 'gallery', label: 'School Gallery', icon: Camera, count: galleryItems.length },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, count: announcements.length },
    { id: 'backups', label: 'Disaster Recovery & Backups', icon: Database },
  ];

  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/health-check')
      .then(res => res.json())
      .then(data => {
        if (data.success) setHealthData(data.health);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2.5">
            <span>Administrator Control Center</span>
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs sm:text-sm text-gray-500">
              Centralized school management, faculty controls, student dossiers, and media publishing.
            </p>
          </div>
          {healthData && (
            <div className="mt-2.5 inline-flex items-center space-x-2 text-[11px] font-mono font-bold px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Storage: {healthData.estimatedDbMb} MB / {healthData.dbStorageLimitMb} MB ({healthData.storageUsedPercentage}% Used • Optimal)</span>
            </div>
          )}
        </div>

        <Link
          href="/"
          target="_blank"
          className="self-start sm:self-auto inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition"
        >
          <span>View Public Website</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Proactive Storage Warning Banner (Triggers automatically if DB usage exceeds 80%) */}
      {healthData && (healthData.isStorageWarning || healthData.isStorageCritical) && (
        <div className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs font-bold animate-fadeIn shadow-md ${
          healthData.isStorageCritical 
            ? 'bg-rose-50 border-rose-300 text-rose-900' 
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}>
          <div className={`p-2 rounded-xl text-white ${healthData.isStorageCritical ? 'bg-rose-600' : 'bg-amber-600'}`}>
            <Database className="h-5 w-5 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold flex items-center space-x-1.5">
              <span>⚠️ ACTION REQUIRED: Database Storage Limit Warning ({healthData.storageUsedPercentage}% Used)</span>
            </h4>
            <p className="font-medium text-xs leading-relaxed">
              Your database storage is currently at <strong>{healthData.estimatedDbMb} MB out of {healthData.dbStorageLimitMb} MB</strong>. To avoid hitting storage limits, consider archiving old analytics logs or contacting technical support.
            </p>
          </div>
        </div>
      )}

      {/* Horizontal Nav Tabs (Swipeable on Mobile & Tablet) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEW: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div 
              onClick={() => switchTab('students')}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition cursor-pointer flex items-center space-x-4 group"
            >
              <div className="p-3 bg-blue-100 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-blue-600 transition">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Students</span>
                <span className="text-xl font-extrabold text-gray-900">{studentsCount}</span>
              </div>
            </div>

            <div 
              onClick={() => switchTab('faculty')}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-green-300 transition cursor-pointer flex items-center space-x-4 group"
            >
              <div className="p-3 bg-green-100 group-hover:bg-green-600 group-hover:text-white rounded-xl text-green-600 transition">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teachers</span>
                <span className="text-xl font-extrabold text-gray-900">{teachersCount}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Classes</span>
                <span className="text-xl font-extrabold text-gray-900">{classes.length}</span>
              </div>
            </div>

            <div 
              onClick={() => switchTab('admissions')}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-amber-300 transition cursor-pointer flex items-center space-x-4 group"
            >
              <div className="p-3 bg-amber-100 group-hover:bg-amber-600 group-hover:text-white rounded-xl text-amber-600 transition">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admissions</span>
                <span className="text-xl font-extrabold text-gray-900">{admissions.length}</span>
              </div>
            </div>

            <div 
              onClick={() => switchTab('gallery')}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-rose-300 transition cursor-pointer flex items-center space-x-4 group"
            >
              <div className="p-3 bg-rose-100 group-hover:bg-rose-600 group-hover:text-white rounded-xl text-rose-600 transition">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gallery Media</span>
                <span className="text-xl font-extrabold text-gray-900">{galleryItems.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div 
              onClick={() => switchTab('faculty')}
              className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer space-y-3 group"
            >
              <div className="p-2.5 bg-white/10 rounded-xl w-fit text-indigo-300">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">Faculty Management</h4>
                <p className="text-xs text-indigo-200 mt-1 font-light">Add new teachers, assign homeroom classes, and reset portal passwords.</p>
              </div>
              <div className="pt-2 text-xs font-bold text-indigo-300 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Manage Teachers</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => switchTab('students')}
              className="bg-gradient-to-br from-slate-900 to-neutral-950 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer space-y-3 group"
            >
              <div className="p-2.5 bg-white/10 rounded-xl w-fit text-blue-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">Student Records & Dossiers</h4>
                <p className="text-xs text-slate-300 mt-1 font-light">Search nominal rolls, inspect monthly attendance cards, and download report cards.</p>
              </div>
              <div className="pt-2 text-xs font-bold text-blue-300 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Inspect Students</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => switchTab('gallery')}
              className="bg-gradient-to-br from-purple-900 to-purple-950 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer space-y-3 group"
            >
              <div className="p-2.5 bg-white/10 rounded-xl w-fit text-purple-300">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">Upload Photos & Videos</h4>
                <p className="text-xs text-purple-200 mt-1 font-light">Publish high-resolution event photos and video reels directly to the public website.</p>
              </div>
              <div className="pt-2 text-xs font-bold text-purple-300 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Open Media Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div 
              onClick={() => switchTab('backups')}
              className="bg-gradient-to-br from-sky-900 to-slate-950 text-white p-6 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer space-y-3 group border border-sky-800/40"
            >
              <div className="p-2.5 bg-white/10 rounded-xl w-fit text-sky-300">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">Google Drive Backups</h4>
                <p className="text-xs text-sky-200 mt-1 font-light">Disaster recovery snapshots with 1-click restore for all school marks and data.</p>
              </div>
              <div className="pt-2 text-xs font-bold text-sky-300 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Manage Backups</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* Bottom Split: Classes & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Class Roster */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <School className="h-5 w-5 text-indigo-600" />
                  <span>Academic Class Distribution</span>
                </h3>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {classes.length} Active Classes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Class Name</th>
                      <th className="py-2.5 px-3">Assigned Homeroom Teacher</th>
                      <th className="py-2.5 px-3">Enrollment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600">
                    {classes.map((cls) => (
                      <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-gray-900">{cls.name}</td>
                        <td className="py-3 px-3">{cls.teacher?.name || <span className="text-amber-500 font-semibold italic">Unassigned</span>}</td>
                        <td className="py-3 px-3">
                          <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-100">
                            {cls.enrollments.length} Students
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                  <span>Latest Notices</span>
                </h3>
                <button
                  onClick={() => switchTab('announcements')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Post Notice
                </button>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {announcements.slice(0, 4).map((ann) => (
                  <div key={ann.id} className="border border-gray-100 rounded-xl p-3.5 space-y-1.5 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-blue-50 text-blue-700 border border-blue-100">
                        {ann.audience}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDateSafe(ann.createdAt, 'short')}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{ann.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-light">{ann.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: FACULTY & TEACHERS */}
      {activeTab === 'faculty' && (
        <div className="animate-fadeIn">
          <AdminTeacherManagement teachers={teachers} classes={classes} />
        </div>
      )}

      {/* VIEW: STUDENT ROSTER */}
      {activeTab === 'students' && (
        <div className="animate-fadeIn">
          <AdminStudentsList students={students} archivedStudents={archivedStudents} classes={classes} />
        </div>
      )}

      {/* VIEW: OFFLINE ENROLLMENT */}
      {activeTab === 'enroll' && (
        <div className="animate-fadeIn max-w-3xl">
          <AdminStudentEnrollForm classes={classes} />
        </div>
      )}

      {/* VIEW: ONLINE ADMISSIONS */}
      {activeTab === 'admissions' && (
        <div className="animate-fadeIn">
          <AdminAdmissionsList admissions={admissions} />
        </div>
      )}

      {/* VIEW: SCHOOL GALLERY */}
      {activeTab === 'gallery' && (
        <div className="animate-fadeIn">
          <AdminGalleryManagement initialItems={galleryItems} />
        </div>
      )}

      {/* VIEW: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          <div className="lg:col-span-7">
            <AdminAnnouncementForm classes={classes} />
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit">
            <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2 border-b border-gray-100 pb-3">
              <Megaphone className="h-5 w-5 text-blue-600" />
              <span>Broadcast Log ({announcements.length})</span>
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {announcements.map((ann: any) => (
                <div key={ann.id} className={`border rounded-xl p-4 space-y-2 transition ${ann.isPinned ? 'bg-amber-50/50 border-amber-300' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-blue-50 text-blue-700 border border-blue-100">
                        {ann.audience}
                      </span>
                      {ann.isPinned && (
                        <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase bg-red-600 text-white border border-red-700 flex items-center space-x-0.5">
                          <span>📌 PINNED</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(ann.id, !ann.isPinned)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md transition ${
                          ann.isPinned
                            ? 'bg-amber-200 text-amber-900 border border-amber-400 hover:bg-amber-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                        }`}
                        title={ann.isPinned ? 'Click to Unpin' : 'Click to Pin statically to Notice Bar'}
                      >
                        {ann.isPinned ? '📌 Pinned' : 'Pin to Bar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition flex items-center space-x-1"
                        title="Delete this notice permanently"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatDateSafe(ann.createdAt, 'short')}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{ann.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">{ann.content}</p>
                  <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                    By: {ann.createdBy?.name || 'Admin'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: WEBSITE TRAFFIC & VISITOR ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="animate-fadeIn">
          <AdminAnalyticsManagement />
        </div>
      )}

      {/* VIEW: MONTHLY FEE PAYMENTS & RECORDS */}
      {activeTab === 'fees' && (
        <div className="animate-fadeIn">
          <AdminFeeManagement />
        </div>
      )}

      {/* VIEW: EXCLUSIVE ONLINE RAZORPAY PAYMENTS LEDGER */}
      {activeTab === 'online-payments' && (
        <div className="animate-fadeIn">
          <AdminOnlinePayments />
        </div>
      )}

      {/* VIEW: DISASTER RECOVERY & BACKUPS */}
      {activeTab === 'backups' && (
        <div className="animate-fadeIn">
          <AdminBackupManagement />
        </div>
      )}
    </div>
  );
}
