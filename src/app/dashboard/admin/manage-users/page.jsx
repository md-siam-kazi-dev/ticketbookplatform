"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Store,
  Ban,
  Loader2,
  Mail,
  User2,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getAdminUser } from "@/lib/serverFunction/getAdminUser";
import { email } from "zod";

const ROLE_STYLES = {
  user:
    "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20",
  vendor:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  admin:
    "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
};

const FILTER_TABS = ["all", "user", "vendor", "admin", "blocked"];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUser();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, optimisticPatch,email) => {
    const key = `${id}-${action}`;
    setActionId(key);

    const role = optimisticPatch?.role;
    const prevUsers = users;
    
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, ...optimisticPatch } : u))
    );

    if (optimisticPatch.isBlock) {
      const isFraud = true;
      try {
        const { data } = await authClient.token();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/admin/users`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ id, isFraud,email }),
        });

        if (!res.ok) throw new Error("Request failed");

        toast.success("Vendor marked as fraud — tickets hidden");
        return; 
      } catch (err) {
        setUsers(prevUsers);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setActionId(null);
      }
    }

    try {
      const { data:tokenData } = await authClient.token();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/admin/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({ id, role ,email}),
      });

      if (!res.ok) throw new Error("Request failed");

      const successMessage = {
        makeAdmin: "User promoted to Admin",
        makeVendor: "User promoted to Vendor",
      };
      toast.success(successMessage[action]);
    } catch (err) {
      setUsers(prevUsers);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "blocked") return u.isBlock;
    return u.role === filter;
  });

  const initials = (name) =>
    name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "??";

  return (
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden w-full max-w-full">
      {/* Header section with adaptive stacking for different screens */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 py-5 border-b border-stone-200 dark:border-neutral-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50">
            Manage Users
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            View all platform users and manage their roles
          </p>
        </div>

        {/* Filter tabs — Horizontally scrollable on small viewports with custom scroll container */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-neutral-800 rounded-xl p-1 w-full lg:w-auto overflow-x-auto scrollbar-none max-w-full touch-pan-x">
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

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          <Loader2 size={20} className="animate-spin mx-auto mb-2" />
          Loading users...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          No {filter !== "all" ? filter : ""} users found.
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <>
          {/* ── DESKTOP & TABLET TABLE (Visible from xl screens up) ── */}
          <div className="hidden xl:block overflow-x-auto w-full">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800/50">
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-6 py-3.5 whitespace-nowrap">User</th>
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-4 py-3.5 whitespace-nowrap">Email</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-4 py-3.5 whitespace-nowrap">Role</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-4 py-3.5 whitespace-nowrap">Status</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-6 py-3.5 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isVendor = u.role === "vendor";
                  const busyAdmin = actionId === `${u._id}-makeAdmin`;
                  const busyVendor = actionId === `${u._id}-makeVendor`;
                  const busyFraud = actionId === `${u._id}-markFraud`;

                  return (
                    <tr
                      key={u._id}
                      className="border-b border-stone-100 dark:border-neutral-800 last:border-0 hover:bg-stone-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.img ? (
                            <img src={u.img} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <span className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                              {initials(u.name)}
                            </span>
                          )}
                          <p className="font-medium text-stone-900 dark:text-stone-50 truncate max-w-[180px]">
                            {u.name}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-stone-500 dark:text-stone-400">
                        <span className="break-all">{u.email}</span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className={["inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize border border-transparent", ROLE_STYLES[u.role]].join(" ")}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {u.isBlock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                            <Ban size={11} /> Fraud
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                            <CheckCircle2 size={11} /> Active
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap min-h-[32px]">
                          {u.isBlock || isAdmin ? (
                            <span className="text-xs text-stone-400 dark:text-stone-500 italic">No actions</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleAction(u._id, "makeAdmin", { role: "admin" },u.email)}
                                disabled={busyAdmin}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-purple-700 dark:text-purple-400 text-xs font-semibold transition-colors whitespace-nowrap"
                              >
                                {busyAdmin ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                                Make Admin
                              </button>

                              {!isVendor && (
                                <button
                                  onClick={() => handleAction(u._id, "makeVendor", { role: "vendor" },u.email)}
                                  disabled={busyVendor}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 dark:text-blue-400 text-xs font-semibold transition-colors whitespace-nowrap"
                                >
                                  {busyVendor ? <Loader2 size={12} className="animate-spin" /> : <Store size={12} />}
                                  Make Vendor
                                </button>
                              )}

                              {isVendor && (
                                <button
                                  onClick={() => handleAction(u._id, "markFraud", { isBlock: true },u.email)}
                                  disabled={busyFraud}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-xs font-semibold transition-colors whitespace-nowrap"
                                >
                                  {busyFraud ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                                  Mark as Fraud
                                </button>
                              )}
                            </>
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
          <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-stone-50/50 dark:bg-neutral-950/20">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === "admin";
              const isVendor = u.role === "vendor";
              const busyAdmin = actionId === `${u._id}-makeAdmin`;
              const busyVendor = actionId === `${u._id}-makeVendor`;
              const busyFraud = actionId === `${u._id}-markFraud`;

              return (
                <div 
                  key={u._id} 
                  className="p-4 sm:p-5 flex flex-col justify-between gap-4 bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800/80 rounded-xl shadow-sm"
                >
                  <div>
                    {/* User Profile Header inside card */}
                    <div className="flex items-start gap-3">
                      {u.img ? (
                        <img src={u.img} alt={u.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">
                          {initials(u.name)}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-900 dark:text-stone-50 text-sm sm:text-base truncate flex items-center gap-1.5">
                          <User2 size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                          {u.name}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 mt-1 break-all">
                          <Mail size={12} className="shrink-0" />
                          {u.email}
                        </p>
                      </div>
                    </div>

                    {/* Status & Badges segment */}
                    <div className="flex items-center gap-2 mt-4">
                      <span className={["inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border border-transparent", ROLE_STYLES[u.role]].join(" ")}>
                        {u.role}
                      </span>
                      {u.isBlock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                          <Ban size={10} /> Fraud
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  {u.isBlock || isAdmin ? (
                    <p className="text-center text-xs text-stone-400 dark:text-stone-500 italic pt-2 border-t border-stone-100 dark:border-neutral-800/80">
                      No actions available
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2 pt-3 border-t border-stone-100 dark:border-neutral-800/80">
                      <div className="flex flex-row items-center gap-2">
                        <button
                          onClick={() => handleAction(u._id, "makeAdmin", { role: "admin" },u.email)}
                          disabled={busyAdmin}
                          className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-purple-700 dark:text-purple-400 text-xs font-semibold transition-colors"
                        >
                          {busyAdmin ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                          Make Admin
                        </button>

                        {!isVendor && (
                          <button
                            onClick={() => handleAction(u._id, "makeVendor", { role: "vendor" },u.email)}
                            disabled={busyVendor}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 dark:text-blue-400 text-xs font-semibold transition-colors"
                          >
                            {busyVendor ? <Loader2 size={13} className="animate-spin" /> : <Store size={13} />}
                            Make Vendor
                          </button>
                        )}
                      </div>

                      {isVendor && (
                        <button
                          onClick={() => handleAction(u._id, "markFraud", { isBlock: true },u.email)}
                          disabled={busyFraud}
                          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
                        >
                          {busyFraud ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
                          Mark as Fraud
                        </button>
                      )}
                    </div>
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