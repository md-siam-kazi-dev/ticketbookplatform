"use client";

import { Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bus,
  CalendarClock,
  Filter,
  MapPin,
  Plane,
  Search,
  Ship,
  Tag,
  Ticket,
  TrainFront,
  Users,
  X // Added X icon
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// --- Design System Constants ---
const TRANSPORT_ICON = {
  bus: Bus,
  train: TrainFront,
  launch: Ship,
  plane: Plane,
  Bus: Bus,
  Train: TrainFront,
  Launch: Ship,
  Plane: Plane,
};

const TRANSPORT_COLOR = {
  bus: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  train: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  launch: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  plane: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  Bus: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  Train: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  Launch: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400",
  Plane: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
};

// --- Skeleton Loader ---
function TicketSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl h-[400px] sm:h-[420px] animate-pulse flex flex-col overflow-hidden"
        >
          <div className="h-44 sm:h-48 bg-stone-200 dark:bg-neutral-800" />
          <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
            <div className="h-3 w-1/3 bg-stone-200 dark:bg-neutral-800 rounded" />
            <div className="space-y-2 mt-1">
              <div className="h-4 w-full bg-stone-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-3/4 bg-stone-200 dark:bg-neutral-800 rounded" />
            </div>
            <div className="h-10 w-full bg-stone-200 dark:bg-neutral-800 rounded-xl mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AllTicketPage() {
  // --- Data State ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // --- Immediate Input State (What the user sees instantly) ---
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  
  // --- Debounced State (What the API actually listens to) ---
  const [debouncedFrom, setDebouncedFrom] = useState("");
  const [debouncedTo, setDebouncedTo] = useState("");

  // --- Filter, Sort, & Pagination State ---
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const popularRoute = useSearchParams();
   

  // 1. Handle Debouncing (Quiet UI generation)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFrom(searchFrom);
      setDebouncedTo(searchTo);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchFrom, searchTo]);

  // 2. Smooth Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // 3. Fetch Tickets (Added sortOrder to the dependency list)
  useEffect(() => {
  //   setSearchFrom(popularRoute.get('from') || searchFrom)
  //  setSearchTo(popularRoute.get('to') || searchTo)
  //  setFilterType(popularRoute.get('type') || filterType)
    const fetchAllTickets = async () => {
      try {
        setLoading(true);
        setError(false);

        const params = new URLSearchParams({
          page: page.toString(),
          type: filterType !== "all" ? filterType : "",
          from: debouncedFrom,
          to: debouncedTo,
          sort: sortOrder
        });

        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/allticketpag?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        console.log(data)
      
        
        setTotalPages(data?.totalPage);
        setTickets(data?.tickets || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    
    fetchAllTickets();
  }, [page, debouncedFrom, debouncedTo, filterType, sortOrder]);

  // 4. Server-Side Data Mapping reference
  const processedData = tickets || [];

  // Formatting Helper
  const formatDepartureDateTime = (isoString) => {
    if (!isoString) return "Time TBD";
    const date = new Date(isoString);
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <div className="bg-stone-50 dark:bg-neutral-950 min-h-screen mt-10 sm:mt-20 py-10 sm:py-16 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* --- Header Section --- */}
        <div className="mb-10 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-4xl text-center font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
              Browse All Tickets
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-center mt-2 text-sm sm:text-base">
              Find the best routes, compare prices, and book your journey.
            </p>
          </div>

          {/* --- Filters Control Bar --- */}
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-sm flex flex-col lg:flex-row gap-4 relative z-10">
            <div className="flex-1 flex flex-col sm:flex-row gap-3 relative">
              <div className="flex-1 relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Leaving from..."
                  value={searchFrom}
                  onChange={(e) => {
                    setSearchFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                />
                {searchFrom && (
                  <button
                    onClick={() => {
                      setSearchFrom("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="hidden sm:flex items-center justify-center text-stone-300 dark:text-neutral-700">
                <ArrowRight size={16} />
              </div>
              <div className="flex-1 relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Going to..."
                  value={searchTo}
                  onChange={(e) => {
                    setSearchTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all dark:text-white"
                />
                {searchTo && (
                  <button
                    onClick={() => {
                      setSearchTo("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:w-auto">
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-40 pl-9 pr-8 py-2.5 bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none dark:text-white cursor-pointer"
                >
                  <option value="all">All Transport</option>
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                  <option value="plane">Plane</option>
                  <option value="launch">Launch</option>
                </select>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setPage(1); // Reset page context upon sorting shift
                  }}
                  className="w-full sm:w-44 pl-9 pr-8 py-2.5 bg-stone-50 dark:bg-neutral-950 border border-stone-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none dark:text-white cursor-pointer"
                >
                  <option value="none">Sort by Price</option>
                  <option value="asc">Low to High</option>
                  <option value="desc">High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- Main Grid Area --- */}
        <div className="min-h-[500px] relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TicketSkeletonGrid />
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32 text-stone-500"
              >
                <p>Failed to load tickets. Please try again later.</p>
              </motion.div>
            ) : processedData.length === 0 ? (
              <motion.div 
                key="empty" 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-32 text-stone-500"
              >
                <Ticket size={40} className="mb-4 text-stone-300 dark:text-neutral-700" />
                <p className="text-lg font-medium text-stone-900 dark:text-stone-100">No tickets found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters.</p>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
              >
                {processedData.map((ticket) => {
                  const type = ticket.transportType ?? "bus";
                  const IconCmp = TRANSPORT_ICON[type] ?? Bus;
                  const typeColor = TRANSPORT_COLOR[type] ?? TRANSPORT_COLOR.bus;
                  const perks = ticket.perks ?? [];

                  return (
                    <motion.div
                      key={ticket._id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      className="group bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-black/40 hover:border-orange-200 dark:hover:border-orange-500/30 transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-44 sm:h-48 overflow-hidden bg-stone-100 dark:bg-neutral-800 shrink-0">
                        <img
                          src={ticket.image}
                          alt={ticket.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm border border-white/20 ${typeColor}`}>
                          <IconCmp size={12} />
                          <span className="capitalize">{type}</span>
                        </span>
                        <span className="absolute top-3 right-3 bg-orange-600 dark:bg-orange-500 text-orange-50 text-xs font-bold px-2.5 py-1 rounded-full">
                          ৳{ticket.price?.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
                        <p className="text-[11px] font-semibold tracking-wide uppercase text-stone-400 dark:text-stone-500 flex items-center gap-1">
                          {ticket.from} <ArrowRight size={10} /> {ticket.to}
                        </p>

                        <h3 className="font-bold text-base text-stone-900 dark:text-stone-50 leading-snug line-clamp-2">
                          {ticket.title}
                        </h3>

                        <div className="flex flex-col gap-2 mt-1">
                          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
                            <CalendarClock size={14} className="text-orange-500" />
                            <span>{formatDepartureDateTime(ticket.departureDateTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-500">
                            <Users size={14} />
                            <span>{ticket.quantity} seats available</span>
                          </div>
                        </div>

                        {perks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {perks.slice(0, 3).map((perk) => (
                              <span key={perk} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-neutral-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-neutral-700">
                                <Tag size={8} /> {perk}
                              </span>
                            ))}
                            {perks.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-neutral-800 text-stone-400 border border-stone-200 dark:border-neutral-700">
                                +{perks.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-4">
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

        {/* --- HeroUI Pagination Snippet --- */}
        {totalPages > 1 && (
          <div className="mt-14 pb-8">
            <Pagination className="justify-center">
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous isDisabled={page === 1} onPress={() => setPage((p) => Math.max(1, p - 1))}>
                    <Pagination.PreviousIcon>
                      <Icon icon="gravity-ui:arrow-left" />
                    </Pagination.PreviousIcon>
                    <span>Back</span>
                  </Pagination.Previous>
                </Pagination.Item>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Pagination.Item key={p}>
                    <Pagination.Link isActive={p === page} onPress={() => setPage(p)}>
                      {p}
                    </Pagination.Link>
                  </Pagination.Item>
                ))}

                <Pagination.Item>
                  <Pagination.Next isDisabled={page === totalPages} onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <span>Forward</span>
                    <Pagination.NextIcon>
                      <Icon icon="gravity-ui:arrow-right" />
                    </Pagination.NextIcon>
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          </div>
        )}

      </div>
    </div>
  );
}