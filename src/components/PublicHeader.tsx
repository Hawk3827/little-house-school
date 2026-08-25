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
  const pathname = usePathname();

  useEffect(() => {
    // Asynchronously check active session on client without forcing server SSR
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

  const navLinks = [
    { name: 'HOME', href: '/', icon: Home },
    { name: 'ABOUT US', href: '/about', icon: Info },
    { name: 'GALLERY', href: '/gallery', icon: ImageIcon },
    { name: 'ADMISSIONS', href: '/admission', icon: Sparkles },
    { name: 'CONTACT', href: '/contact', icon: Phone },
    { name: 'PARENT PORTAL', href: '/parent-portal', icon: GraduationCap, highlight: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-sky-100 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <picture>
                <source srcSet="/school-logo.webp" type="image/webp" />
                <img 
                  src="/school-logo.png" 
                  alt="LITTLE HOUSE Logo" 
                  width={56}
                  height={56}
                  className="h-12 w-12 sm:h-14 sm:w-14 object-contain group-hover:scale-105 transition" 
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
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-7 lg:space-x-9">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs font-bold tracking-wide uppercase transition-colors relative py-1.5 ${
                      link.highlight
                        ? 'text-sky-800 hover:text-sky-950 bg-sky-100 px-3 py-1 rounded-full border border-sky-300'
                        : isActive
                        ? 'text-sky-800 font-extrabold'
                        : 'text-slate-700 hover:text-sky-800'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && !link.highlight && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-sky-500 rounded-full animate-fadeIn" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <HeaderSearch />

              {/* Desktop Portal Login / Dashboard Button (Sunny Yellow & Sky Blue) */}
              <div className="hidden sm:block">
                {session ? (
                  <Link
                    href={`/portal/${session.role.toLowerCase()}`}
                    className="flex items-center space-x-2 bg-sky-600 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-full hover:bg-sky-700 transition shadow-sm"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>DASHBOARD</span>
                  </Link>
                ) : (
                  <Link
                    href="/portal/login"
                    className="flex items-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold px-4 sm:px-5 py-2.5 rounded-full border border-amber-300 transition shadow-sm hover:shadow"
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
                className="md:hidden p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-700 hover:text-sky-600 hover:bg-sky-100 transition focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed top-20 left-0 right-0 bottom-0 bg-white border-t border-sky-100 p-6 flex flex-col justify-between overflow-y-auto animate-slideDown">
            <div className="space-y-6">
              <span className="text-[10px] font-mono font-bold tracking-widest text-sky-600 uppercase">
                MAIN NAVIGATION
              </span>

              {/* Menu Links */}
              <nav className="space-y-2.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-2xl transition ${
                        link.highlight
                          ? 'bg-sky-50 border border-sky-200 text-sky-700 font-bold'
                          : isActive
                          ? 'bg-sky-600 text-white font-bold shadow-sm'
                          : 'bg-slate-50 hover:bg-sky-50/70 text-slate-700 hover:text-sky-600 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`p-2 rounded-xl ${
                          link.highlight 
                            ? 'bg-sky-600 text-white' 
                            : isActive 
                            ? 'bg-white text-sky-600' 
                            : 'bg-white text-slate-500 shadow-2xs'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold tracking-wide">{link.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Portal / Sign In Footer */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              {session ? (
                <Link
                  href={`/portal/${session.role.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 bg-sky-600 text-white text-sm font-bold py-3.5 rounded-2xl hover:bg-sky-700 transition shadow-md"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>OPEN DASHBOARD ({session.name || session.role})</span>
                </Link>
              ) : (
                <div className="space-y-2.5">
                  <Link
                    href="/portal/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-extrabold py-3.5 rounded-2xl transition shadow-md border border-amber-300"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>TEACHER & ADMIN PORTAL</span>
                  </Link>

                  <Link
                    href="/parent-portal"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center space-x-2 bg-sky-600 text-white text-sm font-bold py-3.5 rounded-2xl hover:bg-sky-700 transition shadow-md"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>PARENT & STUDENT PORTAL</span>
                  </Link>
                </div>
              )}

              <p className="text-center text-[10px] text-slate-400 pt-2 font-mono">
                LITTLE HOUSE SCHOOL • Waiton Lamkhai
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
