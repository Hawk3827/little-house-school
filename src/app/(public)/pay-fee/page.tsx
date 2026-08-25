'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  QrCode, 
  Receipt, 
  Calendar, 
  GraduationCap, 
  Download, 
  Printer, 
  Sparkles,
  Search,
  ArrowLeft,
  ShieldCheck,
  Check,
  Lock,
  Building,
  Smartphone,
  X
} from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';

const ACADEMIC_MONTHS = [
  'April 2026', 'May 2026', 'June 2026', 'July 2026',
  'August 2026', 'September 2026', 'October 2026',
  'November 2026', 'December 2026', 'January 2027',
  'February 2027', 'March 2027'
];

export default function PayFeePage() {
  const [admissionNoInput, setAdmissionNoInput] = useState('');
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any | null>(null);
  const [isConfirmedStudent, setIsConfirmedStudent] = useState(false);
  const [pastPayments, setPastPayments] = useState<any[]>([]);
  const [lookupError, setLookupError] = useState('');

  // Fee Selection State
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['August 2026']);
  const tuitionPerMonth = 1200;

  // Payment Submission State
  const [utrNumber, setUtrNumber] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [completedPayment, setCompletedPayment] = useState<any | null>(null);

  // Payment Gateway Modal State
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [gatewayTab, setGatewayTab] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [processingGateway, setProcessingGateway] = useState(false);
  const [gatewayError, setGatewayError] = useState('');
  const [gatewayOrderId, setGatewayOrderId] = useState('');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India (SBI)');

  useEffect(() => {
    // Load official Razorpay Checkout SDK Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInitiateGatewayPayment = async () => {
    setGatewayError('');
    setProcessingGateway(true);

    try {
      const res = await fetch('/api/public/create-gateway-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalTuitionFee,
          studentName: studentInfo?.name,
          admissionNo: studentInfo?.admissionNo,
          studentClass: studentInfo?.class,
          paidMonths: selectedMonths,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create Razorpay order.');

      setGatewayOrderId(data.orderId);

      // Open official Razorpay Checkout SDK if live keys are present
      if (typeof window !== 'undefined' && (window as any).Razorpay && data.isLiveGateway) {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || 'INR',
          name: 'LITTLE HOUSE SCHOOL',
          description: `Monthly Fee Payment for ${studentInfo?.name} (${selectedMonths.join(', ')})`,
          order_id: data.orderId,
          prefill: {
            name: studentInfo?.name,
            contact: parentPhoneInput || studentInfo?.phone || '',
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: 'Pay via UPI / QR Code (Google Pay, PhonePe, Paytm)',
                  instruments: [
                    {
                      method: 'upi'
                    }
                  ]
                },
                other: {
                  name: 'Other Payment Methods',
                  instruments: [
                    { method: 'card' },
                    { method: 'netbanking' }
                  ]
                }
              },
              sequence: ['block.upi', 'block.other'],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          theme: {
            color: '#0284c7',
          },
          handler: async function (response: any) {
            const rzpPaymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
            await handleExecuteGatewayCheckout('RAZORPAY', rzpPaymentId);
          },
          modal: {
            ondismiss: function () {
              setProcessingGateway(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Show interactive Razorpay Gateway Modal for local testing
        setIsGatewayModalOpen(true);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Razorpay gateway connection error.');
    } finally {
      setProcessingGateway(false);
    }
  };

  const handleExecuteGatewayCheckout = async (modeName: string, customRef?: string) => {
    setProcessingGateway(true);
    setGatewayError('');

    try {
      const paymentRef = customRef || `pay_LHS_${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

      const payload = {
        studentName: studentInfo?.name || 'Student',
        admissionNo: studentInfo?.admissionNo || admissionNoInput,
        studentClass: studentInfo?.class || 'Primary School',
        parentPhone: parentPhoneInput,
        paidMonths: selectedMonths,
        tuitionFee: totalTuitionFee,
        transportFee: 0,
        totalAmount: totalTuitionFee,
        paymentMode: `ONLINE_RAZORPAY`,
        paymentRef: paymentRef,
      };

      const res = await fetch('/api/public/pay-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gateway payment verification failed.');

      setIsGatewayModalOpen(false);
      setCompletedPayment(data.payment);
    } catch (err: any) {
      setGatewayError(err.message || 'Payment processing failed.');
    } finally {
      setProcessingGateway(false);
    }
  };

  const fetchStudentFeeInfo = async (admNo: string) => {
    if (!admNo.trim()) return;
    setLoadingLookup(true);
    setLookupError('');
    setStudentInfo(null);
    setIsConfirmedStudent(false);

    try {
      const res = await fetch(`/api/public/pay-fee?admissionNo=${encodeURIComponent(admNo.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Student record not found.');
      }
      setStudentInfo(data.student);
      setPastPayments(data.payments || []);
      if (data.student.phone) setParentPhoneInput(data.student.phone);
    } catch (err: any) {
      setLookupError(err.message || 'Lookup failed.');
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleMonthToggle = (month: string) => {
    if (selectedMonths.includes(month)) {
      if (selectedMonths.length > 1) {
        setSelectedMonths(selectedMonths.filter((m) => m !== month));
      }
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  const totalTuitionFee = selectedMonths.length * tuitionPerMonth;

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setSubmitError('Please enter your 12-digit UPI UTR / Transaction Reference Number.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        studentName: studentInfo?.name || 'Student',
        admissionNo: studentInfo?.admissionNo || admissionNoInput,
        studentClass: studentInfo?.class || 'Primary School',
        parentPhone: parentPhoneInput,
        paidMonths: selectedMonths,
        tuitionFee: totalTuitionFee,
        transportFee: 0,
        totalAmount: totalTuitionFee,
        paymentMode: 'UPI_ONLINE',
        paymentRef: utrNumber.trim(),
      };

      const res = await fetch('/api/public/pay-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment recording failed.');
      }

      setCompletedPayment(data.payment);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to complete transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-extrabold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full flex items-center space-x-1.5 shadow-2xs">
            <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
            <span>Official Online Fee Portal</span>
          </span>
        </div>

        {/* Page Header */}
        <AnimatedSection type="fade-in" className="text-left space-y-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
            MONTHLY TUITION FEES
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Online Monthly Fee Counter.
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
            Pay monthly tuition fees instantly via Google Pay, PhonePe, Paytm, or BHIM UPI and generate your official digital receipt.
          </p>
        </AnimatedSection>

        {/* COMPLETED SUCCESS RECEIPT VIEW */}
        {completedPayment ? (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest">FEE PAYMENT SUCCESSFUL!</span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Receipt #{completedPayment.receiptNo}</h2>
              <p className="text-xs text-slate-600">Official digital receipt issued for {completedPayment.studentName}.</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5 font-mono max-w-lg mx-auto">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900">{completedPayment.studentName} ({completedPayment.admissionNo})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Class:</span>
                <span className="font-bold text-slate-900">{completedPayment.studentClass}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Paid Month(s):</span>
                <span className="font-bold text-sky-800">{completedPayment.paidMonths}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">UPI Ref / UTR:</span>
                <span className="font-bold text-slate-900">{completedPayment.paymentRef}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-extrabold text-emerald-700">
                <span>Total Amount Paid:</span>
                <span>₹{completedPayment.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 transition shadow-md"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Save Receipt PDF</span>
              </button>
              <button
                onClick={() => {
                  setCompletedPayment(null);
                  setStudentInfo(null);
                }}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Pay Another Fee
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-sky-100 shadow-xl p-6 sm:p-10 space-y-8 text-left">
            
            {/* STEP 1: ADMISSION NUMBER LOOKUP */}
            {!studentInfo ? (
              <form onSubmit={(e) => { e.preventDefault(); fetchStudentFeeInfo(admissionNoInput); }} className="max-w-md mx-auto space-y-5">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Student Fee Counter Lookup</h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    Enter your child&apos;s Admission Number (e.g. <span className="font-mono font-bold text-slate-700">LHS-2026-7220</span>) to select months and generate receipt.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Child&apos;s Admission Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={admissionNoInput}
                      onChange={(e) => setAdmissionNoInput(e.target.value)}
                      placeholder="e.g. LHS-2026-7220"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold uppercase focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                    />
                    <button
                      type="submit"
                      disabled={loadingLookup}
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-2xl transition flex items-center space-x-2 shadow-md disabled:opacity-50 flex-shrink-0"
                    >
                      {loadingLookup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span>Lookup</span>
                    </button>
                  </div>
                </div>

                {lookupError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{lookupError}</span>
                  </div>
                )}
              </form>
            ) : !isConfirmedStudent ? (
              /* STEP 2: DISTINCTIVE STUDENT VERIFICATION & CONFIRMATION STEP */
              <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-sky-950 via-sky-900 to-indigo-950 text-white p-6 sm:p-8 rounded-[32px] shadow-2xl space-y-6 text-left border border-sky-500/30">
                  <div className="flex items-center justify-between border-b border-sky-800/80 pb-4">
                    <span className="text-[10px] font-mono font-extrabold tracking-widest text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full uppercase flex items-center space-x-1.5 shadow-xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      <span>STUDENT IDENTITY VERIFICATION</span>
                    </span>
                    <span className="text-xs text-sky-300 font-mono font-bold">Step 1 of 2</span>
                  </div>

                  {/* Prominent & Distinctive Student Profile Header */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-sky-900/40 p-5 rounded-2xl border border-sky-700/50">
                    <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-slate-950 rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl flex-shrink-0 border-2 border-white/30">
                      {studentInfo.name.charAt(0)}
                    </div>
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="flex items-center justify-center sm:justify-start space-x-2">
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 bg-emerald-950/90 text-emerald-300 rounded border border-emerald-500/40">
                          Active Student Record
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{studentInfo.name}</h2>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <span className="text-xs font-mono font-extrabold bg-sky-950 text-sky-200 px-3 py-1 rounded-xl border border-sky-600/40 shadow-xs">
                          ADM NO: {studentInfo.admissionNo}
                        </span>
                        <span className="text-xs font-extrabold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-xl border border-amber-400/40 shadow-xs">
                          CLASS: {studentInfo.class}
                        </span>
                        {studentInfo.phone && (
                          <span className="text-xs font-mono font-semibold bg-indigo-950 text-indigo-200 px-3 py-1 rounded-xl border border-indigo-600/40">
                            PHONE: {studentInfo.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verification Prompt Box */}
                  <div className="bg-sky-950/90 border border-amber-400/40 p-4 sm:p-5 rounded-2xl space-y-1.5 text-center sm:text-left">
                    <p className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center justify-center sm:justify-start space-x-1.5">
                      <span>Are you searching for this student?</span>
                    </p>
                    <p className="text-xs text-sky-200 font-normal leading-relaxed">
                      Please double-check the student name <strong className="text-white font-extrabold">{studentInfo.name}</strong>, admission number <strong className="text-amber-300 font-mono font-bold">{studentInfo.admissionNo}</strong>, and class <strong className="text-white font-bold">{studentInfo.class}</strong> to ensure fee payment goes to the correct child.
                    </p>
                  </div>

                  {/* Action Confirmation Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsConfirmedStudent(true)}
                      className="w-full sm:flex-1 py-4 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl transition flex items-center justify-center space-x-2 shadow-xl active:scale-95 border border-amber-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-slate-950" />
                      <span>Yes, Confirm Student & Pay Fees</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStudentInfo(null);
                        setIsConfirmedStudent(false);
                      }}
                      className="w-full sm:w-auto py-4 px-5 bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-700/60 font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-1.5"
                    >
                      <Search className="h-4 w-4" />
                      <span>Search Different Student</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* STEP 3: MONTH SELECTION & PAYMENT FORM */
              <div className="space-y-8 animate-fadeIn">
                {/* Verified Student Banner */}
                <div className="bg-sky-50 border border-sky-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-sky-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-sm">
                      {studentInfo.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg">{studentInfo.name}</h3>
                      <span className="text-xs text-sky-800 font-semibold font-mono">Admission No: {studentInfo.admissionNo} • Class: {studentInfo.class}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setStudentInfo(null);
                      setIsConfirmedStudent(false);
                    }}
                    className="text-xs text-sky-700 hover:underline font-bold"
                  >
                    Change Student
                  </button>
                </div>

                {/* Academic Months Selection Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Month(s) to Pay (₹{tuitionPerMonth}/month)
                    </label>
                    <span className="text-xs font-mono font-bold text-sky-700">
                      {selectedMonths.length} Month(s) Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {ACADEMIC_MONTHS.map((month) => {
                      const isSelected = selectedMonths.includes(month);
                      const isAlreadyPaid = pastPayments.some((p) => p.paidMonths.includes(month));
                      return (
                        <button
                          key={month}
                          type="button"
                          disabled={isAlreadyPaid}
                          onClick={() => handleMonthToggle(month)}
                          className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                            isAlreadyPaid
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 opacity-80 cursor-not-allowed'
                              : isSelected
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{month}</span>
                          {isAlreadyPaid ? (
                            <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono">PAID</span>
                          ) : isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 100% Razorpay Official Checkout Card */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white p-6 sm:p-8 rounded-[32px] shadow-2xl border border-sky-500/20 space-y-6">
                  <div className="space-y-3 border-b border-slate-800 pb-5 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Student Name:</span>
                      <span className="text-white font-bold text-sm">{studentInfo.name} ({studentInfo.admissionNo})</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Selected Months ({selectedMonths.length}):</span>
                      <span className="text-amber-300 font-bold text-sm">{selectedMonths.join(', ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Rate per Month:</span>
                      <span className="text-white">₹{tuitionPerMonth}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 text-xl sm:text-2xl font-black text-amber-300 border-t border-slate-800/80">
                      <span>Total Payable Amount:</span>
                      <span>₹{totalTuitionFee.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Official Security Badges */}
                  <div className="space-y-2 text-center">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-sky-400">
                      🔒 256-Bit SSL Encrypted Razorpay Gateway
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Credit / Debit Cards', 'NetBanking'].map((badge) => (
                        <span key={badge} className="text-[10px] font-bold px-2.5 py-1 bg-slate-800/90 text-slate-200 rounded-lg border border-slate-700">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary Gold Razorpay Button */}
                  <button
                    type="button"
                    onClick={handleInitiateGatewayPayment}
                    disabled={processingGateway}
                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm sm:text-base rounded-2xl transition flex items-center justify-center space-x-2.5 shadow-xl active:scale-95 border border-amber-300 disabled:opacity-50"
                  >
                    {processingGateway ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-slate-950" />
                    )}
                    <span>Pay ₹{totalTuitionFee.toLocaleString('en-IN')} via Razorpay Gateway</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INTERACTIVE PAYMENT GATEWAY CHECKOUT MODAL */}
        {isGatewayModalOpen && (
          <div className="fixed inset-0 z-[999999] bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
            <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-lg w-full overflow-hidden text-left">
              {/* Gateway Top Header */}
              <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 text-white p-5 sm:p-6 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold tracking-widest text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full uppercase flex items-center space-x-1">
                    <Lock className="h-3 w-3 text-amber-400" />
                    <span>256-BIT SSL ENCRYPTED GATEWAY</span>
                  </span>
                  <button
                    onClick={() => setIsGatewayModalOpen(false)}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">LITTLE HOUSE SCHOOL FEE COUNTER</h3>
                <div className="flex items-center justify-between text-xs text-sky-200 font-mono pt-1 border-t border-sky-700/60">
                  <span>Order ID: {gatewayOrderId}</span>
                  <span className="text-amber-300 font-extrabold text-sm">Payable: ₹{totalTuitionFee.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Gateway Payment Method Tabs */}
                <div className="grid grid-cols-3 gap-2 border-b pb-4">
                  <button
                    type="button"
                    onClick={() => setGatewayTab('UPI')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      gatewayTab === 'UPI'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGatewayTab('CARD')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      gatewayTab === 'CARD'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGatewayTab('NETBANKING')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-1 ${
                      gatewayTab === 'NETBANKING'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span>NetBanking</span>
                  </button>
                </div>

                {/* TAB 1: UPI APPS & INSTANT PAY */}
                {gatewayTab === 'UPI' && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Dynamic UPI QR Code Scanner */}
                    <div className="bg-slate-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border border-amber-400/30">
                      <div className="bg-white p-2.5 rounded-xl shadow-md flex-shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=9876543210@ybl%26pn=LITTLE%20HOUSE%20SCHOOL%26am=${totalTuitionFee}%26cu=INR`}
                          alt="LITTLE HOUSE UPI QR Code"
                          className="w-28 h-28 object-contain"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
                          Scan to Pay ₹{totalTuitionFee.toLocaleString('en-IN')}
                        </span>
                        <p className="text-xs text-slate-300 leading-normal">
                          Open Google Pay, PhonePe, Paytm, or BHIM on your phone and scan this QR Code to pay instantly.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-semibold">
                      Or 1-click pay via installed app or VPA ID:
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((appName) => (
                        <button
                          key={appName}
                          type="button"
                          onClick={() => handleExecuteGatewayCheckout(`UPI (${appName})`)}
                          disabled={processingGateway}
                          className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-2xl text-left transition flex items-center justify-between group disabled:opacity-50"
                        >
                          <span className="text-xs font-black text-slate-800 group-hover:text-sky-900">{appName}</span>
                          <ShieldCheck className="h-4 w-4 text-emerald-500 opacity-80" />
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t space-y-2">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Or enter UPI ID / VPA
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          placeholder="e.g. mobile@upi or username@okicici"
                          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleExecuteGatewayCheckout('UPI VPA')}
                          disabled={processingGateway || !upiIdInput.trim()}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition disabled:opacity-40"
                        >
                          Pay
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CREDIT / DEBIT CARDS */}
                {gatewayTab === 'CARD' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleExecuteGatewayCheckout('Debit Card');
                    }}
                    className="space-y-3.5 animate-fadeIn"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8921"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Expiry (MM/YY) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="08/28"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          CVV *
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={processingGateway}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {processingGateway ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      <span>Pay ₹{totalTuitionFee.toLocaleString('en-IN')} Securely</span>
                    </button>
                  </form>
                )}

                {/* TAB 3: NETBANKING */}
                {gatewayTab === 'NETBANKING' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Select Your Bank *
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500"
                      >
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                        <option>Punjab National Bank (PNB)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecuteGatewayCheckout(`NetBanking (${selectedBank})`)}
                      disabled={processingGateway}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {processingGateway ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building className="h-4 w-4" />}
                      <span>Proceed to {selectedBank} NetBanking</span>
                    </button>
                  </div>
                )}

                {gatewayError && (
                  <p className="text-xs text-rose-600 font-semibold">{gatewayError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
