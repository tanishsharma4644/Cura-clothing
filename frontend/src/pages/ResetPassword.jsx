import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5001';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Password strength indicator
  const getStrength = (p) => {
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const levels = [
      { level: 0, label: '', color: '' },
      { level: 1, label: 'Weak', color: 'bg-red-500' },
      { level: 2, label: 'Fair', color: 'bg-amber-500' },
      { level: 3, label: 'Good', color: 'bg-blue-500' },
      { level: 4, label: 'Strong', color: 'bg-emerald-500' },
    ];
    return levels[score];
  };
  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE}/api/users/reset-password/${token}`, { password });
      // Auto-login after successful reset
      if (data.token) login(data);
      setDone(true);
      setTimeout(() => navigate('/profile'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
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
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-10 shadow-xl border border-[#E8E6E1] dark:border-white/10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1C1917] dark:text-white mb-3">Password Updated!</h2>
              <p className="text-gray-400 text-sm">Your password has been reset successfully. Redirecting you to your profile...</p>
              <div className="mt-6 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5 }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-10 shadow-xl border border-[#E8E6E1] dark:border-white/10"
            >
              <div className="mb-8">
                <div className="w-14 h-14 bg-[#1C1917] dark:bg-[#3B82F6] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#1C1917] dark:text-white mb-2">Set new password</h1>
                <p className="text-gray-400 text-sm">Choose a strong password that you haven't used before.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[#E8E6E1] dark:border-white/10 bg-[#FAF9F6] dark:bg-black/20 text-[#1C1917] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#3B82F6] transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1C1917] dark:hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.level ? strength.color : 'bg-gray-100 dark:bg-gray-700'}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${strength.level <= 1 ? 'text-red-500' : strength.level === 2 ? 'text-amber-500' : strength.level === 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-[#FAF9F6] dark:bg-black/20 text-[#1C1917] dark:text-white text-sm focus:outline-none focus:ring-2 transition-all ${
                        confirm && confirm !== password
                          ? 'border-red-400 focus:ring-red-400'
                          : confirm && confirm === password
                          ? 'border-emerald-400 focus:ring-emerald-400'
                          : 'border-[#E8E6E1] dark:border-white/10 focus:ring-[#1C1917] dark:focus:ring-[#3B82F6]'
                      }`}
                    />
                    {confirm && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {confirm === password
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <AlertCircle className="w-4 h-4 text-red-400" />}
                      </div>
                    )}
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
                  disabled={loading || (confirm && confirm !== password)}
                  className="w-full flex items-center justify-center gap-2 bg-[#1C1917] dark:bg-[#3B82F6] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:-translate-y-0.5 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Remember your password?{' '}
                  <Link to="/account" className="font-bold text-[#1C1917] dark:text-white hover:underline">Sign In</Link>
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
