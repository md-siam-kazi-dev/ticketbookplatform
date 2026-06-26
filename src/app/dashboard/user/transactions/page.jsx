"use client";

import { useState, useEffect } from "react";
import { TrainFront, Loader2 } from "lucide-react";
import { getUserTransactions } from "@/lib/serverFunction/getUserTransactions";
import { authClient, useSession } from "@/lib/auth-client";

const statusStyle = {
  paid: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
};

function fmtDate(d) {
  if (!d) return { day: "—", time: "—" };
  const dt = new Date(d);
  return {
    day: dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function TransactionHistory() {
  const { data: session, isPending: sessionPending } = useSession();
  
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionPending) return;
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data: tokenData } = await authClient.token();
        const data = await getUserTransactions(session.user.email, tokenData?.token);
        setTxns(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTxns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session, sessionPending]);

  // Aggregate metrics derived directly from the backend-filtered dataset
  const totalSpent = txns.reduce((s, t) => s + (t.totalPrice || 0), 0);
  const totalSeats = txns.reduce((s, t) => s + (t.quantity || 0), 0);
  const lastTxn = txns.length > 0 
    ? [...txns].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0] 
    : null;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden w-full">

      {/* Header - Cleaned up to show text only */}
      <div className="px-4 sm:px-6 py-5 border-b border-stone-200 dark:border-neutral-800">
        <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50">Transaction history</h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">All your Stripe payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 sm:px-6 py-4 border-b border-stone-200 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-950/20">
        {[
          { label: "Total spent", value: `৳${totalSpent.toLocaleString("en-IN")}`, sub: `${txns.length} transactions` },
          { label: "Seats reserved", value: totalSeats, sub: "tickets booked" },
          { label: "Last payment", value: lastTxn ? fmtDate(lastTxn.paymentDate).day : "—", sub: lastTxn?.isPaid ? "Paid" : "Pending" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 rounded-xl p-3">
            <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-xl font-bold text-stone-900 dark:text-stone-50">{s.value}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="py-16 text-center text-stone-400">
          <Loader2 size={20} className="animate-spin mx-auto mb-2" />
          Loading...
        </div>
      )}
      
      {!loading && txns.length === 0 && (
        <div className="py-16 text-center text-stone-400 dark:text-stone-500">
          No transactions found.
        </div>
      )}

      {!loading && txns.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800/50">
                  {["Transaction ID", "Ticket", "Amount", "Payment date", "Status"].map((h, i) => (
                    <th key={h} className={`px-${i===0||i===4?6:4} py-3.5 text-xs font-semibold text-stone-500 dark:text-stone-400 whitespace-nowrap ${i===2?"text-right":i===4?"text-center":"text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.map(t => {
                  const { day, time } = fmtDate(t.paymentDate);
                  const status = t.isPaid ? "paid" : "pending";
                  return (
                    <tr key={t._id} className="border-b border-stone-100 dark:border-neutral-800 last:border-0 hover:bg-stone-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-xs bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 px-2 py-0.5 rounded text-stone-600 dark:text-stone-400 max-w-[140px] truncate inline-block" title={t.transactionId || "Processing ID"}>
                          {t.transactionId ? `${t.transactionId.slice(0, 22)}…` : "Pending ID"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-stone-50 max-w-[200px] truncate">{t.title}</p>
                            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{t.quantity} seat{t.quantity > 1 ? "s" : ""} · departs {fmtDate(t.departureDateTime).day}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <p className="font-bold text-stone-900 dark:text-stone-50">৳{(t.totalPrice || 0).toLocaleString("en-IN")}</p>
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">৳{(t.price || 0).toLocaleString("en-IN")} / seat</p>
                      </td>
                      <td className="px-4 py-3.5 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {day} · {time}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${statusStyle[status]}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-stone-50/50 dark:bg-neutral-950/20">
            {txns.map(t => {
              const { day } = fmtDate(t.paymentDate);
              const status = t.isPaid ? "paid" : "pending";
              return (
                <div key={t._id} className="bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800/80 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3 justify-between">
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                      <TrainFront size={15} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm truncate">{t.title}</p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{t.quantity} seat{t.quantity > 1 ? "s" : ""}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${statusStyle[status]}`}>{status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 dark:bg-neutral-800/40 rounded-xl p-3 text-xs">
                    {[["Amount", `৳${(t.totalPrice || 0).toLocaleString("en-IN")}`], ["Per seat", `৳${(t.price || 0).toLocaleString("en-IN")}`], ["Payment date", day], ["Departure", fmtDate(t.departureDateTime).day]].map(([l, v]) => (
                      <div key={l}>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-0.5">{l}</p>
                        <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">{v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-neutral-800/80">
                    <span className="font-mono text-[10px] text-stone-400 truncate flex-1">{t.transactionId || "Pending Transaction ID"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}