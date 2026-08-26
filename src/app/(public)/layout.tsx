import React from 'react';
import PublicHeader from '@/components/PublicHeader';
import Link from 'next/link';
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Responsive Navigation Header with Mobile Hamburger Menu */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Royal Navy & Sunny Yellow School Footer (100% WCAG AAA High Contrast Accessible) */}
      <footer className="bg-slate-950 text-slate-200 py-20 border-t border-sky-900/40 select-none">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16">
          {/* School Brand */}
          <div className="space-y-5 text-left">
            <div className="flex items-center space-x-3 text-white">
              <picture>
                <source srcSet="/school-logo.webp" type="image/webp" />
                <img 
                  src="/school-logo.png" 
                  alt="LITTLE HOUSE Logo" 
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain bg-white rounded-xl p-1 shadow-sm" 
                />
              </picture>
              <div>
                <span className="font-extrabold text-base tracking-tight uppercase block text-white">
                  LITTLE HOUSE
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold uppercase block tracking-wider">
                  A Family of Learning
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed max-w-xs font-normal">
              Nurturing creative minds, shaping ethical character, and inspiring academic excellence for a brighter tomorrow in Manipur.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h2 className="text-amber-300 text-[11px] font-mono font-black tracking-widest uppercase mb-5">
              EXPLORE
            </h2>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <Link href="/" className="text-slate-200 hover:text-white transition">Home Page</Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-200 hover:text-white transition">About Our Legacy</Link>
              </li>
              <li>
                <Link href="/annual-program" className="text-slate-200 hover:text-white transition">Annual Program & Calendar</Link>
              </li>
              <li>
                <Link href="/gallery" className="text-slate-200 hover:text-white transition">School Gallery & Videos</Link>
              </li>
              <li>
                <Link href="/admission" className="text-slate-200 hover:text-white transition">Online Admissions & Fees</Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-200 hover:text-white transition">Contact & Location</Link>
              </li>
              <li>
                <Link href="/parent-portal" className="text-amber-300 hover:text-white transition font-bold flex items-center space-x-1">
                  <span>★ Parent & Student Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="text-left">
            <h2 className="text-amber-300 text-[11px] font-mono font-black tracking-widest uppercase mb-5">
              PORTALS & LOGINS
            </h2>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <Link href="/parent-portal" className="text-slate-200 hover:text-white transition">Parent & Student Portal</Link>
              </li>
              <li>
                <Link href="/portal/login" className="text-slate-200 hover:text-white transition">Teacher Academics Console</Link>
              </li>
              <li>
                <Link href="/portal/login" className="text-slate-200 hover:text-white transition">Administrator Control Center</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-left">
            <h2 className="text-amber-300 text-[11px] font-mono font-black tracking-widest uppercase mb-5">
              CAMPUS LOCATION
            </h2>
            <div className="text-xs text-slate-200 leading-relaxed font-normal">
              <strong className="text-white block font-bold">LITTLE HOUSE SCHOOL</strong>
              Waiton Lamkhai, Imphal East<br />
              Manipur - 795114<br /><br />
              <span className="text-slate-100 font-semibold">Phone:</span> +91 98765 43210<br />
              <span className="text-slate-100 font-semibold">Email:</span> info@littlehouse.edu.in
              <div className="pt-4">
                <a
                  href="https://www.facebook.com/share/1JaexocNb7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Official Facebook Page</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Copyright Strip with High Contrast Colors */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-14 pt-8 border-t border-slate-800/80 text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] text-slate-300 font-mono">
          <span>&copy; {new Date().getFullYear()} LITTLE HOUSE SCHOOL. ALL RIGHTS RESERVED.</span>
          <span className="text-slate-300">WAITON LAMKHAI, IMPHAL EAST, MANIPUR</span>
        </div>
      </footer>
    </div>
  );
}
