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
                    <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                      {ticket.transportType}
                    </span>
                  </div>

                  {/* Meta info */}
                  <div className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-600" />
                      {/* ↓ FIX: min-w-0 + truncate on the inner span, not just the flex parent */}
                      <span className="min-w-0 truncate">
                        {ticket.from} → {ticket.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
                      <span className="font-semibold text-stone-900 dark:text-stone-200">
                        ${ticket.price}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Armchair className="h-3.5 w-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
                      <span className="min-w-0 truncate">{ticket.quantity} spaces left</span>
                    </div>
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleToggleAdvertise(ticket._id, ticket.isAd)}
                    className={`flex w-full min-w-0 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      ticket.isAd
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {togglingId === ticket._id ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : ticket.isAd ? (
                      <>
                        <Megaphone className="h-4 w-4 shrink-0" />
                        <span>Advertised</span>
                      </>
                    ) : (
                      <>
                        <MegaphoneOff className="h-4 w-4 shrink-0" />
                        <span>Advertise</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP TABLE (xl and up) ── */}
          <div className="hidden w-full overflow-x-auto xl:block">
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-stone-400">
                  <th className="whitespace-nowrap px-6 py-3.5 text-left">Title</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left">Route</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left">Type</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left">Price</th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-left">Available Space</th>
                  <th className="whitespace-nowrap px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600 dark:divide-neutral-800 dark:text-neutral-300">
                {tickets.map((ticket) => {
                  const isMaxLimitReached = adCount >= 6;
                  const isDisabled =
                    togglingId === ticket._id || (isMaxLimitReached && !ticket.isAd);

                  return (
                    <tr
                      key={ticket._id}
                      className="transition-colors hover:bg-stone-50 dark:hover:bg-neutral-800/40"
                    >
                      <td className="max-w-[200px] truncate px-6 py-3.5 font-medium text-stone-900 dark:text-stone-50">
                        {ticket.title}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3.5">
                        {ticket.from} → {ticket.to}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 capitalize">
                        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                          {ticket.transportType}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-stone-900 dark:text-stone-200">
                        ${ticket.price}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {ticket.quantity} seats available
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleToggleAdvertise(ticket._id, ticket.isAd)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            ticket.isAd
                              ? "bg-orange-600 text-white hover:bg-orange-700"
                              : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {togglingId === ticket._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : ticket.isAd ? (
                            <>
                              <Megaphone className="h-3.5 w-3.5" />
                              Advertised
                            </>
                          ) : (
                            <>
                              <MegaphoneOff className="h-3.5 w-3.5" />
                              Advertise
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}