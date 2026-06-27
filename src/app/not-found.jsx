"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex items-center justify-center px-4 transition-colors">
      <div className="text-center max-w-sm w-full">

        {/* Animated 404 number */}
        <div
          className="relative mb-8"
          style={{ animation: "tlFloat 3s ease-in-out infinite" }}
        >
          {/* Ticket icon behind the numbers */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-40 h-40 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-orange-200/60 dark:bg-orange-500/20" />
            </div>
          </div>

          {/* 404 text */}
          <p
            className="relative z-10 text-[96px] font-black tracking-tighter leading-none"
            style={{
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #ea580c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </p>
        </div>

        {/* Perforated divider — ticket stub motif */}
        <div
          aria-hidden="true"
          className="w-full h-[10px] mb-8"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #d6d3d1 3px, transparent 3.2px)",
            backgroundSize: "16px 10px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "4px 0",
          }}
        />

        {/* Copy */}
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 mb-3">
          Page not found
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-8">
          Looks like this ticket has expired — the page you're looking for
          doesn't exist or has been moved.
        </p>

        {/* Home button */}
        <Link
          href="/"
          className="no-underline inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 text-sm font-semibold transition-colors shadow-md shadow-orange-200 dark:shadow-orange-900/30"
        >
          <Home size={16} />
          Back to Home
        </Link>

      </div>

      <style>{`
        @keyframes tlFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}