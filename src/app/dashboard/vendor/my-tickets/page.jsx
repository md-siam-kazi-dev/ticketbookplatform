'use client';

import TicketCard from "@/components/dashboard/ticketCard";
import { authClient, useSession } from "@/lib/auth-client";
import { myTicket } from "@/lib/serverFunction/myticket";
import { ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [tickets, setTickets] = useState([]);
  const [issPending, setIsPending] = useState(true);
  const [user, setUser] = useState(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [load, setLoad] = useState(false);
  
  const { data, isPending: isSessionPending } = useSession();

  // 1. Fetch fresh user context from DB to avoid cached/stale data from useSession
  useEffect(() => {
    const fetchFreshUser = async () => {
      if (!data?.user?.email) return;

      try {
        setIsFetchingUser(true);
        const tokenResponse = await authClient.token();
        const tokenData = tokenResponse?.data;

        if (!tokenData?.token) throw new Error("No active authorization token found");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/getuser/${data.user.email}`,
          { 
            headers: { 
              'Authorization': `Bearer ${tokenData.token}` 
            }
          }
        );
        
        if (!res.ok) throw new Error("Could not extract active profile logs");
        
        const json = await res.json();
        const userProfile = Array.isArray(json) ? json[0] : json;
        setUser(userProfile);
      } catch (err) {
        toast.error(err.message || "Failed to sync active profile status");
      } finally {
        setIsFetchingUser(false);
      }
    };

    if (!isSessionPending) {
      fetchFreshUser();
    }
  }, [data, isSessionPending]);

  // 2. Fetch tickets when user context has successfully resolved
  useEffect(() => {
    const getTicketData = async () => {
      if (isFetchingUser || !user) return;

      try {
        setIsPending(true);
        const ticketss = await myTicket(user);
        setTickets(ticketss || []);
      } catch (error) {
        toast.error("Failed to load your ticket collections");
      } finally {
        setIsPending(false);
      }
    };

    getTicketData();
  }, [user, isFetchingUser, load]);

  // Loading skeleton state wrapper
  if (isSessionPending || isFetchingUser) {
    return (
      <div className="p-2 w-full space-y-4 max-w-full box-border animate-pulse">
        <div className="h-8 w-48 bg-stone-200 dark:bg-neutral-800 rounded-xl" />
        <div className="h-4 w-64 bg-stone-200 dark:bg-neutral-800 rounded-xl mb-10" />
        <div className="h-48 w-full bg-stone-100 dark:bg-neutral-900/60 rounded-2xl border border-stone-200 dark:border-neutral-800" />
      </div>
    );
  }

  // Account enforcement restricted shield
  if (user?.isBlock) {
    return (
      <div className="w-full mx-auto p-2 max-w-full box-border">
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-stone-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 py-16 px-6 gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
            <ShieldOff className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">Account Restricted</h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Your account has been flagged for fraudulent activity. You are not allowed to view or manage tickets. Please contact support if you believe this is a mistake.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 w-full max-w-full box-border min-w-0">
      {/* Dynamic Header Frame */}
      <div className="mb-8 min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 truncate">
          Vendor — My Tickets
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 truncate">
          Manage, verify, and monitor custom ticket offers you've added to the platform.
        </p>
      </div>

      {/* Main Table/Card Container Context */}
      <div className="w-full max-w-full box-border">
        <TicketCard 
          tickets={tickets} 
          isLoading={issPending} 
          setLoad={setLoad}
        />
      </div>
    </div>
  );
}