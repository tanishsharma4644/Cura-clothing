import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/account');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('https://cura-clothing.onrender.com/api/orders/myorders', config);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-[#FAF9F6] dark:bg-[#0F172A]">
        <div className="text-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="rounded-lg border p-6 bg-white/80 dark:bg-slate-900/70">
          <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-sm text-gray-600 mt-2">Manage your account details and view recent orders below.</p>
        </div>

        <div className="rounded-lg border p-6 bg-white/80 dark:bg-slate-900/70">
          <h2 className="text-lg font-semibold">Order history</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500 mt-4">You have not placed any orders yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((o) => (
                <li key={o._id} className="flex justify-between">
                  <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold">${o.totalPrice.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
