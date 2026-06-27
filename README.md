# TicketLagbe 🎫

**TicketLagbe** (টিকেট লাগবে) is a full-stack online ticket booking platform for Bangladesh, supporting bus, train, launch, and flight tickets. Users can search and book tickets, vendors can list and manage their routes, and admins can moderate the entire platform.

🌐 **Live Site:** [https://ticketlagbe.vercel.app](https://ticketbookplatform.vercel.app/)  

---

## 🚀 Key Features

### 👤 User
- Browse and search all approved tickets (filter by route, transport type, sort by price)
- View ticket details with live departure countdown
- Book tickets with seat quantity selector
- Pay via **Stripe** after vendor acceptance
- Track booking status (Pending → Accepted → Paid / Rejected)
- View full transaction history

### 🏪 Vendor
- Register as a vendor and list bus / train / launch / flight tickets
- Upload ticket images via **imgbb**
- Manage added tickets (update / delete)
- Accept or reject user booking requests
- View revenue overview with charts (tickets added, sold, revenue)

### 🛡️ Admin
- Approve or reject vendor-submitted tickets
- Manage all platform users — promote to Admin or Vendor, or mark as Fraud
- Choose up to 6 tickets to advertise on the homepage
- Full platform overview dashboard (ticket stats + account stats)

---

## 🖥️ Tech Stack

### Frontend
| Package | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | React framework (App Router) |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [BetterAuth](https://better-auth.com) | Authentication (email + Google OAuth) |
| [Stripe.js](https://stripe.com/docs/js) | Payment processing |
| [Sonner](https://sonner.emilkowal.ski) | Toast notifications |
| [Lucide React](https://lucide.dev) | Icon library |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark / light mode |
| [Recharts](https://recharts.org) | Revenue overview charts |
| [shadcn/ui](https://ui.shadcn.com) | Sidebar, Avatar, UI primitives |

### Backend
| Package | Purpose |
|---|---|
| [Express.js](https://expressjs.com) | REST API server |
| [MongoDB](https://mongodb.com) + [Mongoose](https://mongoosejs.com) | Database |
| [BetterAuth](https://better-auth.com) | Auth session + JWT |
| [Stripe](https://stripe.com) | Checkout session + webhook |
| [imgbb API](https://api.imgbb.com) | Image hosting |
| [cors](https://www.npmjs.com/package/cors) | Cross-origin requests |
| [dotenv](https://www.npmjs.com/package/dotenv) | Environment variables |

---

## 📁 Project Structure

```
ticketlagbe-client/
├── app/
│   ├── (root)/
│   │   ├── page.jsx              # Home (Hero + Advertised Tickets)
│   │   └── tickets/
│   │       ├── page.jsx          # All Tickets
│   │       └── [id]/
│   │           └── page.jsx      # Ticket Details + Book Now
│   ├── login/page.jsx
│   ├── signup/page.jsx
│   ├── unauthorized/page.jsx
│   └── dashboard/
│       ├── layout.jsx            # Shared sidebar layout
│       ├── user/
│       │   ├── profile/page.jsx
│       │   ├── booked-tickets/page.jsx
│       │   └── transactions/page.jsx
│       ├── vendor/
│       │   ├── profile/page.jsx
│       │   ├── add-ticket/page.jsx
│       │   ├── my-tickets/page.jsx
│       │   ├── requested-bookings/page.jsx
│       │   └── revenue/page.jsx
│       └── admin/
│           ├── profile/page.jsx
│           ├── manage-tickets/page.jsx
│           ├── manage-users/page.jsx
│           └── advertise/page.jsx
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── SplashScreen.jsx
│   ├── HeroBanner.jsx
│   ├── AdvertiseSection.jsx
│   └── AppSidebar.jsx
└── lib/
    ├── auth-client.js
    └── sidebarConfig.js
```

---

## ⚙️ Getting Started

### Prerequisites
- **Bun** (recommended) or Node.js 18+
- MongoDB connection string
- Stripe account (publishable + secret key)
- Google OAuth credentials
- imgbb API key

### 1. Clone the repositories

### 2. Install dependencies

```bash
# Client
bun install

# Server
bun install
```

### 3. Environment variables

**Client — `.env.local`**
```env
NEXT_PUBLIC_API=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Server — `.env`**
```env
MONGODB_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
IMGBB_API_KEY=your_imgbb_key
CLIENT_URL=http://localhost:3000
PORT=5000
```

### 4. Run locally

```bash
# Client (http://localhost:3000)
bun dev

# Server (http://localhost:5000)
bun dev
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@ticketlagbe.com | Admin@123 |
| Vendor | vendor@ticketlagbe.com | Vendor@123 |
| User | user@ticketlagbe.com | User@1234 |

---

## 📸 Screenshots

| Home | All Tickets | Ticket Details |
|---|---|---|
| ![Home](./screenshots/home.png) | ![Tickets](./screenshots/tickets.png) | ![Details](./screenshots/details.png) |

| User Dashboard | Vendor Dashboard | Admin Dashboard |
|---|---|---|
| ![User](./screenshots/user-dashboard.png) | ![Vendor](./screenshots/vendor-dashboard.png) | ![Admin](./screenshots/admin-dashboard.png) |

---

## 🌐 API Endpoints

### Tickets
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets` | All approved tickets (with filters) |
| `GET` | `/api/tickets/:id` | Single ticket details |
| `GET` | `/api/adticket` | Advertised tickets (max 6) |
| `POST` | `/api/tickets` | Add new ticket (vendor) |
| `PATCH` | `/api/tickets/:id` | Update ticket (vendor) |
| `DELETE` | `/api/tickets/:id` | Delete ticket (vendor) |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bookings/:email` | User's bookings |
| `POST` | `/api/bookings` | Create booking |
| `GET` | `/api/vendor/bookings` | Vendor's received bookings |
| `PATCH` | `/api/bookings/:id` | Accept / reject booking (vendor) |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/tickets` | All tickets |
| `PATCH` | `/api/admin/tickets` | Approve / reject ticket |
| `GET` | `/api/admin/users` | All users |
| `PATCH` | `/api/admin/users` | Change role / mark fraud |
| `PATCH` | `/api/admin/advertise/:id` | Toggle advertise |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments/create-checkout` | Stripe checkout session |
| `POST` | `/api/payments/webhook` | Stripe webhook handler |
| `GET` | `/api/payments/:email` | User transaction history |

---

## 📦 npm Packages Used

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "better-auth": "^1.0.0",
    "tailwindcss": "^4.0.0",
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^3.0.0",
    "sonner": "^1.5.0",
    "lucide-react": "^0.383.0",
    "next-themes": "^0.3.0",
    "recharts": "^2.12.0",
    "react-icons": "^5.0.0",
    "axios": "^1.7.0"
  }
}
```

---

## 👨‍💻 Author

**Md Siam Kazi**  

---

## 📄 License

This project is for educational purposes as part of a web development assignment.