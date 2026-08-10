# CURA. | Quiet Elegance

A full-stack, enterprise-grade e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). CURA is designed for high-end fashion brands, featuring a minimalist "Quiet Elegance" aesthetic, buttery-smooth animations, and a robust set of features for both customers and administrators.

---

## ✨ Key Features

### 🛍️ Customer Experience
- **Premium UI/UX:** High-end, editorial-style interface built with Tailwind CSS.
- **Advanced Animations:** GSAP and Framer Motion integration for staggered reveals, parallax scrolling, and smooth page transitions.
- **CURA Vision AI (Virtual Try-On):** Allows users to upload a photo or use their webcam for a simulated virtual fitting room experience.
- **Dynamic Shopping:** Real-time filtering by category, search functionality, and pagination.
- **Secure Checkout:** Fully integrated Stripe Payment Intents for seamless, secure credit card processing.
- **User Profiles:** Order history tracking and wishlist management.
- **Interactive Product Reviews:** Customers can leave ratings and comments on products they've purchased.

### 🔐 Administrative Control
- **Role-Based Access Control:** Secure JWT-based authentication separating standard users from Admins.
- **Inventory Management:** Full CRUD operations for products, including granular variant tracking (size/color stock levels).
- **"New Arrivals" Flagging:** One-click toggling to instantly push specific products to the dynamic "New Arrivals" collection.
- **Order Management:** View, fulfill, or delete customer orders.
- **Marketing Tools:** Update the global site-wide announcement marquee and manage dynamic promo codes/offers directly from the dashboard.
- **Newsletter Broadcasting:** Integrated Nodemailer for sending bulk email updates to subscribers.

---

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Styling)
- Framer Motion & GSAP (Animations)
- Lucide React (Icons)
- Axios (HTTP Client)
- Stripe React JS (Payments)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose (Database)
- JSON Web Tokens (JWT Auth)
- Stripe (Payment Gateway API)
- Cloudinary (Image Hosting)
- Multer (File Uploads)
- Nodemailer (Email Services)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and MongoDB installed on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/cura-clothing.git
cd cura-clothing
```

### 2. Install Dependencies
You need to install dependencies for both the frontend and backend.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
You will need to set up your `.env` files. 

**Backend (`backend/.env`):**
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (`frontend/.env`):**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 4. Run the Application
Open two separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 👨‍💻 Admin Credentials
To access the Admin Dashboard, register a new account on the website, then connect to your MongoDB database and manually set the `isAdmin` boolean flag to `true` for your user document. Re-login to access the `/admin` route.

---

## 📄 License
This project is open-source and available under the MIT License.
