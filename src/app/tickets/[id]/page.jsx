"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bus, TrainFront, Ship, Plane, Waves,
  MapPin, Clock, Tag, Users, ChevronLeft,
  Ticket, Calendar, BadgeCheck, XCircle, Loader2,
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

// ── Luminous Pulse Layout Skeleton Loader ──
function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 pt-24 pb-20 animate-pulse">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="h-4 w-20 bg-stone-200 dark:bg-neutral-800 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
          <div className="space-y-6">
            <div className="h-56 sm:h-72 lg:h-80 bg-stone-200 dark:bg-neutral-800 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-7 w-3/4 bg-stone-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-1/2 bg-stone-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-stone-200 dark:bg-neutral-800 rounded-xl" />
              ))}
            </div>
            <div className="h-24 bg-stone-200 dark:bg-neutral-800 rounded-2xl" />
          </div>
          <div className="h-[360px] bg-stone-200 dark:bg-neutral-800 rounded-2xl lg:sticky lg:top-24" />
        </div>
      </div>
    </div>
  );
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
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm">
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
            <div key={unit} className="bg-stone-50 dark:bg-neutral-800/50 rounded-xl py-2.5 border border-stone-100 dark:border-neutral-800/40">
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

// ── InfoTile ──────────────────────────────────────────────────────────────────
function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl px-4 py-3 flex flex-col gap-1.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500">
        <Icon size={13} />
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-stone-900 dark:text-stone-50 leading-tight">{value}</p>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function TicketDetailsPage() {
  const { id } = useParams();
  const { data: session, isPending: sessionPending } = useSession();
  const role = session?.user?.role;

  const [ticket,  setTicket]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty,     setQty]     = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Modal inner flows
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res  = await fetch(`${process.env.NEXT_PUBLIC_API}/api/tickets/${id}`);
        const data = await res.json();
        // Fallback checks for array wrapped or flat documents
        setTicket(Array.isArray(data) ? data[0] : data);
      } catch {
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTicket();
  }, [id]);

  if (loading) return <DetailPageSkeleton />;

  if (!ticket) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Ticket size={36} className="text-stone-300 dark:text-stone-700 animate-pulse" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Ticket not found</h2>
        <p className="text-stone-500 text-sm">This ticket may have been removed or doesn't exist.</p>
        <Link href="/tickets" className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline">
          ← Back to all tickets
        </Link>
      </div>
    );
  }

  const transport  = TRANSPORT_META[(ticket.transportType ?? "").toLowerCase()] ?? TRANSPORT_META.bus;
  const Icon       = transport.icon;
  const statusMeta = STATUS_META[ticket.verificationStatus] ?? STATUS_META.pending;
  const StatusIcon = statusMeta.icon;
  const { date, time } = formatDateTime(ticket.departureDateTime);
  const totalPrice = (ticket.price ?? 0) * qty;

  const isDeparted = new Date(ticket.departureDateTime) <= new Date();
  const isSoldOut  = ticket.quantity === 0;

  const canBook  = !sessionPending && role === "user";
  const showBook = !sessionPending && role !== "admin" && role !== "vendor";
  const bookDisabled = isDeparted || isSoldOut;

  const bookBtnLabel = isDeparted
    ? "Departure Passed"
    : isSoldOut
    ? "Sold Out"
    : "Book Now";

  const handleDecrease = () => {
    setModalError("");
    setQty((q) => Math.max(1, q - 1));
  };

  const handleIncrease = () => {
    if (qty >= ticket.quantity) {
      setModalError(`Only ${ticket.quantity} seats available.`);
      return;
    }
    setModalError("");
    setQty((q) => q + 1);
  };

  const handleBookingSubmit = async () => {
    if (qty > ticket.quantity) {
      setModalError(`Only ${ticket.quantity} seats available.`);
      return;
    }
    setSubmitting(true);
    setModalError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId:   ticket._id,
          userId:     session?.user?.id,
          quantity:   qty,
          totalPrice,
          status:     "pending",
        }),
      });

      if (!res.ok) {
        const fallback = await res.json().catch(() => ({}));
        throw new Error(fallback.message || "Booking failed. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = (open) => {
    if (!open) {
      setModalOpen(false);
      // Reset deep transaction variables cleanly after closing transitions complete
      setTimeout(() => {
        setSuccess(false);
        setModalError("");
      }, 200);
    }
  };

  return (
    <>
      {/* ── Shadcn UI Booking Modal Primitives ── */}
      <Dialog open={modalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-stone-900 dark:text-stone-50">
              {success ? "Booking Confirmed!" : "Confirm Your Booking"}
            </DialogTitle>
          </DialogHeader>

          {success ? (
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
                Status: <span className="text-amber-600 dark:text-amber-400 font-medium">Pending</span> — check dashboards for updates.
              </p>
              <button
                onClick={() => handleModalClose(false)}
                className="w-full h-11 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 rounded-xl font-semibold text-sm transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="bg-stone-50 dark:bg-neutral-800/40 rounded-xl p-4 text-sm space-y-1.5 border border-stone-100 dark:border-neutral-800/50">
                {[
                  ["Route",        `${ticket.from} → ${ticket.to}`],
                  ["Transport",    ticket.transportType],
                  ["Departure",    `${date} · ${time}`],
                  ["Price / seat", `৳${ticket.price?.toLocaleString()}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-stone-400 dark:text-stone-500">{label}</span>
                    <span className="font-medium text-stone-900 dark:text-stone-50 capitalize">{value}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Number of seats
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecrease}
                    className="w-10 h-10 rounded-xl border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-xl font-bold text-stone-900 dark:text-stone-50 tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={handleIncrease}
                    className="w-10 h-10 rounded-xl border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>
                {modalError && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-2">{modalError}</p>
                )}
              </div>

              <div className="flex items-center justify-between bg-stone-50 dark:bg-neutral-800/40 rounded-xl px-4 py-3 border border-stone-100 dark:border-neutral-800/50">
                <span className="text-sm text-stone-500 dark:text-stone-400">Total payable</span>
                <span className="text-lg font-bold text-stone-900 dark:text-stone-50">
                  ৳{totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleBookingSubmit}
                disabled={submitting || qty > ticket.quantity}
                className="w-full h-11 flex items-center justify-center gap-2 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-orange-50 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing…</>
                ) : (
                  <><Ticket size={15} /> Confirm Booking</>
                )}
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Main Layout Canvas ── */}
      <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 transition-colors pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <Link
            href="/tickets"
            className="no-underline inline-flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            <ChevronLeft size={16} />
            All Tickets
          </Link>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start"
          >
            {/* ── LEFT PANELS ── */}
            <div className="flex flex-col gap-5">
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.98, y: 12 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                className="relative rounded-2xl overflow-hidden h-56 sm:h-72 lg:h-80 bg-stone-200 dark:bg-neutral-800 shadow-sm"
              >
                <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <span className={["absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/20", transport.color].join(" ")}>
                  <Icon size={13} />
                  {transport.label}
                </span>

                <span className={["absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border", statusMeta.style].join(" ")}>
                  <StatusIcon size={12} />
                  {statusMeta.label}
                </span>

                <div className="absolute bottom-4 left-4">
                  <p className="text-3xl font-extrabold text-white drop-shadow-md">৳{ticket.price?.toLocaleString()}</p>
                  <p className="text-white/80 text-xs font-medium">per seat</p>
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 leading-snug">
                  {ticket.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-stone-500 dark:text-stone-400 text-sm font-medium">
                  <MapPin size={14} className="text-orange-500 shrink-0" />
                  <span>{ticket.from}</span>
                  <span className="text-stone-300 dark:text-stone-600">&rarr;</span>
                  <span>{ticket.to}</span>
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <InfoTile icon={Calendar} label="Date" value={date} />
                <InfoTile icon={Clock}    label="Time" value={time} />
                <InfoTile icon={Users}    label="Available Seats" value={`${ticket.quantity} seats`} />
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <Countdown departureDateTime={ticket.departureDateTime} />
              </motion.div>

              {ticket.perks?.length > 0 && (
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3 flex items-center gap-2">
                    <Tag size={14} className="text-orange-500" />
                    Included Perks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ticket.perks.map((perk) => (
                      <span key={perk} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-neutral-800/40 border border-stone-200 dark:border-neutral-700/70 text-sm font-medium text-stone-700 dark:text-stone-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        {perk}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3">Operated by</h3>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {ticket.vendorName?.charAt(0) ?? "V"}
                  </span>
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm">{ticket.vendorName}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">{ticket.vendorEmail}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT STICKY CONTROL CARD ── */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.1 }}
              className="lg:sticky lg:top-24"
            >
              <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-neutral-800 pb-4">
                  <div>
                    <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-50">৳{ticket.price?.toLocaleString()}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">per seat</p>
                  </div>
                  <span className={["flex items-center justify-center w-10 h-10 rounded-xl", transport.color].join(" ")}>
                    <Icon size={18} />
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {showBook && (
                    <motion.div layout className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">Number of Seats</label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            className="w-9 h-9 rounded-xl border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors font-bold text-lg"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center font-bold text-lg text-stone-900 dark:text-stone-50 tabular-nums">{qty}</span>
                          <button
                            onClick={() => setQty((q) => Math.min(ticket.quantity ?? 1, q + 1))}
                            className="w-9 h-9 rounded-xl border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors font-bold text-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-stone-50 dark:bg-neutral-800/40 rounded-xl px-4 py-3 border border-stone-100 dark:border-neutral-800/50">
                        <p className="text-sm text-stone-500 dark:text-stone-400">Total</p>
                        <p className="text-lg font-extrabold text-stone-900 dark:text-stone-50">৳{totalPrice.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {showBook && (
                  canBook ? (
                    <button
                      onClick={() => setModalOpen(true)}
                      disabled={bookDisabled}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-orange-50 text-sm font-bold transition-all shadow-sm"
                    >
                      <Ticket size={16} />
                      {bookBtnLabel}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="no-underline flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 text-sm font-bold transition-all shadow-sm"
                    >
                      <Ticket size={16} />
                      Login to Book
                    </Link>
                  )
                )}

                {!showBook && !sessionPending && (
                  <div className="text-center py-2.5 px-3 rounded-xl bg-stone-50 dark:bg-neutral-800/50 border border-stone-200 dark:border-neutral-800">
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                      {role === "admin" ? "Admins" : "Vendors"} cannot book tickets.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 pt-1 border-t border-stone-100 dark:border-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <Users size={12} />
                    {ticket.quantity} seats left
                  </span>
                  <span>{ticket.totalSold ?? 0} sold</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}