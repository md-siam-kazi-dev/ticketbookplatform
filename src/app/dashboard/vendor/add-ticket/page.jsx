"use client";

import AddTicketFormSkeleton from '@/components/loadinganimation/addTicketSkeletion';
import { authClient, useSession } from '@/lib/auth-client';
import { Clock, DollarSign, MapPin, ShieldCheck, ShieldOff, Ticket, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AddTicketForm() {
  const router = useRouter();
  const { data, isPending } = useSession();
  const [user, setUser] = useState(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    from: '',
    to: '',
    transportType: '',
    price: '',
    quantity: '',
    departureDateTime: '',
    perks: [],
    image: ''
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the latest fresh profile logs directly using the authenticated token data
  useEffect(() => {
    const fetchUser = async () => {
      // Ensure we have active session email context before requesting details
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
        // Fallback to json directly if your backend returns an object instead of an array
        const userProfile = Array.isArray(json) ? json[0] : json;
        setUser(userProfile);
      } catch (err) {
        toast.error(err.message || "Failed to retrieve fresh user status");
      } finally {
        setIsFetchingUser(false);
      }
    };

    if (mounted && !isPending) {
      fetchUser();
    }
  }, [data, isPending, mounted]);

  const vendorName = user?.name || "Loading Vendor...";
  const vendorEmail = user?.email || "loading@vendor.com";
  const vendorId = user?.id || "664a1f2e8c3b4d001e8a1001";

  const perksOptions = [
    { id: 'ac', label: 'Air Conditioning (AC)' },
    { id: 'breakfast', label: 'Complimentary Breakfast' },
    { id: 'wifi', label: 'Free Wi-Fi' },
    { id: 'charging', label: 'Power Outlets' },
    { id: 'luggage', label: 'Extra Luggage Space' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePerkChange = (perkId, checked) => {
    setFormData(prev => {
      const updatedPerks = checked 
        ? [...prev.perks, perkId]
        : prev.perks.filter(id => id !== perkId);
      return { ...prev, perks: updatedPerks };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const imgbbApiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY; 
    const body = new FormData();
    body.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: 'POST',
        body: body
      });
      const result = await response.json();
      if (result.success) {
        setFormData(prev => ({ ...prev, image: result.data.url }));
      }
    } catch (error) {
      toast.error(error.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentTimestamp = new Date().toISOString();

    const completeSubmission = {
      title: formData.title,
      from: formData.from,
      to: formData.to,
      transportType: formData.transportType,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      departureDateTime: formData.departureDateTime ? new Date(formData.departureDateTime).toISOString() : currentTimestamp,
      perks: formData.perks,
      image: formData.image,
      vendorId: vendorId,
      vendorName: vendorName,
      vendorEmail: vendorEmail,
      verificationStatus: "pending",
      totalSold: 0,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      isAd: false,
    };
    
    try {
      const { data: tokenData } = await authClient.token();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`
        },
        body: JSON.stringify(completeSubmission),
      });
      
      const msg = await res.json();
      if (res.ok) {
        toast.success('New Added Ticket Waiting for Approval');
        router.push('/dashboard/vendor/my-tickets');
      } else {
        toast.error(msg.message || 'Failed to add ticket');
      }
    } catch (error) {
      toast.error('An error occurred during listing configuration');
    }
  };

  if (isPending || !mounted || isFetchingUser) {
    return <AddTicketFormSkeleton />;
  }

  if (user?.isBlock) {
    return (
      <div className="w-full mx-auto max-w-full box-border">
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-stone-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 py-16 px-6 gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
            <ShieldOff className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">Account Restricted</h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Your account has been flagged for fraudulent activity. You are not allowed to add new tickets. Please contact support if you believe this is a mistake.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-full box-border min-w-0">
      {/* Header Section */}
      <div className="mb-8 min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 truncate">
          Create New Ticket
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 truncate">
          Fill in the details below to list a new travel ticket on the platform.
        </p>
      </div>
       
      {/* Container Wrapper */}
      <div className="rounded-2xl border bg-white border-stone-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800 overflow-hidden w-full max-w-full box-border">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 w-full max-w-full box-border">
          
          {/* Ticket Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Ticket Title
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Premium AC Sleeper - Dhaka to Cox's Bazar"
              value={formData.title}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-stone-600 transition-all shadow-sm"
            />
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" /> From (Location)
              </label>
              <input
                type="text"
                name="from"
                required
                placeholder="Origin city or terminal"
                value={formData.from}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-stone-600 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" /> To (Location)
              </label>
              <input
                type="text"
                name="to"
                required
                placeholder="Destination city or terminal"
                value={formData.to}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-stone-600 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Transport Type, Price, Quantity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Transport Type
              </label>
              <select
                name="transportType"
                required
                value={formData.transportType}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100 transition-all shadow-sm"
              >
                <option value="" disabled>Select Type</option>
                <option value="bus">Bus</option>
                <option value="train">Train</option>
                <option value="flight">Flight</option>
                <option value="ferry">Ferry/Launch</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Price (per unit)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-stone-600 transition-all shadow-sm"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Ticket Quantity
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="1"
                placeholder="Total seats available"
                value={formData.quantity}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100 dark:placeholder:text-stone-600 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Departure Date & Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Departure Date & Time
            </label>
            <input
              type="datetime-local"
              name="departureDateTime"
              required
              value={formData.departureDateTime}
              onChange={handleInputChange}
              suppressHydrationWarning
              className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100 transition-all shadow-sm"
            />
          </div>

          {/* Perks */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Perks & Amenities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-stone-50/50 border border-stone-100 rounded-xl p-4 dark:bg-neutral-950/20 dark:border-neutral-800">
              {perksOptions.map((perk) => (
                <div key={perk.id} className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id={perk.id}
                    checked={formData.perks.includes(perk.id)}
                    onChange={(e) => handlePerkChange(perk.id, e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-600 accent-orange-600 dark:border-neutral-700 dark:bg-neutral-950 transition-all cursor-pointer"
                  />
                  <label htmlFor={perk.id} className="text-sm font-medium text-stone-600 dark:text-stone-400 cursor-pointer select-none">
                    {perk.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload Component */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Ticket / Vehicle Image
            </label>

            {formData.image ? (
              <div className="relative w-fit rounded-xl overflow-hidden border border-stone-200 dark:border-neutral-800 shadow-sm max-w-full">
                <img
                  src={formData.image}
                  alt="Uploaded preview"
                  className="w-full max-w-[400px] h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-sm text-stone-50 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-stone-900 transition-colors shadow"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-stone-50/50 border-stone-200 hover:bg-stone-50 hover:border-orange-500/50 transition-all dark:bg-neutral-950/10 dark:border-neutral-800 dark:hover:bg-neutral-950/20 dark:hover:border-orange-500/30">
                <div className="flex flex-col items-center justify-center p-5">
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading dynamic asset...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mb-2 text-stone-400 dark:text-stone-500" />
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 text-center">
                        <span className="font-bold text-orange-600">Click to upload</span> image asset to imgbb
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="h-[1px] w-full bg-stone-200 dark:bg-neutral-800" />

          {/* Vendor Details */}
          <div className="bg-stone-50/50 border border-stone-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 dark:bg-neutral-950/20 dark:border-neutral-800">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" /> Vendor Name
              </label>
              <input
                type="text"
                readOnly
                value={vendorName}
                className="flex h-9 w-full rounded-lg border border-stone-200 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-900/60 px-3 py-1 text-sm text-stone-600 dark:text-stone-300 cursor-not-allowed focus:outline-none select-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                Verified Email
              </label>
              <input
                type="text"
                readOnly
                value={vendorEmail}
                className="flex h-9 w-full rounded-lg border border-stone-200 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-900/60 px-3 py-1 text-sm text-stone-600 dark:text-stone-300 cursor-not-allowed focus:outline-none select-none"
              />
            </div>
          </div>

          {/* Add Ticket Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-orange-50 text-sm font-semibold transition-colors shadow shadow-orange-600/10"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin shrink-0" />
                <span>Uploading Image...</span>
              </>
            ) : (
              <span>Add Ticket</span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}