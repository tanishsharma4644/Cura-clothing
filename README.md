# CURA — AI-Powered E-Commerce Platform

> A production-grade, full-stack fashion e-commerce platform built with the MERN stack, featuring an AI Virtual Try-On engine, MongoDB aggregation analytics, and a premium 3D user interface.

**Live Demo:** [cura-clothing.vercel.app](https://cura-clothing.vercel.app) &nbsp;|&nbsp; **Backend API:** [cura-clothing.onrender.com](https://cura-clothing.onrender.com)

---

## ✨ Key Features

### AI & Machine Learning
- **AI Virtual Try-On** — Integrates Replicate AI (Flux-fill model) to generate realistic virtual garment try-ons from user photos
- **Production-Grade AI Pipeline** — Exponential backoff retry logic, adaptive polling (not fixed intervals), and specific HTTP error categorization (AUTH_FAILED, QUOTA_EXCEEDED, TIMEOUT, etc.)
- **Cloudinary CDN Integration** — Automatic base64→URL conversion for AI model compatibility with retry logic

### Backend Architecture
- **RESTful API** — 9 route modules covering products, orders, users, analytics, try-on, Stripe payments, collections, offers, and uploads
- **MongoDB Aggregation Pipeline** — Custom analytics engine computes revenue by month, top-selling products, user growth, and category breakdowns using `$group`, `$unwind`, and `$match` stages
- **Two-Tier Rate Limiting** — Global 100 req/15min limit on all API routes + strict 20 req/15min on auth endpoints to prevent brute-force attacks
- **Centralized Error Handling** — Custom `errorMiddleware.js` catches all unhandled errors and returns structured JSON with environment-aware stack traces
- **Request Logging** — Morgan HTTP logger in dev mode for debugging and performance monitoring
- **JWT Authentication** — Stateless auth with `protect` and `admin` middleware guards on all sensitive routes
- **Server-Side Filtering & Sorting** — Products API supports `category`, `keyword`, `sort` (price_asc, price_desc, newest, rating), and `pageNumber` — no client-side filtering hacks
- **Inventory Management** — Automatic stock decrement on order creation with variant-level (size + color) tracking

### Frontend Architecture
- **React 18** with React Router v6 — Full SPA with lazy loading patterns
- **3D Hero Section** — React Three Fiber + Three.js for interactive 3D clothing showcase
- **GSAP ScrollTrigger** — Cinematic scroll-triggered animations and parallax effects
- **Framer Motion** — Page transitions, staggered list animations, and micro-interactions throughout
- **Context API** — Cart, Wishlist, and Auth state management with localStorage persistence
- **User Dashboard** — Full profile management with order history, spending stats, status badges, and inline profile editing
- **Premium Shop Page** — Animated sort dropdown, wishlist toggle on hover, rating display, New Arrival badges

### UX & Design
- **Dark Mode** — Full system-level dark mode support across all pages
- **Mobile Responsive** — Fully responsive across all breakpoints (320px → 4K)
- **Stripe Payments** — Secure payment intent creation via Stripe API

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Framer Motion, Three.js, React Three Fiber, GSAP |
| **Backend** | Node.js, Express.js, Morgan, express-rate-limit |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **AI/ML** | Replicate AI API (Flux-fill-redux-try-on model) |
| **Cloud Storage** | Cloudinary CDN |
| **Payments** | Stripe API |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas |

---

## 🏗️ Project Structure

```
cura/
├── backend/
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect + admin guards
│   │   └── errorMiddleware.js    # Centralized error handling
│   ├── models/
│   │   ├── User.js               # User schema (wishlist, lastLoginAt, profilePicture)
│   │   ├── Product.js            # Product schema (variants, reviews, ratings)
│   │   └── Order.js              # Order schema (inventory auto-decrement)
│   ├── routes/
│   │   ├── analyticsRoutes.js    # MongoDB Aggregation Pipeline analytics
│   │   ├── tryonRoutes.js        # AI Try-On (retry logic, error categorization)
│   │   ├── productRoutes.js      # Server-side filtering, sorting, pagination
│   │   └── userRoutes.js         # Auth, profile update, lastLoginAt tracking
│   └── server.js                 # Rate limiting, Morgan logging, error middleware
└── frontend/
    └── src/
        ├── pages/
        │   ├── Profile.jsx        # Full user dashboard with stats + order history
        │   ├── Shop.jsx           # Animated sort, server-side filter, wishlist UX
        │   ├── TryOn.jsx          # AI Try-On interface
        │   └── AdminDashboard.jsx # Full admin panel
        └── context/
            ├── AuthContext.jsx
            ├── CartContext.jsx
            └── WishlistContext.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account (for image uploads + AI try-on)
- Replicate API token (for AI try-on)
- Stripe secret key (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cura-clothing.git
cd cura-clothing

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
REPLICATE_API_TOKEN=your_replicate_token
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Running Locally

```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

---

## 📊 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/products` | Products with server-side filter/sort/pagination | Public |
| POST | `/api/tryon` | AI Virtual Try-On generation | Public |
| GET | `/api/analytics/dashboard` | MongoDB aggregation analytics | Admin |
| GET | `/api/analytics/products/low-stock` | Low inventory alert | Admin |
| PUT | `/api/users/profile` | Update profile (name/email/password) | Private |
| GET | `/api/users/profile` | Get profile with populated wishlist | Private |

---

## 📄 License

MIT © 2026 CURA
