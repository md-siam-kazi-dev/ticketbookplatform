"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { BadgeCheck, Calendar, Ticket, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const handlePaymentSuccess = async () => {
      try {
        // 1. Fetch checkout details from our secure API handler
        const res = await fetch(`/api/get-session?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to verify session");

        // 2. If paid, process database updates
        if (data.paymentStatus === "paid") {
          setMetadata(data.metadata);

          // ─── UPDATE YOUR DATABASE HERE ───────────────────────────────────────
          // Call your existing booking update API or internal handler
          // const dbUpdate = await fetch("/api/bookings/update-status", {
          //   method: "PUT",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({
          //     bookingId: data.metadata.bookingId,
          //     status: "paid",
          //   }),
          // });
          // ─────────────────────────────────────────────────────────────────────
          
          console.log("Success! Booking ID:", data.metadata.bookingId);
        } else {
          setError("This payment dynamic was not successfully completed.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Could not verify your payment transaction context.");
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-neutral-950 px-4">
        <Loader2 size={36} className="animate-spin text-orange-600 dark:text-orange-500 mb-3" />
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Verifying your ticket bill payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-neutral-950 px-4 text-center">
        <AlertCircle size={40} className="text-red-500 mb-3 animate-pulse" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">Verification Failed</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xs">{error}</p>
        <button 
          onClick={() => router.push("/")} 
          className="mt-5 text-xs font-semibold px-4 py-2 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-neutral-950 px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-3xl p-8 text-center shadow-xl shadow-stone-200/50 dark:shadow-none">
        
        {/* Animated Check Icon */}
        <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-green-100 dark:ring-green-500/5 animate-bounce">
          <BadgeCheck size={36} />
        </div>

        {/* Header Titles */}
        <h1 className="text-2xl font-black text-stone-900 dark:text-stone-50 tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 font-medium">
          Thank you for choosing <span className="text-orange-600 dark:text-orange-500 font-bold">ticket lagbe</span>. Your booking is confirmed.
        </p>

        {/* Ticket Mockup / Info Box */}
        <div className="my-8 border border-dashed border-stone-200 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-800/30 rounded-2xl p-5 text-left relative overflow-hidden">
          {/* Decorative Side Ticket Notches */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-stone-50 dark:bg-neutral-950 rounded-full border border-stone-200 dark:border-neutral-800 -translate-y-1/2" />
          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-stone-50 dark:bg-neutral-950 rounded-full border border-stone-200 dark:border-neutral-800 -translate-y-1/2" />

          {/* Dynamic Booking Reference Display */}
          {metadata?.bookingId && (
            <div className="flex items-start gap-3 min-w-0 pb-4 border-b border-stone-100 dark:border-neutral-800">
              <Ticket size={18} className="text-orange-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Booking ID</span>
                <p className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300 mt-0.5 truncate">
                  {metadata.bookingId}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3 min-w-0 mt-4">
            <Calendar size={18} className="text-orange-500 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest block">Status</span>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-0.5">
                Ticket Issued & Active
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-stone-50 text-sm font-semibold transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to My Home
        </button>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-neutral-950">
        <Loader2 size={24} className="animate-spin text-stone-400" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}