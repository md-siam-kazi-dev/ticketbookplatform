"use client";

import {
  Ticket,
  Clock,
  XCircle,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/**
 * TicketLagbe — Vendor: Overview / Dashboard Home
 *
 * Demo data below — swap `overview` for your server fetch when ready:
 *   const overview = await getVendorOverview();
 *
 * Expected shape:
 * {
 *   totalTickets, pendingTickets, approvedTickets, rejectedTickets,
 *   requestedBookings, totalSold, totalRevenue
 * }
 */

const DEMO_DATA = {
  totalTickets: 34,
  pendingTickets: 5,
  approvedTickets: 24,
  rejectedTickets: 5,
  requestedBookings: 12,
  totalSold: 186,
  totalRevenue: 223200,
};

const DEMO_RECENT_BOOKINGS = [
  { id: "b001", user: "Arif Hossain",    ticket: "Dhaka to Chattogram AC Bus", qty: 2, total: 2400,  status: "pending"  },
  { id: "b002", user: "Nusrat Jahan",    ticket: "Dhaka to Sylhet Non-AC Bus",  qty: 1, total: 700,   status: "pending"  },
  { id: "b003", user: "Tanvir Ahmed",    ticket: "Dhaka to Khulna Train",       qty: 3, total: 2850,  status: "accepted" },
  { id: "b004", user: "Sadia Islam",     ticket: "Dhaka to Barisal Launch",     qty: 2, total: 1300,  status: "pending"  },
  { id: "b005", user: "Rakib Hasan",     ticket: "Dhaka to Rajshahi Express",   qty: 1, total: 800,   status: "rejected" },
];

const BOOKING_STATUS_STYLES = {
  pending:  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  accepted: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20",
  rejected: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20",
};

const STAT_CARDS = [
  {
    key: "totalTickets",
    label: "Total Tickets",
    icon: Ticket,
    accent: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    href: "/dashboard/vendor/my-tickets",
  },
  {
    key: "pendingTickets",
    label: "Pending Approval",
    icon: Clock,
    accent: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    href: "/dashboard/vendor/my-tickets",
  },
  {
    key: "rejectedTickets",
    label: "Rejected Tickets",
    icon: XCircle,
    accent: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    href: "/dashboard/vendor/my-tickets",
  },
  {
    key: "requestedBookings",
    label: "Requested Bookings",
    icon: ClipboardList,
    accent: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    href: "/dashboard/vendor/requested-bookings",
  },
];

export default function VendorOverview({ overview = DEMO_DATA, recentBookings = DEMO_RECENT_BOOKINGS }) {
  return (
    <div className="flex flex-col gap-8">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          Overview
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Your ticket performance and booking requests at a glance
        </p>
      </div>

      {/* ── Top revenue banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-orange-600 dark:bg-orange-600 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 justify-between">
        {/* Dot texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10">
          <p className="text-orange-100 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ৳{overview.totalRevenue?.toLocaleString() ?? "—"}
          </p>
          <p className="text-orange-200 text-sm mt-1.5 flex items-center gap-1.5">
            <TrendingUp size={14} />
            {overview.totalSold?.toLocaleString()} tickets sold total
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 sm:flex-col sm:items-end">
          <div className="bg-white/15 rounded-xl px-4 py-2.5 text-center">
            <p className="text-white font-extrabold text-xl leading-none">{overview.approvedTickets}</p>
            <p className="text-orange-100 text-xs mt-1">Active Tickets</p>
          </div>
          <CheckCircle2 size={32} className="text-orange-300 hidden sm:block" />
        </div>
      </div>

      {/* ── 4 Stat cards ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-3">
          Ticket Summary
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, accent, href }) => (
            <Link
              key={key}
              href={href}
              className="group bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 hover:border-orange-200 dark:hover:border-orange-500/30 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-colors no-underline"
            >
              <div className="flex items-center justify-between">
                <span className={["flex items-center justify-center w-9 h-9 rounded-xl shrink-0", accent].join(" ")}>
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                <ArrowRight
                  size={14}
                  className="text-stone-300 dark:text-stone-600 group-hover:text-orange-500 transition-colors"
                />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-none">
                  {overview[key]?.toLocaleString() ?? "—"}
                </p>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1.5">
                  {label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent requested bookings ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
            Recent Booking Requests
          </h2>
          <Link
            href="/dashboard/vendor/requested-bookings"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden">

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800/50">
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-5 py-3 whitespace-nowrap">User</th>
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-4 py-3 whitespace-nowrap">Ticket</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-4 py-3 whitespace-nowrap">Qty</th>
                  <th className="text-right font-semibold text-stone-500 dark:text-stone-400 px-4 py-3 whitespace-nowrap">Total</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-5 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-stone-100 dark:border-neutral-800 last:border-0 hover:bg-stone-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-stone-900 dark:text-stone-50 whitespace-nowrap">
                      {b.user}
                    </td>
                    <td className="px-4 py-3 text-stone-500 dark:text-stone-400 truncate max-w-[200px]">
                      {b.ticket}
                    </td>
                    <td className="px-4 py-3 text-center text-stone-700 dark:text-stone-300">
                      ×{b.qty}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">
                      ৳{b.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={["inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize border", BOOKING_STATUS_STYLES[b.status]].join(" ")}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-stone-100 dark:divide-neutral-800">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm">{b.user}</p>
                  <span className={["px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize border", BOOKING_STATUS_STYLES[b.status]].join(" ")}>
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">{b.ticket}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-400 dark:text-stone-500">Qty: <span className="font-medium text-stone-700 dark:text-stone-300">×{b.qty}</span></span>
                  <span className="font-bold text-stone-900 dark:text-stone-50">৳{b.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}