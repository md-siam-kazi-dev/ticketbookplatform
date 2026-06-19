import React from 'react';

 export default function AddTicketFormSkeleton() {
  return (
    <div className="w-full mx-auto p-2 animate-pulse">
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Create New Ticket</h1>
    <p className="text-muted-foreground mt-2 text-gray-500 dark:text-zinc-400">
      Fill in the details below to list a new travel ticket on the platform.
    </p>
  </div>
  
  {/* Container matching the shadcn card layout */}
  <div className="rounded-xl border bg-white border-gray-200 shadow-md dark:bg-zinc-900 dark:border-zinc-800">
    
    {/* Header Skeleton */}
    <div className="flex flex-col space-y-2.5 p-6 border-b border-gray-100 dark:border-zinc-800">
      <div className="h-7 bg-gray-200 dark:bg-zinc-700/60 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-2/3"></div>
    </div>

    {/* Form Fields Skeleton */}
    <div className="p-6 space-y-6">
      
      {/* Ticket Title */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-20"></div>
        <div className="h-10 bg-gray-200 dark:bg-zinc-700/60 rounded w-full"></div>
      </div>

      {/* From / To Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-28"></div>
          <div className="h-10 bg-gray-200 dark:bg-zinc-700/60 rounded w-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-zinc-700/60 rounded w-full"></div>
        </div>
      </div>

      {/* Transport, Price, Quantity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-zinc-700/60 rounded w-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-28"></div>
          <div className="h-10 bg-gray-200 dark:bg-zinc-700/60 rounded w-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-24"></div>
          <div className="h-10 bg-gray-200 dark:bg-zinc-700/60 rounded w-full"></div>
        </div>
      </div>

      {/* Departure Date & Time */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-36"></div>
        <div className="h-10 bg-gray-200 dark:bg-zinc-700/60 rounded w-full"></div>
      </div>

      {/* Perks (Checkboxes block) */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-32"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50/70 p-4 rounded-lg border border-gray-100 dark:bg-zinc-800/40 dark:border-zinc-800">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center space-x-2 py-1">
              <div className="h-4 w-4 bg-gray-200 dark:bg-zinc-700/60 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Upload Box */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-36"></div>
        <div className="h-32 bg-gray-50/70 border-2 border-dashed border-gray-200 rounded-lg w-full flex flex-col items-center justify-center space-y-2 dark:bg-zinc-800/40 dark:border-zinc-800">
          <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700/60 rounded-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-zinc-700/60 rounded w-32"></div>
        </div>
      </div>

      <hr className="border-gray-100 dark:border-zinc-800" />

      {/* Read-Only Vendor Details */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 dark:bg-zinc-800/20 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-zinc-700/60 rounded w-20"></div>
          <div className="h-9 bg-gray-200/70 dark:bg-zinc-700/40 rounded w-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-zinc-700/60 rounded w-24"></div>
          <div className="h-9 bg-gray-200/70 dark:bg-zinc-700/40 rounded w-full"></div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="h-11 bg-gray-200 dark:bg-zinc-700/60 rounded w-full"></div>

    </div>
  </div>
</div>
  );
}