"use client";

import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";

/**
 * TicketLagbe — Splash Screen
 *
 * Shows for ~2.5s on first visit, then fades out to reveal the real app.
 *
 * Usage in your root layout or page:
 *
 *   import SplashScreen from "@/components/SplashScreen";
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html>
 *         <body>
 *           <SplashScreen />
 *           {children}
 *         </body>
 *       </html>
 *     );
 *   }
 */

export default function SplashScreen() {
  const [visible, setVisible] = useState(false); // false until mount check
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Only show splash on a real page load / hard refresh — not on Next.js
    // client-side navigation. sessionStorage is cleared when the tab closes,
    // so the splash re-appears on the next fresh browser visit.
    const alreadySeen = sessionStorage.getItem("tl_splash_seen");

    if (alreadySeen) {
      // Client-side nav or back/forward — skip splash entirely
      setVisible(false);
      return;
    }

    // First load this session — mark it immediately so navigating back
    // to this page within the same tab doesn't replay the splash.
    sessionStorage.setItem("tl_splash_seen", "1");
    setVisible(true);

    const fadeTimer = setTimeout(() => setFadeOut(true), 2200);
    const removeTimer = setTimeout(() => setVisible(false), 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
        "bg-stone-950 transition-opacity duration-700 ease-in-out",
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      {/* Logo mark + wordmark */}
      <div className="flex items-center gap-3 animate-[splashRise_0.7s_ease_0.3s_both]">
        <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-600">
          <Ticket size={28} strokeWidth={2.4} className="-rotate-12 text-orange-50" />
        </span>
        <span className="font-extrabold text-4xl tracking-tight text-stone-50">
          Ticket<span className="text-orange-500">Lagbe</span>
        </span>
      </div>

      {/* Tagline */}
      <p className="mt-4 text-xs font-semibold tracking-[0.2em] uppercase text-stone-500 animate-[splashRise_0.6s_ease_0.75s_both]">
        Book · Travel · Arrive
      </p>

      {/* Progress bar */}
      <div className="mt-9 w-44 h-[3px] rounded-full bg-stone-800 overflow-hidden animate-[splashRise_0.4s_ease_1s_both]">
        <div className="h-full rounded-full bg-orange-600 animate-[splashFill_1.8s_cubic-bezier(0.4,0,0.2,1)_1.1s_both]" />
      </div>

      {/* Pulsing dots */}
      <div className="mt-7 flex gap-1.5 animate-[splashRise_0.4s_ease_1s_both]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-stone-700 animate-[splashDot_1.6s_ease_infinite]"
            style={{ animationDelay: `${1.1 + i * 0.2}s` }}
          />
        ))}
      </div>

      {/* Keyframe definitions */}
      <style>{`
        @keyframes splashRise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes splashDot {
          0%, 100% { background: #44403c; transform: scale(1); }
          50%       { background: #ea580c; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}