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
  ChevronRight
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
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

  // Main navigation links (clean text links only)
  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'ABOUT US', href: '/about' },
    { name: 'ANNUAL PROGRAM', href: '/annual-program' },
    { name: 'ADMISSIONS', href: '/admission' },
    { name: 'GALLERY', href: '/gallery' },
    { name: 'CONTACT', href: '/contact' },
  ];

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

            {/* 2. Main Desktop Navigation Links (Clean, Uniform Text Links) */}
            <nav className="hidden lg:flex items-center space-x-7 xl:space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs font-extrabold tracking-wide uppercase transition-colors relative py-2 ${
                      isActive
                        ? 'text-sky-800 font-black'
                        : 'text-slate-700 hover:text-sky-800'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-500 rounded-full animate-fadeIn" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Right Action Group (Pay Fee, Parent Portal, Search, Login) */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              {/* Pay Fee Button */}
              <Link
                href="/pay-fee"
                className={`hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition border ${
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
                className={`hidden md:inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition border ${
                  pathname === '/parent-portal'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border-sky-200'
                }`}
                title="Parent & Student Progress Portal"
              >
                <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
                <span>Parent Portal</span>
              </Link>

              {/* Search Widget */}
              <HeaderSearch />

              {/* Portal Login / Dashboard Button */}
              <div className="hidden sm:block">
                {session ? (
                  <Link
                    href={`/portal/${session.role.toLowerCase()}`}
                    className="flex items-center space-x-2 bg-sky-600 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-sky-700 transition shadow-xs"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>DASHBOARD</span>
                  </Link>
                ) : (
                  <Link
                    href="/portal/login"
                    className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-full border border-amber-300 transition shadow-xs"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>PORTAL LOGIN</span>
                  </Link>
                )}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-sky-800 hover:bg-sky-50 transition"
                aria-label="Toggle Navigation Menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 4. Mobile Drawer Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fadeIn select-none">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="fixed top-20 right-0 left-0 bg-white border-b border-sky-100 shadow-2xl p-6 space-y-5 animate-slideDown max-h-[85vh] overflow-y-auto">
            {/* Mobile Nav Links */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center justify-between p-3 rounded-2xl text-xs font-bold uppercase transition ${
                      isActive 
                        ? 'bg-sky-50 text-sky-800 font-extrabold border border-sky-100' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <Link
                href="/pay-fee"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase"
              >
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Pay Monthly Fee</span>
                </div>
                <ChevronRight className="h-4 w-4 text-emerald-500" />
              </Link>

              <Link
                href="/parent-portal"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 text-sky-900 border border-sky-200 text-xs font-bold uppercase"
              >
                <div className="flex items-center space-x-2.5">
                  <GraduationCap className="h-4 w-4 text-sky-600" />
                  <span>Parent Portal</span>
                </div>
                <ChevronRight className="h-4 w-4 text-sky-500" />
              </Link>

              <Link
                href="/portal/login"
                className="flex items-center justify-center space-x-2 p-3.5 rounded-2xl bg-amber-400 text-slate-950 text-xs font-extrabold uppercase shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>Portal Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
