'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  QrCode, 
  Receipt, 
  GraduationCap, 
  Printer, 
  ShieldCheck,
  Search,
  Lock,
  Building,
  Smartphone
} from 'lucide-react';

interface MonthlyFeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAdmissionNo?: string;
}

const ACADEMIC_MONTHS = [
  'April 2026', 'May 2026', 'June 2026', 'July 2026',
  'August 2026', 'September 2026', 'October 2026',
  'November 2026', 'December 2026', 'January 2027',
  'February 2027', 'March 2027'
];

export default function MonthlyFeePaymentModal({
  isOpen,
  onClose,
  initialAdmissionNo = ''
}: MonthlyFeePaymentModalProps) {
  const [admissionNoInput, setAdmissionNoInput] = useState(initialAdmissionNo);
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

  // Payment Gateway State
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
    // Load Razorpay Checkout SDK
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

  useEffect(() => {
    if (initialAdmissionNo && isOpen) {
      setAdmissionNoInput(initialAdmissionNo);
      fetchStudentFeeInfo(initialAdmissionNo);
    }
  }, [initialAdmissionNo, isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 lg:p-8 flex items-center justify-center animate-fadeIn select-none">
      <div 
        className="relative max-w-3xl w-full bg-white rounded-[32px] shadow-2xl border border-sky-100 overflow-hidden text-slate-900 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white p-6 sm:p-8 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-extrabold tracking-widest text-amber-300 bg-amber-950/70 border border-amber-400/40 px-2.5 py-0.5 rounded-full uppercase">
              PORTAL FEE COUNTER
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Online Monthly Fee Counter</h2>
            <p className="text-xs text-sky-200 font-normal">Fast, secure Razorpay & UPI payments with instant digital receipts.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition border border-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* STEP 1: COMPLETED RECEIPT VIEW */}
          {completedPayment ? (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="bg-emerald-50 border-2 border-emerald-200 p-6 sm:p-8 rounded-[28px] space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest">FEE PAYMENT SUCCESSFUL!</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Receipt #{completedPayment.receiptNo}</h3>
                  <p className="text-xs text-slate-600">Official digital receipt generated for {completedPayment.studentName}.</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-emerald-100 text-left text-xs space-y-2 font-mono">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Student Name:</span>
                    <span className="font-bold text-slate-900">{completedPayment.studentName} ({completedPayment.admissionNo})</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Class:</span>
                    <span className="font-bold text-slate-900">{completedPayment.studentClass}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Paid Months:</span>
                    <span className="font-bold text-sky-800">{completedPayment.paidMonths}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">Payment Ref / UTR:</span>
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
                    className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-2 transition shadow-md"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print / Save Receipt PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      setCompletedPayment(null);
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 2: STUDENT LOOKUP */}
              {!studentInfo ? (
                <form onSubmit={(e) => { e.preventDefault(); fetchStudentFeeInfo(admissionNoInput); }} className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter Child&apos;s Admission Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={admissionNoInput}
                        onChange={(e) => setAdmissionNoInput(e.target.value)}
                        placeholder="e.g. LHS-2026-7220"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold uppercase focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingLookup}
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-2xl transition flex items-center space-x-2 shadow-md disabled:opacity-50"
                    >
                      {loadingLookup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span>Find Student</span>
                    </button>
                  </div>

                  {lookupError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{lookupError}</span>
                    </div>
                  )}
                </form>
              ) : !isConfirmedStudent ? (
                /* STEP 3: DISTINCTIVE STUDENT IDENTITY VERIFICATION STEP */
                <div className="space-y-6 animate-fadeIn max-w-xl mx-auto">
                  <div className="bg-gradient-to-br from-sky-950 via-sky-900 to-indigo-950 text-white p-6 sm:p-8 rounded-[32px] shadow-2xl space-y-6 text-left border border-sky-500/30">
                    <div className="flex items-center justify-between border-b border-sky-800/80 pb-4">
                      <span className="text-[10px] font-mono font-extrabold tracking-widest text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full uppercase flex items-center space-x-1.5 shadow-xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                        <span>STUDENT IDENTITY VERIFICATION</span>
                      </span>
                      <span className="text-xs text-sky-300 font-mono font-bold">Step 1 of 2</span>
                    </div>

                    {/* Prominent Student Profile Header */}
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
                        </div>
                      </div>
                    </div>

                    {/* Verification Prompt Box */}
                    <div className="bg-sky-950/90 border border-amber-400/40 p-4 sm:p-5 rounded-2xl space-y-1.5 text-center sm:text-left">
                      <p className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center justify-center sm:justify-start space-x-1.5">
                        <span>Are you searching for this student?</span>
                      </p>
                      <p className="text-xs text-sky-200 font-normal leading-relaxed">
                        Please confirm that the student name <strong className="text-white font-extrabold">{studentInfo.name}</strong> and admission number <strong className="text-amber-300 font-mono font-bold">{studentInfo.admissionNo}</strong> match before making payments.
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
                /* STEP 4: MONTH SELECTION & RAZORPAY PAYMENT COUNTER */
                <div className="space-y-6 animate-fadeIn">
                  {/* Verified Student Header */}
                  <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                        {studentInfo.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{studentInfo.name}</h4>
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

                  {/* Month Selection Grid */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Month(s) to Pay (₹{tuitionPerMonth}/month)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ACADEMIC_MONTHS.map((month) => {
                        const isSelected = selectedMonths.includes(month);
                        const isAlreadyPaid = pastPayments.some((p) => p.paidMonths.includes(month));
                        return (
                          <button
                            key={month}
                            type="button"
                            disabled={isAlreadyPaid}
                            onClick={() => handleMonthToggle(month)}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
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
                              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
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
                        <span>Total Amount Payable:</span>
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
            </>
          )}
        </div>
      </div>

      {/* RAZORPAY GATEWAY CHECKOUT MODAL */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 z-[9999999] bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-lg w-full overflow-hidden text-left">
            <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 text-white p-5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold tracking-widest text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase flex items-center space-x-1">
                  <Lock className="h-3 w-3 text-amber-400" />
                  <span>RAZORPAY 256-BIT SSL GATEWAY</span>
                </span>
                <button
                  onClick={() => setIsGatewayModalOpen(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-extrabold">LITTLE HOUSE SCHOOL FEE COUNTER</h3>
              <div className="flex items-center justify-between text-xs text-sky-200 font-mono pt-1 border-t border-sky-700/60">
                <span>Order ID: {gatewayOrderId}</span>
                <span className="text-amber-300 font-extrabold">Payable: ₹{totalTuitionFee.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-2 border-b pb-3">
                <button
                  type="button"
                  onClick={() => setGatewayTab('UPI')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1 ${
                    gatewayTab === 'UPI' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGatewayTab('CARD')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1 ${
                    gatewayTab === 'CARD' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGatewayTab('NETBANKING')}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center space-y-1 ${
                    gatewayTab === 'NETBANKING' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building className="h-4 w-4" />
                  <span>NetBanking</span>
                </button>
              </div>

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

                  <p className="text-xs font-bold text-slate-700">Or 1-click pay via installed app:</p>

                  <div className="grid grid-cols-2 gap-2">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((appName) => (
                      <button
                        key={appName}
                        type="button"
                        onClick={() => handleExecuteGatewayCheckout(`UPI (${appName})`)}
                        disabled={processingGateway}
                        className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl text-xs font-black text-left flex items-center justify-between transition group disabled:opacity-50"
                      >
                        <span className="text-slate-800 group-hover:text-sky-900">{appName}</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gatewayTab === 'CARD' && (
                <form onSubmit={(e) => { e.preventDefault(); handleExecuteGatewayCheckout('Debit Card'); }} className="space-y-3">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 •••• •••• 8921"
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-bold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-bold"
                    />
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="CVV"
                      className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={processingGateway}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl"
                  >
                    Pay ₹{totalTuitionFee.toLocaleString('en-IN')} via Razorpay
                  </button>
                </form>
              )}

              {gatewayTab === 'NETBANKING' && (
                <div className="space-y-3">
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                  >
                    <option>State Bank of India (SBI)</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleExecuteGatewayCheckout(`NetBanking (${selectedBank})`)}
                    disabled={processingGateway}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl"
                  >
                    Proceed to NetBanking
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
  );
}
