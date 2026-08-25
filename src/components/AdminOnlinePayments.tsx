'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Download, 
  CheckCircle2, 
  Loader2, 
  FileSpreadsheet, 
  ShieldCheck, 
  Receipt, 
  Calendar, 
  User, 
  ExternalLink,
  Printer,
  Copy,
  Check,
  Smartphone,
  Building
} from 'lucide-react';

interface FeePaymentRecord {
  id: string;
  receiptNo: string;
  studentName: string;
  admissionNo: string;
  studentClass: string;
  parentPhone?: string | null;
  paidMonths: string;
  tuitionFee: number;
  totalAmount: number;
  paymentMode: string;
  paymentRef: string;
  paymentStatus: string;
  createdAt: string;
}

const MONTHS_LIST = [
  'ALL MONTHS',
  'April 2026', 'May 2026', 'June 2026', 'July 2026',
  'August 2026', 'September 2026', 'October 2026',
  'November 2026', 'December 2026', 'January 2027',
  'February 2027', 'March 2027'
];

export default function AdminOnlinePayments() {
  const [payments, setPayments] = useState<FeePaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL MONTHS');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOnlinePayments();
  }, []);

  const fetchOnlinePayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/public/pay-fee?admissionNo=ALL_RECORDS');
      const data = await res.json();
      if (res.ok && data.payments) {
        // Filter exclusively for online payments (UPI, ONLINE_RAZORPAY, RAZORPAY)
        const onlineOnly = data.payments.filter((p: FeePaymentRecord) => 
          p.paymentMode !== 'CASH_OFFLINE' && p.paymentMode !== 'CASH'
        );
        setPayments(onlineOnly);
      }
    } catch (err) {
      console.error('Error fetching online payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paymentRef.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMonth = 
      selectedMonth === 'ALL MONTHS' || p.paidMonths.includes(selectedMonth);

    return matchesSearch && matchesMonth;
  });

  const totalOnlineCollected = filteredPayments.reduce((sum, p) => sum + p.totalAmount, 0);

  const exportCSV = () => {
    if (filteredPayments.length === 0) return;
    const header = 'Receipt No,Student Name,Admission No,Class,Paid Months,Amount (INR),Payment Mode,Razorpay Ref,Payment Date\n';
    const rows = filteredPayments.map((p) => 
      `"${p.receiptNo}","${p.studentName}","${p.admissionNo}","${p.studentClass}","${p.paidMonths}",${p.totalAmount},"${p.paymentMode}","${p.paymentRef}","${new Date(p.createdAt).toLocaleString()}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LHS_Online_Razorpay_Payments_Ledger.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 select-none text-left animate-fadeIn">
      {/* Top Banner & KPI Cards */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 text-white p-6 sm:p-8 rounded-[32px] shadow-xl border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full uppercase flex items-center space-x-1.5 w-fit">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>EXCLUSIVE ONLINE RAZORPAY LEDGER</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Online Payment Audit Records</h2>
          <p className="text-xs text-emerald-200 font-normal max-w-xl">
            Dedicated portal menu recording all tuition fees paid online via Razorpay, Google Pay, PhonePe, Paytm, and NetBanking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/90 border border-emerald-500/30 p-3.5 rounded-2xl text-left min-w-[150px]">
            <span className="block text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-wider">
              Total Online Collected
            </span>
            <span className="text-xl font-black text-amber-300">
              ₹{totalOnlineCollected.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={exportCSV}
            disabled={filteredPayments.length === 0}
            className="px-4 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-2xl transition flex items-center space-x-1.5 shadow-lg active:scale-95 border border-emerald-300 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-950" />
            <span>Export Online Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, admission no, receipt no, or pay_... ID"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            {MONTHS_LIST.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Loading online Razorpay records...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CreditCard className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Online Payments Found</h4>
            <p className="text-xs text-slate-400">No online Razorpay fee transactions match your current search query or month filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4">Receipt No</th>
                  <th className="py-3.5 px-4">Student Name & Class</th>
                  <th className="py-3.5 px-4">Adm No</th>
                  <th className="py-3.5 px-4">Paid Month(s)</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Razorpay Reference ID</th>
                  <th className="py-3.5 px-4">Gateway</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      {p.receiptNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.studentName}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{p.studentClass}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">
                      {p.admissionNo}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">
                      {p.paidMonths}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-700 text-sm">
                      ₹{p.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg font-mono font-bold text-[11px]">
                        <span>{p.paymentRef}</span>
                        <button
                          onClick={() => copyToClipboard(p.paymentRef)}
                          className="hover:text-emerald-600 transition"
                          title="Copy Razorpay Ref ID"
                        >
                          {copiedId === p.paymentRef ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        <span>Razorpay</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
