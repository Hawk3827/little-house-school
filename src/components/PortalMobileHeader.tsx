'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  School, 
  Settings, 
  Calendar, 
  ClipboardList, 
  MessageSquare, 
  GraduationCap, 
  Users, 
  LogOut,
  ChevronRight,
  UserCheck,
  UserPlus,
  CreditCard,
  Camera,
  Megaphone,
  Award,
  FileText,
  FileSpreadsheet,
  LayoutDashboard,
  Database,
  DollarSign,
  Activity,
  KeyRound
} from 'lucide-react';
import SignOutButton from './SignOutButton';
import ChangeAdminPasswordModal from '@/components/ChangeAdminPasswordModal';

interface PortalMobileHeaderProps {
  session: any;
}

export default function PortalMobileHeader({ session }: PortalMobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const renderRoleLinks = () => {
    if (session.role === 'ADMIN') {
      return (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider px-2 block">
              MANAGEMENT
            </span>
            <Link
              href="/portal/admin?tab=overview"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                <span>Overview & Summary</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/admin?tab=analytics"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="h-4 w-4 text-emerald-600" />
                <span>📈 Traffic & Visitor Analytics</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/admin?tab=faculty"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span>Faculty & Teachers</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/admin?tab=students"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="h-4 w-4 text-blue-600" />
                <span>Student Roster</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/admin?tab=enroll"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <UserPlus className="h-4 w-4 text-purple-600" />
                <span>Offline Student Enrollment</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/admin?tab=admissions"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <CreditCard className="h-4 w-4 text-amber-600" />
                <span>Online Paid Admissions</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/admin?tab=fees"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Monthly Fee Register</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/admin?tab=online-payments"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/80 text-emerald-950 text-xs font-extrabold border border-emerald-200/80"
            >
              <div className="flex items-center space-x-2.5">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span>Online Razorpay Ledger</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                ONLINE
              </span>
            </Link>
          </div>

          <div className="space-y-1 pt-2 border-t border-gray-100">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider px-2 block">
              MEDIA & COMMUNICATIONS
            </span>
            <Link
              href="/portal/admin?tab=gallery"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Camera className="h-4 w-4 text-rose-600" />
                <span>Photo & Video Gallery</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/admin?tab=announcements"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Megaphone className="h-4 w-4 text-blue-600" />
                <span>Broadcast Announcements</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/calendar"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>Calendar & Events</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
          </div>

          <div className="space-y-1 pt-2 border-t border-gray-100">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider px-2 block">
              SYSTEM & SAFETY
            </span>
            <Link
              href="/portal/admin?tab=backups"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Database className="h-4 w-4 text-sky-600" />
                <span>Google Drive Backups</span>
              </div>
              <span className="text-[9px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">AUTO</span>
            </Link>
          </div>
        </div>
      );
    }

    if (session.role === 'TEACHER') {
      return (
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider px-2 block">
              DAILY ACADEMICS
            </span>
            <Link
              href="/portal/teacher?tab=attendance"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <ClipboardList className="h-4 w-4 text-indigo-600" />
                <span>Daily Attendance</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/teacher?tab=grades"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Award className="h-4 w-4 text-blue-600" />
                <span>Exam Marks & Grades</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/teacher?tab=monthly"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Monthly Reports & PDFs</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/teacher?tab=activities"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Camera className="h-4 w-4 text-rose-600" />
                <span>Activity Photos & Docs</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
          </div>

          <div className="space-y-1 pt-2 border-t border-gray-100">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider px-2 block">
              STUDENTS & RECORDS
            </span>
            <Link
              href="/portal/teacher?tab=nominal"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Users className="h-4 w-4 text-gray-600" />
                <span>Nominal Roll Directory</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/teacher?tab=bulk"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span>Batch CSV Import</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/teacher?tab=enroll"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <UserPlus className="h-4 w-4 text-purple-600" />
                <span>New Student Enroll</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/messages"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span>Messages</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
            <Link
              href="/portal/calendar"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-semibold"
            >
              <div className="flex items-center space-x-2.5">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>Calendar & Events</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </Link>
          </div>
        </div>
      );
    }

    if (session.role === 'STUDENT') {
      return (
        <>
          <Link
            href="/portal/student"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-3.5 rounded-xl transition ${
              pathname === '/portal/student' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
            }`}
          >
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Student Dashboard</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href="/portal/messages"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-3.5 rounded-xl transition ${
              pathname === '/portal/messages' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
            }`}
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <span className="text-sm">Messages</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href="/portal/calendar"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-3.5 rounded-xl transition ${
              pathname === '/portal/calendar' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Calendar</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </>
      );
    }

    if (session.role === 'PARENT') {
      return (
        <>
          <Link
            href="/portal/parent"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-3.5 rounded-xl transition ${
              pathname === '/portal/parent' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Parent Dashboard</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href="/portal/messages"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-3.5 rounded-xl transition ${
              pathname === '/portal/messages' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
            }`}
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <span className="text-sm">Messages</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href="/portal/calendar"
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-between p-3.5 rounded-xl transition ${
              pathname === '/portal/calendar' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Calendar</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left: Mobile Hamburger & School Logo */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none"
            aria-label="Toggle Portal Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center space-x-2">
            <img src="/school-logo.png" alt="LITTLE HOUSE Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-gray-900 text-sm tracking-tight">LITTLE HOUSE</span>
          </Link>
        </div>

        {/* Center: Desktop Title */}
        <div className="hidden md:block text-xs text-gray-500 font-bold uppercase tracking-wider">
          {session.role} Portal Dashboard
        </div>

        {/* Right: User brief & Logout */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-gray-900 leading-tight">{session.name}</span>
            <span className="text-[10px] text-gray-400 uppercase font-mono">{session.role}</span>
          </div>

          {session.role === 'ADMIN' && (
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-xs rounded-xl transition flex items-center space-x-1 border border-purple-200 shadow-2xs cursor-pointer"
              title="Change your logged-in password"
            >
              <KeyRound className="h-3.5 w-3.5 text-purple-700" />
              <span className="hidden sm:inline">Change Password</span>
            </button>
          )}

          <SignOutButton />
        </div>
      </header>

      {/* Mobile Portal Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-16 left-0 bottom-0 w-72 bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slideRight">
            <div className="space-y-6">
              {/* User Profile Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Logged In As</span>
                <h4 className="font-bold text-gray-900 text-sm truncate">{session.name}</h4>
                <p className="text-xs text-gray-500 font-mono truncate">{session.email}</p>
                <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                  {session.role} ACCOUNT
                </span>
              </div>

              {/* Navigation */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 block">
                  Dashboard Navigation
                </span>
                <nav className="space-y-1">
                  {renderRoleLinks()}
                </nav>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2.5 text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
              >
                <School className="h-4 w-4" />
                <span>Visit Public Website</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <ChangeAdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        adminName={session.name}
        adminEmail={session.email}
      />
    </>
  );
}
