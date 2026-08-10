import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, Heart, ChevronDown, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import axios from 'axios';

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  
  const [marquee, setMarquee] = useState({
    text: "⚡ FREE EXPRESS SHIPPING ON ALL ORDERS OVER $150 ⚡ NEW AUTUMN COLLECTION DROPPING THIS FRIDAY ⚡",
    active: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('https://cura-clothing.onrender.com/api/settings');
        if (data) {
          setMarquee({ text: data.marqueeText, active: data.marqueeActive });
        }
      } catch (error) {
        console.error('Error fetching settings for marquee', error);
      }
    };
    fetchSettings();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const dummySearchProducts = [
    { name: 'Classic White T-Shirt', price: 29.99, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80' },
    { name: 'Vintage Wash Denim Jacket', price: 89.99, img: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=100&q=80' }
  ];

  const handleMouseEnter = (menu) => setActiveMenu(menu);
  const handleMouseLeave = () => setActiveMenu(null);

  const categories = ['Men', 'Women', 'Accessories', 'New Arrivals'];

  return (
    <>
      {/* Top Marquee */}
      {marquee.active && (
        <div className="bg-black text-white text-[10px] font-black py-2 overflow-hidden whitespace-nowrap border-b border-gray-800">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            className="flex space-x-8 inline-block tracking-widest uppercase"
          >
            {[...Array(10)].map((_, i) => (
               <span key={i} className="mx-4">{marquee.text}</span>
            ))}
          </motion.div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 w-full z-[100] bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300 dark:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo & Mobile Menu */}
            <div className="flex items-center gap-4 w-1/4">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/" className="text-3xl font-black tracking-tighter uppercase">
                CURA<span className="text-gray-400">.</span>
              </Link>
            </div>
            
            {/* Desktop Center Links */}
            <div className="hidden lg:flex items-center justify-center gap-6 text-[11px] font-bold tracking-widest flex-1 h-full whitespace-nowrap">
              {categories.map((item) => (
                <div 
                  key={item} 
                  className="h-full flex items-center group cursor-pointer relative"
                >
                  <Link to={`/shop?category=${item}`} className="hover:text-gray-500 transition-colors uppercase flex items-center gap-1">
                    {item}
                  </Link>
                  {/* Subtle hover underline */}
                  <span className="absolute bottom-6 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </div>
              ))}
              
              {/* Subtle AI Try-On link */}
              <Link to="/try-on" className="h-full flex items-center relative group text-gray-500 hover:text-black transition-colors whitespace-nowrap">
                <span className="uppercase flex items-center gap-1">
                  AI Try-On
                </span>
                <span className="absolute bottom-6 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center justify-end gap-3 w-1/4">
              
              {/* Search */}
              <div className="relative hidden sm:block">
                <form 
                  onSubmit={(e) => { e.preventDefault(); if (searchQuery) { navigate(`/shop?search=${searchQuery}`); setSearchFocused(false); } }}
                  className={`flex items-center border ${searchFocused ? 'border-black' : 'border-gray-200'} rounded-full px-3 py-1.5 transition-colors bg-gray-50 dark:bg-[#1E293B] dark:border-gray-700`}
                >
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all duration-300 dark:text-white"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
                
                {/* Live Search Autocomplete */}
                <AnimatePresence>
                  {searchFocused && searchQuery.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-12 right-0 w-80 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-[120]"
                    >
                      <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Products</h4>
                      <div className="space-y-3">
                        {dummySearchProducts.map((p, i) => (
                          <div key={i} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
                            <img src={p.img} alt={p.name} className="w-12 h-12 rounded-md object-cover bg-gray-100" />
                            <div>
                              <p className="text-sm font-bold">{p.name}</p>
                              <p className="text-xs text-gray-500">${p.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 mt-4 pt-3 text-center">
                         <span onClick={() => { navigate(`/shop?search=${searchQuery}`); setSearchFocused(false); }} className="text-xs font-bold text-black cursor-pointer hover:underline">View all results</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 hover:bg-black/5 rounded-full transition-colors hidden sm:block group">
                <Heart className="w-5 h-5 text-gray-700 group-hover:text-black transition-colors dark:text-gray-300 dark:group-hover:text-white" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-0 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white dark:border-[#0F172A]">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              {user ? (
                <div className="relative group/auth flex items-center gap-2 cursor-pointer p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                  <span className="text-xs font-bold uppercase tracking-widest">{(user.name && user.name.split ? user.name.split(' ')[0] : user.name) || 'Account'}</span>
                  {/* Invisible bridge to maintain hover state */}
                  <div className="absolute top-full right-0 pt-4 hidden group-hover/auth:block z-[120]">
                    <div className="bg-white border border-gray-100 shadow-xl p-4 w-40 dark:bg-[#1E293B] dark:border-gray-800 flex flex-col gap-3">
                      {!user.isAdmin && (
                        <Link to="/profile" className="text-xs font-bold uppercase hover:text-[#3B82F6] transition-colors dark:text-white text-left block">Profile</Link>
                      )}
                      {user.isAdmin && (
                        <Link to="/admin" className="text-xs font-bold uppercase hover:text-[#3B82F6] transition-colors dark:text-white text-left block">Admin Panel</Link>
                      )}
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      <button onClick={logout} className="text-xs font-bold uppercase text-red-500 hover:text-red-600 transition-colors text-left block">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/account" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </Link>
              )}
              
              <button onClick={toggleTheme} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors hidden sm:block">
                {isDark ? <Sun className="w-5 h-5 text-gray-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
              
              {/* Cart */}
              <Link to="/cart" className="flex items-center justify-center w-12 h-12 bg-black text-white hover:bg-gray-800 rounded-full transition-all relative hover:scale-105 active:scale-95 shadow-md group flex-shrink-0 ml-2">
                <motion.div 
                  key={cartCount} 
                  initial={{ scale: 0.8 }} 
                  animate={{ scale: [0.8, 1.4, 1] }} 
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <ShoppingCart className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                </motion.div>
                {cartCount > 0 && (
                  <motion.span 
                    key={`badge-${cartCount}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white dark:border-[#0F172A]"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[200] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white dark:bg-[#0F172A] z-[210] shadow-2xl flex flex-col lg:hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black tracking-tighter uppercase dark:text-white">
                  CURA<span className="text-gray-400">.</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 dark:text-gray-400 text-2xl">&times;</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <form 
                  onSubmit={(e) => { e.preventDefault(); if (searchQuery) { navigate(`/shop?search=${searchQuery}`); setIsMobileMenuOpen(false); } }}
                  className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 bg-gray-50 dark:bg-[#1E293B]"
                >
                  <Search className="w-5 h-5 text-gray-500 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    className="bg-transparent border-none outline-none text-sm w-full dark:text-white"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                <div className="flex flex-col gap-4 mt-4">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Categories</h4>
                  {categories.map((item) => (
                    <Link 
                      key={item} 
                      to={`/shop?category=${item}`} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-bold uppercase dark:text-white hover:text-[#8B5E3C] transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                  <Link 
                    to="/try-on" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold uppercase text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    AI Try-On
                  </Link>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <button onClick={toggleTheme} className="flex items-center gap-2 text-sm font-bold uppercase dark:text-white">
                  {isDark ? <><Sun className="w-5 h-5 text-gray-300" /> Light Mode</> : <><Moon className="w-5 h-5 text-gray-700" /> Dark Mode</>}
                </button>
                <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="relative p-2">
                  <Heart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white dark:border-[#0F172A]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
