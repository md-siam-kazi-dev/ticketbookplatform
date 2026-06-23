"use client";

import React, { useEffect, useState } from "react";
import { DeleteTicketModal, UpdateTicketModal } from "./Ticketmodal";
import { useRouter } from "next/navigation";

const TicketCard = ({ tickets, isLoading, onRefresh ,setLoad}) => {
  const [updateTarget, setUpdateTarget] = useState(null); // ticket object
  const [deleteTarget, setDeleteTarget] = useState(null); // { _id, title }
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/vendor/my-tickets')
  }, [updateTarget, setUpdateTarget, isLoading, deleteTarget])

  // ── Skeleton Loader ──
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800"
          >
            <div className="h-48 w-full bg-gray-200 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800" />
            <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-2/5" />
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
                <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/5" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="h-9 bg-gray-200 dark:bg-zinc-800 rounded-lg w-full" />
                <div className="h-9 bg-gray-200 dark:bg-zinc-800 rounded-lg w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
        No tickets found.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => {
          // Changed status to verificationStatus to match backend schema fallback
          const currentStatus = ticket.verificationStatus || ticket.status || "pending";
          const isRejected = currentStatus === "rejected";

          const formattedDate = new Date(ticket.departureDateTime).toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return (
            <div
              key={ticket._id?.$oid || ticket._id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:bg-zinc-900 dark:border-zinc-800"
            >
              {/* Thumbnail */}
              <div className="relative h-48 w-full bg-gray-100 dark:bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-zinc-800">
                {ticket.image ? (
                  <img
                    src={ticket.image}
                    alt={ticket.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-400 dark:text-zinc-600">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    <span className="text-xs font-medium uppercase tracking-wider">
                      No Image
                    </span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {currentStatus === "pending" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30">
                      ● Pending
                    </span>
                  )}
                  {currentStatus === "approved" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30">
                      ● Approved
                    </span>
                  )}
                  {currentStatus === "rejected" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30">
                      ● Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    <span className="capitalize">{ticket.transportType}</span>
                    <span className="text-gray-300 dark:text-zinc-700">|</span>
                    <span>{ticket.quantity} Seats</span>
                  </div>

                  <h4 className="font-bold text-lg text-gray-900 dark:text-zinc-100 line-clamp-1">
                    {ticket.title}
                  </h4>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400 pt-1">
                    <span className="font-medium text-gray-800 dark:text-zinc-200">
                      {ticket.fromLocation ?? ticket.from}
                    </span>
                    <span className="text-gray-400">➔</span>
                    <span className="font-medium text-gray-800 dark:text-zinc-200">
                      {ticket.toLocation ?? ticket.to}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formattedDate}
                  </p>
                </div>

                <div className="flex items-baseline justify-between border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <span className="text-xs text-gray-400 dark:text-zinc-500">
                    Price per seat
                  </span>
                  <span className="text-xl font-extrabold text-gray-900 dark:text-zinc-50 font-mono">
                    ${ticket.price}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setUpdateTarget(ticket)}
                    disabled={isRejected}
                    className="inline-flex items-center justify-center rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 h-9 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-40 disabled:pointer-events-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:ring-offset-zinc-950"
                  >
                    Update
                  </button>

                  <button
                    onClick={() =>
                      setDeleteTarget({ _id: ticket._id?.$oid || ticket._id, title: ticket.title })
                    }
                    className="inline-flex items-center justify-center rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 h-9 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 dark:hover:bg-rose-950/40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Modal */}
      <UpdateTicketModal
        ticket={updateTarget}
        open={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        onSuccess={() => {
          setUpdateTarget(null);
          onRefresh?.();
        }}
        setLoad={setLoad}
      />

      {/* Delete Modal */}
      <DeleteTicketModal
        ticketId={deleteTarget?._id}
        ticketTitle={deleteTarget?.title}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => {
          setDeleteTarget(null);
          onRefresh?.();
        }}
        setLoad = {setLoad}
      />
    </>
  );
};

export default TicketCard;