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

  // Fetch all approved tickets on initial mount
  useEffect(() => {
    const fetchApprovedTickets = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/allticket/ad`, {
          cache: "no-store",
        });
        const data = await res.json();

        const activeAdsCount = data.filter((x) => x.isAd === true).length;
        setAdCount(activeAdsCount);
        setTickets(data);
      } catch (error) {
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

    // Preserve previous states to roll back cleanly on catch block errors
    const previousTickets = tickets;
    const previousAdCount = adCount;

    // ── OPTIMISTIC UI STATE UPDATE ──
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
        // Rollback state instantly if server returns false/error flags
        setTickets(previousTickets);
        setAdCount(previousAdCount);
        toast.error(data.message || "Failed to update advertisement status");
      }
    } catch (error) {
      // Rollback state instantly on network dropped operations
      setTickets(previousTickets);
      setAdCount(previousAdCount);
      toast.error("Network connection error encountered");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden w-full  box-border">
      {/* Header section matching platform core styling layout */}
      <div className="flex flex-col xl:flex-row  sm:justify-between gap-4 px-4  py-5 border-b border-stone-200 dark:border-neutral-800 w-full max-w-full overflow-hidden">
        <div className="min-w-0">
          <h1 className="text-left sm:text-lg font-bold text-stone-900 dark:text-stone-50 truncate">
            Campaign Advertisements
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            Promote up to 6 approved items directly onto your home display banners.
          </p>
        </div>
        <div className="shrink-0">
          <span className="flex flex-col xxl:flex-row items-center gap-1.5 px-3 py-1.5  rounded-xl bg-stone-100 dark:bg-neutral-800 text-xs font-semibold text-stone-700 dark:text-stone-300">
            Advertising:{" "}
            <span className={adCount >= 6 ? "text-red-500 font-bold" : "text-orange-600 font-bold"}>
              {adCount}/6
            </span>
          </span>
        </div>
      </div>

      {/* Loading state rendered inline */}
      {loading && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          <Loader2 size={20} className="animate-spin mx-auto mb-2 text-orange-600" />
          Loading tickets...
        </div>
      )}

      {/* Empty state */}
      {!loading && tickets.length === 0 && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          No approved tickets available for promotional ads.
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <>
          {/* ── MOBILE & TABLET COMPACT CARDS RESPONSIVE GRID (Below lg breakpoints) ── */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-1 gap-4 p-4 bg-stone-50/50 dark:bg-neutral-950/20 w-full max-w-full">
            {tickets.map((ticket) => {
              const isMaxLimitReached = adCount >= 6;
              const isDisabled = togglingId === ticket._id || (isMaxLimitReached && !ticket.isAd);

              return (
                <div
                  key={ticket._id}
                  className="p-4 sm:p-5 flex flex-col justify-between gap-4 bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800/80 rounded-xl shadow-sm min-w-0 overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-stone-900 dark:text-stone-50 text-sm sm:text-base line-clamp-1 min-w-0 flex-1">
                        {ticket.title}
                      </h3>
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[11px] font-semibold capitalize whitespace-nowrap">
                        {ticket.transportType}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-stone-500 dark:text-stone-400 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="truncate">
                          {ticket.from} &rarr; {ticket.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
                        <span className="font-semibold text-stone-900 dark:text-stone-200">
                          ${ticket.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
                        <span className="truncate">{ticket.quantity} spaces left</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleToggleAdvertise(ticket._id, ticket.isAd)}
                    className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap ${
                      ticket.isAd
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {togglingId === ticket._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : ticket.isAd ? (
                      <>
                        <Megaphone className="h-3.5 w-3.5" />
                        <span>Advertised</span>
                      </>
                    ) : (
                      <>
                        <MegaphoneOff className="h-3.5 w-3.5" />
                        <span>Advertise</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP TABULAR VIEW MATRIX (Visible from lg breakpoints up) ── */}
          <div className="hidden xl:block overflow-x-auto w-full max-w-full left-0 right-0">
            <table className="w-full text-sm table-auto border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800/50 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <th className="text-left px-6 py-3.5 whitespace-nowrap">Title</th>
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">Route</th>
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">Type</th>
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">Price</th>
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">Available Space</th>
                  <th className="text-center px-6 py-3.5 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-neutral-800 text-stone-600 dark:text-neutral-300">
                {tickets.map((ticket) => {
                  const isMaxLimitReached = adCount >= 6;
                  const isDisabled = togglingId === ticket._id || (isMaxLimitReached && !ticket.isAd);

                  return (
                    <tr
                      key={ticket._id}
                      className="hover:bg-stone-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-medium text-stone-900 dark:text-stone-50 max-w-[200px] truncate">
                        {ticket.title}
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px] truncate">
                        {ticket.from} &rarr; {ticket.to}
                      </td>
                      <td className="px-4 py-3.5 capitalize whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-xs font-semibold">
                          {ticket.transportType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-stone-900 dark:text-stone-200 whitespace-nowrap">
                        ${ticket.price}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {ticket.quantity} seats available
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center min-h-[32px] whitespace-nowrap">
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleToggleAdvertise(ticket._id, ticket.isAd)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                              ticket.isAd
                                ? "bg-orange-600 text-white hover:bg-orange-700"
                                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700"
                            }`}
                          >
                            {togglingId === ticket._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : ticket.isAd ? (
                              <>
                                <Megaphone className="h-3.5 w-3.5" />
                                <span>Advertised</span>
                              </>
                            ) : (
                              <>
                                <MegaphoneOff className="h-3.5 w-3.5" />
                                <span>Advertise</span>
                              </>
                            )}
                          </button>
                        </div>
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