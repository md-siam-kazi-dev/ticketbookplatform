'use client';

import { motion } from "framer-motion";
import { ArrowRight, Bus, TrainFront, Ship, Plane, Star } from "lucide-react";
import { TypingAnimation } from "../ui/typing-animation";
import Link from "next/link";

const STATS = [
  { value: "12K+", label: "Daily Tickets" },
  { value: "320+", label: "Routes"        },
  { value: "98%",  label: "On-time Rate"  },
];

const TRANSPORT = [
  { icon: Bus,        label: "Bus",    color: "bg-orange-50 text-orange-500 border border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20"  },
  { icon: TrainFront, label: "Train",  color: "bg-blue-50 text-blue-500 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"            },
  { icon: Ship,       label: "Launch", color: "bg-cyan-50 text-cyan-500 border border-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20"            },
  { icon: Plane,      label: "Flight", color: "bg-purple-50 text-purple-500 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20"},
];

const REVIEWS = [
  { name: "Rafiq H.",  text: "Booked in under 2 minutes. Absolutely seamless." },
  { name: "Nusrat J.", text: "Best ticket platform in Bangladesh, hands down."  },
  { name: "Tanvir A.", text: "Real-time seats and instant confirmation. Love it." },
];

export default function HeroBanner() {
  return (
    <section className="relative mt-16 overflow-hidden bg-[#fafafa] dark:bg-neutral-950 transition-colors">

      {/* ── Background blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(234,88,12,0.1) 0%, transparent 65%)," +
            "radial-gradient(ellipse 40% 40% at 50% 100%, rgba(234,88,12,0.05) 0%, transparent 60%)",
        }}
      />

      {/* ── Dot grid ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #78716c 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28 lg:py-32">
        <div className="flex flex-col items-center gap-16">

          {/* ── TOP: Text content (centered) ── */}
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">

            {/* Startup-style Eyebrow pill */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shadow-sm mb-8 transition-colors cursor-default">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400 animate-pulse" />
                </span>
                <span className="text-stone-600 dark:text-stone-300">Bangladesh's #1 Ticket Platform</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-[5rem] font-extrabold tracking-tighter text-stone-900 dark:text-white mb-6 leading-[1.05]"
            >
              <span className="block mb-2">
                <TypingAnimation>Your Journey</TypingAnimation>
              </span>
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-rose-500 dark:from-orange-400 dark:via-orange-300 dark:to-rose-400 pb-3">
                <TypingAnimation delay={1300}>Starts Here.</TypingAnimation>
              </span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-stone-500 dark:text-stone-400 max-w-lg mb-10 leading-relaxed font-medium"
            >
              Book bus, train, launch &amp; flight tickets instantly.
              Compare routes, pick your seat, and travel with confidence.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto"
            >
              <Link
                href="/alltickets"
                className="no-underline w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-[0_8px_30px_rgb(234,88,12,0.25)] dark:shadow-[0_8px_30px_rgb(234,88,12,0.15)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.4)] dark:hover:shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:-translate-y-0.5 group"
              >
                Browse All Tickets
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Stats card with theme-aware glowing effect */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="relative flex items-center justify-center gap-6 sm:gap-10 px-8 py-5 rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-stone-200/50 dark:border-neutral-800/80 shadow-[0_0_40px_-10px_rgba(234,88,12,0.2)] dark:shadow-[0_0_30px_-10px_rgba(234,88,12,0.05)] transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(234,88,12,0.25)] dark:hover:shadow-[0_0_40px_-10px_rgba(234,88,12,0.07)]"
            >
              {STATS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-6 sm:gap-10 z-10">
                  {i !== 0 && <div className="h-10 w-px bg-stone-200/80 dark:bg-neutral-800/80" />}
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tighter leading-none">
                      {s.value}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-stone-500 dark:text-stone-400 mt-1.5 uppercase tracking-widest">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── BOTTOM: Visual static card display (Balanced 2-column layout) ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, type: "spring", stiffness: 160, damping: 22 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5 pointer-events-none select-none"
          >

            {/* Static Transport mode pills card (Unclickable) */}
            <div className="bg-white dark:bg-neutral-900/80 border border-stone-200/80 dark:border-neutral-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-4">
                We cover all modes
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TRANSPORT.map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl text-xs font-semibold border ${color}`}
                  >
                    <Icon size={22} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Static Review snippet card (Unclickable) */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-500 dark:to-orange-700 rounded-2xl p-6 shadow-[0_8px_30px_rgb(234,88,12,0.2)] dark:shadow-[0_8px_30px_rgb(234,88,12,0.1)] flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="text-white fill-white" />
                ))}
                <span className="text-orange-50 text-xs font-bold ml-1">4.9 / 5</span>
              </div>
              <div className="flex flex-col gap-3.5">
                {REVIEWS.map(({ name, text }) => (
                  <div key={name} className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-white">{name}</p>
                      <p className="text-[11px] text-orange-50/90 leading-relaxed font-medium">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* ── Bottom wave ── */}
      <div aria-hidden="true" className="relative h-12 -mb-1">
        <svg
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-full text-stone-50 dark:text-neutral-900"
          fill="currentColor"
        >
          <path d="M0 48 L0 24 Q360 0 720 24 Q1080 48 1440 24 L1440 48 Z" />
        </svg>
      </div>
    </section>
  );
}