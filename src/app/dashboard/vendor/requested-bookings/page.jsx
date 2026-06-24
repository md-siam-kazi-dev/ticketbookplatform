"use client";

import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Loader2, BadgeCheck, XCircle, Clock, ShieldOff,
  Users, PackageOpen, ChevronUp, ChevronDown, Calendar, Wallet
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
  paid:     { label: "Paid",     bg: "bg-blue-50 dark:bg-blue-500/10",    text: "text-blue-700 dark:text-blue-400",    dot: "bg-blue-400"   },
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function RequestedBookings() {
  const { data: session, isPending: sessionPending } = useSession();
  
  const [user, setUser] = useState(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  // Track BOTH the booking ID and the specific action type being executed
  const [currentAction, setCurrentAction] = useState({ id: null, type: null }); 
  
  const [sortField, setSortField] = useState("departureDateTime");
  const [sortDir, setSortDir] = useState("asc");
  const router = useRouter();

  // ── 1. Fetch Fresh Profile Logs to Avoid Session Cache Stale Data ──────────
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

  // ── 2. Fetch Booking Records After Identity Confirmed ──────────────────────
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
          `${process.env.NEXT_PUBLIC_API}/api/bookings/vendor/${user.email}`, {
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

  // ── Accept / Reject Handler ────────────────────────────────────────────────
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

  // ── Sorting ─────────────────────────────────────────────────────────────────
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

  // ── Filters ─────────────────────────────────────────────────────────────────
  const TABS = ["all", "pending", "accepted", "rejected", "paid"];

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? bookings.length : bookings.filter((b) => b.status === t).length;
    return acc;
  }, {});

  const displayed = (filter === "all" ? bookings : bookings.filter((b) => b.status === filter))
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

  if (sessionPending || isFetchingUser) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={22} className="animate-spin text-stone-400" />
      </div>
    );
  }

  // Account enforcement restricted shield
  if (user?.isBlock) {
    return (
      <div className="w-full mx-auto p-2 max-w-full box-border">
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-stone-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 py-16 px-6 gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
            <ShieldOff className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0">
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
    <div className="space-y-5 px-2 ">

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-50">
            Requested Bookings
          </h2>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
            {bookings.length} total request{bookings.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <SummaryPill icon={Clock}      label="Pending"  count={counts.pending}  color="text-amber-500" />
          <SummaryPill icon={BadgeCheck} label="Accepted" count={counts.accepted} color="text-green-500" />
          <SummaryPill icon={XCircle}    label="Rejected" count={counts.rejected} color="text-red-500"   />
        </div>
      </div>

      {/* Filter Tabs Container */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 flex-nowrap md:flex-wrap border-b border-stone-100 dark:border-neutral-800 xl:border-0">
        {TABS.map((tab) => {
          const active = filter === tab;
          const s = STATUS_STYLE[tab];
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0",
                active
                  ? "bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 border-transparent"
                  : "bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-700 text-stone-600 dark:text-stone-300 hover:border-stone-300",
              ].join(" ")}
            >
              {s && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
              <span className="capitalize">{tab}</span>
              {counts[tab] > 0 && (
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

      {/* Core Component Canvas Windows */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center py-20 gap-3 text-center px-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-neutral-800 flex items-center justify-center">
            <PackageOpen size={22} className="text-stone-400" />
          </div>
          <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm">
            {filter === "all" ? "No booking requests yet" : `No ${filter} requests`}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Booking requests from users will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* 📱 EARLY CARD GRID VIEW (Mobile/Tablet Viewports) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {displayed.map((booking) => {
              const isPendingStatus = booking.status === "pending";
              const isAcceptLoading = currentAction.id === booking._id && currentAction.type === "accept";
              const isRejectLoading = currentAction.id === booking._id && currentAction.type === "reject";
              const isAnyRowBusy   = currentAction.id !== null;

              return (
                <div 
                  key={booking._id} 
                  className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {booking?.userImg ? (
                          <img src={booking.userImg} className="h-9 w-9 rounded-full object-cover shrink-0 border border-stone-100 dark:border-neutral-800" alt="" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {(booking.name || booking.email || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-semibold text-stone-900 dark:text-stone-50 truncate text-sm">
                            {booking.name || "—"}
                          </h4>
                          <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
                            {booking.email}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="p-3 bg-stone-50 dark:bg-neutral-800/40 rounded-xl space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
                      <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-50 pb-2 border-b border-stone-200/60 dark:border-neutral-800">
                        <img src={booking.image} className="w-6 h-6 rounded object-cover shrink-0" alt="" onError={(e) => { e.target.style.display = "none"; }} />
                        <span className="truncate">{booking.title}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center gap-1.5 text-stone-400"><Calendar size={13} /> Departure</span>
                        <span className="font-medium text-stone-800 dark:text-stone-200">{formatDate(booking.departureDateTime)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center gap-1.5 text-stone-400"><Users size={13} /> Requested Seats</span>
                        <span className="font-medium text-stone-800 dark:text-stone-200">{booking.quantity}x</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-200/60 dark:border-neutral-800">
                        <span className="inline-flex items-center gap-1.5 text-stone-400 font-medium"><Wallet size={13} /> Total Amount</span>
                        <div className="text-right">
                          <span className="font-bold text-sm text-stone-900 dark:text-stone-50">৳{booking.totalPrice?.toLocaleString()}</span>
                          <p className="text-[10px] text-stone-400">{booking.quantity} × ৳{booking.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    {isPendingStatus ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleAction(booking._id, booking.ticketId, "accept")}
                          disabled={isAnyRowBusy}
                          className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors shadow-sm"
                        >
                          {isAcceptLoading ? <Loader2 size={13} className="animate-spin" /> : <><BadgeCheck size={14} /> Accept</>}
                        </button>
                        <button
                          onClick={() => handleAction(booking._id, booking.ticketId, "reject")}
                          disabled={isAnyRowBusy}
                          className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-500/30 transition-colors"
                        >
                          {isRejectLoading ? <Loader2 size={13} className="animate-spin" /> : <><XCircle size={14} /> Reject</>}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-1.5 text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider bg-stone-50 dark:bg-neutral-800/20 rounded-lg">
                        {booking.status}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 💻 DESKTOP COMPACT DATA TABLE VIEW (Desktop Viewports) */}
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
                      { label: "Status",      field: null                },
                      { label: "Actions",     field: null                },
                    ].map(({ label, field }) => (
                      <th
                        key={label}
                        onClick={() => field && toggleSort(field)}
                        className={[
                          "px-4 py-3 text-left text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide whitespace-nowrap select-none",
                          field ? "cursor-pointer hover:text-stone-700 dark:hover:text-stone-200" : "",
                        ].join(" ")}
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {field && <SortIcon field={field} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-neutral-800">
                  {displayed.map((booking) => {
                    const isPendingStatus = booking.status === "pending";
                    const isAcceptLoading = currentAction.id === booking._id && currentAction.type === "accept";
                    const isRejectLoading = currentAction.id === booking._id && currentAction.type === "reject";
                    const isAnyRowBusy   = currentAction.id !== null;

                    return (
                      <tr key={booking._id} className="hover:bg-stone-50 dark:hover:bg-neutral-800/40 transition-colors">
                        {/* Customer */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {booking?.userImg ? (
                              <img src={`${booking?.userImg}`} className="h-8 w-8 rounded-full object-cover" alt="" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                                {(booking.name || booking.email || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-stone-900 dark:text-stone-50 truncate max-w-[140px]">
                                {booking.name || "—"}
                              </p>
                              <p className="text-xs text-stone-400 dark:text-stone-500 truncate max-w-[140px]">
                                {booking.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Ticket Title */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={booking.image}
                              alt={booking.title}
                              className="w-8 h-8 rounded-lg object-cover shrink-0 bg-stone-100 dark:bg-neutral-800"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                            <span className="font-medium text-stone-900 dark:text-stone-50 truncate max-w-[160px]">
                              {booking.title}
                            </span>
                          </div>
                        </td>

                        {/* Departure */}
                        <td className="px-4 py-3.5 text-stone-600 dark:text-stone-300 whitespace-nowrap">
                          {formatDate(booking.departureDateTime)}
                        </td>

                        {/* Qty */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 text-stone-700 dark:text-stone-300">
                            <Users size={13} className="text-stone-400" />
                            {booking.quantity}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3.5 font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">
                          ৳{booking.totalPrice?.toLocaleString()}
                          <p className="text-[11px] font-normal text-stone-400">
                            {booking.quantity} × ৳{booking.price?.toLocaleString()}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={booking.status} />
                        </td>

                        {/* Actions Control */}
                        <td className="px-4 py-3.5">
                          {isPendingStatus ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAction(booking._id, booking.ticketId, "accept")}
                                disabled={isAnyRowBusy}
                                className="w-24 h-8 inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                              >
                                {isAcceptLoading ? <Loader2 size={12} className="animate-spin" /> : <><BadgeCheck size={13} /> Accept</>}
                              </button>
                              <button
                                onClick={() => handleAction(booking._id, booking.ticketId, "reject")}
                                disabled={isAnyRowBusy}
                                className="w-24 h-8 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-500/30 transition-colors"
                              >
                                {isRejectLoading ? <Loader2 size={12} className="animate-spin" /> : <><XCircle size={13} /> Reject</>}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 dark:text-stone-500 italic uppercase tracking-wider font-medium">
                              {booking.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Metric Count Footer Summary Bar */}
          <div className="px-4 py-3 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl text-xs text-stone-400 dark:text-stone-500 shadow-sm">
            Showing {displayed.length} of {bookings.length} request{bookings.length !== 1 ? "s" : ""}
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

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl p-4 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-neutral-800" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded w-1/3" />
          <div className="h-2 bg-stone-100 dark:bg-neutral-800 rounded w-1/2" />
        </div>
      </div>
      <div className="h-20 bg-stone-50 dark:bg-neutral-800/30 rounded-xl" />
    </div>
  );
}