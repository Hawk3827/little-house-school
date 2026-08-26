'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  LogIn, 
  LayoutDashboard, 
  GraduationCap, 
  Home, 
  Info, 
  Image as ImageIcon, 
  Phone, 
  UserCheck, 
  Sparkles,
  CreditCard,
  ChevronDown,
  Calendar,
  BookOpen
} from 'lucide-react';
import HeaderSearch from '@/components/HeaderSearch';

interface PublicHeaderProps {
  session?: {
    userId: string;
    email: string;
    name: string;
    role: string;
  } | null;
}

export default function PublicHeader({ session: initialSession = null }: PublicHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [session, setSession] = useState(initialSession);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function checkClientSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setSession(data.session || null);
        }
      } catch (err) {
        // Silent catch for public guests
      }
    }
    if (!initialSession) {
      checkClientSession();
    }
    return () => { isMounted = false; };
  }, [initialSession]);

  // Close mobile menu & dropdown on route change
  useEffect(() => {
    setIsOpen(false);
    setAboutDropdownOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isAboutActive = pathname === '/about' || pathname === '/annual-program';

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-sky-100/80 shadow-2xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* 1. School Brand Logo */}
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <picture>
                <source srcSet="/school-logo.webp" type="image/webp" />
                <img 
                  src="/school-logo.png" 
                  alt="LITTLE HOUSE Logo" 
                  width={56}
                  height={56}
                  className="h-12 w-12 sm:h-13 sm:w-13 object-contain group-hover:scale-105 transition" 
                />
              </picture>
              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 uppercase block leading-none">
                  LITTLE HOUSE
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-800 tracking-widest uppercase block mt-0.5">
                  A Family of Learning
                </span>
              </div>
            </Link>

            {/* 2. Main Desktop Navigation Links (Clean, Spacious with About Dropdown) */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-7">
              <Link
                href="/"
                className={`text-xs font-extrabold tracking-wide uppercase transition-colors relative py-2 ${
                  pathname === '/' ? 'text-sky-800 font-black' : 'text-slate-700 hover:text-sky-800'
                }`}
              >
                <span>HOME</span>
                {pathname === '/' && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-500 rounded-full animate-fadeIn" />}
              </Link>

              {/* ABOUT US Dropdown */}
              <div 
                className="relative group"
                onMouseEnter={() => setAboutDropdownOpen(true)}
                onMouseLeave={() => setAboutDropdownOpen(false)}
              >
                <button
                  onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                  className={`text-xs font-extrabold tracking-wide uppercase transition-colors relative py-2 flex items-center space-x-1 ${
                    isAboutActive ? 'text-sky-800 font-black' : 'text-slate-700 hover:text-sky-800'
                  }`}
                >
                  <span>ABOUT US</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180 text-sky-600' : 'text-slate-400'}`} />
                  {isAboutActive && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-500 rounded-full animate-fadeIn" />}
                </button>

                {/* Dropdown Menu Box */}
                {aboutDropdownOpen && (
                  <div className="absolute top-full left-0 pt-2 w-64 animate-fadeIn z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-sky-100 p-2 space-y-1 text-left">
                      <Link
                        href="/about"
                        className={`flex items-start space-x-3 p-2.5 rounded-xl transition ${
                          pathname === '/about' ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="p-2 bg-sky-100 text-sky-700 rounded-lg mt-0.5">
                          <Info className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-900">About Our Legacy</span>
                          <span className="text-[10px] text-slate-500 leading-tight block">History, Vision & Curriculum</span>
                        </div>
                      </Link>

                      <Link
                        href="/annual-program"
                        className={`flex items-start space-x-3 p-2.5 rounded-xl transition ${
                          pathname === '/annual-program' ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="p-2 bg-amber-100 text-amber-800 rounded-lg mt-0.5">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-900">Annual Program & Calendar</span>
                          <span className="text-[10px] text-slate-500 leading-tight block">Milestones, Holidays & Exams</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/admission"
                className={`text-xs font-extrabold tracking-wide uppercase transition-colors relative py-2 ${
                  pathname === '/admission' ? 'text-sky-800 font-black' : 'text-slate-700 hover:text-sky-800'
                }`}
              >
                <span>ADMISSIONS</span>
                {pathname === '/admission' && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-500 rounded-full animate-fadeIn" />}
              </Link>

              <Link
                href="/gallery"
                className={`text-xs font-extrabold tracking-wide uppercase transition-colors relative py-2 ${
                  pathname === '/gallery' ? 'text-sky-800 font-black' : 'text-slate-700 hover:text-sky-800'
                }`}
              >
                <span>GALLERY</span>
                {pathname === '/gallery' && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-500 rounded-full animate-fadeIn" />}
              </Link>

              <Link
                href="/contact"
                className={`text-xs font-extrabold tracking-wide uppercase transition-colors relative py-2 ${
                  pathname === '/contact' ? 'text-sky-800 font-black' : 'text-slate-700 hover:text-sky-800'
                }`}
              >
                <span>CONTACT</span>
                {pathname === '/contact' && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-500 rounded-full animate-fadeIn" />}
              </Link>
            </nav>

            {/* 3. Right Action Group (Pay Fee, Parent Portal, Search, Login) */}
            <div className="flex items-center space-x-2 sm:space-x-2.5">
              {/* Pay Fee Button */}
              <Link
                href="/pay-fee"
                className={`hidden xl:inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition border ${
                  pathname === '/pay-fee'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200'
                }`}
                title="Pay Monthly Tuition Fees Online"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                <span>Pay Fee</span>
              </Link>

              {/* Parent Portal Button */}
              <Link
                href="/parent-portal"
                className={`hidden xl:inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition border ${
                  pathname === '/parent-portal'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border-sky-200'
                }`}
                title="Parent & Student Information Portal"
              >
                <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
                <span>Parent Portal</span>
              </Link>

              {/* Global Instant Search Trigger */}
              <HeaderSearch />

              {/* Dynamic Authentication Button */}
              {mounted && session ? (
                <Link
                  href={
                    session.role === 'ADMIN'
                      ? '/portal/admin'
                      : session.role === 'TEACHER'
                      ? '/portal/teacher'
                      : '/parent-portal'
                  }
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all border border-amber-300 active:scale-95 flex-shrink-0"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-slate-950" />
                  <span className="hidden sm:inline">DASHBOARD</span>
                  <span className="sm:hidden">PORTAL</span>
                </Link>
              ) : (
                <Link
                  href="/portal/login"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all border border-amber-300 active:scale-95 flex-shrink-0"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-950" />
                  <span>PORTAL LOGIN</span>
                </Link>
              )}

              {/* Mobile Hamburger Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition focus:outline-none"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay & Slide-Out Navigation */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={() => setIsOpen(false)} />

          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in-right z-10 text-left">
            <div className="p-6 space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <picture>
                    <source srcSet="/school-logo.webp" type="image/webp" />
                    <img src="/school-logo.png" alt="LITTLE HOUSE" width={40} height={40} className="h-10 w-10 object-contain" />
                  </picture>
                  <div>
                    <span className="font-extrabold text-slate-900 uppercase text-sm block">LITTLE HOUSE</span>
                    <span className="text-[10px] text-sky-800 font-bold block">A Family of Learning</span>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <Link
                  href="/"
                  className={`flex items-center space-x-3 p-3 rounded-xl font-bold text-sm transition ${
                    pathname === '/' ? 'bg-sky-50 text-sky-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Home className="h-4 w-4 text-sky-600" />
                  <span>HOME</span>
                </Link>

                <Link
                  href="/about"
                  className={`flex items-center space-x-3 p-3 rounded-xl font-bold text-sm transition ${
                    pathname === '/about' ? 'bg-sky-50 text-sky-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Info className="h-4 w-4 text-sky-600" />
                  <span>ABOUT OUR LEGACY</span>
                </Link>

                <Link
                  href="/annual-program"
                  className={`flex items-center space-x-3 p-3 rounded-xl font-bold text-sm transition ${
                    pathname === '/annual-program' ? 'bg-amber-50 text-amber-900 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="h-4 w-4 text-amber-600" />
                  <span>ANNUAL PROGRAM & CALENDAR</span>
                </Link>

                <Link
                  href="/admission"
                  className={`flex items-center space-x-3 p-3 rounded-xl font-bold text-sm transition ${
                    pathname === '/admission' ? 'bg-sky-50 text-sky-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="h-4 w-4 text-sky-600" />
                  <span>ADMISSIONS & FEES</span>
                </Link>

                <Link
                  href="/gallery"
                  className={`flex items-center space-x-3 p-3 rounded-xl font-bold text-sm transition ${
                    pathname === '/gallery' ? 'bg-sky-50 text-sky-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon className="h-4 w-4 text-sky-600" />
                  <span>SCHOOL GALLERY</span>
                </Link>

                <Link
                  href="/contact"
                  className={`flex items-center space-x-3 p-3 rounded-xl font-bold text-sm transition ${
                    pathname === '/contact' ? 'bg-sky-50 text-sky-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Phone className="h-4 w-4 text-sky-600" />
                  <span>CONTACT & LOCATION</span>
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t space-y-2.5">
                <Link
                  href="/pay-fee"
                  className="flex items-center justify-between p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl font-bold text-xs border border-emerald-200"
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-emerald-700" />
                    <span>Pay Tuition Fees Online</span>
                  </div>
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                </Link>

                <Link
                  href="/parent-portal"
                  className="flex items-center justify-between p-3.5 bg-sky-50 text-sky-900 rounded-2xl font-bold text-xs border border-sky-200"
                >
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-sky-700" />
                    <span>Parent & Student Portal</span>
                  </div>
                  <Sparkles className="h-4 w-4 text-sky-600" />
                </Link>
              </div>
            </div>

            {/* Drawer Footer Login Button */}
            <div className="p-6 bg-slate-50 border-t">
              {mounted && session ? (
                <Link
                  href={
                    session.role === 'ADMIN'
                      ? '/portal/admin'
                      : session.role === 'TEACHER'
                      ? '/portal/teacher'
                      : '/parent-portal'
                  }
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-sm uppercase tracking-wider"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>GO TO DASHBOARD ({session.name.split(' ')[0]})</span>
                </Link>
              ) : (
                <Link
                  href="/portal/login"
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-sm uppercase tracking-wider"
                >
                  <LogIn className="h-4 w-4" />
                  <span>PORTAL LOGIN</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
