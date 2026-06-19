'use client'
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Ticket, ChevronDown, Menu, X, User, LogOut, Sun, Moon, TrainFront } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "@/lib/auth-client";

export default function TicketLagbeNavbar() {
  const { data, isPending } = useSession();
  const user = data?.user;


  const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "All Tickets", href: "/tickets" },
    {
      label: "Dashboard",
      href: `/dashboard/${user?.role}`
    }
  ];

  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="bg-stone-50 fixed z-[100] w-full dark:bg-neutral-950 transition-colors">
      <header
        className={[
          "sticky top-0 z-50 border-b transition-colors",
          "border-stone-200 dark:border-neutral-800",
          scrolled
            ? "bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm"
            : "bg-white dark:bg-neutral-950",
        ].join(" ")}
      >
        {/* Perforated ticket-stub edge */}
        <div
          aria-hidden="true"
          className="absolute left-0 right-0 -bottom-[5px] h-[10px] bg-stone-50 dark:bg-neutral-950"
          style={{
            backgroundImage: "radial-gradient(circle at center, var(--tl-edge) 3.2px, transparent 3.4px)",
            backgroundSize: "16px 10px",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "4px 0",
          }}
        />
        <style>{`
          :root { --tl-edge: #fff; }
          .dark { --tl-edge: #0a0a0a; }
        `}</style>

        <nav className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
            <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-orange-600 dark:bg-orange-500 text-orange-50">
              <TrainFront size={19} />
            </span>
            <span className="font-bold text-xl tracking-tight text-stone-900 dark:text-stone-50 whitespace-nowrap">
              Ticket<span className="text-orange-600 dark:text-orange-500">Lagbe</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="block px-3.5 py-2 rounded-lg text-sm font-medium text-stone-500 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />

            {/* Desktop auth — 3 states: loading | logged in | logged out */}
            <div className="hidden md:block">
              {isPending ? (
                // ── Skeleton: no flash of Login/Register while session resolves ──
                <div className="flex items-center gap-2 bg-stone-100 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-full pl-1.5 pr-3 py-1.5 animate-pulse">
                  <div className="w-[26px] h-[26px] rounded-full bg-stone-300 dark:bg-neutral-700" />
                  <div className="w-20 h-3 rounded-full bg-stone-300 dark:bg-neutral-700" />
                </div>
              ) : user ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 bg-stone-100 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-full pl-1.5 pr-3 py-1.5 cursor-pointer text-stone-900 dark:text-stone-50"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-[26px] h-[26px] rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-[26px] h-[26px] rounded-full bg-orange-600 dark:bg-orange-500 text-orange-50 flex items-center justify-center text-xs font-bold">
                        {user.name?.charAt(0)}
                      </span>
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                    <ChevronDown
                      size={14}
                      className={["text-stone-400 transition-transform", profileOpen ? "rotate-180" : ""].join(" ")}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-[calc(100%+8px)] min-w-[170px] bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl shadow-lg p-1.5">
                      <DropdownItem
                        icon={User}
                        label="My Profile"
                        fun={() =>
                          router.push(`/dashboard/${user.role}/profile`)
                        }
                      />
                      <DropdownItem
                        icon={LogOut}
                        label="Logout"
                        danger
                        fun={async () => {
                          await signOut();
                          router.push("/");
                          router.refresh();
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 rounded-lg border border-stone-200 dark:border-neutral-700 text-stone-900 dark:text-stone-50 text-sm font-medium hover:bg-stone-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="px-4 py-2 rounded-lg bg-orange-600 dark:bg-orange-500 text-orange-50 text-sm font-semibold hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex items-center p-1.5 text-stone-900 dark:text-stone-50"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile panel */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200 dark:border-neutral-800 px-5 pt-3 pb-4 bg-white dark:bg-neutral-950">
            {NAV_LINKS.filter((l) => l.label !== "Dashboard" || !!user).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 border-b border-stone-100 dark:border-neutral-800 text-stone-900 dark:text-stone-50 text-[15px] font-medium"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3.5">
              {isPending ? (
                // Mobile skeleton
                <div className="flex items-center gap-2.5 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-stone-300 dark:bg-neutral-700" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded-full bg-stone-300 dark:bg-neutral-700" />
                    <div className="h-2.5 w-16 rounded-full bg-stone-200 dark:bg-neutral-800" />
                  </div>
                </div>
              ) : user ? (
                <div className="flex items-center gap-2.5">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-orange-600 dark:bg-orange-500 text-orange-50 flex items-center justify-center text-sm font-bold">
                      {user.name?.charAt(0)}
                    </span>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                      {user.name}
                    </div>
                    <button
                      onClick={async () => {
                        await signOut();
                        router.push("/");
                        router.refresh();
                      }}
                      className="text-xs text-orange-600 dark:text-orange-400 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { router.push("/login"); setMobileOpen(false); }}
                    className="flex-1 py-2.5 rounded-lg border border-stone-200 dark:border-neutral-700 text-stone-900 dark:text-stone-50 text-sm font-medium"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { router.push("/signup"); setMobileOpen(false); }}
                    className="flex-1 py-2.5 rounded-lg bg-orange-600 dark:bg-orange-500 text-orange-50 text-sm font-semibold"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-[52px] h-7 rounded-full border border-stone-200 dark:border-neutral-700 bg-stone-100 dark:bg-neutral-900 shrink-0"
    >
      <span
        className={[
          "absolute top-0.5 w-[22px] h-[22px] rounded-full bg-orange-600 dark:bg-orange-500 text-orange-50 flex items-center justify-center transition-all",
          isDark ? "left-[26px]" : "left-0.5",
        ].join(" ")}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  );
}

function DropdownItem({ icon: Icon, label, danger, fun }) {
  return (
    <button
      onClick={fun}
      className={[
        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-left transition-colors",
        danger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-stone-900 dark:text-stone-50 hover:bg-orange-50 dark:hover:bg-orange-500/10",
      ].join(" ")}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}