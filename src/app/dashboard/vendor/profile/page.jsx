export default function VendorProfile() {
  const vendor = {
    name: "John Doe",
    email: "vendor@example.com",
    role: "Vendor",
    image: "https://i.pravatar.cc/300",
    joinedAt: "12 Jun 2026",
    totalTickets: 42,
    totalSold: 156,
    revenue: 245000,
  };

  return (
    <div className="p-2">
      <div className="mx-auto w-full">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">Profile</h1>
          <p className="text-muted-foreground mt-2 text-gray-500 dark:text-zinc-400">
            Manage and view your profile information.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl border border-gray-200 mt-20 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="-mt-16 flex flex-col items-start gap-4">
              <div className="flex mx-auto w-fit items-center flex-col gap-5 justify-center">
                <img
                  src={vendor.image}
                  alt={vendor.name}
                  className="h-32 w-32 mx-auto rounded-full border-4 border-white object-cover shadow-lg dark:border-zinc-900"
                />

                <div className="pb-2 flex flex-col items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{vendor.name}</h2>

                  <span className="mt-1 rounded-full mx-auto bg-blue-100 px-3 text-sm font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                    {vendor.role}
                  </span>
                </div>
              </div>

              <button className="rounded-xl mx-auto bg-orange-600 px-5 py-2.5 font-medium text-white transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 dark:focus-visible:ring-offset-zinc-950">
                Edit Profile
              </button>
            </div>

            {/* Info Grid */}
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 p-5 dark:border-zinc-800">
                <p className="text-sm text-gray-500 dark:text-zinc-400">Email Address</p>
                <h3 className="mt-2 font-semibold text-gray-900 dark:text-zinc-100">{vendor.email}</h3>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 dark:border-zinc-800">
                <p className="text-sm text-gray-500 dark:text-zinc-400">Account Type</p>
                <h3 className="mt-2 font-semibold text-gray-900 dark:text-zinc-100">{vendor.role}</h3>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5 dark:border-zinc-800">
                <p className="text-sm text-gray-500 dark:text-zinc-400">Joined</p>
                <h3 className="mt-2 font-semibold text-gray-900 dark:text-zinc-100">{vendor.joinedAt}</h3>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-10">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">
                Vendor Statistics
              </h3>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 dark:bg-zinc-950/40 dark:border-zinc-800">
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Total Tickets Added
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">
                    {vendor.totalTickets}
                  </h2>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 dark:bg-zinc-950/40 dark:border-zinc-800">
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Total Tickets Sold
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-zinc-100">
                    {vendor.totalSold}
                  </h2>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 dark:bg-zinc-950/40 dark:border-zinc-800">
                  <p className="text-sm text-gray-500 dark:text-zinc-400">
                    Total Revenue
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-green-600 dark:text-green-500">
                    ৳ {vendor.revenue.toLocaleString()}
                  </h2>
                </div>
              </div>
            </div>

            {/* About / Generic Info Block */}
            <div className="mt-10 rounded-2xl border border-gray-200 p-6 dark:border-zinc-800">
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-zinc-100">
                Vendor Information
              </h3>
              <p className="text-gray-600 dark:text-zinc-400">
                This vendor provides transportation tickets across
                multiple routes and manages bookings through the
                TicketBari platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}