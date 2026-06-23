'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Megaphone, MegaphoneOff, Loader2, MapPin, Tag, Armchair } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function AdminAdManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [q, setQ] = useState(0);

  // Fetch all approved tickets on load
  useEffect(() => {
    const fetchApprovedTickets = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/allticket/ad`, { cache: 'no-store' });
        const data = await res.json();
        
        const activeAdsCount = data.filter(x => x.isAd === true);
        setQ(activeAdsCount.length);
        setTickets(data);
      } catch (error) {
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedTickets();
  }, [tickets]); // Removed tickets from dependencies to stop the network request loop

  const handleToggleAdvertise = async (ticketId, currentStatus) => {
    setTogglingId(ticketId);
    const newStatus = !currentStatus;

    try {
      const tokenResponse = await authClient.token();
      const tokenData = tokenResponse?.data;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/ticket/ad`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `bearer ${tokenData?.token}` 
        },
        body: JSON.stringify({ id: ticketId, isAd: newStatus })
      });

      const data = await res.json();

      if (data.success) {
        // Uncommented and working: Optimistically updates UI state list matching backend keys
        // setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, isAd: newStatus } : t));
        setQ(prev => newStatus ? prev + 1 : prev - 1);
        
        toast.success(newStatus ? "Ticket pinned to advertisements!" : "Advertisement removed");
      } else {
        toast.error(data.message || "Failed to update advertisement status");
      }
    } catch (error) {
      toast.error("Network connection error encountered");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Campaign Advertisements</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Promote up to 6 approved tickets onto the home display banner. Currently advertising:{" "}
          <span className="font-bold text-orange-600">{q}/6</span>
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-xl border-gray-200 dark:border-zinc-800 text-gray-400">
          No approved tickets available for promotion.
        </div>
      ) : (
        <>
          {/* MOBILE COMPACT CARDS RESPONSIVE GRID (Hidden on Medium Screens and above) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {tickets.map((ticket) => {
              const isMaxLimitReached = q >= 6;
              const isDisabled = togglingId === ticket._id || (isMaxLimitReached && !ticket.isAd);

              return (
                <div 
                  key={ticket._id} 
                  className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-zinc-100 line-clamp-1">{ticket.title}</h3>
                      <span className="shrink-0 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-xs font-medium capitalize text-gray-600 dark:text-zinc-400">
                        {ticket.transportType}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-1.5 text-xs text-gray-500 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        <span>{ticket.from} &rarr; {ticket.to}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-semibold text-gray-900 dark:text-zinc-200">${ticket.price}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{ticket.quantity} seats available</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleToggleAdvertise(ticket._id, ticket.isAd)}
                    className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                      ticket.isAd
                        ? 'bg-orange-600 text-white hover:bg-orange-700 disabled:hover:bg-orange-600'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700'
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

          {/* DESKTOP TABULAR VIEW GRID (Hidden on Mobile viewports) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  <th className="p-4">Title</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Available</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700 dark:divide-zinc-800 dark:text-zinc-300">
                {tickets.map((ticket) => {
                  const isMaxLimitReached = q >= 6;
                  const isDisabled = togglingId === ticket._id || (isMaxLimitReached && !ticket.isAd);

                  return (
                    <tr key={ticket._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-medium text-gray-900 dark:text-zinc-100">{ticket.title}</td>
                      <td className="p-4">{ticket.from} → {ticket.to}</td>
                      <td className="p-4 capitalize">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-xs">
                          {ticket.transportType}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">${ticket.price}</td>
                      <td className="p-4">{ticket.quantity} seats</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleToggleAdvertise(ticket._id, ticket.isAd)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                            ticket.isAd
                              ? 'bg-orange-600 text-white hover:bg-orange-700 disabled:hover:bg-orange-600'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700'
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