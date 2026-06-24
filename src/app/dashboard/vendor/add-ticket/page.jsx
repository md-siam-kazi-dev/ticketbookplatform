'use client';

import AddTicketFormSkeleton from '@/components/loadinganimation/addTicketSkeletion';
import { authClient, useSession } from '@/lib/auth-client';
import { Clock, DollarSign, MapPin, ShieldCheck, ShieldOff, Ticket, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AddTicketForm() {

  const router = useRouter();
  const { data, isPending } = useSession();
  const user = data?.user;
  console.log(user)

  const [formData, setFormData] = useState({
    title: '',
    from: '',
    to: '',
    transportType: '',
    price: '',
    quantity: '',
    departureDateTime: '',
    perks: [],
    image: '' // Changed from imageUrl to image
  });

  const [isUploading, setIsUploading] = useState(false);

  // Fallback to safe defaults if session data is still resolving
  const vendorName = user?.name || "Loading Vendor...";
  const vendorEmail = user?.email || "loading@vendor.com";
  const vendorId = user?.id || "664a1f2e8c3b4d001e8a1001"; // Fallback/placeholder vendorId

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

    // Generate ISO timestamp for dates
    const currentTimestamp = new Date().toISOString();

    // Map properties strictly into your desired backend schema structure
    const completeSubmission = {
      title: formData.title,
      from: formData.from,
      to: formData.to,
      transportType: formData.transportType,
      price: Number(formData.price), // Force number type conversion
      quantity: Number(formData.quantity), // Force number type conversion
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
      isAd:false,
    };
    
    try {
      const {data:tokenData} = await authClient.token();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization':`bearerr ${tokenData.token}`
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

  if (isPending) {
    return <AddTicketFormSkeleton />;
  }
  if (user?.isBlock) {
  return (
    <div className="w-full mx-auto p-2">
      <div className="flex flex-col items-center justify-center text-center rounded-xl border border-red-200 bg-red-50/60 dark:bg-red-500/5 dark:border-red-500/20 py-20 px-6 gap-4">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
          <ShieldOff className="w-7 h-7 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Account Restricted</h2>
          <p className="text-sm text-red-500 dark:text-red-400/80 mt-1.5 max-w-sm">
            Your account has been flagged for fraudulent activity. You are not allowed to add new tickets. Please contact support if you believe this is a mistake.
          </p>
        </div>
       
      </div>
    </div>
  );
}

  return (
    <div className="w-full mx-auto p-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Create New Ticket</h1>
        <p className="text-muted-foreground mt-2 text-gray-500 dark:text-zinc-400">
          Fill in the details below to list a new travel ticket on the platform.
        </p>
      </div>
       
      <div className="rounded-xl border bg-white border-gray-200 shadow-md dark:bg-zinc-900 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Ticket Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Ticket Title</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g., Premium AC Sleeper - Dhaka to Cox's Bazar"
              value={formData.title}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus-visible:ring-offset-zinc-950"
            />
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-orange-600" /> From (Location)
              </label>
              <input
                type="text"
                name="from"
                required
                placeholder="Origin city or terminal"
                value={formData.from}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus-visible:ring-offset-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-orange-600" /> To (Location)
              </label>
              <input
                type="text"
                name="to"
                required
                placeholder="Destination city or terminal"
                value={formData.to}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus-visible:ring-offset-zinc-950"
              />
            </div>
          </div>

          {/* Transport Type, Price, Quantity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Transport Type</label>
              <select
                name="transportType"
                required
                value={formData.transportType}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:ring-offset-zinc-950"
              >
                <option value="" disabled className="dark:bg-zinc-950">Select Type</option>
                <option value="bus" className="dark:bg-zinc-950">Bus</option>
                <option value="train" className="dark:bg-zinc-950">Train</option>
                <option value="flight" className="dark:bg-zinc-950">Flight</option>
                <option value="ferry" className="dark:bg-zinc-950">Ferry/Launch</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-orange-600" /> Price (per unit)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus-visible:ring-offset-zinc-950"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1">
                <Ticket className="w-4 h-4 text-orange-600" /> Ticket Quantity
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="1"
                placeholder="Total seats available"
                value={formData.quantity}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus-visible:ring-offset-zinc-950"
              />
            </div>
          </div>

          {/* Departure Date & Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-600" /> Departure Date & Time
            </label>
            <input
              type="datetime-local"
              name="departureDateTime"
              required
              value={formData.departureDateTime}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:ring-offset-zinc-950 [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* Perks (Checkboxes) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Perks & Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 border border-gray-100 rounded-lg p-4 dark:bg-zinc-800/40 dark:border-zinc-800">
              {perksOptions.map((perk) => (
                <div key={perk.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={perk.id}
                    checked={formData.perks.includes(perk.id)}
                    onChange={(e) => handlePerkChange(perk.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600 accent-orange-600 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <label htmlFor={perk.id} className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                    {perk.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload Component */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1">
              <Upload className="w-4 h-4 text-orange-600" /> Ticket / Vehicle Image
            </label>

            {formData.image ? (
              <div className="relative w-fit rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800">
                <img
                  src={formData.image}
                  alt="Uploaded preview"
                  className="w-100 h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-md hover:bg-black/80 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-orange-500 transition-colors dark:bg-zinc-800/40 dark:border-zinc-800 dark:hover:bg-zinc-800/70 dark:hover:border-orange-500">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <p className="text-sm text-orange-600 font-medium animate-pulse">Uploading...</p>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-400 dark:text-zinc-500" />
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        <span className="font-semibold text-orange-600">Click to upload</span>
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

          <hr className="border-gray-200 dark:border-zinc-800" />

          {/* Vendor Details (Read-only) */}
          <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 dark:bg-orange-950/10 dark:border-orange-900/30">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-orange-800 dark:text-orange-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Vendor Name
              </label>
              <input
                type="text"
                readOnly
                value={vendorName}
                className="flex h-9 w-full rounded-md border border-gray-200 bg-orange-50/50 px-3 py-1 text-sm text-gray-600 cursor-not-allowed focus:outline-none dark:border-orange-900/20 dark:bg-orange-950/20 dark:text-zinc-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-orange-800 dark:text-orange-400 flex items-center gap-1">
                Verified Email
              </label>
              <input
                type="text"
                readOnly
                value={vendorEmail}
                className="flex h-9 w-full rounded-md border border-gray-200 bg-orange-50/50 px-3 py-1 text-sm text-gray-600 cursor-not-allowed focus:outline-none dark:border-orange-900/20 dark:bg-orange-950/20 dark:text-zinc-300"
              />
            </div>
          </div>

          {/* Add Ticket Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-600 text-white hover:bg-orange-700 h-11 px-8 w-full font-semibold shadow dark:focus-visible:ring-offset-zinc-950"
          >
            {isUploading ? 'Uploading Image...' : 'Add Ticket'}
          </button>

        </form>
      </div>
    </div>
  );
}