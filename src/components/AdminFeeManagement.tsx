'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Receipt, 
  Calendar, 
  User, 
  GraduationCap, 
  Phone, 
  Download, 
  Printer, 
  Sparkles,
  Filter,
  DollarSign,
  X,
  ShieldCheck,
  FileSpreadsheet,
  Upload,
  Check,
  Edit2,
  ArrowRight
} from 'lucide-react';

interface StudentMatrixItem {
  id: string;
  name: string;
  admissionNo: string;
  phone: string;
  class: string;
}

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

const ACADEMIC_MONTHS = [
  'April 2026', 'May 2026', 'June 2026', 'July 2026',
  'August 2026', 'September 2026', 'October 2026',
  'November 2026', 'December 2026', 'January 2027',
  'February 2027', 'March 2027'
];

const CLASSES_LIST = [
  'ALL CLASSES', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI',
  'Lower KG', 'Upper KG', 'Nursery', 'Play-Group'
];

const PURE_CLASSES = [
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI',
  'Lower KG', 'Upper KG', 'Nursery', 'Play-Group'
];

export default function AdminFeeManagement() {
  const [students, setStudents] = useState<StudentMatrixItem[]>([]);
  const [payments, setPayments] = useState<FeePaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL CLASSES');

  // Custom Spreadsheet Export Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'WHOLE_SCHOOL' | 'SINGLE_CLASS' | 'MULTI_CLASS'>('WHOLE_SCHOOL');
  const [exportSingleClass, setExportSingleClass] = useState('Class I');
  const [exportSelectedClasses, setExportSelectedClasses] = useState<string[]>([...PURE_CLASSES]);

  const toggleExportClassSelection = (cls: string) => {
    if (exportSelectedClasses.includes(cls)) {
      setExportSelectedClasses(exportSelectedClasses.filter((c) => c !== cls));
    } else {
      setExportSelectedClasses([...exportSelectedClasses, cls]);
    }
  };

  const selectAllExportClasses = () => {
    setExportSelectedClasses([...PURE_CLASSES]);
  };

  const deselectAllExportClasses = () => {
    setExportSelectedClasses([]);
  };

  // Quick Cell Fee Marking Modal State
  const [cellModalOpen, setCellModalOpen] = useState(false);
  const [cellStudent, setCellStudent] = useState<StudentMatrixItem | null>(null);
  const [cellMonth, setCellMonth] = useState('');
  const [cellMode, setCellMode] = useState<'ONLINE_UPI' | 'OFFLINE_CASH'>('ONLINE_UPI');
  const [cellRefId, setCellRefId] = useState('');
  const [cellAmount, setCellAmount] = useState('1200');
  const [cellStaffPin, setCellStaffPin] = useState('');
  const [cellSubmitting, setCellSubmitting] = useState(false);
  const [cellError, setCellError] = useState('');
  const [isEditingCell, setIsEditingCell] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null);

  const handleCellClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    student: StudentMatrixItem,
    month: string,
    payment: FeePaymentRecord | undefined
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverHeight = 360;
    const popoverWidth = 320;

    let top: number | undefined = undefined;
    let bottom: number | undefined = undefined;

    if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
      // Automatically flip UPWARDS right above the clicked month button!
      bottom = window.innerHeight - rect.top + 6;
    } else {
      // Open BELOW the clicked month button!
      top = rect.bottom + 6;
    }

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    if (left < 16) left = 16;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }

    setPopoverPos({ top, bottom, left });
    setCellStudent(student);
    setCellMonth(month);

    if (payment) {
      setCellRefId(payment.paymentRef);
      setCellMode(payment.paymentMode === 'CASH_OFFLINE' ? 'OFFLINE_CASH' : 'ONLINE_UPI');
      setIsEditingCell(false);
    } else {
      setCellRefId('');
      setIsEditingCell(true);
    }
    setCellModalOpen(true);
  };

  // Bulk CSV Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [importSuccessCount, setImportSuccessCount] = useState(0);

  const downloadSampleTemplate = () => {
    const csvHeader = 'Admission No,Student Name,Class,Paid Month,Payment Mode,Reference Number,Amount\n';
    const sampleRows = [
      'LHS-2026-7220,Chanu Nungshiba,Class III,August 2026,UPI,428195829104,1200',
      'LHS-2026-101,Khuman Tomba,Class I,August 2026,CASH,REC-2026-9482,1200',
      'LHS-2026-102,Ningthouja Linthoingambi,Class I,September 2026,UPI,429104829105,1200'
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LHS_Sample_Fee_Import_Template.csv';
    link.click();
  };

  const handleCSVImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportLogs([]);
    setImportSuccessCount(0);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        
        if (lines.length < 2) {
          setImportLogs(['Error: CSV file is empty or missing data rows.']);
          setImporting(false);
          return;
        }

        const logs: string[] = [];
        let successCounter = 0;

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length < 4) continue;

          const [admNo, name, studentClass, month, modeStr, refNo, amtStr] = cols;
          if (!admNo || !month) continue;

          const mode = modeStr && modeStr.toUpperCase().includes('CASH') ? 'CASH_OFFLINE' : 'UPI_ONLINE';
          const ref = refNo || `REF-${Date.now().toString().slice(-6)}`;
          const amount = Number(amtStr) || 1200;

          try {
            const res = await fetch('/api/public/pay-fee', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                admissionNo: admNo,
                studentName: name || 'Student',
                studentClass: studentClass || 'Class I',
                paidMonths: month,
                paymentMode: mode,
                paymentRef: ref,
                tuitionFee: amount,
                transportFee: 0,
                totalAmount: amount,
              }),
            });

            if (res.ok) {
              successCounter++;
              logs.push(`✓ Imported fee for ${admNo} (${month}) - Ref: ${ref}`);
            } else {
              const errData = await res.json();
              logs.push(`✕ Failed ${admNo}: ${errData.error || 'Server error'}`);
            }
          } catch (err: any) {
            logs.push(`✕ Error for ${admNo}: ${err.message}`);
          }
        }

        setImportSuccessCount(successCounter);
        setImportLogs(logs);
        fetchMatrixData(); // Refresh spreadsheet matrix
      } catch (err: any) {
        setImportLogs([`Import error: ${err.message}`]);
      } finally {
        setImporting(false);
      }
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/public/pay-fee?admissionNo=ALL_RECORDS');
      const data = await res.json();
      if (res.ok) {
        if (data.students) setStudents(data.students);
        if (data.payments) setPayments(data.payments);
      }
    } catch (err) {
      console.error('Error fetching fee matrix data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCellFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellStudent || !cellMonth || !cellRefId.trim()) {
      setCellError('Please enter Reference ID or Receipt Number.');
      return;
    }
    if (!cellStaffPin.trim()) {
      setCellError('Please enter your Staff Security PIN for accountability audit.');
      return;
    }

    setCellSubmitting(true);
    setCellError('');

    try {
      const payload = {
        studentName: cellStudent.name,
        admissionNo: cellStudent.admissionNo,
        studentClass: cellStudent.class || selectedClass,
        parentPhone: cellStudent.phone || '',
        paidMonths: cellMonth,
        tuitionFee: Number(cellAmount),
        transportFee: 0,
        totalAmount: Number(cellAmount),
        paymentMode: cellMode === 'ONLINE_UPI' ? 'UPI_ONLINE' : 'CASH_OFFLINE',
        paymentRef: cellRefId.trim(),
        securityPin: cellStaffPin.trim(),
      };

      const res = await fetch('/api/public/pay-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save fee payment.');
      }

      setPayments([data.payment, ...payments]);
      setCellModalOpen(false);
      setCellRefId('');
      setCellStaffPin('');
    } catch (err: any) {
      setCellError(err.message || 'Error saving fee payment.');
    } finally {
      setCellSubmitting(false);
    }
  };

  // Filter students by selected class & search query
  const classStudents = students.filter((s) => {
    const matchesClass = selectedClass === 'ALL CLASSES' || s.class.toLowerCase() === selectedClass.toLowerCase();
    const matchesQuery = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesQuery;
  });

  // Helper to find existing payment record for a student & month
  const getFeeStatus = (admissionNo: string, month: string) => {
    return payments.find(
      (p) => p.admissionNo === admissionNo && p.paidMonths.includes(month)
    );
  };

  // Custom Spreadsheet Export (Whole School, Single Class, or Selected Multi-Classes)
  const executeSpreadsheetExport = () => {
    let targetClasses: string[] = [];

    if (exportScope === 'WHOLE_SCHOOL') {
      targetClasses = PURE_CLASSES;
    } else if (exportScope === 'SINGLE_CLASS') {
      targetClasses = [exportSingleClass];
    } else {
      targetClasses = exportSelectedClasses;
    }

    if (targetClasses.length === 0) {
      alert('Please select at least one class to export.');
      return;
    }

    const targetStudents = students.filter((s) => 
      targetClasses.some((c) => c.toLowerCase() === s.class.toLowerCase())
    );

    if (targetStudents.length === 0) {
      alert('No student records found for the selected class(es).');
      return;
    }

    const headers = ['Admission No', 'Student Name', 'Class', 'Phone', ...ACADEMIC_MONTHS, 'Total Paid Months', 'Total Amount Paid (INR)'];
    const rows = targetStudents.map((s) => {
      let paidCount = 0;
      const row = [s.admissionNo, s.name, s.class, s.phone || 'N/A'];
      
      ACADEMIC_MONTHS.forEach((m) => {
        const p = getFeeStatus(s.admissionNo, m);
        if (p) {
          paidCount++;
          row.push(`PAID (${p.paymentMode === 'CASH_OFFLINE' ? 'CASH' : 'UPI'}:${p.paymentRef})`);
        } else {
          row.push('UNPAID');
        }
      });

      row.push(paidCount.toString());
      row.push((paidCount * 1200).toString());
      return row;
    });

    const scopeTitle = exportScope === 'WHOLE_SCHOOL'
      ? 'Whole_School_All_Students'
      : exportScope === 'SINGLE_CLASS'
      ? exportSingleClass.replace(/\s+/g, '_')
      : `Combined_${targetClasses.length}_Classes`;

    const metadataHeader = [
      `"LITTLE HOUSE SCHOOL - OFFICIAL MONTHLY FEE REGISTER (2026-2027)"`,
      `"Export Scope: ${exportScope} | Classes Included: ${targetClasses.join(', ')} | Total Students: ${targetStudents.length} | Exported: ${new Date().toLocaleString()}"`,
      `""`,
    ].join('\n');

    const csvContent = metadataHeader + '\n' + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LHS_Fee_Register_${scopeTitle}_2026.csv`;
    link.click();

    setExportModalOpen(false);
  };

  return (
    <div className="space-y-6 select-none text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 text-white p-6 sm:p-8 rounded-[32px] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full uppercase">
            CLASS-WISE FEE SPREADSHEET MATRIX
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Monthly Student Fee Register</h2>
          <p className="text-xs text-sky-200 font-normal">Click any month cell to view or mark online UTR reference IDs and offline cash receipt numbers.</p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-2xl transition flex items-center space-x-1.5 shadow-lg active:scale-95 border border-amber-300"
            title="Bulk import fee payments from Excel / CSV file"
          >
            <Upload className="h-4 w-4 text-slate-950" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-2xl transition flex items-center space-x-1.5 shadow-lg active:scale-95"
            title="Download fee register spreadsheet for Whole School, Single Class, or Multiple Selected Classes"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Class Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar border-b border-slate-200">
        {CLASSES_LIST.map((cls) => {
          const isActive = selectedClass.toLowerCase() === cls.toLowerCase();
          const classCount = students.filter((s) => s.class.toLowerCase() === cls.toLowerCase()).length;
          return (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 flex-shrink-0 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cls}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {classCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Full-Width Search Bar Toolbar with Search Button */}
      <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1 w-full flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search student name, admission no, or class in ${selectedClass}...`}
            className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
          <button
            type="button"
            className="absolute right-2 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1 shadow-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* SPREADSHEET MATRIX TABLE */}
      <div className="bg-white rounded-3xl border border-sky-100 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-sky-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Loading class fee matrix...</p>
          </div>
        ) : classStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto" />
            <h4 className="font-extrabold text-slate-800 text-base">No Students Enrolled in {selectedClass}</h4>
            <p className="text-xs text-slate-500">Enroll new students or select another class tab above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-12">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white text-[10px] font-mono font-bold uppercase tracking-wider sticky top-0 z-20">
                <tr>
                  <th className="py-3.5 px-4 min-w-[180px] bg-slate-900 sticky left-0 z-30 shadow-md">Student Name</th>
                  <th className="py-3.5 px-3 min-w-[130px]">Adm No</th>
                  {ACADEMIC_MONTHS.map((m) => (
                    <th key={m} className="py-3.5 px-3 min-w-[125px] text-center border-l border-slate-800">
                      {m.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {classStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-sky-50/50 transition">
                    {/* Sticky Student Name Column */}
                    <td className="py-3 px-4 font-bold text-slate-900 bg-white sticky left-0 z-10 shadow-xs border-r border-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="truncate">{student.name}</span>
                        <span className="text-[9px] font-mono font-bold bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded border border-sky-200 uppercase flex-shrink-0">
                          {student.class}
                        </span>
                      </div>
                      <span className="block text-[10px] font-mono text-slate-400 font-normal">{student.phone || 'No Phone'}</span>
                    </td>

                    {/* Admission Number */}
                    <td className="py-3 px-3 font-mono font-bold text-sky-900 text-[11px]">
                      {student.admissionNo}
                    </td>

                    {/* Monthly Status Cells */}
                    {ACADEMIC_MONTHS.map((month) => {
                      const payment = getFeeStatus(student.admissionNo, month);
                      const isCellActive = cellModalOpen && cellStudent?.admissionNo === student.admissionNo && cellMonth === month;

                      return (
                        <td key={month} className="py-2 px-2 text-center border-l border-slate-100">
                          {payment ? (
                            <button
                              onClick={(e) => handleCellClick(e, student, month, payment)}
                              className="w-full p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition group cursor-pointer"
                              title={`Paid on ${new Date(payment.createdAt).toLocaleDateString()}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-extrabold text-emerald-800 uppercase">
                                  {payment.paymentMode === 'CASH_OFFLINE' ? 'CASH' : payment.paymentMode.includes('RAZORPAY') ? 'RAZORPAY' : 'UPI'}
                                </span>
                                <Check className="h-3 w-3 text-emerald-600" />
                              </div>
                              <span className="block text-[10px] font-mono text-slate-700 font-bold truncate mt-0.5">
                                {payment.paymentRef}
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleCellClick(e, student, month, undefined)}
                              className="w-full py-2 px-2 rounded-xl bg-slate-50 hover:bg-sky-100 border border-dashed border-slate-200 hover:border-sky-300 text-slate-400 hover:text-sky-800 text-[11px] font-mono font-bold transition cursor-pointer"
                            >
                              + Mark Paid
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* ANCHORED CONTEXTUAL POPOVER RIGHT AT PRESSED MONTH CELL RECORD */}
      {cellModalOpen && cellStudent && cellMonth && popoverPos && (() => {
        const activePayment = payments.find(
          (p) => p.admissionNo === cellStudent.admissionNo && p.paidMonths === cellMonth
        );

        return (
          <>
            <div 
              className="fixed inset-0 z-[99998] bg-black/20 backdrop-blur-[1px]"
              onClick={() => setCellModalOpen(false)}
            />
            <div 
              style={{
                position: 'fixed',
                top: popoverPos.top !== undefined ? `${popoverPos.top}px` : undefined,
                bottom: popoverPos.bottom !== undefined ? `${popoverPos.bottom}px` : undefined,
                left: `${popoverPos.left}px`,
                width: '320px',
              }}
              className="z-[99999] bg-white rounded-2xl border border-sky-200 shadow-2xl p-4 text-left animate-fadeIn shadow-sky-900/20 select-none flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <div>
                  <span className="text-[9px] font-mono font-bold text-sky-700 uppercase tracking-widest bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                    FEE RECORD COUNTER
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-xs mt-0.5">{cellStudent.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{cellStudent.admissionNo} • {cellMonth}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCellModalOpen(false)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {activePayment && !isEditingCell ? (
                  /* PROTECTED READ-ONLY VERIFIED VIEW */
                  <div className="space-y-4 animate-fadeIn">
                    <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-2.5 text-xs font-mono">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
                        <span className="text-[11px] font-bold text-emerald-900 uppercase flex items-center space-x-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Verified &amp; Paid</span>
                        </span>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded font-extrabold">
                          {activePayment.paymentMode === 'CASH_OFFLINE'
                            ? 'CASH RECEIPT'
                            : activePayment.paymentMode.includes('RAZORPAY')
                            ? 'RAZORPAY GATEWAY'
                            : 'UPI ONLINE'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Reference / UTR:</span>
                        <span className="font-bold text-slate-900">{activePayment.paymentRef}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Receipt No:</span>
                        <span className="font-bold text-sky-900">{activePayment.receiptNo}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Amount Paid:</span>
                        <span className="font-extrabold text-emerald-700 text-sm">₹{activePayment.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-200/70 pt-2 text-slate-700">
                        <span>Recorded By:</span>
                        <span className="font-bold text-purple-900 flex items-center space-x-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-purple-600 inline" />
                          <span>{(activePayment as any).recordedBy || 'Admin Office'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingCell(true)}
                        className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Edit Record Reference</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCellModalOpen(false)}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  /* EDITABLE FORM MODE */
                  <form onSubmit={handleMarkCellFee} className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                        Payment Mode <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCellMode('ONLINE_UPI')}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                            cellMode === 'ONLINE_UPI'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>UPI Online</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCellMode('OFFLINE_CASH')}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                            cellMode === 'OFFLINE_CASH'
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <DollarSign className="h-4 w-4" />
                          <span>Offline Cash</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                        {cellMode === 'ONLINE_UPI' ? 'UPI UTR Reference ID *' : 'Cash Receipt Number *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={cellRefId}
                        onChange={(e) => setCellRefId(e.target.value)}
                        placeholder={cellMode === 'ONLINE_UPI' ? 'e.g. 428195829104' : 'e.g. REC-2026-8492'}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                        Amount Paid (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={cellAmount}
                        onChange={(e) => setCellAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-extrabold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* STAFF SECURITY PIN FOR ACCOUNTABILITY */}
                    <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-1.5">
                      <label className="block text-[11px] font-extrabold text-purple-900 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <ShieldCheck className="h-4 w-4 text-purple-700" />
                          <span>Staff Security PIN *</span>
                        </span>
                        <span className="text-[9px] font-mono text-purple-600 font-normal">Accountability Audit</span>
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={6}
                        value={cellStaffPin}
                        onChange={(e) => setCellStaffPin(e.target.value)}
                        placeholder="Enter your Staff PIN (e.g. 1234)"
                        className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 placeholder:text-purple-300"
                      />
                    </div>

                    {cellError && (
                      <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">{cellError}</p>
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        type="submit"
                        disabled={cellSubmitting}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {cellSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
                        <span>Save Payment Record</span>
                      </button>
                      {activePayment && (
                        <button
                          type="button"
                          onClick={() => setIsEditingCell(false)}
                          className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </>
        );
      })()}

      {/* BULK EXCEL / CSV IMPORT MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-slate-900">
                <Upload className="h-6 w-6 text-amber-500" />
                <h3 className="text-lg font-black">Bulk Import Fee Records (CSV/Excel)</h3>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload a CSV spreadsheet containing fee payment records to bulk-import student fee statuses instantly into the fee matrix.
              </p>

              {/* Sample Template Download */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-sky-900">Need the correct format?</span>
                  <span className="text-[10px] text-sky-700">Download the official sample CSV import template.</span>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-xs flex-shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Sample Template</span>
                </button>
              </div>

              {/* File Input Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50 p-6 rounded-2xl text-center space-y-3 transition">
                <FileSpreadsheet className="h-10 w-10 text-amber-500 mx-auto" />
                <div>
                  <label className="cursor-pointer text-xs font-extrabold text-amber-700 hover:underline">
                    Click to Select CSV File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImportFile}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports .csv exported from Microsoft Excel or Google Sheets</p>
                </div>
              </div>

              {/* Import Progress Logs */}
              {importing && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <span>Processing CSV rows and updating fee database...</span>
                </div>
              )}

              {importLogs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">
                    Import Results ({importSuccessCount} Successes):
                  </span>
                  <div className="max-h-36 overflow-y-auto bg-slate-900 text-emerald-400 font-mono text-[10px] p-3 rounded-xl space-y-1">
                    {importLogs.map((log, idx) => (
                      <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400' : 'text-rose-400'}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SPREADSHEET EXPORT OPTIONS MODAL */}
      {exportModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setExportModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-sky-100 space-y-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                  CUSTOM SPREADSHEET EXPORT
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Export Fee Register</h3>
              </div>
              <button 
                onClick={() => setExportModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Export Scope:
              </label>

              {/* Scope Selector Pills */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setExportScope('WHOLE_SCHOOL')}
                  className={`p-3 rounded-2xl text-xs font-extrabold text-center transition border ${
                    exportScope === 'WHOLE_SCHOOL'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  🏫 Whole School
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('SINGLE_CLASS')}
                  className={`p-3 rounded-2xl text-xs font-extrabold text-center transition border ${
                    exportScope === 'SINGLE_CLASS'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  🎒 Single Class
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('MULTI_CLASS')}
                  className={`p-3 rounded-2xl text-xs font-extrabold text-center transition border ${
                    exportScope === 'MULTI_CLASS'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  📑 Multiple Classes
                </button>
              </div>

              {/* SCOPE A: WHOLE SCHOOL */}
              {exportScope === 'WHOLE_SCHOOL' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs text-emerald-900">
                  <span className="font-extrabold block">Full School Export ({students.length} Total Students)</span>
                  <p className="text-emerald-700 font-normal">
                    Generates a complete spreadsheet matrix containing all enrolled students across all 10 academic classes.
                  </p>
                </div>
              )}

              {/* SCOPE B: SINGLE CLASS */}
              {exportScope === 'SINGLE_CLASS' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Choose Particular Class:</label>
                  <select
                    value={exportSingleClass}
                    onChange={(e) => setExportSingleClass(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                  >
                    {PURE_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} ({students.filter((s) => s.class.toLowerCase() === cls.toLowerCase()).length} Students)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* SCOPE C: MULTI CLASS SELECTION */}
              {exportScope === 'MULTI_CLASS' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Select Classes to Combine ({exportSelectedClasses.length} Selected):
                    </label>
                    <div className="space-x-2 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={selectAllExportClasses}
                        className="text-sky-600 hover:underline"
                      >
                        Select All
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={deselectAllExportClasses}
                        className="text-slate-400 hover:underline"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    {PURE_CLASSES.map((cls) => {
                      const isChecked = exportSelectedClasses.includes(cls);
                      const count = students.filter((s) => s.class.toLowerCase() === cls.toLowerCase()).length;
                      return (
                        <label
                          key={cls}
                          className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                            isChecked
                              ? 'bg-purple-50 border-purple-300 text-purple-900 font-extrabold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleExportClassSelection(cls)}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="flex-1">{cls}</span>
                          <span className="text-[10px] font-mono text-slate-400">({count})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeSpreadsheetExport}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Generate & Download Spreadsheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
