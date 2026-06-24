"use client";

import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Ticket, Clock, Users, BadgeCheck,
  XCircle, Loader2, CreditCard, CalendarDays,
  AlertCircle, PackageOpen,
} from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, "0"); }

function formatDate(raw) {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(raw) {
  if (!raw) return "—";
  return new Date(raw).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS = {
  all:      { label: "All",      dot: "bg-stone-400" },
  pending:  { label: "Pending",  dot: "bg-amber-400",  text: "text-amber-600 dark:text-amber-400",  ring: "ring-amber-200 dark:ring-amber-500/30",  bg: "bg-amber-50 dark:bg-amber-500/10"  },
  accepted: { label: "Accepted", dot: "bg-green-400",  text: "text-green-700 dark:text-green-400",  ring: "ring-green-200 dark:ring-green-500/30",  bg: "bg-green-50 dark:bg-green-500/10"  },
  rejected: { label: "Rejected", dot: "bg-red-400",    text: "text-red-600 dark:text-red-400",      ring: "ring-red-200 dark:ring-red-500/30",      bg: "bg-red-50 dark:bg-red-500/10"      },
  paid:     { label: "Paid",     dot: "bg-blue-400",   text: "text-blue-700 dark:text-blue-400",    ring: "ring-blue-200 dark:ring-blue-500/30",    bg: "bg-blue-50 dark:bg-blue-500/10"    },
};

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(departureDateTime) {
  const [state, setState] = useState({ expired: false, timeLeft: null });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(departureDateTime) - new Date();
      if (diff <= 0) { setState({ expired: true, timeLeft: null }); return; }
      setState({
        expired: false,
        timeLeft: {
          days:  Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          mins:  Math.floor((diff % 3600000)  / 60000),
          secs:  Math.floor((diff % 60000)    / 1000),
        },
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [departureDateTime]);
  return state;
}

// ── Countdown display ─────────────────────────────────────────────────────────
function Countdown({ departureDateTime, rejected }) {
  const { expired, timeLeft } = useCountdown(departureDateTime);

  if (rejected) {
    return (
      <div className="flex items-center gap-1.5 text-red-400 dark:text-red-500 text-xs font-medium whitespace-nowrap truncate">
        <XCircle size={12} className="shrink-0" /> Booking rejected
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-xs font-medium whitespace-nowrap truncate">
        <XCircle size={12} className="shrink-0" /> Departed
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1 text-xs flex-wrap min-w-0">
      <Clock size={11} className="text-stone-400 dark:text-stone-500 shrink-0" />
      <span className="text-stone-500 dark:text-stone-400 mr-1 whitespace-nowrap">Departs in</span>
      <div className="inline-flex gap-1 items-center font-mono font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
        {[
          [timeLeft.days,  "d"],
          [timeLeft.hours, "h"],
          [timeLeft.mins,  "m"],
          [timeLeft.secs,  "s"],
        ].map(([val, unit]) => (
          <span key={unit}>
            {pad(val)}<span className="font-normal text-stone-400 dark:text-stone-500">{unit}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Booking Card ──────────────────────────────────────────────────────────────
function BookingCard({ booking, onPayNow, isPaying }) {
  const s = STATUS[booking.status] ?? STATUS.pending;
  const isExpired = new Date(booking.departureDateTime) < new Date();

  return (
    <div className="h-full bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-md hover:border-stone-300 dark:hover:border-neutral-700 transition-all duration-200 group min-w-0 w-full mx-auto">

      {/* Image Container */}
      <div className="relative h-40 shrink-0 bg-stone-100 dark:bg-neutral-800 overflow-hidden w-full">
        <img
          src={booking.image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Status badge */}
        <span className={[
          "absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 whitespace-nowrap",
          s.bg, s.text, s.ring,
        ].join(" ")}>
          <span className={["w-1.5 h-1.5 rounded-full shrink-0", s.dot].join(" ")} />
          {s.label}
        </span>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3 min-w-0">
          <p className="text-white font-bold text-lg drop-shadow leading-tight truncate">
            ৳{booking.totalPrice?.toLocaleString()}
          </p>
          <p className="text-white/70 text-[11px] truncate">
            {booking.quantity} × ৳{booking.price?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-4 gap-3 min-w-0 w-full box-border">
        {/* Title */}
        <h3 className="font-bold text-stone-900 dark:text-stone-50 text-sm leading-tight line-clamp-1 min-w-0">
          {booking.title}
        </h3>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-xs text-stone-500 dark:text-stone-400 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Users size={12} className="shrink-0 text-orange-500" />
            <span className="truncate">{booking.quantity} seat{booking.quantity !== 1 ? "s" : ""} booked</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <CalendarDays size={12} className="shrink-0 text-orange-500" />
            <span className="truncate">{formatDate(booking.departureDateTime)} · {formatTime(booking.departureDateTime)}</span>
          </div>
        </div>

        {/* Countdown Area */}
        <div className="bg-stone-50 dark:bg-neutral-800/40 rounded-xl px-3 py-2 min-h-[36px] flex items-center min-w-0 overflow-hidden">
          <Countdown
            departureDateTime={booking.departureDateTime}
            rejected={booking.status === "rejected"}
          />
        </div>

        {/* Actions Slot pinned down */}
        <div className="mt-auto pt-1 w-full min-w-0">
          {booking.status === "accepted" && !isExpired ? (
            <button
              onClick={() => onPayNow(booking)}
              disabled={isPaying}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-orange-50 text-sm font-semibold transition-colors whitespace-nowrap overflow-hidden"
            >
              {isPaying ? <Loader2 size={14} className="animate-spin shrink-0" /> : <CreditCard size={14} className="shrink-0" />}
              <span className="truncate">{isPaying ? "Redirecting…" : `Pay ৳${booking.totalPrice?.toLocaleString()}`}</span>
            </button>
          ) : booking.status === "accepted" && isExpired ? (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-100 dark:bg-neutral-800 text-stone-400 dark:text-stone-500 text-sm font-medium border border-stone-200 dark:border-neutral-700 whitespace-nowrap overflow-hidden px-2">
              <XCircle size={14} className="shrink-0" />
              <span className="truncate">Payment window closed</span>
            </div>
          ) : booking.status === "paid" ? (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold ring-1 ring-blue-200 dark:ring-blue-500/30 whitespace-nowrap overflow-hidden px-2">
              <BadgeCheck size={14} className="shrink-0" />
              <span className="truncate">Payment complete</span>
            </div>
          ) : booking.status === "rejected" ? (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-sm font-medium ring-1 ring-red-200 dark:ring-red-500/30 whitespace-nowrap overflow-hidden px-2">
              <AlertCircle size={13} className="shrink-0" />
              <span className="truncate">Booking was rejected</span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium ring-1 ring-amber-200 dark:ring-amber-500/30 whitespace-nowrap overflow-hidden px-2">
              <Clock size={13} className="shrink-0" />
              <span className="truncate">Awaiting vendor response</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden animate-pulse w-full">
      <div className="h-40 bg-stone-100 dark:bg-neutral-800 w-full" />
      <div className="p-4 flex flex-col gap-3 w-full box-border">
        <div className="h-4 bg-stone-100 dark:bg-neutral-800 rounded-lg w-3/4" />
        <div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded-lg w-1/2" />
        <div className="h-3 bg-stone-100 dark:bg-neutral-800 rounded-lg w-2/3" />
        <div className="h-9 bg-stone-100 dark:bg-neutral-800 rounded-xl mt-2 w-full" />
        <div className="h-9 bg-stone-100 dark:bg-neutral-800 rounded-xl w-full" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = ["all", "pending", "accepted", "rejected", "paid"];

export default function MyBookedTickets() {
  const { data: session, isPending: sessionPending } = useSession();
  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState("all");
  const [payingId,      setPayingId]      = useState(null);

  useEffect(() => {
    if (sessionPending || !session?.user?.email) return;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const { data: tokenData } = await authClient.token();
        const res  = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/bookings/${session.user.email}`,
          { headers: { Authorization: `Bearer ${tokenData.token}` } }
        );
        const data = await res.json();
        setBookings(data || []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [session, sessionPending]);

  const handlePayNow = async (booking) => {
    setPayingId(booking._id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/payments/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId:  booking._id,
          totalPrice: booking.totalPrice,
          title:      booking.title,
          email:      session.user.email,
        }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Payment initiation failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === "all" ? bookings.length : bookings.filter((b) => b.status === t).length;
    return acc;
  }, {});

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  if (sessionPending) {
    return (
      <div className="min-h-screen flex items-center justify-center w-full">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 transition-colors w-full max-w-full box-border overflow-hidden">
      <div className="mx-auto w-full max-w-full">

        {/* Header Section */}
        <div className="mb-8 px-1 min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 truncate">
            My Booked Tickets
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 truncate">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Horizontal Navigation tabs area */}
        <div className="flex flex-wrap items-center gap-2  pb-3 mb-6  w-full max-w-full box-border">
          {TABS.map((tab) => {
            const active = filter === tab;
            const s = STATUS[tab];
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={[
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border shrink-0 whitespace-nowrap shadow-sm",
                  active
                    ? "bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 border-transparent"
                    : "bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-700 text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-neutral-600",
                ].join(" ")}
              >
                {s?.dot && <span className={["w-1.5 h-1.5 rounded-full shrink-0", s.dot].join(" ")} />}
                <span className="capitalize">{tab}</span>
                {counts[tab] > 0 && (
                  <span className={[
                    "text-xs px-1.5 py-0.5 rounded-full shrink-0 font-semibold",
                    active
                      ? "bg-stone-700 dark:bg-stone-300 text-stone-100 dark:text-stone-800"
                      : "bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-stone-400",
                  ].join(" ")}>
                    {counts[tab]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Interface Output Logic */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-full box-border">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center w-full max-w-full box-border px-4">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 flex items-center justify-center shadow-sm">
              <PackageOpen size={26} className="text-stone-400 dark:text-stone-500" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-50 truncate">
                {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs mt-1">
                {filter === "all"
                  ? "Tickets you book will appear here."
                  : `You have no bookings with "${filter}" status.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch w-full max-w-full box-border">
            {filtered.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onPayNow={handlePayNow}
                isPaying={payingId === booking._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}