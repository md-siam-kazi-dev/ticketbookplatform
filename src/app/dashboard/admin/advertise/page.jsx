"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Megaphone,
  MegaphoneOff,
  Loader2,
  MapPin,
  Tag,
  Armchair,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function AdminAdManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [adCount, setAdCount] = useState(0);

  useEffect(() => {
    const fetchApprovedTickets = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/allticket/ad`, {
          cache: "no-store",
        });
        const data = await res.json();
        setAdCount(data.filter((x) => x.isAd === true).length);
        setTickets(data);
      } catch {
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedTickets();
  }, []);

  const handleToggleAdvertise = async (ticketId, currentStatus) => {
    setTogglingId(ticketId);
    const newStatus = !currentStatus;
    const previousTickets = tickets;
    const previousAdCount = adCount;

    setTickets((prev) =>
      prev.map((t) => (t._id === ticketId ? { ...t, isAd: newStatus } : t))
    );
    setAdCount((prev) => (newStatus ? prev + 1 : prev - 1));

    try {
      const tokenResponse = await authClient.token();
      const tokenData = tokenResponse?.data;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/ticket/ad`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${tokenData?.token}`,
        },
        body: JSON.stringify({ id: ticketId, isAd: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          newStatus ? "Ticket pinned to advertisements!" : "Advertisement removed"
        );
      } else {
        setTickets(previousTickets);
        setAdCount(previousAdCount);
        toast.error(data.message || "Failed to update advertisement status");
      }
    } catch {
      setTickets(previousTickets);
      setAdCount(previousAdCount);
      toast.error("Network connection error encountered");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">

      {/* ── HEADER ── */}
      <div className="flex w-full flex-wrap items-start justify-between gap-3 border-b border-stone-200 px-4 py-4 sm:flex-nowrap sm:items-center dark:border-neutral-800">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold text-stone-900 sm:text-base dark:text-stone-50">
            Campaign Advertisements
          </h1>
          <p className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">
            Promote up to 6 approved items directly onto your home display banners.
          </p>
        </div>
        <span className="shrink-0 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:bg-neutral-800 dark:text-stone-300">
          Ads:{" "}
          <span className={adCount >= 6 ? "font-bold text-red-500" : "font-bold text-orange-600"}>
            {adCount}/6
          </span>
        </span>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          <Loader2 size={20} className="mx-auto mb-2 animate-spin text-orange-600" />
          Loading tickets...
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && tickets.length === 0 && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          No approved tickets available for promotional ads.
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <>
          {/* ── MOBILE / TABLET CARDS (below xl) ── */}
          <div className="grid w-full grid-cols-1 gap-3 bg-stone-50/50 p-3 sm:grid-cols-2 xl:hidden dark:bg-neutral-950/20">
            {tickets.map((ticket) => {
              const isMaxLimitReached = adCount >= 6;
              const isDisabled =
                togglingId === ticket._id || (isMaxLimitReached && !ticket.isAd);

              return (
                <div
                  key={ticket._id}
                  className="flex min-w-0 flex-col justify-between gap-3 overflow-hidden rounded-xl border border-stone-100 bg-white p-3.5 shadow-sm sm:p-4 dark:border-neutral-800/80 dark:bg-neutral-900"
                >
                  {/* Card header row */}
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-900 dark:text-stone-50">
                      {ticket.title}
                    </h3>
                    <span className="shrink-0 rounded-full