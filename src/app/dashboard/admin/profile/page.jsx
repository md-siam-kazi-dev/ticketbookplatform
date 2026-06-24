"use client";

import { useEffect, useState, useRef } from "react";
import { Pencil, Upload, X, User, Loader2 } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ─── SKELETON LOADING STATE ──────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-stone-200 dark:bg-neutral-800 shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-36 rounded-md bg-stone-200 dark:bg-neutral-800" />
          <div className="h-3 w-24 rounded-md bg-stone-100 dark:bg-neutral-850" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="h-3 w-20 rounded bg-stone-100 dark:bg-neutral-850" />
            <div className="h-5 w-48 rounded bg-stone-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INFO DATA FIELDS ────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
        {label}
      </span>
      <span className="text-sm font-medium text-stone-800 dark:text-stone-100 break-all">
        {value || "—"}
      </span>
    </div>
  );
}

// ─── PROFILE UPDATE MODAL ────────────────────────────────────────────────────

function EditProfileModal({ open, onClose, user, onSaved }) {
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName(user?.name || "");
      setFile(null);
      setPreview(null);
    }
  }, [user, open]);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const uploadToImgbb = async (imageFile) => {
    const form = new FormData();
    form.append("image", imageFile);
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      { method: "POST", body: form }
    );
    const data = await res.json();
    if (!data.success) throw new Error("Image upload failed");
    return data.data.url;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Name field cannot be left empty");
      return;
    }

    setSubmitting(true);
    try {
      let imgUrl = user?.img || "";
      if (file) {
        imgUrl = await uploadToImgbb(file);
      }

      const tokenResponse = await authClient.token();
      const tokenData = tokenResponse?.data;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/admin/getuser`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData?.token}`,
          },
          body: JSON.stringify({ name, img: imgUrl, email: user.email }),
        }
      );
      
      if (!res.ok) throw new Error("Update lifecycle failed");
      const updated = await res.json();
      
      onSaved(updated);
      toast.success("Profile records updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile settings");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-stone-900 dark:text-stone-50 text-base sm:text-lg font-bold">
            Edit Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Input Name field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your profile name"
              className="w-full rounded-xl border border-stone-200 dark:bg-neutral-900 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-850 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-50 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Asset Dropper Area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Avatar Display
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={[
                "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors py-8 px-4 text-center",
                dragging
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-500/5"
                  : "border-stone-200 dark:border-neutral-700 hover:border-orange-400 hover:bg-stone-50/50 dark:hover:bg-neutral-850/40",
              ].join(" ")}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {preview ? (
                <div className="relative group flex flex-col items-center">
                  <img
                    src={preview}
                    alt="Preview avatar target"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-stone-200 dark:border-neutral-700 flex items-center justify-center text-stone-500 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Click to replace file</p>
                </div>
              ) : (
                <>
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 dark:bg-neutral-800 text-stone-500 dark:text-stone-400">
                    <Upload size={18} />
                  </span>
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      Drop image or <span className="text-orange-500 font-semibold">browse</span>
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                      PNG, JPG, or WEBP formats up to 10 MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Trigger Row */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 transition-colors shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Profile Changes...</span>
              </>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── ADMIN DASHBOARD PROFILE MAIN WRAPPER ────────────────────────────────────

export default function AdminProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUser = async () => {
      try {
        const tokenResponse = await authClient.token();
        const tokenData = tokenResponse?.data;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/getuser/${session.user.email}`,
          { headers: { Authorization: `Bearer ${tokenData?.token}` }}
        );
        if (!res.ok) throw new Error("Could not extract active profile logs");
        const json = await res.json();
        setUser(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session?.user?.email,modalOpen]); // Safely targets initial connection arrays cleanly

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  return (
    <div className="w-full max-w-full">
      {/* Structural Profile Header section */}
      <div className="mb-6">
        <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50">
          Profile Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
          Review, analyze and manage your root administrative profile structures.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400">
          Error payload trace: {error}
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header Area Card Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {user?.img ? (
                  <img
                    src={user.img}
                    alt={user.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-stone-100 dark:ring-neutral-800"
                  />
                ) : (
                  <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                    <User size={28} />
                  </span>
                )}
                <div>
                  <p className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 leading-tight">
                    {user?.name}
                  </p>
                  <span className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/20 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-700 px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors shrink-0 sm:ml-auto"
              >
                <Pencil size={13} />
                Edit Profile
              </button>
            </div>

            <hr className="border-stone-100 dark:border-neutral-800" />

            {/* Matrix Data Display Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
              <InfoRow label="Email Address" value={user?.email} />
              <InfoRow
                label="Account Security Status"
                value={
                  <span className={`inline-flex items-center font-bold ${user?.isBlock ? "text-red-500" : "text-green-600"}`}>
                    {user?.isBlock ? "Suspended / Blocked" : "Active & Clear"}
                  </span>
                }
              />
              <InfoRow label="Registration Date" value={formatDate(user?.createdAt)} />
              <InfoRow label="Last Log Mutation" value={formatDate(user?.updatedAt)} />
            </div>
          </div>
        )}
      </div>

      {/* Edit Form Trigger Context */}
      {!loading && (
        <EditProfileModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          user={user}
          onSaved={(updated) => setUser(updated)}
        />
      )}
    </div>
  );
}