"use client";

import { useEffect, useState, useRef } from "react";
import { Pencil, Upload, X, User } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client"; // adjust path if needed
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      {/* avatar + name row */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-stone-200 dark:bg-neutral-700 shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-36 rounded-md bg-stone-200 dark:bg-neutral-700" />
          <div className="h-3 w-24 rounded-md bg-stone-100 dark:bg-neutral-800" />
        </div>
      </div>
      {/* info rows */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="h-3 w-20 rounded bg-stone-100 dark:bg-neutral-800" />
          <div className="h-5 w-64 rounded bg-stone-200 dark:bg-neutral-700" />
        </div>
      ))}
    </div>
  );
}

// ─── Info row ────────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
        {label}
      </span>
      <span className="text-sm text-stone-800 dark:text-stone-100 break-all">
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditProfileModal({ open, onClose, user, onSaved }) {
  const [name, setName] = useState(user?.name || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  // sync name when user loads
  useEffect(() => {
    setName(user?.name || "");
    setFile(null);
    setPreview(null);
  }, [user, open]);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
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
    
    setSubmitting(true);
    try {
      let imgUrl = user?.img || "";
      if (file) imgUrl = await uploadToImgbb(file);

      const {data:tokenData} =await authClient.token();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/admin/getuser`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.token}`,
          },
          body: JSON.stringify({ name, img: imgUrl, email: user.email }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      onSaved(updated);
      onClose();
      
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-stone-900 dark:text-stone-50 text-lg font-semibold">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 px-4 py-2.5 text-sm text-stone-900 dark:text-stone-50 outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Drop zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
              Profile Picture
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={[
                "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-colors py-8",
                dragging
                  ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10"
                  : "border-stone-200 dark:border-neutral-700 hover:border-orange-300 hover:bg-stone-50 dark:hover:bg-neutral-800/60",
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
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-orange-400"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-stone-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                  >
                    <X size={12} className="text-stone-600 dark:text-stone-300" />
                  </button>
                  <p className="text-xs text-stone-400">Click to change</p>
                </>
              ) : (
                <>
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-400">
                    <Upload size={20} />
                  </span>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Drop image here or{" "}
                    <span className="text-orange-500 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-600">
                    PNG, JPG, WEBP up to 10 MB
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 transition-colors"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
        const {data:tokenData} =await authClient.token();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/getuser/${session.user.email}`,
          { headers: { Authorization: `Bearer ${tokenData.token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const json = await res.json();
        setUser(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session?.user?.email, session,modalOpen]);

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  return (
    <div className=" ">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
          Profile
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Manage your admin profile details
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col gap-6">
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Avatar + name + edit btn */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {user?.img ? (
                  <img
                    src={user.img}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-stone-200 dark:ring-neutral-700"
                  />
                ) : (
                  <span className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <User size={32} />
                  </span>
                )}
                <div>
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-50 leading-tight">
                    {user?.name}
                  </p>
                  <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 shrink-0 rounded-xl border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-700 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-200 transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            </div>

            <hr className="border-stone-100 dark:border-neutral-800" />

            {/* Info fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow label="Email" value={user?.email} />
              <InfoRow
                label="Account Status"
                value={user?.isBlock ? "Blocked" : "Active"}
              />
              <InfoRow label="Member Since" value={formatDate(user?.createdAt)} />
              <InfoRow label="Last Updated" value={formatDate(user?.updatedAt)} />
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
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