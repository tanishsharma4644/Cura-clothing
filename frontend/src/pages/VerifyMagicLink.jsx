import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5001';

const VerifyMagicLink = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No token found in this link. Please request a new magic link.');
      return;
    }

    const verifyToken = async () => {
      try {
        const { data } = await axios.post(`${API_BASE}/api/users/verify-magic`, { token });
        login(data);
        setStatus('success');
        setMessage(`Welcome back, ${data.name}! Redirecting you...`);
        setTimeout(() => navigate('/profile'), 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'This magic link is invalid or has already been used.');
      }
    };

    verifyToken();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] flex items-center justify-center px-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1E293B] rounded-3xl p-12 shadow-xl border border-[#E8E6E1] dark:border-white/10 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-14 h-14 text-[#1C1917] dark:text-[#3B82F6] animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-[#1C1917] dark:text-white mb-2">Verifying your link...</h2>
            <p className="text-gray-400 text-sm">Please wait while we securely log you in.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-[#1C1917] dark:text-white mb-2">You're in! ✨</h2>
            <p className="text-gray-400 text-sm">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[#1C1917] dark:text-white mb-2">Link Invalid</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/account')}
              className="w-full py-3.5 bg-[#1C1917] dark:bg-[#3B82F6] text-white rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-transform shadow-lg"
            >
              Back to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyMagicLink;
