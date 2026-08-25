'use client';

import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  Barcode, 
  Copy, 
  Check,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { formatDateSafe } from '@/lib/dateUtils';

export interface AdmissionItem {
  id: string;
  studentName: string;
  grade: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string | null;
  amount: number;
  paymentReference: string | null;
  createdAt: string | Date;
}

export default function AdminAdmissionsList({ 
  admissions 
}: { 
  admissions: AdmissionItem[] 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionItem | null>(null);

  // Quick Reference ID Matcher Bar
  const [quickRefQuery, setQuickRefQuery] = useState('');
  const [quickMatchResult, setQuickMatchResult] = useState<AdmissionItem | null | 'NOT_FOUND'>(null);

  const handleQuickMatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = quickRefQuery.trim().toLowerCase();
    if (!query) {
      setQuickMatchResult(null);
      return;
    }

    const match = admissions.find((a) => {
      const ref = a.paymentReference?.toLowerCase() || '';
      const id = a.id.toLowerCase();
      const phone = a.parentPhone?.toLowerCase() || '';
      const name = a.studentName.toLowerCase();
      return ref === query || ref.includes(query) || id.startsWith(query) || phone.includes(query) || name.includes(query);
    });

    if (match) {
      setQuickMatchResult(match);
    } else {
      setQuickMatchResult('NOT_FOUND');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Grade list for filtering
  const grades = useMemo(() => {
    const set = new Set(admissions.map(a => a.grade).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [admissions]);

  // Filtered Admissions
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((adm) => {
      // Grade filter
      if (selectedGrade !== 'ALL' && adm.grade !== selectedGrade) {
        return false;
      }

      // Search filter
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase().trim();
      const studentName = adm.studentName?.toLowerCase() || '';
      const grade = adm.grade?.toLowerCase() || '';
      const parentName = adm.parentName?.toLowerCase() || '';
      const parentEmail = adm.parentEmail?.toLowerCase() || '';
      const parentPhone = adm.parentPhone?.toLowerCase() || '';
      const ref = adm.paymentReference?.toLowerCase() || '';

      return (
        studentName.includes(query) ||
        grade.includes(query) ||
        parentName.includes(query) ||
        parentEmail.includes(query) ||
        parentPhone.includes(query) ||
        ref.includes(query)
      );
    });
  }, [admissions, searchTerm, selectedGrade]);

  const totalCollected = useMemo(() => {
    return admissions.reduce((sum, a) => sum + (a.amount || 0), 0);
  }, [admissions]);

  return (
    <div className="space-y-6 text-left">
      {/* 🚀 QUICK REFERENCE NUMBER LOOKUP & SEARCH BAR */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
              <Barcode className="h-3.5 w-3.5" />
              <span>OFFICE RECEIPT CHECKER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Physical Receipt Reference Matcher
            </h2>
            <p className="text-xs text-slate-300 font-normal">
              Type or paste the <strong>Reference / UTR Number</strong> from a parent&apos;s physical receipt to cross-check against the official website log.
            </p>
          </div>

          <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-right flex-shrink-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Logged Submissions</span>
            <span className="text-xl font-black text-amber-400">{admissions.length} Receipts</span>
          </div>
        </div>

        {/* Quick Search Form */}
        <form onSubmit={handleQuickMatch} className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="relative flex-1">
            <Barcode className="h-5 w-5 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickRefQuery}
              onChange={(e) => {
                setQuickRefQuery(e.target.value);
                if (!e.target.value.trim()) setQuickMatchResult(null);
              }}
              placeholder="Enter Reference ID or UTR (e.g. pay_LH_... or 12-digit number)..."
              className="w-full pl-12 pr-10 py-3.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-950 font-mono text-sm rounded-2xl border border-white/20 focus:border-amber-400 focus:outline-none transition font-bold placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal"
            />
            {quickRefQuery && (
              <button
                type="button"
                onClick={() => {
                  setQuickRefQuery('');
                  setQuickMatchResult(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition shadow-md flex-shrink-0"
          >
            <Search className="h-4 w-4" />
            <span>MATCH REFERENCE</span>
          </button>
        </form>

        {/* Quick Match Found Card */}
        {quickMatchResult && quickMatchResult !== 'NOT_FOUND' && (
          <div className="bg-emerald-950/80 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/60 animate-slideDown flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl flex-shrink-0 border border-emerald-400/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 uppercase">
                    GENUINE RECEIPT MATCH FOUND
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    Ref: <strong>{quickMatchResult.paymentReference}</strong>
                  </span>
                </div>
                <h4 className="text-lg font-extrabold text-white mt-1">
                  {quickMatchResult.studentName} • <span className="text-amber-300">{quickMatchResult.grade}</span>
                </h4>
                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <span>Parent: <strong className="text-white">{quickMatchResult.parentName}</strong></span>
                  {quickMatchResult.parentPhone && <span>Phone: <strong className="text-white font-mono">{quickMatchResult.parentPhone}</strong></span>}
                  <span>Amount: <strong className="text-amber-400 font-mono">₹{quickMatchResult.amount.toLocaleString('en-IN')}</strong></span>
                  <span>Date: <strong className="text-slate-200 font-mono">{formatDateSafe(quickMatchResult.createdAt, 'short')}</strong></span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAdmission(quickMatchResult)}
              className="px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-xs transition shadow-sm flex-shrink-0"
            >
              View Full Receipt
            </button>
          </div>
        )}

        {/* No Match Alert */}
        {quickMatchResult === 'NOT_FOUND' && (
          <div className="bg-red-950/90 border border-red-700/80 text-red-200 p-4 rounded-2xl flex items-center justify-between text-xs animate-shake">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span>
                ⚠️ <strong>Reference Not Found:</strong> No admission receipt with reference <code>&ldquo;{quickRefQuery}&rdquo;</code> exists in the website log. Please verify if the reference was entered correctly.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setQuickMatchResult(null)}
              className="text-red-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Database Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header & Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/60">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-sky-600" />
              <span>Admission Receipts Database</span>
              <span className="text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full ml-1">
                {filteredAdmissions.length} of {admissions.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Browse, filter by grade, or search admission payment records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Grade Filter Select */}
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-slate-800 shadow-sm"
            >
              {grades.map(g => (
                <option key={g} value={g}>{g === 'ALL' ? 'All Grades' : `Grade: ${g}`}</option>
              ))}
            </select>

            {/* General Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, phone, ref..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 placeholder-slate-400 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 font-mono font-bold text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student & Grade</th>
                <th className="py-3.5 px-4">Parent Details</th>
                <th className="py-3.5 px-4">Fee Amount</th>
                <th className="py-3.5 px-4">Payment Reference ID</th>
                <th className="py-3.5 px-4">Submission Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-slate-600">No admission receipts match.</p>
                    <p className="text-[11px] mt-0.5">Try searching with a different name, phone, or reference number.</p>
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{adm.studentName}</div>
                      <div className="inline-block mt-1">
                        <span className="bg-sky-50 text-sky-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-sky-100">
                          {adm.grade}
                        </span>
                      </div>
                    </td>

                    {/* Parent Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{adm.parentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{adm.parentEmail}</span>
                      </div>
                      {adm.parentPhone && (
                        <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
                          <Phone className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          <span>{adm.parentPhone}</span>
                        </div>
                      )}
                    </td>

                    {/* Fee Amount */}
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                      ₹{adm.amount.toLocaleString('en-IN')}
                    </td>

                    {/* Reference ID */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg border border-slate-200 inline-block text-[11px] select-all">
                          {adm.paymentReference || 'N/A'}
                        </span>
                        {adm.paymentReference && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(adm.paymentReference!, adm.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                            title="Copy Reference"
                          >
                            {copiedId === adm.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {formatDateSafe(adm.createdAt, 'short')}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAdmission(adm)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition border border-slate-200"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scaleUp text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-400/30 text-amber-400">
                  <Barcode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Admission Receipt Record</h3>
                  <p className="text-xs text-slate-300 font-mono">Date: {formatDateSafe(selectedAdmission.createdAt, 'short')}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-mono uppercase text-[10px]">Student Name</span>
                  <strong className="text-slate-900 text-sm font-extrabold">{selectedAdmission.studentName}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px]">Grade</span>
                    <strong className="text-slate-800">{selectedAdmission.grade}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px]">Fee Amount</span>
                    <strong className="text-emerald-700 font-mono text-sm">₹{selectedAdmission.amount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px]">Parent</span>
                    <strong className="text-slate-800">{selectedAdmission.parentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-mono text-[10px]">Phone</span>
                    <strong className="text-slate-800 font-mono">{selectedAdmission.parentPhone || 'N/A'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-mono uppercase text-[10px] block">Payment Reference ID</span>
                  <div className="mt-1 font-mono font-bold text-sm bg-white p-2.5 rounded-xl border border-slate-300 text-slate-900 select-all flex items-center justify-between">
                    <span>{selectedAdmission.paymentReference || 'N/A'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedAdmission.paymentReference || '', selectedAdmission.id)}
                      className="text-xs text-sky-600 hover:text-sky-800 font-sans font-bold flex items-center space-x-1"
                    >
                      {copiedId === selectedAdmission.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAdmission(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
