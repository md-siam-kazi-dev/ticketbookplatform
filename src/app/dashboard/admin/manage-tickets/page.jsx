"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bus, TrainFront, Ship, Plane, Check, X, Loader2, Mail, User2 } from "lucide-react";
import { manageTicket } from "@/lib/serverFunction/manageTIcket";
import { authClient } from "@/lib/auth-client";

const TRANSPORT_ICON = {
  Bus: Bus,
  Train: TrainFront,
  Launch: Ship,
  Plane: Plane,
};

const STATUS_STYLES = {
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  approved:
    "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20",
  rejected:
    "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20",
};

const FILTER_TABS = ["all", "pending", "approved", "rejected"];

export default function ManageTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await manageTicket();
      setTickets(data);
    } catch (err) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionId(id);
    const prevTickets = tickets;
    setTickets((prev) =>
      prev.map((t) => (t._id === id ? { ...t, verificationStatus: status } : t))
    );

    try {
      const { data: tokenData } = await authClient.token();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/admin/tickets`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({ id, verificationStatus: status }),
      });

      if (!res.ok) throw new Error("Request failed");
      toast.success(status === "approved" ? "Ticket approved" : "Ticket rejected");
    } catch (err) {
      setTickets(prevTickets);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const filteredTickets =
    filter === "all" ? tickets : tickets.filter((t) => t.verificationStatus === filter);

  const formatDate = (dateVal) => {
    const date = dateVal?.$date ? new Date(dateVal.$date) : new Date(dateVal);
    return {
      day: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden w-full max-w-full box-border">
      
      {/* Header section with structural wrapping rules */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 py-5 border-b border-stone-200 dark:border-neutral-800 w-full max-w-full overflow-hidden">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 truncate">
            Manage Tickets
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5 truncate">
            Review and moderate tickets submitted by vendors
          </p>
        </div>

        {/* Filter Tab Scroll Area */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-neutral-800 rounded-xl p-1 w-full lg:w-auto overflow-x-auto scrollbar-none touch-pan-x">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap shrink-0 flex-1 lg:flex-none text-center",
                filter === tab
                  ? "bg-white dark:bg-neutral-700 text-stone-900 dark:text-stone-50 shadow-sm"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          <Loader2 size={20} className="animate-spin mx-auto mb-2" />
          Loading tickets...
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredTickets.length === 0 && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          No {filter !== "all" ? filter : ""} tickets found.
        </div>
      )}

      {!loading && filteredTickets.length > 0 && (
        <>
          {/* ── DESKTOP & TABLET TABLE (Visible from xl screens up) ── */}
          <div className="hidden xl:block overflow-x-auto w-full max-w-full left-0 right-0">
            <table className="w-full text-sm table-auto border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800/50">
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-6 py-3.5 whitespace-nowrap">Ticket</th>
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-4 py-3.5 whitespace-nowrap">Route</th>
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-4 py-3.5 whitespace-nowrap">Vendor</th>
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-4 py-3.5 whitespace-nowrap">Departure</th>
                  <th className="text-right font-semibold text-stone-500 dark:text-stone-400 px-4 py-3.5 whitespace-nowrap">Price</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-6 py-3.5 whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const TransportIcon = TRANSPORT_ICON[ticket.transportType] || Bus;
                  const isPending = ticket.verificationStatus === "pending";
                  const isBusy = actionId === ticket._id;
                  const { day, time } = formatDate(ticket.departureDateTime);

                  return (
                    <tr
                      key={ticket._id}
                      className="border-b border-stone-100 dark:border-neutral-800 last:border-0 hover:bg-stone-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3 max-w-[240px]">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-100 dark:bg-neutral-800">
                            <img src={ticket.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900 dark:text-stone-50 truncate max-w-[160px]">
                              {ticket.title}
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                              <TransportIcon size={12} />
                              {ticket.transportType}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className=" py-3.5 whitespace-nowrap text-stone-700 dark:text-stone-300 max-w-[180px] truncate">
                        {ticket.from} <span className="text-stone-300 dark:text-stone-600 mx-1">→</span> {ticket.to}
                      </td>
                      <td className=" py-3.5">
                        <div className="max-w-[180px]">
                          <p className="text-stone-700 dark:text-stone-300 font-medium truncate max-w-[160px]">{ticket.vendorName}</p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 truncate max-w-[160px]">{ticket.vendorEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-stone-500 dark:text-stone-400">
                        {day} · {time}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-stone-900 dark:text-stone-50 whitespace-nowrap">
                        ৳{ticket.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className={["inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize border", STATUS_STYLES[ticket.verificationStatus]].join(" ")}>
                          {ticket.verificationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-1.5 min-h-[32px] whitespace-nowrap">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(ticket._id, "approved")}
                                disabled={isBusy}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                              >
                                {isBusy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(ticket._id, "rejected")}
                                disabled={isBusy}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
                              >
                                {isBusy ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                                Reject
                              </button>
                            </>
                          ) : (
                            <p className="text-center text-xs text-stone-400 dark:text-stone-500 italic capitalize">
                              {ticket.verificationStatus}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE & TABLET RESPONSIVE GRID CARDS (Below xl screens) ── */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-stone-50/50 dark:bg-neutral-950/20 w-full max-w-full box-border">
            {filteredTickets.map((ticket) => {
              const TransportIcon = TRANSPORT_ICON[ticket.transportType] || Bus;
              const isPending = ticket.verificationStatus === "pending";
              const isBusy = actionId === ticket._id;
              const { day, time } = formatDate(ticket.departureDateTime);

              return (
                <div 
                  key={ticket._id} 
                  className="p-4 sm:p-5 flex flex-col justify-between gap-4 bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800/80 rounded-xl shadow-sm min-w-0 overflow-hidden"
                >
                  <div>
                    <div className="flex items-start gap-3 justify-between">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-stone-100 dark:bg-neutral-800">
                        <img src={ticket.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm sm:text-base leading-snug truncate">
                          {ticket.title}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 mt-1">
                          <TransportIcon size={12} />
                          {ticket.transportType}
                        </span>
                      </div>
                      <span className={["shrink-0  py-0.5 rounded-full text-[11px] font-semibold capitalize border whitespace-nowrap", STATUS_STYLES[ticket.verificationStatus]].join(" ")}>
                        {ticket.verificationStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm bg-stone-50 dark:bg-neutral-800/40 rounded-xl  py-3 mt-4">
                      <div className="min-w-0">
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Route</p>
                        <p className="text-stone-800 dark:text-stone-200 font-medium truncate">
                          {ticket.from} → {ticket.to}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Price</p>
                        <p className="text-stone-800 dark:text-stone-200 font-semibold">
                          ৳{ticket.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">Departure</p>
                        <p className="text-stone-800 dark:text-stone-200 truncate">
                          {day} · {time}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-xs sm:text-sm mt-4 min-w-0">
                      <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 min-w-0">
                        <User2 size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                        <span className="font-medium truncate">{ticket.vendorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-50 min-w-0">
                        <Mail size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                        <span className="text-xs text-stone-400 dark:text-stone-500 truncate">{ticket.vendorEmail}</span>
                      </div>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="flex items-center gap-2 pt-3 border-t border-stone-100 dark:border-neutral-800/80">
                      <button
                        onClick={() => handleStatusChange(ticket._id, "approved")}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                      >
                        {isBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(ticket._id, "rejected")}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
                      >
                        {isBusy ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        Reject
                      </button>
                    </div>
                  ) : (
                    <p className="text-center text-xs text-stone-400 dark:text-stone-500 italic pt-2 border-t border-stone-100 dark:border-neutral-800/80 capitalize">
                      Already {ticket.verificationStatus}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}