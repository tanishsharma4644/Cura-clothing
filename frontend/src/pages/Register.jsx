import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Password strength logic
  const calculateStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength += 25;
    if (pass.length > 7) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    return strength;
  };
  const passwordStrength = calculateStrength(password);

  // Carousel text for the left side
  const [taglineIndex, setTaglineIndex] = useState(0);
  const taglines = ["DEFINE YOUR STYLE.", "EMBRACE THE NEW.", "JOIN THE MOVEMENT.", "ELEVATE EVERYDAY."];

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post('https://cura-clothing.onrender.com/api/users/register', { name, email, password });
      login(data);
      navigate('/profile');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0a0a0a]">
      {/* Left side - Image/Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop" 
          alt="Fashion Editorial Registration" 
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-[20s] ease-linear"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold tracking-tighter mb-4">CURA.</h1>
            <div className="h-8 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.p
                  key={taglineIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white/90 font-medium tracking-widest absolute uppercase"
                >
                  {taglines[taglineIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-md"
          >
            <div className="backdrop-blur-md bg-black/20 p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <p className="text-xl text-white/95 leading-relaxed font-light italic relative z-10">
                "Become a part of a community that values aesthetics, quality, and timeless design."
              </p>
              <div className="mt-8 flex items-center gap-4 relative z-10">
                <div className="w-12 h-[1px] bg-white/50 group-hover:w-20 transition-all duration-300"></div>
                <span className="font-semibold text-sm tracking-wider uppercase text-white/90 group-hover:text-white transition-colors">Start your journey</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100/50 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-100/50 dark:bg-rose-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold mb-3 text-slate-900 dark:text-white tracking-tight">
              Create an account
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400">
              Join us to curate your personal wardrobe.
            </p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold text-slate-700 dark:text-gray-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold text-slate-700 dark:text-gray-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.59-.8 1.51.05 2.95.72 3.94 1.92-3.3 1.9-2.76 5.96.48 7.32-.82 2.15-2.04 4.54-3.09 3.73z" />
                <path d="M12.03 7.25c-.15-3.01 2.39-5.45 5.25-5.36.19 3.12-2.67 5.59-5.25 5.36z" />
              </svg>
              Apple
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-[#0a0a0a] text-gray-500">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full pl-11 px-4 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 px-4 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-11 pr-12 px-4 py-3.5 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2 ml-1">
                  <div className="flex gap-1 h-1.5 mb-1.5 w-full">
                    <div className={`flex-1 rounded-full ${passwordStrength >= 25 ? (passwordStrength >= 75 ? 'bg-green-500' : passwordStrength >= 50 ? 'bg-yellow-400' : 'bg-red-400') : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                    <div className={`flex-1 rounded-full ${passwordStrength >= 50 ? (passwordStrength >= 75 ? 'bg-green-500' : 'bg-yellow-400') : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                    <div className={`flex-1 rounded-full ${passwordStrength >= 75 ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                    <div className={`flex-1 rounded-full ${passwordStrength >= 100 ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : 'Strong'} password
                  </p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl text-sm border flex items-start gap-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30">
                    <span className="mt-0.5">⚠️</span>
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-8 flex items-center justify-center gap-2 py-4 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-xl shadow-slate-900/20 dark:shadow-white/10 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500 ease-in-out"></div>
              {loading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800/60 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/account')} 
                className="text-slate-900 dark:text-white font-bold hover:underline decoration-2 underline-offset-4 transition-all ml-1"
              >
                Sign in instead
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
