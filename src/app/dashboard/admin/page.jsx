"use client";

import { useEffect, useState } from "react";
import {
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  User2,
  Store,
  ShieldCheck,
  Cross,
} from "lucide-react";
import { authClient } from "@/lib/auth-client"; // adjust path if needed

const TICKET_STATS = [
  {
    key: "totalTickets",
    label: "Total Tickets",
    icon: Ticket,
    accent: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    key: "pendingTickets",
    label: "Pending Review",
    icon: Clock,
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    key: "activeTickets",
    label: "Active Tickets",
    icon: CheckCircle2,
    accent: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  },
  {
    key: "rejectedTickets",
    label: "Rejected Tickets",
    icon: XCircle,
    accent: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
];

const ACCOUNT_STATS = [
  {
    key: "totalAccount",
    label: "Total Accounts",
    icon: Users,
    accent: "bg-stone-100 text-stone-700 dark:bg-neutral-800 dark:text-stone-300",
  },
  {
    key: "totalUser",
    label: "Users",
    icon: User2,
    accent: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    key: "totalVendor",
    label: "Vendors",
    icon: Store,
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    key: "totalAdmin",
    label: "Total Blocked",
    icon: Cross,
    accent: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  },
];

export default function AdminOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const {data:tokenData} =await authClient.token();
        console.log(tokenData.token)

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/admin/overview`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch overview");
        const data = await res.json();
        setOverview(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          Overview
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          A snapshot of tickets and accounts across TicketLagbe
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* ── Tickets section ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-3">
          Tickets
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {TICKET_STATS.map(({ key, label, icon: Icon, accent }) =>
            loading ? (
              <SkeletonCard key={key} />
            ) : (
              <StatCard
                key={key}
                icon={Icon}
                accent={accent}
                label={label}
                value={overview?.[key]}
              />
            )
          )}
        </div>
      </section>

      {/* ── Accounts section ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-3">
          Accounts
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {ACCOUNT_STATS.map(({ key, label, icon: Icon, accent }) =>
            loading ? (
              <SkeletonCard key={key} />
            ) : (
              <StatCard
                key={key}
                icon={Icon}
                accent={accent}
                label={label}
                value={overview?.[key]}
              />
            )
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, accent, label, value }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
      <span
        className={[
          "flex items-center justify-center w-9 h-9 rounded-xl shrink-0",
          accent,
        ].join(" ")}
      >
        <Icon size={18} strokeWidth={2.2} />
      </span>
      <div>
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-none">
          {value?.toLocaleString() ?? "—"}
        </p>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1.5">
          {label}
        </p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 animate-pulse">
      {/* icon placeholder */}
      <div className="w-9 h-9 rounded-xl bg-stone-200 dark:bg-neutral-700" />
      <div className="flex flex-col gap-2">
        {/* number placeholder */}
        <div className="h-8 w-20 rounded-lg bg-stone-200 dark:bg-neutral-700" />
        {/* label placeholder */}
        <div className="h-3 w-24 rounded-md bg-stone-100 dark:bg-neutral-800" />
      </div>
    </div>
  );
}