"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client"; // Your explicit Better Auth client export
import { toast } from "sonner";
import {
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  TrendingUp,
  DollarSign,
} from "lucide-react";



export default function VendorDashboardOverview() {
  // Better Auth client session state hook hook signature
  const { data: session, isPending } = authClient.useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hold fetching sequence while Better Auth finishes background validation
    if (isPending) return;

    const fetchOverviewData = async () => {
      // Better Auth structures the payload under session.user
      const email = session?.user?.email;
      
      if (!email) {
        // Fallback to static metrics smoothly if no active session is detected
        setStats(DEMO_DATA);
        setLoading(false);
        return;
      }

      try {
        const {data:tokenData} = await authClient.token();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/vendoroverview/${email}`,{
          headers:{
            'Authorization':`bekd ${tokenData.token}`

          }
        } ,{
          cache: "no-store",
        });
        
        if (!res.ok) throw new Error("Server metrics error");
        
        const data = await res.json();
        setStats(data.success ? data.overview : data);
      } catch (err) {
        toast.error("Failed to load live server metrics. Displaying offline demo statistics.");
        setStats(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [session, isPending]);

  const isLoading = loading || isPending;

  return (
    <div className="w-full space-y-6">
      
      {/* ── HEADER ── */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-50">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-xs text-stone-500 sm:text-sm dark:text-stone-400">
          Real-time metrics, product performance tracking, and generated revenue summaries.
        </p>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          // Tailwind Motion Skeleton Blocks matching data layout footprint
          Array.from({ length: 7 }).map((_, idx) => (
            <div 
              key={idx} 
              className="animate-pulse rounded-2xl border border-stone-200/60 bg-white p-5 dark:border-neutral-800/60 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-stone-200 dark:bg-neutral-800" />
                <div className="h-8 w-8 rounded-xl bg-stone-200 dark:bg-neutral-800" />
              </div>
              <div className="mt-4 h-7 w-16 rounded bg-stone-200 dark:bg-neutral-800" />
            </div>
          ))
        ) : (
          // Live Loaded Components
          <>
            <StatCard
              title="Total Tickets"
              value={stats?.totalTickets}
              icon={<Ticket className="h-5 w-5 text-blue-500" />}
            />
            <StatCard
              title="Pending Approval"
              value={stats?.pendingTickets}
              icon={<Clock className="h-5 w-5 text-amber-500" />}
            />
            <StatCard
              title="Approved Items"
              value={stats?.approvedTickets}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            />
            <StatCard
              title="Rejected Campaigns"
              value={stats?.rejectedTickets}
              icon={<XCircle className="h-5 w-5 text-rose-500" />}
            />
            <StatCard
              title="Active Booking Queries"
              value={stats?.requestedBookings}
              icon={<CalendarCheck className="h-5 w-5 text-indigo-500" />}
            />
            <StatCard
              title="Total Units Sold"
              value={stats?.totalSold}
              icon={<TrendingUp className="h-5 w-5 text-teal-500" />}
            />
            <StatCard
              title="Gross Earnings"
              value={`$${stats?.totalRevenue?.toLocaleString()}`}
              icon={<DollarSign className="h-5 w-5 text-orange-500" />}
              className="sm:col-span-2 lg:col-span-1 xl:col-span-2 border-orange-100 dark:border-orange-950/30"
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ── SUB-COMPONENT: CARD CARRIER ── */
function StatCard({ title, value, icon, className = "" }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 transition-all duration-200 hover:border-stone-300 dark:border-neutral-800/80 dark:bg-neutral-900 dark:hover:border-neutral-700 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-500 truncate dark:text-stone-400">
          {title}
        </span>
        <div className="rounded-xl p-2 bg-stone-50 group-hover:scale-105 transition-transform dark:bg-neutral-800/50">
          {icon}
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          {value ?? 0}
        </span>
      </div>
    </div>
  );
}