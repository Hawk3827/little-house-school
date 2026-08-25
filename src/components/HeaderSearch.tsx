'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  GraduationCap, 
  Sparkles, 
  Calendar, 
  Bus, 
  MapPin, 
  Image as ImageIcon, 
  UserCheck, 
  Info, 
  Phone, 
  Bell, 
  FileText,
  CornerDownLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Global Keyboard shortcut: Cmd + K or Ctrl + K or / to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  // Arrow Key Navigation in Search Results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      setIsOpen(false);
      router.push(results[selectedIndex].href);
    }
  };

  // Fetch search results on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/public/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('Search fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Result icon helper
  const getIcon = (type: string) => {
    switch (type) {
      case 'portal':
        return <GraduationCap className="h-4 w-4 text-sky-600" />;
      case 'admission':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case 'calendar':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'bus':
        return <Bus className="h-4 w-4 text-emerald-600" />;
      case 'location':
        return <MapPin className="h-4 w-4 text-rose-500" />;
      case 'gallery':
        return <ImageIcon className="h-4 w-4 text-purple-500" />;
      case 'teacher':
        return <UserCheck className="h-4 w-4 text-cyan-600" />;
      case 'about':
        return <Info className="h-4 w-4 text-slate-500" />;
      case 'contact':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'announcement':
        return <Bell className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <>
      {/* 🔍 Search trigger button in Header (Clean Sky Blue & White) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 text-slate-600 hover:text-sky-700 transition group focus:outline-none shadow-2xs"
        aria-label="Search LITTLE HOUSE site"
      >
        <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-600 transition" />
        <span className="text-[11px] font-medium hidden sm:inline text-slate-600 group-hover:text-sky-700">
          Search...
        </span>
        <kbd className="hidden lg:inline-flex items-center text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white border border-slate-200 text-slate-500 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col justify-start items-center pt-12 sm:pt-20 px-4 sm:px-6 select-none animate-fadeIn">
          {/* Backdrop click to close */}
          <div 
            className="fixed inset-0 -z-10" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Search container */}
          <div className="w-full max-w-2xl bg-white border border-sky-100 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-slideDown text-slate-900">
            {/* Input Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3.5 flex-1 pr-3">
                <Search className="h-5 w-5 text-sky-600 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search student reports, admission fees, exams, holidays, map..."
                  className="w-full bg-transparent text-base sm:text-lg text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-[10px] text-slate-500 hover:text-slate-900 font-mono bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded-md"
                  >
                    CLEAR
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Results listing */}
            <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-2.5">
              {loading ? (
                <div className="text-center py-10 text-xs font-mono text-sky-700 animate-pulse">
                  Searching Little House directory...
                </div>
              ) : query && results.length > 0 ? (
                <>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase px-1">
                    <span>Search Results ({results.length})</span>
                    <span className="hidden sm:inline">Use ↑ ↓ to navigate, Enter to open</span>
                  </div>

                  {results.map((res, index) => (
                    <Link
                      key={index}
                      href={res.href}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`block p-4 rounded-2xl transition border text-left group ${
                        selectedIndex === index
                          ? 'bg-sky-50/80 border-sky-300 shadow-sm'
                          : 'bg-slate-50/60 border-slate-100 hover:border-sky-200 hover:bg-sky-50/40'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                              {getIcon(res.iconType)}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full uppercase">
                              {res.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-sky-700 transition leading-snug">
                            {res.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-2">
                            {res.desc}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0 flex items-center space-x-1.5 text-xs font-bold text-sky-600 group-hover:translate-x-0.5 transition-transform mt-1">
                          <span className="hidden sm:inline text-[11px]">{res.actionLabel}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              ) : query ? (
                <div className="text-center py-12 text-sm text-slate-600 font-normal space-y-2">
                  <p>No matching records found for &quot;<span className="text-slate-900 font-medium">{query}</span>&quot;.</p>
                  <p className="text-xs text-slate-500">
                    Try searching for <button onClick={() => setQuery('report')} className="text-sky-600 underline">report</button>, <button onClick={() => setQuery('admission')} className="text-sky-600 underline">admission</button>, <button onClick={() => setQuery('fee')} className="text-sky-600 underline">fee</button>, <button onClick={() => setQuery('exam')} className="text-sky-600 underline">exam</button>, or <button onClick={() => setQuery('calendar')} className="text-sky-600 underline">calendar</button>.
                  </p>
                </div>
              ) : (
                /* Instant Suggestions when Search is Empty */
                <div className="space-y-4 pt-1">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase block">
                    QUICK ACTIONS & FREQUENTLY ACCESSED
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setQuery('parent')}
                      className="p-3.5 bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-200 rounded-2xl flex items-center space-x-3 transition text-left"
                    >
                      <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900">Student Progress Lookup</span>
                        <span className="block text-[10px] text-slate-500">Monthly attendance & report cards</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setQuery('admission')}
                      className="p-3.5 bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-200 rounded-2xl flex items-center space-x-3 transition text-left"
                    >
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900">Online Admissions & Fees</span>
                        <span className="block text-[10px] text-slate-500">Class I - VI registration & fee chart</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setQuery('exam')}
                      className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 rounded-2xl flex items-center space-x-3 transition text-left"
                    >
                      <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900">Academic Calendar & Exams</span>
                        <span className="block text-[10px] text-slate-500">Periodic FA II test dates & holidays</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setQuery('van')}
                      className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-200 rounded-2xl flex items-center space-x-3 transition text-left"
                    >
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Bus className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900">Van Transit & Bus Routes</span>
                        <span className="block text-[10px] text-slate-500">Pangei, Sawombung & transit fares</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setQuery('map')}
                      className="p-3.5 bg-slate-50 hover:bg-rose-50/60 border border-slate-200/80 hover:border-rose-200 rounded-2xl flex items-center space-x-3 transition text-left"
                    >
                      <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900">Google Map Location</span>
                        <span className="block text-[10px] text-slate-500">Waiton Lamkhai, Imphal East</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setQuery('teacher')}
                      className="p-3.5 bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-200 rounded-2xl flex items-center space-x-3 transition text-left"
                    >
                      <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900">Faculty & Teacher Console</span>
                        <span className="block text-[10px] text-slate-500">Attendance upload & teacher portal</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>Press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">ESC</kbd> to close</span>
              <span>LITTLE HOUSE Search Engine</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
