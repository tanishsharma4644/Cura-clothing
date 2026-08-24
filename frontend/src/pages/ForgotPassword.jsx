import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5001';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address.');
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/api/users/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] flex items-center justify-center px-4 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-10 shadow-xl border border-[#E8E6E1] dark:border-white/10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1C1917] dark:text-white mb-3">Check your inbox</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                If <strong className="text-[#1C1917] dark:text-white">{email}</strong> is registered with CURA, you'll receive a password reset link shortly. The link expires in <strong>15 minutes</strong>.
              </p>
              <p className="text-xs text-gray-400 mb-6">Didn't receive it? Check your spam folder or try again.</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="w-full py-3 rounded-xl border border-[#E8E6E1] dark:border-white/10 text-sm font-bold text-gray-500 hover:border-[#1C1917] dark:hover:border-white transition-colors"
                >
                  Try a different email
                </button>
                <Link
                  to="/account"
                  className="w-full py-3 rounded-xl bg-[#1C1917] dark:bg-white text-white dark:text-black text-sm font-bold text-center hover:-translate-y-0.5 transition-transform shadow-lg"
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-10 shadow-xl border border-[#E8E6E1] dark:border-white/10"
            >
              {/* Back link */}
              <Link to="/account" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1C1917] dark:hover:text-white transition-colors mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>

              {/* Header */}
              <div className="mb-8">
                <div className="w-14 h-14 bg-[#1C1917] dark:bg-[#3B82F6] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#1C1917] dark:text-white mb-2">Forgot your password?</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  No problem. Enter the email address linked to your account and we'll send you a secure reset link.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="hello@example.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#E8E6E1] dark:border-white/10 bg-[#FAF9F6] dark:bg-black/20 text-[#1C1917] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#3B82F6] transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-xl"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#1C1917] dark:bg-[#3B82F6] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:-translate-y-0.5 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Link <Mail className="w-4 h-4" /></>}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
