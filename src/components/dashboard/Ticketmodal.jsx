"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client"; // adjust path as needed
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────
// UPDATE MODAL
// ─────────────────────────────────────────────
export const UpdateTicketModal = ({ ticket, open,setLoad, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    from: "",
    to: "",
    transportType: "",
    price: "",
    quantity: "",
    departureDateTime: "",
    
    perks: [],
  });
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Populate form when ticket changes
  useEffect(() => {
    if (ticket) {
      // Convert ISO string → datetime-local format (strip the "Z" and trailing seconds if needed)
      const localDT = ticket.departureDateTime
        ? new Date(ticket.departureDateTime).toISOString().slice(0, 16)
        : "";

      setForm({
        title: ticket.title ?? "",
        from: ticket.from ?? ticket.fromLocation ?? "",
        to: ticket.to ?? ticket.toLocation ?? "",
        transportType: ticket.transportType ?? "",
        price: ticket.price ?? "",
        quantity: ticket.quantity ?? "",
        departureDateTime: localDT,
        
        perks: ticket.perks ?? [],
      });
      setError("");
    }
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePerksChange = (e) => {
    // Store perks as comma-separated string in UI, convert to array on submit
    setForm((prev) => ({ ...prev, perks: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const {data:tokenData} = await authClient.token();

      const payload = {
        id:ticket._id,
        title: form.title,
        from: form.from,
        to: form.to,
        transportType: form.transportType,
        price: Number(form.price),
        quantity: Number(form.quantity),
        departureDateTime: new Date(form.departureDateTime).toISOString(),
        
        perks:
          typeof form.perks === "string"
            ? form.perks.split(",").map((p) => p.trim()).filter(Boolean)
            : form.perks,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/ticket/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      setLoad((prev) => !prev)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to update ticket.");
      }

      onSuccess?.();
      onClose();
      router.refresh()
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg w-full dark:bg-zinc-900 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-zinc-100">
            Update Ticket
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-zinc-400 text-sm">
            Edit the fields below and save your changes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="title" className="dark:text-zinc-300">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Dhaka To Chandpur"
              className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-100"
            />
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="from" className="dark:text-zinc-300">
                From
              </Label>
              <Input
                id="from"
                name="from"
                value={form.from}
                onChange={handleChange}
                placeholder="Departure location"
                className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="to" className="dark:text-zinc-300">
                To
              </Label>
              <Input
                id="to"
                name="to"
                value={form.to}
                onChange={handleChange}
                placeholder="Arrival location"
                className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Transport Type */}
          <div className="grid gap-1.5">
            <Label className="dark:text-zinc-300">Transport Type</Label>
            <Select
              value={form.transportType}
              onValueChange={(val) =>
                setForm((prev) => ({ ...prev, transportType: val }))
              }
            >
              <SelectTrigger className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-100">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-900 dark:border-zinc-700">
                {["bus", "train", "ferry", "plane", "other"].map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price / Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="price" className="dark:text-zinc-300">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="200"
                className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quantity" className="dark:text-zinc-300">
                Seats
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="18"
                className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Departure Date & Time */}
          <div className="grid gap-1.5">
            <Label htmlFor="departureDateTime" className="dark:text-zinc-300">
              Departure Date & Time
            </Label>
            <Input
              id="departureDateTime"
              name="departureDateTime"
              type="datetime-local"
              value={form.departureDateTime}
              onChange={handleChange}
              className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-100 [color-scheme:dark]"
            />
          </div>

          {/* Image URL */}
          

          {/* Perks */}
          <div className="grid gap-1.5">
            <Label htmlFor="perks" className="dark:text-zinc-300">
              Perks{" "}
              <span className="text-xs text-gray-400 font-normal">
                (comma-separated)
              </span>
            </Label>
            <Input
              id="perks"
              name="perks"
              value={
                Array.isArray(form.perks) ? form.perks.join(", ") : form.perks
              }
              onChange={handlePerksChange}
              placeholder="AC, WiFi, Snacks"
              className="dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-100"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white focus-visible:ring-orange-600"
          >
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────
// DELETE MODAL
// ─────────────────────────────────────────────
export const DeleteTicketModal = ({ ticketId,setLoad, ticketTitle, open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const {data:tokenData} = await authClient.token();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/ticket/${ticketId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to delete ticket.");
      }

      onSuccess?.();
      onClose();
      setLoad((prev) => !prev)
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm w-full dark:bg-zinc-900 dark:border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            {/* Trash icon */}
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/40 flex-shrink-0">
              <svg
                className="w-5 h-5 text-rose-600 dark:text-rose-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </span>
            <DialogTitle className="text-gray-900 dark:text-zinc-100">
              Delete Ticket
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700 dark:text-zinc-300">
              "{ticketTitle}"
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-rose-500 dark:text-rose-400 -mt-1">
            {error}
          </p>
        )}

        <DialogFooter className="pt-1">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-600"
          >
            {loading ? "Deleting…" : "Delete Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};