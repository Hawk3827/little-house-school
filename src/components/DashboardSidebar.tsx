'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import ChangeAdminPasswordModal from '@/components/ChangeAdminPasswordModal';
import { 
  LayoutDashboard,
  Users, 
  UserCheck, 
  UserPlus, 
  CreditCard, 
  Camera, 
  Megaphone, 
  Calendar,
  ClipboardList,
  GraduationCap,
  FileSpreadsheet,
  FileText,
  Upload,
  MessageSquare,
  Sparkles,
  Award,
  ChevronRight,
  Database,
  DollarSign,
  Activity,
  KeyRound
} from 'lucide-react';

interface DashboardSidebarProps {
  session: any;
}

export default function DashboardSidebar({ session }: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const role = (session as any).role || (session as any).user?.role || 'STUDENT';

  // Navigation schema based on user role
  const getNavSections = () => {
    if (role === 'ADMIN') {
      return [
        {
          heading: 'CONTROL CENTER',
          items: [
            {
              name: 'Overview & Stats',
              href: '/portal/admin?tab=overview',
              isActive: pathname === '/portal/admin' && (currentTab === 'overview' || !searchParams.get('tab')),
              icon: LayoutDashboard,
            },
            {
              name: 'Traffic & Visitor Analytics',
              href: '/portal/admin?tab=analytics',
              isActive: pathname === '/portal/admin' && currentTab === 'analytics',
              icon: Activity,
            },
            {
              name: 'Faculty & Teachers',
              href: '/portal/admin?tab=faculty',
              isActive: pathname === '/portal/admin' && currentTab === 'faculty',
              icon: UserCheck,
            },
            {
              name: 'Student Roster',
              href: '/portal/admin?tab=students',
              isActive: pathname === '/portal/admin' && currentTab === 'students',
              icon: Users,
            },
            {
              name: 'Offline Enrollment',
              href: '/portal/admin?tab=enroll',
              isActive: pathname === '/portal/admin' && currentTab === 'enroll',
              icon: UserPlus,
            },
            {
              name: 'Online Admissions',
              href: '/portal/admin?tab=admissions',
              isActive: pathname === '/portal/admin' && currentTab === 'admissions',
              icon: CreditCard,
            },
            {
              name: 'Monthly Fee Payments',
              href: '/portal/admin?tab=fees',
              isActive: pathname === '/portal/admin' && currentTab === 'fees',
              icon: DollarSign,
            },
            {
              name: 'Online Razorpay Ledger',
              href: '/portal/admin?tab=online-payments',
              isActive: pathname === '/portal/admin' && currentTab === 'online-payments',
              icon: CreditCard,
              badge: 'ONLINE'
            },
          ]
        },
        {
          heading: 'MEDIA & COMMUNICATION',
          items: [
            {
              name: 'School Gallery & Video',
              href: '/portal/admin?tab=gallery',
              isActive: pathname === '/portal/admin' && currentTab === 'gallery',
              icon: Camera,
              badge: 'LIVE'
            },
            {
              name: 'Announcements',
              href: '/portal/admin?tab=announcements',
              isActive: pathname === '/portal/admin' && currentTab === 'announcements',
              icon: Megaphone,
            },
            {
              name: 'Calendar & Exams',
              href: '/portal/calendar',
              isActive: pathname === '/portal/calendar',
              icon: Calendar,
            },
          ]
        },
        {
          heading: 'SYSTEM & SAFETY',
          items: [
            {
              name: 'Admin Audit & Change Log',
              href: '/portal/admin?tab=audit-log',
              isActive: pathname === '/portal/admin' && currentTab === 'audit-log',
              icon: KeyRound,
              badge: 'STAFF'
            },
            {
              name: 'Google Drive Backups',
              href: '/portal/admin?tab=backups',
              isActive: pathname === '/portal/admin' && currentTab === 'backups',
              icon: Database,
              badge: 'AUTO'
            },
          ]
        }
      ];
    }

    if (role === 'TEACHER') {
      return [
        {
          heading: 'DAILY ACADEMICS',
          items: [
            {
              name: 'Attendance Register',
              href: '/portal/teacher?tab=attendance',
              isActive: pathname === '/portal/teacher' && (currentTab === 'attendance' || (!searchParams.get('tab') && currentTab === 'overview')),
              icon: ClipboardList,
            },
            {
              name: 'Exam Marks & Grades',
              href: '/portal/teacher?tab=grades',
              isActive: pathname === '/portal/teacher' && currentTab === 'grades',
              icon: Award,
            },
            {
              name: 'Monthly Report Cards',
              href: '/portal/teacher?tab=monthly',
              isActive: pathname === '/portal/teacher' && currentTab === 'monthly',
              icon: FileText,
            },
            {
              name: 'Activity Photos & Docs',
              href: '/portal/teacher?tab=activities',
              isActive: pathname === '/portal/teacher' && currentTab === 'activities',
              icon: Camera,
            },
          ]
        },
        {
          heading: 'STUDENTS & RECORDS',
          items: [
            {
              name: 'Nominal Roll Directory',
              href: '/portal/teacher?tab=nominal',
              isActive: pathname === '/portal/teacher' && currentTab === 'nominal',
              icon: Users,
            },
            {
              name: 'Batch CSV Import',
              href: '/portal/teacher?tab=bulk',
              isActive: pathname === '/portal/teacher' && currentTab === 'bulk',
              icon: FileSpreadsheet,
            },
            {
              name: 'Single Student Enroll',
              href: '/portal/teacher?tab=enroll',
              isActive: pathname === '/portal/teacher' && currentTab === 'enroll',
              icon: UserPlus,
            },
          ]
        },
        {
          heading: 'CONNECT',
          items: [
            {
              name: 'Staff & Parent Messages',
              href: '/portal/messages',
              isActive: pathname === '/portal/messages',
              icon: MessageSquare,
            },
            {
              name: 'School Calendar',
              href: '/portal/calendar',
              isActive: pathname === '/portal/calendar',
              icon: Calendar,
            },
          ]
        }
      ];
    }

    // STUDENT or PARENT fallback
    return [
      {
        heading: 'PORTAL',
        items: [
          {
            name: role === 'STUDENT' ? 'Student Dashboard' : 'Parent Dashboard',
            href: role === 'STUDENT' ? '/portal/student' : '/portal/parent',
            isActive: pathname.startsWith('/portal/student') || pathname.startsWith('/portal/parent'),
            icon: GraduationCap,
          },
          {
            name: 'Messages',
            href: '/portal/messages',
            isActive: pathname === '/portal/messages',
            icon: MessageSquare,
          },
          {
            name: 'Academic Calendar',
            href: '/portal/calendar',
            isActive: pathname === '/portal/calendar',
            icon: Calendar,
          },
        ]
      }
    ];
  };

  const navSections = getNavSections();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes('?tab=') && pathname === href.split('?')[0]) {
      e.preventDefault();
      window.history.pushState(null, '', href);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <aside className="w-68 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between p-5 select-none h-screen sticky top-0 overflow-y-auto no-scrollbar">
      <div className="space-y-6">
        {/* School Logo Brand */}
        <Link href="/" className="flex items-center space-x-3 group border-b border-gray-100 pb-4">
          <img 
            src="/school-logo.png" 
            alt="Little House Logo" 
            className="h-10 w-10 object-contain group-hover:scale-105 transition" 
          />
          <div>
            <span className="font-extrabold text-base text-gray-900 tracking-tight block">LITTLE HOUSE</span>
            <span className="text-[10px] font-mono text-gray-400 font-semibold tracking-wider uppercase block">
              PORTAL SYSTEM
            </span>
          </div>
        </Link>

        {/* User Badge Info Card */}
        <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <h4 className="font-bold text-gray-900 text-xs truncate">{session.name}</h4>
              <p className="text-[11px] text-gray-500 truncate">{session.email}</p>
            </div>
            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border flex-shrink-0 ${
              role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              role === 'TEACHER' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {role}
            </span>
          </div>

          {role === 'ADMIN' && (
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full py-1.5 px-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-extrabold text-[10px] rounded-xl transition flex items-center justify-center space-x-1 border border-purple-200 shadow-2xs"
            >
              <KeyRound className="h-3 w-3 text-purple-700" />
              <span>Change My Password</span>
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase px-3 block">
                {section.heading}
              </span>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        item.isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-bold'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/70'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon className={`h-4 w-4 flex-shrink-0 ${item.isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          item.isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Sign out */}
      <div className="pt-6 border-t border-gray-100 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
        >
          <span>View Public Website</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <SignOutButton />
      </div>

      <ChangeAdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        adminName={session.name}
        adminEmail={session.email}
      />
    </aside>
  );
}
