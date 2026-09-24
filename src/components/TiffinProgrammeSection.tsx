'use client';

import React from 'react';
import { Utensils, Heart, ShieldCheck, Sparkles, CheckCircle2, Apple, Soup, Users2 } from 'lucide-react';
import { AnimatedSection } from './AnimatedSection';

export default function TiffinProgrammeSection() {
  const highlights = [
    {
      icon: Soup,
      title: 'Freshly Cooked Daily',
      desc: 'Meals are freshly prepared on-campus every morning under the highest standards of culinary hygiene and food safety.',
      badge: '100% Hygienic',
      color: 'emerald',
    },
    {
      icon: Apple,
      title: 'Balanced Nutrition Menu',
      desc: 'A carefully curated, rotating daily menu designed by nutritionists to give young minds and bodies optimal energy and health.',
      badge: 'Different Menu Daily',
      color: 'amber',
    },
    {
      icon: Users2,
      title: 'Promotes Equality & Sharing',
      desc: 'Serving the exact same wholesome meal to all students fosters togetherness, lifelong table manners, and eliminates tiffin envy.',
      badge: 'Zero Tiffin Envy',
      color: 'sky',
    },
    {
      icon: ShieldCheck,
      title: 'Strict No-Outside-Food Policy',
      desc: 'Students are not permitted to bring outside packed food, protecting children from junk foods, artificial additives, and allergens.',
      badge: 'Pure & Wholesome',
      color: 'purple',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-10">
      <AnimatedSection type="fade-in-up" className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white p-8 sm:p-14 lg:p-16 border border-emerald-500/20 shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-emerald-500/20 pb-8">
            <div className="space-y-4 max-w-2xl text-left">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                <Heart className="h-4 w-4 text-emerald-400 fill-emerald-400/40" />
                <span>SIGNATURE CAMPUS WELLNESS</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Fresh & Healthy<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                  Tiffin Programme.
                </span>
              </h2>
              <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed font-normal">
                At The Little House School, we believe nutritious food is foundational to learning. We provide freshly cooked, hygienically prepared, and balanced tiffin for every child every day.
              </p>
            </div>

            {/* Motto Badge */}
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-5 text-left max-w-sm backdrop-blur-sm">
              <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest mb-1 flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>CAMPUS MOTTO</span>
              </div>
              <p className="text-sm font-extrabold text-white tracking-wide">
                Healthy Food • Happy Children • Brighter Future
              </p>
              <p className="text-xs text-emerald-200/80 mt-1">
                A common campus meal creates a warm culture of equality, mindfulness, and healthy habits.
              </p>
            </div>
          </div>

          {/* 4 Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-4 group backdrop-blur-xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Included for every student</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Brochure Principle Banner */}
          <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-400/30 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg">
                <Utensils className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm sm:text-base">Why We Do Not Permit Outside Tiffins:</h4>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                  A common menu guarantees equal nutrition, instills shared community values, and completely prevents social comparison and tiffin envy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
