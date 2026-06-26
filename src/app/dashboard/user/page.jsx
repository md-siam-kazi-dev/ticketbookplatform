"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Ticket, Clock, CheckCircle2, XCircle, Wallet, CreditCard } from "lucide-react";

// ── SUB-COMPONENT: CARD SKELETON REPLICA ─────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-900/40 border border-stone-200 dark:border-neutral-800/80 p-5 rounded-2xl flex flex-col gap-3 animate-pulse">
      {/* Icon Frame Skeleton */}
      <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-neutral-800" />
      
      {/* Metrics Block Skeleton */}
      <div className="flex flex-col gap-2 pt-0.5">
        {/* Large Value Stat Block */}
        <div className="h-7 w-16 bg-stone-100 dark:bg-neutral-800 rounded-lg" />
        {/* Label Text Block */}
        <div className="h-3.5 w-28 bg-stone-100 dark:bg-neutral-800 rounded-md" />
      </div>
    </div>
  );
}

// ── MAIN COMPONENT MODULE ─────────────────────────────────────────────────────
export default function UserStatistics() {
  const { data: session, isPending: sessionPending } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionPending) return;
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: tokenData } = await authClient.token();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/user/stats/${session.user.email}`,
          {
            headers: { Authorization: `Bearer ${tokenData?.token}` },
          }
        );
        
        if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
        
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching user statistics view layer:", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session, sessionPending]);

  // ── SKELETON LAYOUT STATE GENERATOR ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-8 select-none antialiased">
        {/* Static Header Section to prevent cumulative layout shift (CLS) */}
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">Overview</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            A snapshot of tickets and analytical accounts across TicketLagbe
          </p>
        </div>

        {/* Section 1 Skeleton Layout: 4 Cards */}
        <div className="flex flex-col gap-3.5">
          <div className="h-3 w-16 bg-stone-100 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={`sec1-skel-${i}`} />
            ))}
          </div>
        </div>

        {/* Section 2 Skeleton Layout: 3 Cards */}
        <div className="flex flex-col gap-3.5">
          <div className="h-3 w-32 bg-stone-100 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`sec2-skel-${i}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Safe structural fallback parsing configuration logic 
  const sData = stats || {
    totalBookings: 0, pendingReview: 0, approvedPaid: 0, rejectedCount: 0,
    totalSpent: 0, pendingPay: 0, totalSeats: 0
  };

  const sections = [
    {
      title: "TICKETS",
      cards: [
        { label: "Total Bookings",    value: sData.totalBookings, icon: Ticket,       color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
        { label: "Pending Review",    value: sData.pendingReview, icon: Clock,        color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
        { label: "Approved & Paid",   value: sData.approvedPaid,  icon: CheckCircle2, color: "text-green-500 bg-green-500/10 border-green-500/20" },
        { label: "Rejected Bookings", value: sData.rejectedCount, icon: XCircle,      color: "text-red-500 bg-red-500/10 border-red-500/20" },
      ],
    },
    {
      title: "ACCOUNTS & FINANCES",
      cards: [
        { label: "Total Spent",      value: `৳${(sData.totalSpent || 0).toLocaleString("en-IN")}`, icon: Wallet,     color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
        { label: "Awaiting Payment", value: `৳${(sData.pendingPay || 0).toLocaleString("en-IN")}`, icon: CreditCard, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
        { label: "Total Seats Reserved", value: sData.totalSeats,                                  icon: Ticket,     color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
      ],
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 select-none antialiased">
      {/* Title Header Section */}
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">Overview</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          A snapshot of tickets and analytical accounts across TicketLagbe
        </p>
      </div>

      {/* Main Grid Render Loop */}
      {sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-3.5">
          <h3 className="text-[10px] font-bold tracking-widest text-stone-400 dark:text-neutral-500 uppercase">
            {section.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {section.cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-neutral-900/40 border border-stone-200 dark:border-neutral-800/80 p-5 rounded-2xl flex flex-col gap-3 hover:border-stone-300 dark:hover:border-neutral-700 transition-all duration-200 group"
                >
                  {/* Icon Frame */}
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon size={14} className="stroke-[2.5]" />
                  </div>

                  {/* Core Value Fields */}
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50 truncate">
                      {card.value}
                    </p>
                    <p className="text-xs font-medium text-stone-400 dark:text-stone-500 mt-0.5 truncate">
                      {card.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}