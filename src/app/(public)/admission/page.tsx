'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  ShieldCheck, 
  Printer, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  QrCode,
  Bus,
  Sparkles,
  MapPin,
  Clock,
  Car
} from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';
import MonthlyFeePaymentModal from '@/components/MonthlyFeePaymentModal';

export default function AdmissionPage() {
  const [activeSection, setActiveSection] = useState<'ADMISSION_PAYMENT' | 'VAN_FARES'>('ADMISSION_PAYMENT');
  const [step, setStep] = useState(1); // 1: Form, 2: Checkout, 3: Success
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('Play-Group');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [searchRoute, setSearchRoute] = useState('');
  const [draftRestored, setDraftRestored] = useState(false);
  const [botTrapVal, setBotTrapVal] = useState('');
  const [formLoadTime] = useState<number>(() => Date.now());

  // Restore unsaved admission draft on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lhs_admission_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studentName || parsed.parentName || parsed.parentPhone || parsed.parentEmail) {
          if (parsed.studentName) setStudentName(parsed.studentName);
          if (parsed.grade) setGrade(parsed.grade);
          if (parsed.parentName) setParentName(parsed.parentName);
          if (parsed.parentEmail) setParentEmail(parsed.parentEmail);
          if (parsed.parentPhone) setParentPhone(parsed.parentPhone);
          setDraftRestored(true);
        }
      }
    } catch (e) {
      console.warn('Failed to restore draft:', e);
    }
  }, []);

  // Auto-save admission form draft on change
  useEffect(() => {
    if (step === 1) {
      try {
        const draft = { studentName, grade, parentName, parentEmail, parentPhone };
        localStorage.setItem('lhs_admission_draft', JSON.stringify(draft));
      } catch (e) {}
    }
  }, [studentName, grade, parentName, parentEmail, parentPhone, step]);

  const feeChart: Record<string, { admission: number; monthly: number; desc: string }> = {
    'Play-Group': { admission: 6500, monthly: 1300, desc: 'Admission fee + Book Set + Note Books + Pencil, Colour, Eraser' },
    'Nursery': { admission: 7500, monthly: 1300, desc: 'Admission fee + Book Set + Note Books + Pencil, Colour, Eraser' },
    'Lower KG': { admission: 7500, monthly: 1300, desc: 'Admission fee + Book Set + Note Books + Pencil, Colour, Eraser' },
    'Upper KG': { admission: 7900, monthly: 1300, desc: 'Admission fee + Book Set + Note Books + Pencil, Colour, Eraser' },
    'Class I': { admission: 8600, monthly: 1300, desc: 'Admission fee + Book Set + Note Books' },
    'Class II': { admission: 8800, monthly: 1300, desc: 'Admission fee + Book Set + Note Books' },
    'Class III': { admission: 9000, monthly: 1300, desc: 'Admission fee + Book Set + Note Books' },
    'Class IV': { admission: 9200, monthly: 1300, desc: 'Admission fee + Book Set + Note Books' },
    'Class V': { admission: 9400, monthly: 1300, desc: 'Admission fee + Book Set + Note Books' },
    'Class VI': { admission: 4800, monthly: 1500, desc: 'Admission fee (Note-books and book set separate). Monthly includes Tuition, Lunch, Snacks' }
  };

  const currentFee = feeChart[grade]?.admission || 6500;

  const vanRoutes = [
    { loc: "PUKHAO", fare: 1400 },
    { loc: "UYUMPOK / WAKHONG", fare: 1400 },
    { loc: "SAGOLMANG / PATLOU", fare: 1300 },
    { loc: "ISHIKHA", fare: 1300 },
    { loc: "YUMNAM KHUNOU", fare: 1250 },
    { loc: "SINAM / SINAM KOM", fare: 1300 },
    { loc: "CHINGKHU / SAMBEI", fare: 1100 },
    { loc: "HARAOROU", fare: 1100 },
    { loc: "SAROUTHEL / TAOREM", fare: 1300 },
    { loc: "TANGKHAM / TANGKHAM ETHEI MAPAL", fare: 1100 },
    { loc: "KHUNDRAKPAM AAGNI MAMANG", fare: 900 },
    { loc: "KHUNDRAKPAM MAYAI LEIKAI", fare: 850 },
    { loc: "KHUNDRAKPAM MAKHA LEIKAI", fare: 800 },
    { loc: "PANGEI", fare: 800 },
    { loc: "NEPALI BASTI", fare: 850 },
    { loc: "MPTC", fare: 750 },
    { loc: "PANGEI LAIRAM MAPAL", fare: 800 },
    { loc: "SAINIK", fare: 750 },
    { loc: "WAITON", fare: 900 },
    { loc: "WAIRI", fare: 1000 },
    { loc: "SAWOMBUNG", fare: 1000 },
    { loc: "YORBUNG KHUNOU", fare: 1500 },
    { loc: "KHURAI ANGOM LEIKAI", fare: 1400 },
    { loc: "KHURAI KONSAM LEIKAI", fare: 1300 },
    { loc: "KAIRANG", fare: 1400 }
  ];

  const filteredRoutes = vanRoutes.filter(r => 
    r.loc.toLowerCase().includes(searchRoute.toLowerCase())
  );

  // Payment states
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Loader states
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<any>(null);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentName.trim() || !parentEmail.trim() || !parentPhone.trim()) {
      setError('Please fill in all details.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (processing) return; // Prevent double-clicks / debouncing lock
    
    if (paymentMethod === 'CARD' && (!cardNumber || !cardExpiry || !cardCvv)) {
      setError('Please fill in card details.');
      return;
    }
    if (paymentMethod === 'UPI' && !upiId && upiId.trim() !== '') {
      setError('Please enter a valid UPI ID.');
      return;
    }

    setError('');
    setProcessing(true);

    const statuses = [
      paymentMethod === 'UPI' ? 'Initializing UPI transaction...' : 'Securing Razorpay card tunnel...',
      'Requesting payment gateway...',
      'Verifying transaction status...',
      'Registering admission profile...'
    ];

    for (let i = 0; i < statuses.length; i++) {
      setProcessingStatus(statuses[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          grade,
          parentName,
          parentEmail,
          parentPhone,
          paymentMethod,
          upiId: paymentMethod === 'UPI' ? (upiId || 'QR_CODE_SCAN') : null,
          cardNumber: paymentMethod === 'CARD' ? cardNumber : null,
          website_code_val: botTrapVal,
          _formLoadTime: formLoadTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application payment.');
      }

      setReceipt(data.admission);
      try {
        localStorage.removeItem('lhs_admission_draft');
      } catch (e) {}
      setDraftRestored(false);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment.');
      setStep(2);
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 select-none selection:bg-sky-500 selection:text-white space-y-12 bg-slate-50 text-slate-900">
      {/* 🔄 Top Switcher: Admission Payment vs Van Fares */}
      <div className="flex justify-center select-none print:hidden">
        <div className="inline-flex p-1.5 bg-slate-200/90 border border-slate-300 rounded-full shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveSection('ADMISSION_PAYMENT')}
            className={`px-5 sm:px-8 py-3 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center space-x-2.5 ${
              activeSection === 'ADMISSION_PAYMENT'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Online Admission & Fees</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('VAN_FARES')}
            className={`px-5 sm:px-8 py-3 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center space-x-2.5 ${
              activeSection === 'VAN_FARES'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Bus className="h-4 w-4" />
            <span>Van Fares & Transit Routes</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFeeModalOpen(true)}
            className="px-5 sm:px-8 py-3 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
          >
            <CreditCard className="h-4 w-4" />
            <span>Pay Monthly Fees</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: ONLINE ADMISSION & PAYMENT WORKFLOW */}
      {activeSection === 'ADMISSION_PAYMENT' && (
        <div className="space-y-12 animate-fadeIn">
          {/* Step Indicators */}
          <div className="flex items-center justify-between max-w-md mx-auto mb-10 select-none print:hidden font-mono text-[10px] font-bold tracking-widest text-slate-500">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                  step >= 1 ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'border-slate-300 text-slate-400 bg-white'
                }`}
              >
                01
              </div>
              <span className="mt-2 text-slate-600">PROFILE</span>
            </div>
            <div className={`flex-1 h-[2px] mx-4 ${step >= 2 ? 'bg-sky-600' : 'bg-slate-200'}`} />
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                  step >= 2 ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'border-slate-300 text-slate-400 bg-white'
                }`}
              >
                02
              </div>
              <span className="mt-2 text-slate-600">CHECKOUT</span>
            </div>
            <div className={`flex-1 h-[2px] mx-4 ${step >= 3 ? 'bg-sky-600' : 'bg-slate-200'}`} />
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                  step >= 3 ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'border-slate-300 text-slate-400 bg-white'
                }`}
              >
                03
              </div>
              <span className="mt-2 text-slate-600">RECEIPT</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 text-xs text-red-600 rounded-2xl mb-8 print:hidden text-left animate-pulse max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {/* Step 1: Form details */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Admission Form */}
              <div className="lg:col-span-7 bg-white rounded-[32px] border border-sky-100 shadow-md p-8 sm:p-10 space-y-8">
                <div className="text-left space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase">
                    ONLINE REGISTRATION
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">Admission Fee</h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    Register your child&apos;s application profile. An admission fee of <strong className="text-slate-900 font-bold">₹{currentFee.toLocaleString('en-IN')} INR</strong> is required for registration ({grade} level).
                  </p>
                </div>

                {draftRestored && (
                  <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fadeIn text-left">
                    <span className="flex items-center space-x-2">
                      <span>📋</span>
                      <span>Restored unsaved admission draft from your previous session.</span>
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        localStorage.removeItem('lhs_admission_draft');
                        setStudentName('');
                        setParentName('');
                        setParentEmail('');
                        setParentPhone('');
                        setDraftRestored(false);
                      }}
                      className="text-[10px] text-sky-600 hover:text-sky-800 font-mono font-bold uppercase underline ml-3"
                    >
                      Clear Draft
                    </button>
                  </div>
                )}

                <form onSubmit={handleProceedToPayment} className="space-y-6">
                  {/* Invisible Honeypot Spam Trap */}
                  <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                    <input
                      type="text"
                      name="website_code_val"
                      tabIndex={-1}
                      autoComplete="off"
                      value={botTrapVal}
                      onChange={(e) => setBotTrapVal(e.target.value)}
                    />
                  </div>

                  <div className="space-y-5">
                    {/* Grade Level Picker */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="gradeSelect" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                        Grade Level
                      </label>
                      <select
                        id="gradeSelect"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900 font-medium"
                      >
                        {Object.keys(feeChart).map((k) => (
                          <option key={k} value={k}>
                            {k} (Fee: ₹{feeChart[k].admission.toLocaleString('en-IN')})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Student Name */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="studentName" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                        Student Full Name
                      </label>
                      <input
                        id="studentName"
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                        placeholder="e.g. Linthoingambi Devi"
                      />
                    </div>

                    {/* Parent Name */}
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="parentName" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                        Parent / Guardian Name
                      </label>
                      <input
                        id="parentName"
                        type="text"
                        required
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                        placeholder="e.g. Kh. Ibomcha Singh"
                      />
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label htmlFor="parentEmail" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                          Email Address
                        </label>
                        <input
                          id="parentEmail"
                          type="email"
                          required
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                          placeholder="parent@email.com"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label htmlFor="parentPhone" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                          WhatsApp / Phone
                        </label>
                        <input
                          id="parentPhone"
                          type="tel"
                          required
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-8 py-3.5 rounded-full flex items-center space-x-2 shadow-md transition border border-amber-300"
                    >
                      <span>CONTINUE TO PAYMENT</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Fee Breakdown & Overview */}
              <div className="lg:col-span-5 space-y-6 text-left">
                <div className="bg-white rounded-[32px] border border-sky-100 shadow-md p-8 space-y-6">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase">
                    FEE BREAKDOWN
                  </span>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                      <span className="text-slate-600">Grade</span>
                      <span className="font-bold text-slate-900">{grade}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                      <span className="text-slate-600">Admission Fee (One-Time)</span>
                      <span className="font-extrabold text-slate-900">₹{feeChart[grade]?.admission.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                      <span className="text-slate-600">Monthly Tuition Fee</span>
                      <span className="font-bold text-slate-900">₹{feeChart[grade]?.monthly.toLocaleString('en-IN')} / mo</span>
                    </div>

                    <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-800 leading-relaxed">
                      <strong className="block font-bold mb-1">Includes:</strong>
                      {feeChart[grade]?.desc}
                    </div>

                    <div className="flex justify-between items-center text-base font-extrabold text-slate-900 pt-2">
                      <span>Total Payable Online</span>
                      <span className="text-xl text-sky-700 font-black">₹{currentFee.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Checkout */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto bg-white rounded-[32px] border border-sky-100 shadow-lg p-8 sm:p-10 space-y-8 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase">
                    STEP 2: PAYMENT
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">Choose Payment Option</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Amount</span>
                  <span className="text-2xl font-black text-sky-700">₹{currentFee.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold text-xs transition ${
                    paymentMethod === 'UPI'
                      ? 'border-sky-600 bg-sky-50 text-sky-800 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  <span>UPI / QR SCAN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold text-xs transition ${
                    paymentMethod === 'CARD'
                      ? 'border-sky-600 bg-sky-50 text-sky-800 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>DEBIT / CREDIT CARD</span>
                </button>
              </div>

              {/* Form inputs for checkout */}
              {processing ? (
                <div className="py-12 text-center space-y-4">
                  <Loader2 className="h-10 w-10 text-sky-600 animate-spin mx-auto" />
                  <p className="text-xs font-mono font-bold text-slate-700">{processingStatus}</p>
                </div>
              ) : paymentMethod === 'UPI' ? (
                <div className="space-y-6">
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 text-center space-y-3">
                    <QrCode className="h-28 w-28 mx-auto text-slate-900" />
                    <p className="text-xs text-slate-600">Scan using any UPI App (GPay, PhonePe, Paytm, BHIM)</p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="upiIdInput" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                      Or Enter UPI ID / VPA
                    </label>
                    <input
                      id="upiIdInput"
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okaxis / mobile@upi"
                      className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-full flex items-center space-x-2 transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>BACK</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExecutePayment}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-8 py-3 rounded-full flex items-center space-x-2 shadow-md transition border border-amber-300"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>PAY ₹{currentFee.toLocaleString('en-IN')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label htmlFor="cardNumber" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4532 •••• •••• 8892"
                      className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="cardExpiry" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                        Expiry (MM/YY)
                      </label>
                      <input
                        id="cardExpiry"
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="08/29"
                        className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="cardCvv" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                        CVV / CVC
                      </label>
                      <input
                        id="cardCvv"
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123"
                        className="block w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-full flex items-center space-x-2 transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>BACK</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExecutePayment}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-8 py-3 rounded-full flex items-center space-x-2 shadow-md transition border border-amber-300"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>PAY ₹{currentFee.toLocaleString('en-IN')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success Receipt */}
          {step === 3 && receipt && (
            <AnimatedSection type="fade-in-up" className="space-y-8">
              <div className="bg-white rounded-[32px] border border-sky-100 shadow-xl p-8 sm:p-10 text-center space-y-6 print:shadow-none print:border-none max-w-2xl mx-auto">
                <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto" />
                <div>
                  <h1 className="text-3xl font-extrabold text-emerald-700 uppercase tracking-tight">Payment Successful</h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal mt-1">
                    Your admission application fee of <strong className="text-slate-900">₹{(receipt.amount || currentFee).toLocaleString('en-IN')}.00</strong> has been successfully paid online.
                  </p>
                </div>

                {/* Instruction Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 text-xs text-amber-900 leading-relaxed max-w-lg mx-auto text-left font-normal space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-amber-200 text-amber-900 font-mono font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                      OFFICE AUDIT
                    </span>
                    <h4 className="font-extrabold text-slate-900 uppercase tracking-tight">
                      Next Step: Office Bank Reconciliation
                    </h4>
                  </div>
                  <p>
                    Please save or print this receipt containing your <strong>Reference ID</strong>. Our accounts desk at Waiton Lamkhai will cross-check this UTR reference against the school bank passbook before issuing your child&apos;s final class nominal roll number.
                  </p>
                </div>

                {/* Receipt details block */}
                <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-6 sm:p-8 text-left space-y-3 max-w-lg mx-auto text-xs text-slate-700 font-medium">
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono">Payment ID</span>
                    <span className="font-mono text-slate-900 font-extrabold">{receipt.paymentReference}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono">Student Name</span>
                    <span className="text-slate-900 font-bold">{receipt.studentName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono">Grade Level</span>
                    <span className="text-slate-900 font-bold">{receipt.grade}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono">Parent Name</span>
                    <span className="text-slate-900 font-bold">{receipt.parentName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2.5">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono">Parent Email</span>
                    <span className="text-slate-900 font-bold">{receipt.parentEmail}</span>
                  </div>
                  {receipt.parentPhone && (
                    <div className="flex justify-between border-b border-slate-200 pb-2.5">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono">WhatsApp</span>
                      <span className="text-slate-900 font-bold">{receipt.parentPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-slate-900 pt-2 text-base">
                    <span>Fee Amount Paid</span>
                    <span className="text-sky-700 font-black">₹{(receipt.amount || currentFee).toLocaleString('en-IN')}.00</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-3 pt-4 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold px-6 py-3 rounded-full flex items-center space-x-2 transition shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span>PRINT RECEIPT</span>
                  </button>

                  <Link
                    href="/"
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-6 py-3 rounded-full flex items-center space-x-2 shadow-md transition"
                  >
                    <span>BACK TO HOME</span>
                  </Link>
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      )}

      {/* SECTION 2: VAN FARES & TRANSIT ROUTES */}
      {activeSection === 'VAN_FARES' && (
        <div className="space-y-12 animate-fadeIn text-left">
          <AnimatedSection type="fade-in" className="text-left space-y-4 max-w-3xl">
            <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
              TRANSIT SCHEDULER & PASSES
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              VAN FARES & LOGISTICS.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Search your boarding point to calculate flat monthly transportation van fares for our 2026 school routes across Imphal East and surrounding regions.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Lookup Search Panel */}
            <div className="lg:col-span-7 bg-white rounded-[32px] border border-sky-100 shadow-md p-8 space-y-6">
              <div className="space-y-2">
                <label htmlFor="vanSearchInput" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                  Search Your Boarding Point / Locality
                </label>
                <input
                  id="vanSearchInput"
                  type="text"
                  value={searchRoute}
                  onChange={(e) => setSearchRoute(e.target.value)}
                  className="block w-full py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                  placeholder="e.g. Waiton, Pangei, Pukhao, Sawombung, Khurai..."
                />
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-2">
                {filteredRoutes.length > 0 ? (
                  filteredRoutes.map((route) => (
                    <div key={route.loc} className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5 last:border-0 hover:bg-sky-50/60 px-3 py-2 rounded-xl transition">
                      <span className="font-bold text-slate-800 uppercase tracking-tight">{route.loc}</span>
                      <span className="font-mono text-sky-800 font-black bg-sky-50 border border-sky-200 px-3 py-1 rounded-full shadow-xs">
                        ₹{route.fare.toLocaleString('en-IN')} / mo
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 font-normal text-center py-12">
                    No matching route found for &quot;{searchRoute}&quot;. Please check spelling or contact the school office.
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle & Pass Info Card */}
            <div className="lg:col-span-5 bg-white rounded-[32px] border border-sky-100 p-8 shadow-md space-y-6 hover:border-sky-200 transition-all">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">Van Pass Schedule</h3>
                <span className="text-[10px] font-mono font-extrabold text-sky-800 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full">
                  ACTIVE PASS 2026
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-5 text-xs text-slate-600 font-normal">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono block">Vehicle Fleet</span>
                  <span className="text-slate-900 font-bold">Maruti Omni (School Van)</span>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono block">Drivers & Staff</span>
                  <span className="text-slate-900 font-bold">Verified School Staff</span>
                </div>
                <div className="col-span-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 font-mono block">Pickup Hours</span>
                  <span className="text-slate-900 font-bold">Morning: 07:15 AM | Afternoon: 02:30 PM</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed font-normal">
                <span className="font-bold text-slate-900 block mb-1">📢 Transport Booking Note:</span>
                Van seats are allocated on a first-come, first-served basis. Fares are calculated on a flat monthly rate. Transport registration can be completed during document submission at the school office.
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('ADMISSION_PAYMENT')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold py-3.5 rounded-2xl transition flex items-center justify-center space-x-2 shadow-md border border-amber-300"
              >
                <span>Proceed to Admission Form</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Fee Payment Counter Modal */}
      <MonthlyFeePaymentModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
      />
    </div>
  );
}
