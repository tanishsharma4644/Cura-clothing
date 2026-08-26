import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, Heart, Settings, LogOut,
  ShoppingBag, TrendingUp, Clock, CheckCircle2,
  Truck, AlertCircle, ChevronRight, Edit3, Save, X
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001'
  : 'https://cura-clothing.onrender.com';

// ── Stat Card Component ────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E8E6E1] dark:border-white/10 shadow-sm flex items-center gap-5"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-3xl font-bold text-[#1C1917] dark:text-white">{value}</p>
      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-0.5">{label}</p>
    </div>
  </motion.div>
);

// ── Order Status Badge Component ───────────────────────────────────────────────
const OrderStatusBadge = ({ isPaid, isDelivered }) => {
  if (isDelivered) return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
      <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
    </span>
  );
  if (isPaid) return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
      <Truck className="w-3.5 h-3.5" /> In Transit
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">
      <Clock className="w-3.5 h-3.5" /> Pending
    </span>
  );
};

// ── Main Profile Dashboard Component ──────────────────────────────────────────
const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/account');
      return;
    }
    setFormData({ name: user.name, email: user.email, password: '' });
    fetchMyOrders();
  }, [user, navigate]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_BASE}/api/orders/myorders`, config);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { name: formData.name, email: formData.email };
      if (formData.password) payload.password = formData.password;
      await axios.put(`${API_BASE}/api/users/profile`, payload, config);
      setUpdateSuccess(true);
      setIsEditing(false);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Compute stats from orders
  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const deliveredCount = orders.filter(o => o.isDelivered).length;
  const pendingCount = orders.filter(o => !o.isPaid).length;

  const tabs = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1C1917] dark:border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] pt-28 pb-20 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-[#E8E6E1] dark:border-white/10 shadow-sm mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1C1917] to-[#57534E] dark:from-[#3B82F6] dark:to-[#1D4ED8] flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              {initials}
            </div>
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1E293B] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[#1C1917] dark:text-white">{user?.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-3">
              <span className="text-xs bg-[#F5F3F0] dark:bg-white/10 text-[#57534E] dark:text-gray-300 px-3 py-1 rounded-full font-semibold">
                {user?.isAdmin ? '👑 Admin' : '🛍️ Customer'}
              </span>
              <span className="text-xs text-gray-400">
                {user?.createdAt
                  ? `Member since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  : 'CURA Member'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {user?.isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#3B82F6] text-white shadow-md hover:-translate-y-0.5 transition-transform">
                <TrendingUp className="w-4 h-4" /> Dashboard
              </Link>
            )}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </motion.div>

        {/* ── Stats Row ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} color="bg-violet-500" />
          <StatCard icon={TrendingUp} label="Total Spent" value={`₹${totalSpent.toFixed(0)}`} color="bg-emerald-500" />
          <StatCard icon={Truck} label="Delivered" value={deliveredCount} color="bg-blue-500" />
          <StatCard icon={AlertCircle} label="Pending" value={pendingCount} color="bg-amber-500" />
        </div>

        {/* ── Tab Navigation ──────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-[#1E293B] p-1.5 rounded-2xl border border-[#E8E6E1] dark:border-white/10 w-fit shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1C1917] dark:bg-[#3B82F6] text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#1C1917] dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-12 border border-[#E8E6E1] dark:border-white/10 flex justify-center">
                  <div className="w-8 h-8 border-2 border-[#1C1917] dark:border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-16 border border-[#E8E6E1] dark:border-white/10 text-center">
                  <Package className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#1C1917] dark:text-white mb-2">No orders yet</h3>
                  <p className="text-gray-400 text-sm mb-6">Time to explore our collection!</p>
                  <Link to="/shop" className="inline-flex items-center gap-2 bg-[#1C1917] dark:bg-[#3B82F6] text-white px-6 py-3 rounded-full text-sm font-bold hover:-translate-y-0.5 transition-transform shadow-lg">
                    <ShoppingBag className="w-4 h-4" /> Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, i) => (
                    <Link
                      to={`/track-order?id=${order._id}`}
                      key={order._id}
                      className="block group"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-[#E8E6E1] dark:border-white/10 shadow-sm hover:shadow-md hover:border-[#8B5E3C] dark:hover:border-[#3B82F6] transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {/* Product Thumbnails */}
                            <div className="flex -space-x-3">
                              {order.orderItems.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-[#1E293B] bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'; }} />
                                </div>
                              ))}
                              {order.orderItems.length > 3 && (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-[#1E293B] flex items-center justify-center text-xs font-bold text-gray-500">
                                  +{order.orderItems.length - 3}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-0.5">
                                Order ID: #{order._id}
                              </p>
                              <p className="font-bold text-[#1C1917] dark:text-white text-sm">
                                {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <OrderStatusBadge isPaid={order.isPaid} isDelivered={order.isDelivered} />
                            <span className="font-bold text-[#1C1917] dark:text-white">₹{order.totalPrice.toFixed(0)}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider hidden sm:block">{order.paymentMethod}</span>
                            <span className="text-xs font-bold text-[#8B5E3C] dark:text-[#3B82F6] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Track Details <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 border border-[#E8E6E1] dark:border-white/10 shadow-sm max-w-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-[#1C1917] dark:text-white">Account Settings</h2>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-[#8B5E3C] dark:text-[#3B82F6] hover:underline">
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  )}
                </div>

                {updateSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-4 py-3 rounded-xl mb-6 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> Profile updated successfully!
                  </motion.div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E6E1] dark:border-white/10 bg-[#FAF9F6] dark:bg-black/20 text-[#1C1917] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#3B82F6] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E6E1] dark:border-white/10 bg-[#FAF9F6] dark:bg-black/20 text-[#1C1917] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#3B82F6] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                  {isEditing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">New Password <span className="text-gray-300">(leave blank to keep current)</span></label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-[#E8E6E1] dark:border-white/10 bg-[#FAF9F6] dark:bg-black/20 text-[#1C1917] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#3B82F6] transition-all"
                      />
                    </motion.div>
                  )}
                  {isEditing && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      type="submit"
                      disabled={updateLoading}
                      className="w-full flex items-center justify-center gap-2 bg-[#1C1917] dark:bg-[#3B82F6] text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:-translate-y-0.5 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {updateLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><Save className="w-4 h-4" /> Save Changes</>
                      )}
                    </motion.button>
                  )}
                </form>

                {/* Danger Zone */}
                <div className="mt-10 pt-8 border-t border-[#E8E6E1] dark:border-white/10">
                  <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">Danger Zone</h3>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center gap-2 text-sm font-semibold text-red-500 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out of Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
