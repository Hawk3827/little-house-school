'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft, ShieldAlert, Sparkles, UserCheck, Shield } from 'lucide-react';

function getSafeRedirect(redirectParam: string | null, defaultPath: string): string {
  if (!redirectParam) return defaultPath;
  if (redirectParam.startsWith('/') && !redirectParam.startsWith('//') && !redirectParam.includes(':')) {
    return redirectParam;
  }
  return defaultPath;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const redirectUrl = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      // Successful login, safe redirect based on role or whitelisted local path
      const rolePath = data.role.toLowerCase();
      const targetPath = getSafeRedirect(redirectUrl, `/portal/${rolePath}`);
      router.push(targetPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
      setLoading(false);
    }
  };

  // Instant 1-Click Fast Login
  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      const rolePath = data.role.toLowerCase();
      router.push(`/portal/${rolePath}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative text-slate-900">
      {/* Home Link */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center space-x-2 text-slate-500 hover:text-sky-600 transition text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="p-2">
          <img src="/school-logo.png" alt="LITTLE HOUSE Logo" className="h-20 w-20 object-contain" />
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          LITTLE HOUSE
        </h2>
        <p className="mt-1 text-center text-xs font-mono font-bold text-sky-700 uppercase tracking-wider">
          Teacher & Administrator Access Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg border border-sky-100 rounded-3xl space-y-6">
          {/* Idle Timeout Notification */}
          {reason === 'idle_timeout' && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 font-medium flex items-start space-x-2.5 animate-fadeIn">
              <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Session Timed Out:</strong> You were automatically logged out after 20 minutes of inactivity to protect student records.
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white text-sm transition text-slate-900"
                  placeholder="teacher@school.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white text-sm transition text-slate-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 rounded-xl shadow-md text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-300 focus:outline-none disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Console</span>
              )}
            </button>
          </form>

          {/* ⚡ 1-Click Fast Demo Logins */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>1-CLICK INSTANT LOGIN (TEST ACCOUNTS)</span>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('teacher1@school.com', 'teacher123')}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 p-3 rounded-2xl font-bold text-left border border-amber-200 transition flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-amber-200 text-amber-900 rounded-lg">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Teacher: Sarah Jenkins</span>
                    <span className="block text-[10px] font-mono text-amber-700">teacher@school.com / teacher123</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-amber-200/80 px-2 py-0.5 rounded text-amber-900 group-hover:bg-amber-300 transition">
                  1-Click Login →
                </span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin('admin@school.com', 'admin123')}
                className="w-full bg-sky-50 hover:bg-sky-100 text-sky-900 p-3 rounded-2xl font-bold text-left border border-sky-200 transition flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-sky-200 text-sky-900 rounded-lg">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Admin: Principal Arthur Vance</span>
                    <span className="block text-[10px] font-mono text-sky-700">admin@school.com / admin123</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-sky-200/80 px-2 py-0.5 rounded text-sky-900 group-hover:bg-sky-300 transition">
                  1-Click Login →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
