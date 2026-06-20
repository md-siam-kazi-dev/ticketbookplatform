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

/**
 * TicketLagbe — Admin: Manage Users
 *
 * Responsive: full table on md+ screens, stacked cards on mobile.
 * Actions:
 *  - Make Admin  -> sets role: "admin"
 *  - Make Vendor -> sets role: "vendor"
 *  - Mark as Fraud (vendor only) -> sets isBlock: true, hides their tickets
 *
 * Expects:
 *   GET   /api/admin/users                   -> array of user documents
 *   PATCH /api/admin/users  { id, action }    -> action: "makeAdmin" | "makeVendor" | "markFraud"
 *
 * Schema (matches what you provided):
 * {
 *   _id, name, email, emailVerified, createdAt, updatedAt,
 *   role: "user" | "vendor" | "admin",
 *   id, isBlock, img, userInfo, vendorInfo
 * }
 */

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
  const [actionId, setActionId] = useState(null); // `${id}-${action}` currently in flight

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUser();
      console.log(data)
      setUsers(data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, optimisticPatch) => {
    const key = `${id}-${action}`;
    setActionId(key);

    const role = optimisticPatch?.role;

    const prevUsers = users;
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, ...optimisticPatch } : u))
    );

    if(optimisticPatch.isBlock){
      const isFraud = true;
      try {
      const { data } = await authClient.token();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/admin/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({ id, isFraud  }),
      });

      if (!res.ok) throw new Error("Request failed");

      const successMessage = {
        makeAdmin: "User promoted to Admin",
        makeVendor: "User promoted to Vendor",
        markFraud: "Vendor marked as fraud — tickets hidden",
      };
      toast.success(successMessage[action]);
    } catch (err) {
      setUsers(prevUsers);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setActionId(null);
    }
      

    }

    try {
      const { data } = await authClient.token();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/admin/users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({ id, role}),
      });

      if (!res.ok) throw new Error("Request failed");

      const successMessage = {
        makeAdmin: "User promoted to Admin",
        makeVendor: "User promoted to Vendor",
        markFraud: "Vendor marked as fraud — tickets hidden",
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
    <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-5 border-b border-stone-200 dark:border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
            Manage Users
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            View all platform users and manage their roles
          </p>
        </div>

        {/* Filter tabs — horizontally scrollable on mobile */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-neutral-800 rounded-xl p-1 w-fit overflow-x-auto max-w-full">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap shrink-0",
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

      {/* Loading */}
      {loading && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          <Loader2 size={20} className="animate-spin mx-auto mb-2" />
          Loading users...
        </div>
      )}

      {/* Empty */}
      {!loading && filteredUsers.length === 0 && (
        <div className="px-6 py-16 text-center text-stone-400 dark:text-stone-500">
          No {filter !== "all" ? filter : ""} users found.
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <>
          {/* ── DESKTOP TABLE (md and up) ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800/50">
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-6 py-3 whitespace-nowrap">User</th>
                  <th className="text-left font-semibold text-stone-500 dark:text-stone-400 px-4 py-3 whitespace-nowrap">Email</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-4 py-3 whitespace-nowrap">Role</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="text-center font-semibold text-stone-500 dark:text-stone-400 px-6 py-3 whitespace-nowrap">Actions</th>
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
                      {/* User: avatar + name */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          {u.img ? (
                            <img
                              src={u.img}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <span className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                              {initials(u.name)}
                            </span>
                          )}
                          <p className="font-medium text-stone-900 dark:text-stone-50 truncate max-w-[160px]">
                            {u.name}
                          </p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-stone-500 dark:text-stone-400">
                        <span className="break-all">{u.email}</span>
                      </td>

                      {/* Role badge */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={["inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize border", ROLE_STYLES[u.role]].join(" ")}>
                          {u.role}
                        </span>
                      </td>

                      {/* Block status */}
                      <td className="px-4 py-3.5 text-center">
                        {u.isBlock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                            <Ban size={11} />
                            Fraud
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                            <CheckCircle2 size={11} />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {!isAdmin && (
                            <button
                              onClick={() => handleAction(u._id, "makeAdmin", { role: "admin" })}
                              disabled={busyAdmin}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-purple-700 dark:text-purple-400 text-xs font-semibold transition-colors whitespace-nowrap"
                            >
                              {busyAdmin ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                              Make Admin
                            </button>
                          )}

                          {!isVendor && !isAdmin && (
                            <button
                              onClick={() => handleAction(u._id, "makeVendor", { role: "vendor" })}
                              disabled={busyVendor}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 dark:text-blue-400 text-xs font-semibold transition-colors whitespace-nowrap"
                            >
                              {busyVendor ? <Loader2 size={12} className="animate-spin" /> : <Store size={12} />}
                              Make Vendor
                            </button>
                          )}

                          {isVendor && !u.isBlock && (
                            <button
                              onClick={() => handleAction(u._id, "markFraud", { isBlock: true })}
                              disabled={busyFraud}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-xs font-semibold transition-colors whitespace-nowrap"
                            >
                              {busyFraud ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                              Mark as Fraud
                            </button>
                          )}

                          {isAdmin && (
                            <span className="text-xs text-stone-400 dark:text-stone-500 italic">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS (below md) ── */}
          <div className="md:hidden divide-y divide-stone-100 dark:divide-neutral-800">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === "admin";
              const isVendor = u.role === "vendor";
              const busyAdmin = actionId === `${u._id}-makeAdmin`;
              const busyVendor = actionId === `${u._id}-makeVendor`;
              const busyFraud = actionId === `${u._id}-markFraud`;

              return (
                <div key={u._id} className="p-4 flex flex-col gap-3">

                  {/* Top row: avatar + name + role badge */}
                  <div className="flex items-start gap-3">
                    {u.img ? (
                      <img
                        src={u.img}
                        alt={u.name}
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">
                        {initials(u.name)}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 dark:text-stone-50 leading-snug flex items-center gap-1.5">
                        <User2 size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                        {u.name}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 mt-1 break-all">
                        <Mail size={12} className="shrink-0" />
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Role + status badges — own row */}
                  <div className="flex items-center gap-2">
                    <span className={["inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize border", ROLE_STYLES[u.role]].join(" ")}>
                      {u.role}
                    </span>
                    {u.isBlock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                        <Ban size={10} />
                        Fraud
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                        <CheckCircle2 size={10} />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Actions — stacked, full width, roomy */}
                  {!isAdmin ? (
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(u._id, "makeAdmin", { role: "admin" })}
                          disabled={busyAdmin}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-purple-700 dark:text-purple-400 text-sm font-semibold transition-colors"
                        >
                          {busyAdmin ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                          Make Admin
                        </button>

                        {!isVendor && (
                          <button
                            onClick={() => handleAction(u._id, "makeVendor", { role: "vendor" })}
                            disabled={busyVendor}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 dark:text-blue-400 text-sm font-semibold transition-colors"
                          >
                            {busyVendor ? <Loader2 size={15} className="animate-spin" /> : <Store size={15} />}
                            Make Vendor
                          </button>
                        )}
                      </div>

                      {isVendor && !u.isBlock && (
                        <button
                          onClick={() => handleAction(u._id, "markFraud", { isBlock: true })}
                          disabled={busyFraud}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-sm font-semibold transition-colors"
                        >
                          {busyFraud ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
                          Mark as Fraud
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-stone-400 dark:text-stone-500 italic pt-1">
                      No actions available for admins
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