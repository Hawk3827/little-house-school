'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, KeyRound, Loader2, CheckCircle2, AlertCircle, X, ShieldCheck, Hash } from 'lucide-react';

interface ChangeAdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  adminEmail: string;
}

export default function ChangeAdminPasswordModal({
  isOpen,
  onClose,
  adminName,
  adminEmail,
}: ChangeAdminPasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'PASSWORD' | 'PIN'>('PASSWORD');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // PIN state
  const [pinCurrentPassword, setPinCurrentPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/update-password-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccessMsg(data.message || 'Your password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!pinCurrentPassword || !newPin || !confirmPin) {
      setError('Please fill in current password and PIN fields.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PIN and confirmation PIN do not match.');
      return;
    }

    if (!/^\d{4,6}$/.test(newPin.trim())) {
      setError('Security PIN must be a 4-to-6 digit numeric code (e.g. 7951).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/update-pin-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pinCurrentPassword,
          newPin: newPin.trim(),
          confirmPin: confirmPin.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update PIN.');
      }

      setSuccessMsg(data.message || 'Your Staff Security PIN has been updated successfully!');
      setPinCurrentPassword('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your PIN.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl w-full max-w-md overflow-hidden text-left select-none space-y-4 p-6 relative z-[100000]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded uppercase">
                ADMIN SELF-SERVICE SECURITY
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">Account Credentials & PIN</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Managing credentials for <strong className="text-slate-800">{adminEmail}</strong> ({adminName}).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => { setActiveTab('PASSWORD'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'PASSWORD'
                ? 'bg-white text-purple-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('PIN'); setError(''); setSuccessMsg(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'PIN'
                ? 'bg-white text-purple-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Hash className="h-3.5 w-3.5" />
            <span>Change Security PIN</span>
          </button>
        </div>

        {/* Security Policy Alert Banner */}
        <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-start space-x-2.5 text-xs text-purple-900 font-medium">
          <ShieldCheck className="h-4 w-4 text-purple-700 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">
            {activeTab === 'PASSWORD'
              ? 'Security Policy: You are modifying your login password. Other admin accounts remain unmodifiable.'
              : 'PIN Conflict Policy: Every admin/staff PIN must be strictly unique across the school for fee audit accountability.'}
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs font-extrabold text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2 text-xs font-bold text-rose-800 animate-fadeIn">
            <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: PASSWORD FORM */}
        {activeTab === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SECURITY PIN FORM */}
        {activeTab === 'PIN' && (
          <form onSubmit={handlePinSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password Verification *
              </label>
              <input
                type="password"
                required
                value={pinCurrentPassword}
                onChange={(e) => setPinCurrentPassword(e.target.value)}
                placeholder="Verify with your login password..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Staff Security PIN (4-6 Digits) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 7951"
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest text-purple-900 bg-purple-50/50 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Security PIN *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Re-enter new 4-digit PIN..."
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest text-purple-900 bg-purple-50/50 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving PIN...</span>
                  </>
                ) : (
                  <>
                    <Hash className="h-3.5 w-3.5" />
                    <span>Save New PIN</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
