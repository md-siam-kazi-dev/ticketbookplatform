'use client'
import { useState } from "react";
import { Bus, Train, Ship, Plane, ArrowRight, MapPin, Calendar, Search } from "lucide-react";

/**
 * TicketLagbe — Hero Banner Section
 * Matches orange-600 / stone / neutral dark-mode palette from Navbar & Footer.
 * Wrap this inside the same `dark`-class ancestor to sync theme.
 *
 * Usage: <HeroBanner />
 */

const TRANSPORT_TABS = [
  { key: "bus",    label: "Bus",    icon: Bus   },
  { key: "train",  label: "Train",  icon: Train  },
  { key: "launch", label: "Launch", icon: Ship   },
  { key: "flight", label: "Flight", icon: Plane  },
];

const STATS = [
  { value: "12K+",  label: "Daily Tickets" },
  { value: "320+",  label: "Routes" },
  { value: "98%",   label: "On-time Rate" },
];

export default function HeroBanner() {
  const [activeTab, setActiveTab] = useState("bus");
  const [from, setFrom]   = useState("");
  const [to, setTo]       = useState("");
  const [date, setDate]   = useState("");

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="relative mt-20 md:mt-40  overflow-hidden bg-white dark:bg-neutral-950 transition-colors">

      {/* ── Gradient wash ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 80% 50%, rgba(234,88,12,0.08) 0%, transparent 70%), " +
            "radial-gradient(ellipse 50% 80% at 0% 100%, rgba(234,88,12,0.05) 0%, transparent 60%)",
        }}
      />

      {/* ── Dot-grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #78716c 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ── LEFT: Copy + stats ── */}
        <div className="flex-1 text-center lg:text-left">

          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Bangladesh's #1 Ticket Platform
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-stone-900 dark:text-stone-50 mb-5">
            Your Journey{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-orange-600 dark:text-orange-500">
                Starts Here
              </span>
              {/* Underline squiggle */}
              <svg
                aria-hidden="true"
                viewBox="0 0 220 10"
                className="absolute -bottom-2 left-0 w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 7 Q55 2 110 6 Q165 10 218 4"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-orange-400 dark:text-orange-600"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-500 dark:text-stone-400 max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed">
            Book bus, train, launch &amp; flight tickets instantly. Compare routes, choose
            your seat, and travel with confidence — all in one place.
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-10">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3 sm:gap-4">
                {i !== 0 && (
                  <div className="h-8 w-px bg-stone-200 dark:bg-neutral-800" />
                )}
                <div>
                  <div className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight leading-none">
                    {s.value}
                  </div>
                  <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Ticket-stub search card ── */}
        <div className="w-full lg:w-[440px] shrink-0">
          <div
            className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-xl dark:shadow-black/40"
            style={{ animation: "tlFloat 4s ease-in-out infinite" }}
          >

            {/* Perforated top edge — ticket stub detail */}
            <div
              aria-hidden="true"
              className="absolute -top-[5px] left-0 right-0 h-[10px]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, #fff 3.2px, transparent 3.4px)",
                backgroundSize: "16px 10px",
                backgroundRepeat: "repeat-x",
                backgroundPosition: "4px 0",
              }}
            />
            <style>{`
              @keyframes tlFloat {
                0%, 100% { transform: translateY(0px); }
                50%       { transform: translateY(-8px); }
              }
              .dark .tl-perf-top {
                background-image: radial-gradient(circle at center, #171717 3.2px, transparent 3.4px) !important;
              }
              @media (prefers-reduced-motion: reduce) {
                [style*="tlFloat"] { animation: none !important; }
              }
            `}</style>

            {/* Transport tabs */}
            <div className="flex border-b border-stone-100 dark:border-neutral-800 px-4 pt-4 gap-1">
              {TRANSPORT_TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium transition-colors",
                    activeTab === key
                      ? "bg-orange-600 dark:bg-orange-500 text-orange-50"
                      : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-800",
                  ].join(" ")}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Search fields */}
            <div className="p-5 flex flex-col gap-4">

              {/* From / To with swap */}
              <div className="relative flex flex-col gap-3">
                {/* From */}
                <div className="flex items-center gap-3 border border-stone-200 dark:border-neutral-700 rounded-xl px-4 py-3 bg-stone-50 dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-orange-500">
                  <MapPin size={16} className="text-orange-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-0.5">
                      From
                    </div>
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Departure city"
                      className="w-full bg-transparent text-sm font-medium text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-600 outline-none"
                    />
                  </div>
                </div>

                {/* Swap button */}
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Swap cities"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 dark:bg-orange-500 text-orange-50 shadow-md hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 3v10M4 13l-2-2M4 13l2-2M12 13V3M12 3l-2 2M12 3l2 2" />
                  </svg>
                </button>

                {/* To */}
                <div className="flex items-center gap-3 border border-stone-200 dark:border-neutral-700 rounded-xl px-4 py-3 bg-stone-50 dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-orange-500">
                  <MapPin size={16} className="text-stone-400 dark:text-stone-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-0.5">
                      To
                    </div>
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Destination city"
                      className="w-full bg-transparent text-sm font-medium text-stone-900 dark:text-stone-50 placeholder-stone-400 dark:placeholder-stone-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 border border-stone-200 dark:border-neutral-700 rounded-xl px-4 py-3 bg-stone-50 dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-orange-500">
                <Calendar size={16} className="text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-0.5">
                    Date
                  </div>
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-stone-900 dark:text-stone-50 outline-none"
                  />
                </div>
              </div>

              {/* Search button */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 font-semibold py-3.5 rounded-xl transition-colors shadow-md shadow-orange-200 dark:shadow-orange-900/30"
              >
                <Search size={17} />
                Search Tickets
                <ArrowRight size={16} />
              </button>

              {/* Trust note */}
              <p className="text-center text-[11px] text-stone-400 dark:text-stone-500 -mt-1">
                Free cancellation on most routes · Instant confirmation
              </p>
            </div>

            {/* Perforated bottom edge — ticket stub detail */}
            <div
              aria-hidden="true"
              className="absolute -bottom-[5px] left-0 right-0 h-[10px]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, #fff 3.2px, transparent 3.4px)",
                backgroundSize: "16px 10px",
                backgroundRepeat: "repeat-x",
                backgroundPosition: "4px 0",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom wave divider ── */}
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