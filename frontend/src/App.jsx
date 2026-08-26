import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import TryOn from './pages/TryOn';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Shop from './pages/Shop';
import Wishlist from './pages/Wishlist';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyMagicLink from './pages/VerifyMagicLink';
import TrackOrder from './pages/TrackOrder';
import { WishlistProvider } from './context/WishlistContext';
import { useEffect } from 'react';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <WishlistProvider>
      <div className="font-sans selection:bg-black selection:text-white cursor-default">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/try-on" element={<TryOn />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/account" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-magic" element={<VerifyMagicLink />} />
        </Routes>
        <Footer />
        <Chatbot />
      </div>
    </WishlistProvider>
  );
}

export default App;
