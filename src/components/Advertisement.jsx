"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, TrainFront, Ship, Plane, Tag, Users, ArrowRight, Ticket } from "lucide-react";

const TRANSPORT_ICON = {
  bus:    Bus,
  train:  TrainFront,
  launch: Ship,
  plane:  Plane,
  Bus:    Bus,
  Train:  TrainFront,
  Launch: Ship,
  Plane:  Plane,
};

const TRANSPORT_COLOR = {
  bus:    "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  train:  "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  launch: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  plane:  "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  Bus:    "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  Train:  "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  Launch: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  Plane:  "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
};

// ── Custom Skeleton Loader Sub-component ──
function AdvertiseSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-[420px]"
        >
          {/* Image placeholder */}
          <div className="h-44 sm:h-48 bg-stone-200 dark:bg-neutral-800" />
          
          {/* Content placeholders */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
            <div className="h-3 w-1/3 bg-stone-200 dark:bg-neutral-800 rounded" />
            <div className="space-y-2 mt-1">
              <div className="h-4 w-full bg-stone-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-3/4 bg-stone-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-3 w-1/2 bg-stone-200 dark:bg-neutral-800 rounded mt-2" />
            
            {/* Perks skeletons */}
            <div className="flex gap-2 mt-2">
              <div className="h-5 w-16 bg-stone-200 dark:bg-neutral-800 rounded-full" />
              <div className="h-5 w-20 bg-stone-200 dark:bg-neutral-800 rounded-full" />
            </div>

            {/* Button skeleton */}
            <div className="h-10 w-full bg-stone-200 dark:bg-neutral-800 rounded-xl mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdvertiseSection() {
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/adticket`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setTickets(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  return (
    <section className="bg-stone-50 dark:bg-neutral-950 py-16 sm:py-20 transition-colors overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="flex flex-col mx-auto text-center sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Featured Routes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
              Advertised Tickets
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm sm:text-base max-w-md">
              Handpicked routes by our team — great prices, trusted vendors.
            </p>
          </div>
        </div>

        {/* Dynamic Content Handling */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdvertiseSkeletonGrid />
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-2 text-stone-400 dark:text-stone-500"
            >
              <Ticket size={28} className="text-stone-300 dark:text-stone-700" />
              <p className="text-sm">Couldn't load featured tickets right now.</p>
            </motion.div>
          ) : tickets.length === 0 ? (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-2 text-stone-400 dark:text-stone-500"
            >
              <Ticket size={28} className="text-stone-300 dark:text-stone-700" />
              <p className="text-sm">No advertised tickets yet.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="tickets-grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            >
              {tickets.map((ticket) => {
                const type      = ticket.transportType ?? "bus";
                const Icon      = TRANSPORT_ICON[type] ?? Bus;
                const typeColor = TRANSPORT_COLOR[type] ?? TRANSPORT_COLOR.bus;
                const perks     = ticket.perks ?? [];

                return (
                  <motion.div
                    key={ticket._id}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    whileHover={{ y: -4 }}
                    className="group bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-lg dark:hover:shadow-black/40 hover:border-orange-200 dark:hover:border-orange-500/30 transition-shadow duration-300 flex flex-col"
                  >
                    {/* Image Area */}
                    <div className="relative h-44 sm:h-48 overflow-hidden bg-stone-100 dark:bg-neutral-800 shrink-0">
                      <img
                        src={ticket.image}
                        alt={ticket.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Transport Badge */}
                      <span className={[
                        "absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm border border-white/20",
                        typeColor,
                      ].join(" ")}>
                        <Icon size={12} />
                        {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                      </span>

                      {/* Price Badge */}
                      <span className="absolute top-3 right-3 bg-orange-600 dark:bg-orange-500 text-orange-50 text-xs font-bold px-2.5 py-1 rounded-full">
                        ৳{ticket.price?.toLocaleString()}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
                      
                      {/* Routes info */}
                      <p className="text-[11px] font-semibold tracking-wide uppercase text-stone-400 dark:text-stone-500">
                        {ticket.from} → {ticket.to}
                      </p>

                      {/* Title */}
                      <h3 className="font-bold text-base text-stone-900 dark:text-stone-50 leading-snug line-clamp-2">
                        {ticket.title}
                      </h3>

                      {/* Capacity info */}
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <Users size={13} className="shrink-0" />
                        <span>{ticket.quantity} seats available</span>
                      </div>

                      {/* Perks layout */}
                      {perks.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {perks.slice(0, 4).map((perk) => (
                            <span
                              key={perk}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-neutral-700"
                            >
                              <Tag size={9} />
                              {perk}
                            </span>
                          ))}
                          {perks.length > 4 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-neutral-800 text-stone-400 dark:text-stone-500 border border-stone-200 dark:border-neutral-700">
                              +{perks.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA Action button */}
                      <div className="mt-auto pt-2">
                        <Link
                          href={`/tickets/${ticket._id}`}
                          className="no-underline flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-orange-50 text-sm font-semibold transition-colors group/btn"
                        >
                          See Details
                          <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}