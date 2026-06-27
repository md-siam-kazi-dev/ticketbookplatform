"use client";

import { useEffect, useState, useMemo } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Loader2, BadgeCheck, XCircle, Clock, ShieldOff, BarChart3,
  Users, PackageOpen, ChevronUp, ChevronDown, Calendar, Wallet, TrendingUp, DollarSign, Ticket
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(raw) {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

const STATUS_STYLE = {
  pending:  { label: "Pending",  bg: "bg-amber-50 dark:bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400",  dot: "bg-amber-400"  },
  accepted: { label: "Accepted", bg: "bg-green-50 dark:bg-green-500/10",  text: "text-green-700 dark:text-green-400",  dot: "bg-green-400"  },
  rejected: { label: "Rejected", bg: "bg-red-50 dark:bg-red-500/10",      text: "text-red-600 dark:text-red-400",      dot: "bg-red-400"    },
  paid:      { label: "Paid",     bg: "bg-blue-50 dark:bg-blue-500/10",    text: "text-blue-700 dark:text-blue-400",    dot: "bg-blue-400"   },
  unpaid:   { label: "Unpaid",   bg: "bg-stone-100 dark:bg-neutral-800", text: "text-stone-600 dark:text-stone-400", dot: "bg-stone-400"  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

function PaymentBadge({ isPaid }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
      isPaid 
        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/30 dark:border-blue-500/20" 
        : "bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-neutral-700"
    }`}>
      {isPaid ? "Paid" : "Unpaid"}
    </span>
  );
}

// ── Revenue Timeline Chart Component ───────────────────────────────────────────
function RevenueChart({ bookings = [] }) {
  const [viewType, setViewType] = useState("daily");

  const chartData = useMemo(() => {
    const revenueMap = {};

    bookings.forEach((booking) => {
      if (!booking.isPaid || !booking.paymentDate) return;

      const dateObj = new Date(booking.paymentDate);
      
      const key = viewType === "daily"
        ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) 
        : dateObj.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }); 

      if (!revenueMap[key]) {
        revenueMap[key] = { name: key, revenue: 0, rawDate: dateObj.getTime() };
      }

      revenueMap[key].revenue += Number(booking.totalPrice) || 0;
    });

    return Object.values(revenueMap).sort((a, b) => a.rawDate - b.rawDate);
  }, [bookings, viewType]);

  const totals = useMemo(() => {
    return bookings.reduce((acc, curr) => {
      if (curr.isPaid) {
        acc.revenue += Number(curr.totalPrice) || 0;
        acc.tickets += Number(curr.quantity) || 0;
      }
      return acc;
    }, { revenue: 0, tickets: 0 });
  }, [bookings]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-3 rounded-xl shadow-lg text-xs">
          <p className="font-bold text-stone-400 dark:text-stone-500 mb-1">{label}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            ৳{payload[0].value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h3 className="text-md font-bold text-stone-900 dark:text-stone-50 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Earnings Timeline
          </h3>
          <p className="text-xs text-stone-400 dark:text-stone-500">Revenue generation tracked by payment finalization dates</p>
        </div>

        <div className="inline-flex rounded-lg bg-stone-100 dark:bg-neutral-800 p-0.5 border border-stone-200/40 dark:border-neutral-700/30">
          <button
            onClick={() => setViewType("daily")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewType === "daily" 
                ? "bg-white dark:bg-neutral-900 text-stone-900 dark:text-stone-50 shadow-sm" 
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            Date Wise
          </button>
          <button
            onClick={() => setViewType("monthly")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewType === "monthly" 
                ? "bg-white dark:bg-neutral-900 text-stone-900 dark:text-stone-50 shadow-sm" 
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            Month Wise
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <DollarSign size={14} /> Total Revenue
          </div>
          <p className="text-lg font-extrabold text-stone-900 dark:text-stone-50 mt-0.5">
            ৳{totals.revenue.toLocaleString()}
          </p>
        </div>
        <div className="p-3 bg-stone-50 dark:bg-neutral-800/40 border border-stone-200/60 dark:border-neutral-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
            <Ticket size={14} /> Tickets Sold
          </div>
          <p className="text-lg font-extrabold text-stone-900 dark:text-stone-50 mt-0.5">
            {totals.tickets} units
          </p>
        </div>
      </div>

      <div className="h-60 w-full text-xs pt-2">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-stone-400 italic">
            No settled transaction history available to plot.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" className="dark:stroke-neutral-800" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#a8a29e" dy={8} />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                stroke="#a8a29e" 
                tickFormatter={(val) => `৳${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#revenueGrad)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── Ticket Wise Revenue Chart Component (Converted to Vertical Orientation) ───
function TicketRevenueChart({ bookings = [] }) {
  const ticketData = useMemo(() => {
    const map = {};

    bookings.forEach((booking) => {
      if (!booking.isPaid) return;
      const title = booking.title || "Unknown Route";

      if (!map[title]) {
        map[title] = { name: title, revenue: 0, quantities: 0 };
      }
      map[title].revenue += Number(booking.totalPrice) || 0;
      map[title].quantities += Number(booking.quantity) || 0;
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [bookings]);

  const CustomTicketTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold text-stone-900 dark:text-stone-50 max-w-xs">{data.name}</p>
          <p className="text-blue-600 dark:text-blue-400 font-bold">
            Revenue: ৳{data.revenue.toLocaleString()}
          </p>
          <p className="text-stone-400 dark:text-stone-500 font-medium">
            Volume Sold: {data.quantities} units
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="space-y-0.5">
        <h3 className="text-md font-bold text-stone-900 dark:text-stone-50 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-500" /> Route wise Breakdown
        </h3>
        <p className="text-xs text-stone-400 dark:text-stone-500">Gross profit breakdown structured by specific ticket configurations</p>
      </div>

      <div className="h-64 w-full text-xs">
        {ticketData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-stone-400 italic">
            No itemized purchases processed to break down distributions.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {/* Reset layout directions to match standard vertical data presentation layout rules */}
            <BarChart data={ticketData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" className="dark:stroke-neutral-800" />
              <XAxis 
                dataKey="name"
                tickLine={false} 
                axisLine={false} 
                stroke="#a8a29e" 
                tickFormatter={(val) => val.length > 16 ? `${val.substring(0, 14)}...` : val}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                stroke="#a8a29e" 
                tickFormatter={(val) => `৳${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
              />
              <Tooltip content={<CustomTicketTooltip />} />
              <Bar 
                dataKey="revenue" 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]} 
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RequestedBookings() {
  const { data: session, isPending: sessionPending } = useSession();
  
  const [user, setUser] = useState(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [currentAction, setCurrentAction] = useState({ id: null, type: null }); 
  const [sortField, setSortField] = useState("departureDateTime");
  const [sortDir, setSortDir] = useState("asc");
  const router = useRouter();

  useEffect(() => {
    const fetchFreshUser = async () => {
      if (!session?.user?.email) return;

      try {
        setIsFetchingUser(true);
        const tokenResponse = await authClient.token();
        const tokenData = tokenResponse?.data;

        if (!tokenData?.token) throw new Error("No active authorization token found");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/getuser/${session.user.email}`,
          { headers: { 'Authorization': `Bearer ${tokenData.token}` } }
        );
        
        if (!res.ok) throw new Error("Could not extract active profile logs");
        
        const json = await res.json();
        const userProfile = Array.isArray(json) ? json[0] : json;
        setUser(userProfile);
      } catch (err) {
        toast.error(err.message || "Failed to sync profile restriction status");
      } finally {
        setIsFetchingUser(false);
      }
    };

    if (!sessionPending) {
      fetchFreshUser();
    }
  }, [session, sessionPending]);

  useEffect(() => {
    if (isFetchingUser || !user || user?.isBlock) {
      if (!isFetchingUser && !user) setLoading(false);
      return;
    }

    const loadBookings = async () => {
      setLoading(true);
      try {
        const { data: tokenData } = await authClient.token();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/vendor/rev/${user.email}`, {
            headers: { 'Authorization': `Bearer ${tokenData.token}` },
            cache: 'no-store'
          }
        );
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setBookings([]);
        toast.error("Failed to load request manifest ledger");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user, isFetchingUser]);

  const handleAction = async (bookingId, ticketId, action) => {
    setCurrentAction({ id: bookingId, type: action });
    try {
      const { data: tokenData } = await authClient.token();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/reqbookings/${ticketId}`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json", 
            'Authorization': `Bearer ${tokenData.token}`
          },
          body: JSON.stringify({ status: action === "accept" ? "accepted" : "rejected", _id: bookingId }),
        }
      );
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? { ...b, status: action === "accept" ? "accepted" : "rejected" }
              : b
          )
        );
        toast.success(`Booking request successfully ${action === "accept" ? "accepted" : "rejected"}`);
      } else {
        throw new Error("Target transaction update failed");
      }
    } catch (err) {
      toast.error("Action updates failed");
    } finally {
      setCurrentAction({ id: null, type: null });
      router.refresh();
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-stone-300 dark:text-stone-600" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-orange-500" />
      : <ChevronDown size={12} className="text-orange-500" />;
  };

  const TABS = ["all", "pending", "accepted", "rejected", "paid", "unpaid"];

  const counts = TABS.reduce((acc, t) => {
    if (t === "all") acc[t] = bookings.length;
    else if (t === "paid") acc[t] = bookings.filter((b) => b.isPaid === true).length;
    else if (t === "unpaid") acc[t] = bookings.filter((b) => b.isPaid === false).length;
    else acc[t] = bookings.filter((b) => b.status === t).length;
    return acc;
  }, {});

  const displayed = bookings
    .filter((b) => {
      if (filter === "all") return true;
      if (filter === "paid") return b.isPaid === true;
      if (filter === "unpaid") return b.isPaid === false;
      return b.status === filter;
    })
    .slice()
    .sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === "departureDateTime" || sortField === "totalPrice") {
        va = sortField === "totalPrice" ? Number(va) : new Date(va);
        vb = sortField === "totalPrice" ? Number(vb) : new Date(vb);
      } else {
        va = String(va ?? "").toLowerCase();
        vb = String(vb ?? "").toLowerCase();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    });

  const isGlobalLoading = sessionPending || isFetchingUser || loading;

  if (!sessionPending && !isFetchingUser && user?.isBlock) {
    return (
      <div className="w-full mx-auto p-2 max-w-full box-border">
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-stone-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 py-16 px-6 gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
            <ShieldOff className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">Account Restricted</h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Your account has been flagged for fraudulent activity. Access to real-time seat processing registers has been frozen. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      {/* Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-50">
            Revenue Dashboard
          </h2>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
            {isGlobalLoading ? "Loading financial records..." : `${bookings.length} transactions fetched`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <SummaryPill icon={Clock}      label="Pending"  count={isGlobalLoading ? "—" : counts.pending}  color="text-amber-500" />
          <SummaryPill icon={BadgeCheck} label="Accepted" count={isGlobalLoading ? "—" : counts.accepted} color="text-green-500" />
          <SummaryPill icon={XCircle}    label="Rejected" count={isGlobalLoading ? "—" : counts.rejected} color="text-red-500"   />
        </div>
      </div>

      {/* Fixed: Configured layouts to stack cleanly line by line on a single column list track */}
      {!isGlobalLoading && (
        <div className="grid grid-cols-1 gap-6">
          <RevenueChart bookings={bookings} />
          <TicketRevenueChart bookings={bookings} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 flex-wrap border-b border-stone-100 dark:border-neutral-800 xl:border-0">
        {TABS.map((tab) => {
          const active = filter === tab;
          const s = STATUS_STYLE[tab];
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              disabled={isGlobalLoading}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0 disabled:opacity-60",
                active
                  ? "bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 border-transparent"
                  : "bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-700 text-stone-600 dark:text-stone-300 hover:border-stone-300",
              ].join(" ")}
            >
              {s && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
              <span className="capitalize">{tab}</span>
              {!isGlobalLoading && counts[tab] > 0 && (
                <span className={[
                  "text-xs px-1.5 py-0.5 rounded-full",
                  active
                    ? "bg-stone-700 dark:bg-stone-300 text-stone-100 dark:text-stone-800"
                    : "bg-stone-100 dark:bg-neutral-800 text-stone-500",
                ].join(" ")}>
                  {counts[tab]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contents Container */}
      {isGlobalLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="hidden xl:block bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">Ticket</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">Departure</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-neutral-800">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : displayed.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center py-16 gap-3 text-center px-6 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-stone-100 dark:bg-neutral-800 flex items-center justify-center">
            <PackageOpen size={20} className="text-stone-400" />
          </div>
          <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm">
            {filter === "all" ? "No records discovered" : `No records tagged as ${filter}`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 📱 MOBILE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {displayed.map((booking) => {
              const isPendingStatus = booking.status === "pending";
              return (
                <div key={booking._id} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {booking?.userImg ? (
                          <img src={booking.userImg} className="h-9 w-9 rounded-full object-cover shrink-0" alt="" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {(booking.name || booking.email || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-semibold text-stone-900 dark:text-stone-50 truncate text-sm">{booking.name || "—"}</h4>
                          <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{booking.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-neutral-800/40 rounded-xl space-y-2 text-xs text-stone-600 dark:text-stone-300">
                      <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-50 pb-1.5 border-b border-stone-200/60 dark:border-neutral-800 min-w-0">
                        <img src={booking.image} className="w-5 h-5 rounded object-cover shrink-0" alt="" onError={(e) => { e.target.style.display = "none"; }} />
                        <span className="block truncate text-sm flex-1" title={booking.title}>{booking.title}</span>
                      </div>
                      <div className="flex justify-between"><span className="text-stone-400">Departure</span><span>{formatDate(booking.departureDateTime)}</span></div>
                      {booking.paymentDate && (
                        <div className="flex justify-between"><span className="text-stone-400">Payment Date</span><span>{formatDate(booking.paymentDate)}</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-stone-400">Seats Ordered</span><span>{booking.quantity}x</span></div>
                      <div className="flex justify-between pt-1.5 border-t border-stone-200/60 dark:border-neutral-800 font-bold">
                        <span className="text-stone-400">Total</span>
                        <span className="text-stone-900 dark:text-stone-50">৳{booking.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isPendingStatus ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleAction(booking._id, booking.ticketId, "accept")} className="h-8 rounded-lg bg-green-600 text-white text-xs font-semibold">Accept</button>
                        <button onClick={() => handleAction(booking._id, booking.ticketId, "reject")} className="h-8 rounded-lg bg-red-50 text-red-600 text-xs font-semibold border border-red-200">Reject</button>
                      </div>
                    ) : (
                      <div className="text-center py-1 text-xs font-semibold text-stone-400 bg-stone-50 dark:bg-neutral-800/20 rounded-lg uppercase tracking-wider">{booking.status}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 💻 DESKTOP TABLE */}
          <div className="hidden xl:block bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800/50">
                    {[
                      { label: "Customer",    field: "name"              },
                      { label: "Ticket",      field: "title"             },
                      { label: "Departure",   field: "departureDateTime" },
                      { label: "Qty",         field: "quantity"          },
                      { label: "Total",       field: "totalPrice"        },
                      { label: "Status Logs", field: null                },
                      { label: "Actions",     field: null                },
                    ].map(({ label, field }) => (
                      <th key={label} onClick={() => field && toggleSort(field)} className={["px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide select-none", field ? "cursor-pointer" : ""].join(" ")}>
                        <span className="inline-flex items-center gap-1">{label}{field && <SortIcon field={field} />}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-neutral-800">
                  {displayed.map((booking) => {
                    const isPendingStatus = booking.status === "pending";
                    return (
                      <tr key={booking._id} className="hover:bg-stone-50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">
                              {(booking.name || "?")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-stone-900 dark:text-stone-50 truncate max-w-[140px]">{booking.name || "—"}</p>
                              <p className="text-xs text-stone-400 truncate max-w-[140px]">{booking.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-stone-900 dark:text-stone-50 truncate max-w-[200px]" title={booking.title}>
                            {booking.title}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{formatDate(booking.departureDateTime)}</td>
                        <td className="px-4 py-3 text-stone-700 dark:text-stone-300">{booking.quantity}</td>
                        <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-50">৳{booking.totalPrice?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-4 py-3">
                          {isPendingStatus ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleAction(booking._id, booking.ticketId, "accept")} className="w-20 h-7 rounded bg-green-600 text-white text-xs font-semibold">Accept</button>
                              <button onClick={() => handleAction(booking._id, booking.ticketId, "reject")} className="w-20 h-7 rounded bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">Reject</button>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 italic uppercase font-medium">{booking.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Subcomponents ──────────────────────────────────────────────────────
function SummaryPill({ icon: Icon, label, count, color }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 shadow-sm">
      <Icon size={13} className={color} />
      {count} {label}
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4 space-y-4 animate-pulse">
      <div className="h-4 bg-stone-100 dark:bg-neutral-800 rounded w-1/3" />
      <div className="h-20 bg-stone-50 dark:bg-neutral-800/30 rounded-xl" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4"><div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded w-20" /></td>
      <td className="px-4 py-4"><div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded w-24" /></td>
      <td className="px-4 py-4"><div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded w-16" /></td>
      <td className="px-4 py-4"><div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded w-6" /></td>
      <td className="px-4 py-4"><div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded w-12" /></td>
      <td className="px-4 py-4"><div className="h-5 bg-stone-100 dark:bg-neutral-800 rounded-full w-14" /></td>
      <td className="px-4 py-4"><div className="h-7 bg-stone-100 dark:bg-neutral-800 rounded w-16" /></td>
    </tr>
  );
}