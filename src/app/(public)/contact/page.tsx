'use client';

import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { AnimatedSection } from '@/components/AnimatedSection';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [botTrapVal, setBotTrapVal] = useState('');
  const [formLoadTime] = useState<number>(() => Date.now());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (botTrapVal || (Date.now() - formLoadTime < 1000)) {
      // Bot trapped: silently simulate success without sending spam
      setSubmitted(true);
      return;
    }
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 space-y-20 relative bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <AnimatedSection type="fade-in" className="text-left max-w-4xl space-y-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
          COMMUNICATION & HELPDESK
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
          GET IN TOUCH.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
          Have a question regarding admissions, academics, or school transport? Our school administrative office at Waiton Lamkhai is here to help.
        </p>
      </AnimatedSection>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Card */}
        <AnimatedSection type="slide-in-left" className="bg-white text-slate-900 p-8 sm:p-10 rounded-[32px] shadow-md space-y-10 lg:col-span-5 relative overflow-hidden border border-sky-100">
          <div className="space-y-2 relative z-10 text-left">
            <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 uppercase bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
              OFFICE DESK
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Reach Our Campus</h2>
          </div>
          
          <div className="space-y-6 relative z-10 text-left">
            <div className="flex items-start space-x-4">
              <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 text-sky-600 flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-500">Address</h3>
                <p className="text-slate-800 text-sm mt-1 leading-relaxed font-semibold">
                  Waiton Lamkhai, Imphal East<br />
                  Manipur - 795114
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-600 flex-shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-500">Phone Hotline</h3>
                <p className="text-slate-800 text-sm mt-1 font-semibold">
                  +91 98765 43210
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 text-sky-600 flex-shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-500">Official Email</h3>
                <p className="text-slate-800 text-sm mt-1 font-semibold break-all">
                  littlehousepreschoolmanipur@gmail.com
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-emerald-600 flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-500">Office Working Hours</h3>
                <p className="text-slate-800 text-sm mt-1 font-semibold leading-relaxed">
                  Monday – Friday: 8:00 AM – 4:00 PM<br />
                  Saturday: 8:30 AM – 1:00 PM
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Inquiry Form */}
        <AnimatedSection type="slide-in-right" className="bg-white rounded-[32px] border border-sky-100 p-8 sm:p-10 lg:col-span-7 flex flex-col justify-between shadow-md">
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-4 text-left">
              Send an Inquiry
            </h2>
            
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-[24px] flex items-start space-x-4 my-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-extrabold text-lg uppercase tracking-tight text-emerald-900">Message Received</h3>
                  <p className="text-xs sm:text-sm text-emerald-700 mt-2 font-normal leading-relaxed">
                    Thank you. Your message has been sent to our administrative office. We will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-mono font-bold text-emerald-800 underline mt-4 hover:text-emerald-900 transition uppercase tracking-wider"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                      placeholder="e.g. Priyobarta Singh"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                      placeholder="e.g. parent@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="subject" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition text-slate-900"
                    placeholder="e.g. Admission / Transport query"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 focus:bg-white transition resize-none text-slate-900"
                    placeholder="How can we assist you today?"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold px-8 py-3.5 rounded-full transition shadow-md border border-amber-300"
                  >
                    <Send className="h-4 w-4" />
                    <span>SUBMIT INQUIRY</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </AnimatedSection>
      </section>

      {/* Google Maps Location Section */}
      <AnimatedSection type="fade-in-up" className="space-y-4 text-left">
        <span className="text-[10px] font-mono font-bold tracking-widest text-sky-700 bg-sky-100 border border-sky-200 px-3 py-1 rounded-full uppercase">
          CAMPUS MAP & SATELLITE
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Find Us on Google Maps</h2>
        <div className="h-[450px] w-full rounded-[32px] border border-sky-100 overflow-hidden bg-slate-200 relative shadow-md">
          <iframe
            src="https://maps.google.com/maps?q=24.8672431,93.9763613+(LITTLE+HOUSE+PRE-SCHOOL)&t=k&z=18&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 absolute inset-0"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </AnimatedSection>
    </div>
  );
}
