'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Megaphone, MegaphoneOff, Loader2 } from 'lucide-react';

export default function AdminAdManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // Fetch all approved tickets on load
  useEffect(() => {
    const fetchApprovedTickets = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/allticket`);
        const data = await res.json();
        
        // Filter out only admin-approved tickets
        const approvedTickets = data.filter(t => t.verificationStatus === 'approved');
        setTickets(approvedTickets);
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

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/ad/ticket`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, isAdvertised: newStatus })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Optimistically update frontend state list
        setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, isAdvertised: newStatus } : t));
        toast.success(newStatus ? "Ticket pinned to advertisements!" : "Advertisement removed");
      } else {
        // Throws error safely if backend rules block execution (e.g., limit > 6 rule triggered)
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
          <span className="font-bold text-orange-600">{tickets.filter(t => t.isAdvertised).length}/6</span>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">No approved tickets available for promotion.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-medium text-gray-900 dark:text-zinc-100">{ticket.title}</td>
                  <td className="p-4">{ticket.from} → {ticket.to}</td>
                  <td className="p-4 capitalize"><span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-xs">{ticket.transportType}</span></td>
                  <td className="p-4 font-semibold">${ticket.price}</td>
                  <td className="p-4">{ticket.quantity} seats</td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      disabled={togglingId === ticket._id}
                      onClick={() => handleToggleAdvertise(ticket._id, ticket.isAdvertised)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                        ticket.isAdvertised
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {togglingId === ticket._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : ticket.isAdvertised ? (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}