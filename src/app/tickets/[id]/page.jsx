"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Bus, TrainFront, Ship, Plane, Waves,
  MapPin, Clock, Tag, Users, ChevronLeft,
  Ticket, Calendar, BadgeCheck, XCircle, Loader2, X,
} from "lucide-react";

const TRANSPORT_META = {
  bus:    { icon: Bus,        label: "Bus",    color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" },
  train:  { icon: TrainFront, label: "Train",  color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
  launch: { icon: Ship,       label: "Launch", color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400" },
  plane:  { icon: Plane,      label: "Plane",  color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" },
  ferry:  { icon: Ship,       label: "Ferry",  color: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" },
};

const STATUS_META = {
  approved: { label: "Approved", icon: BadgeCheck, style: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20" },
  pending:  { label: "Pending",  icon: Clock,      style: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" },
  rejected: { label: "Rejected", icon: XCircle,    style: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20" },
};

function formatDateTime(raw) {
  if (!raw) return { date: "—", time: "—" };
  const d = new Date(raw);
  return {
    date: d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// ── Countdown component ───────────────────────────────────────────────────────
function Countdown({ departureDateTime }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(departureDateTime) - new Date();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000) / 60000),
        secs:  Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [departureDateTime]);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3 flex items-center gap-2">
        <Clock size={14} className="text-orange-500" />
        Departure countdown
      </h3>

      {expired ? (
        <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm font-medium">
          <XCircle size={15} />
          Departure time has passed
        </div>
      ) : timeLeft ? (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ["Days",  timeLeft.days],
            ["Hours", timeLeft.hours],
            ["Mins",  timeLeft.mins],
            ["Secs",  timeLeft.secs],
          ].map(([unit, val]) => (
            <div key={unit} className="bg-stone-50 dark:bg-neutral-800 rounded-xl py-2.5">
              <p className="text-xl font-bold text-stone-900 dark:text-stone-50 tabular-nums">
                {pad(val)}
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 uppercase tracking-wide">
                {unit}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center py-2">
          <Loader2 size={16} className="animate-spin text-stone-400" />
        </div>
      )}
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ ticket, session, onClose }) {
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const maxQty = ticket.quantity;
  const totalPrice = ticket.price * qty;

  const decrease = () => {
    setError("");
    setQty((q) => Math.max(1, q - 1));
  };

  const increase = () => {
    if (qty >= maxQty) {
      setError(`Only ${maxQty} seat${maxQty !== 1 ? "s" : ""} available`);
      return;
    }
    setError("");
    setQty((q) => q + 1);
  };

  const handleSubmit = async () => {
    if (qty > maxQty) {
      setError(`Only ${maxQty} seat${maxQty !== 1 ? "s" : ""} available`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId:   ticket._id,
          userId:     session.user.id,
          quantity:   qty,
          totalPrice,
          status:     "pending",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Booking failed. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
            {success ? "Booking confirmed!" : "Confirm your booking"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <BadgeCheck size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-stone-700 dark:text-stone-300 text-sm mb-1">
              Your booking for{" "}
              <span className="font-semibold text-stone-900 dark:text-stone-50">
                {qty} seat{qty !== 1 ? "s" : ""}
              </span>{" "}
              has been submitted.
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-xs mb-6">
              Status: <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span> — check "My Booked Tickets" for updates.
            </p>
            <button
              onClick={onClose}
              className="w-full h-11 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 rounded-xl font-semibold text-sm transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Ticket summary */}
            <div className="bg-stone-50 dark:bg-neutral-800 rounded-xl p-4 mb-5 text-sm space-y-1.5">
              {[
                ["Route",        `${ticket.from} → ${ticket.to}`],
                ["Transport",    ticket.transportType],
                ["Departure",    formatDateTime(ticket.departureDateTime).date + " · " + formatDateTime(ticket.departureDateTime).time],
                ["Price / seat", `৳${ticket.price?.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-stone-400 dark:text-stone-500">{label}</span>
                  <span className="font-medium text-stone-900 dark:text-stone-50 capitalize">{value}</span>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                Number of seats
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={decrease}
                  className="w-10 h-10 rounded-xl border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors text-lg font-bold"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="flex-1 text-center text-xl font-bold text-stone-900 dark:text-stone-50 tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={increase}
                  className="w-10 h-10 rounded-xl border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors text-lg font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {error && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-2">{error}</p>
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-stone-50 dark:bg-neutral-800 rounded-xl px-4 py-3 mb-5">
              <span className="text-sm text-stone-500 dark:text-stone-400">Total payable</span>
              <span className="text-lg font-bold text-stone-900 dark:text-stone-50">
                ৳{totalPrice.toLocaleString()}
              </span>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting || qty > maxQty}
              className="w-full h-11 flex items-center justify-center gap-2 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-orange-50 rounded-xl font-semibold text-sm transition-colors"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Processing…</>
              ) : (
                <><Ticket size={15} /> Confirm booking</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── InfoTile ──────────────────────────────────────────────────────────────────
function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl px-4 py-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500">
        <Icon size={13} />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-50 leading-tight">{value}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TicketDetailsPage() {
  const { id } = useParams();
  const { data: session, isPending: sessionPending } = useSession();
  const role = session?.user?.role;

  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty,     setQty]     = useState(1);
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res  = await fetch(`${process.env.NEXT_PUBLIC_API}/api/tickets/${id}`);
        const data = await res.json();
        setTicket(data[0]);
      } catch {
        setTicket(null);
      } finally {
        setLoading(false);
        setTimeout(() => setVisible(true), 60);
      }
    };
    if (id) fetchTicket();
  }, [id]);

  const transport  = TRANSPORT_META[(ticket?.transportType ?? "").toLowerCase()] ?? TRANSPORT_META.bus;
  const Icon       = transport.icon;
  const statusMeta = STATUS_META[ticket?.verificationStatus] ?? STATUS_META.pending;
  const StatusIcon = statusMeta.icon;
  const { date, time } = formatDateTime(ticket?.departureDateTime);
  const totalPrice = (ticket?.price ?? 0) * qty;

  const isDeparted = ticket ? new Date(ticket.departureDateTime) <= new Date() : false;
  const isSoldOut  = ticket?.quantity === 0;

  const canBook  = !sessionPending && role === "user";
  const showBook = !sessionPending && role !== "admin" && role !== "vendor";

  const bookDisabled = isDeparted || isSoldOut;

  const bookBtnLabel = isDeparted
    ? "Departure Passed"
    : isSoldOut
    ? "Sold Out"
    : "Book Now";

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-400 dark:text-stone-500">
          <Loader2 size={24} className="animate-spin" />
          <p className="text-sm">Loading ticket…</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!ticket) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Ticket size={36} className="text-stone-300 dark:text-stone-700" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Ticket not found</h2>
        <p className="text-stone-500 text-sm">This ticket may have been removed or doesn't exist.</p>
        <Link href="/tickets" className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline">
          ← Back to all tickets
        </Link>
      </div>
    );
  }

  // ── Page ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Booking modal */}
      {modalOpen && (
        <BookingModal
          ticket={ticket}
          session={session}
          onClose={() => setModalOpen(false)}
        />
      )}

      <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 transition-colors pt-20">

        {/* Back link */}
        <div
          className="max-w-5xl mx-auto px-4 sm:px-6 py-4"
          style={{
            opacity:    visible ? 1 : 0,
            transform:  visible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <Link
            href="/tickets"
            className="no-underline inline-flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <ChevronLeft size={16} />
            All Tickets
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">

            {/* ── LEFT ── */}
            <div className="flex flex-col gap-5">

              {/* Hero image */}
              <div
                className="relative rounded-2xl overflow-hidden h-56 sm:h-72 lg:h-80 bg-stone-200 dark:bg-neutral-800"
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? "scale(1)" : "scale(0.98)",
                  transition: "opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s",
                }}
              >
                <img
                  src={ticket.image}
                  alt={ticket.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <span className={[
                  "absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20",
                  transport.color,
                ].join(" ")}>
                  <Icon size={13} />
                  {transport.label}
                </span>

                <span className={[
                  "absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                  statusMeta.style,
                ].join(" ")}>
                  <StatusIcon size={12} />
                  {statusMeta.label}
                </span>

                <div className="absolute bottom-4 left-4">
                  <p className="text-3xl font-extrabold text-white drop-shadow">
                    ৳{ticket.price?.toLocaleString()}
                  </p>
                  <p className="text-white/70 text-xs">per seat</p>
                </div>
              </div>

              {/* Title + route */}
              <div
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.5s ease 0.12s, transform 0.5s ease 0.12s",
                }}
              >
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-snug">
                  {ticket.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-stone-500 dark:text-stone-400 text-sm font-medium">
                  <MapPin size={14} className="text-orange-500 shrink-0" />
                  {ticket.from}
                  <span className="text-stone-300 dark:text-stone-600">→</span>
                  {ticket.to}
                </div>
              </div>

              {/* Info tiles */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                }}
              >
                <InfoTile icon={Calendar} label="Date"            value={date} />
                <InfoTile icon={Clock}    label="Time"            value={time} />
                <InfoTile icon={Users}    label="Available Seats" value={`${ticket.quantity} seats`} />
              </div>

              {/* Countdown */}
              <div
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.5s ease 0.26s, transform 0.5s ease 0.26s",
                }}
              >
                <Countdown departureDateTime={ticket.departureDateTime} />
              </div>

              {/* Perks */}
              {ticket.perks?.length > 0 && (
                <div
                  className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5"
                  style={{
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.5s ease 0.32s, transform 0.5s ease 0.32s",
                  }}
                >
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-orange-500" />
                    Included Perks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.perks.map((perk) => (
                      <span
                        key={perk}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-sm font-medium text-stone-700 dark:text-stone-300"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendor */}
              <div
                className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5"
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.5s ease 0.38s, transform 0.5s ease 0.38s",
                }}
              >
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3">
                  Operated by
                </h3>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {ticket.vendorName?.charAt(0) ?? "V"}
                  </span>
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm">{ticket.vendorName}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{ticket.vendorEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Booking card ── */}
            <div
              className="lg:sticky lg:top-24"
              style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? "translateY(0)" : "translateY(24px)",
                transition: "opacity 0.55s ease 0.22s, transform 0.55s ease 0.22s",
              }}
            >
              <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-5">

                {/* Price header */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-neutral-800 pb-4">
                  <div>
                    <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-50">
                      ৳{ticket.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">per seat</p>
                  </div>
                  <span className={["flex items-center justify-center w-10 h-10 rounded-xl", transport.color].join(" ")}>
                    <Icon size={18} />
                  </span>
                </div>

                {/* Qty picker */}
                {showBook && (
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                      Number of Seats
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-xl border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors font-bold text-lg"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-bold text-lg text-stone-900 dark:text-stone-50 tabular-nums">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => Math.min(ticket.quantity ?? 1, q + 1))}
                        className="w-9 h-9 rounded-xl border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors font-bold text-lg"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Total */}
                {showBook && (
                  <div className="flex items-center justify-between bg-stone-50 dark:bg-neutral-800/60 rounded-xl px-4 py-3">
                    <p className="text-sm text-stone-500 dark:text-stone-400">Total</p>
                    <p className="text-lg font-extrabold text-stone-900 dark:text-stone-50">
                      ৳{totalPrice.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* CTA */}
                {showBook && (
                  canBook ? (
                    <button
                      onClick={() => setModalOpen(true)}
                      disabled={bookDisabled}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-orange-50 text-sm font-bold transition-colors"
                    >
                      <Ticket size={16} />
                      {bookBtnLabel}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="no-underline flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 text-sm font-bold transition-colors"
                    >
                      <Ticket size={16} />
                      Login to Book
                    </Link>
                  )
                )}

                {/* Admin / vendor note */}
                {!showBook && !sessionPending && (
                  <div className="text-center py-2 px-3 rounded-xl bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700">
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      {role === "admin" ? "Admins" : "Vendors"} cannot book tickets.
                    </p>
                  </div>
                )}

                {/* Seats left */}
                <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Users size={12} />
                    {ticket.quantity} seats left
                  </span>
                  <span>{ticket.totalSold} sold</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <style>{`
          @media (prefers-reduced-motion: reduce) {
            * { transition: none !important; }
          }
        `}</style>
      </div>
    </>
  );
}