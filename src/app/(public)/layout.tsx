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
