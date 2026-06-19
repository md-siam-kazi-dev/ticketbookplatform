import Link from "next/link";

export default function NonAuthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50 dark:bg-neutral-950">
      <div className="text-center max-w-sm w-full">

        {/* Lock icon with ripple rings */}
        <div className="relative w-24 h-24 mx-auto mb-8 animate-[tlFloat_3s_ease-in-out_infinite]">
          <span className="absolute inset-0 rounded-full border border-orange-500 animate-[tlRipple_2s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-full border border-orange-500 animate-[tlRipple_2s_ease-out_0.7s_infinite]" />
          <span className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-orange-600 dark:text-orange-500 animate-[tlShake_1.2s_ease_0.4s_both]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        </div>

        {/* Label */}
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-orange-600 dark:text-orange-500 mb-2 animate-[tlFadeUp_0.5s_ease_0.2s_both] opacity-0">
          403 — Forbidden
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 mb-3 animate-[tlFadeUp_0.5s_ease_0.35s_both] opacity-0">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-8 animate-[tlFadeUp_0.5s_ease_0.5s_both] opacity-0">
          You don't have permission to view this page.
          Please log in with the correct account or return home.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap animate-[tlFadeUp_0.5s_ease_0.65s_both] opacity-0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 text-sm font-semibold transition-colors no-underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 dark:border-neutral-700 text-stone-900 dark:text-stone-50 text-sm font-medium hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors no-underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Log In
          </Link>
        </div>

      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes tlFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes tlShake {
          0%,100% { transform: rotate(0deg); }
          20%     { transform: rotate(-8deg); }
          40%     { transform: rotate(8deg); }
          60%     { transform: rotate(-5deg); }
          80%     { transform: rotate(5deg); }
        }
        @keyframes tlRipple {
          0%   { transform: scale(0.85); opacity: 1; }
          100% { transform: scale(2.1);  opacity: 0; }
        }
        @keyframes tlFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}