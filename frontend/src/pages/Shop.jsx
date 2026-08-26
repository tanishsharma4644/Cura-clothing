import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Heart, ShoppingBag, Star } from 'lucide-react';
import Loader from '../components/Loader';
import { useWishlist } from '../context/WishlistContext';

const API_BASE = 'https://cura-clothing.onrender.com';
const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Accessories', 'New Arrivals'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const pageQuery = searchParams.get('page') || 1;
  const sortQuery = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSort, setShowSort] = useState(false);

  const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Pass keyword and page to backend; category/sort done client-side
        // as fallback since production API may not support these params yet
        const params = new URLSearchParams();
        if (searchQuery) params.set('keyword', searchQuery);
        params.set('pageNumber', pageQuery);
        // Fetch all products for this keyword/page, then filter below
        params.set('pageNumber', 1); // fetch page 1 broadly, filter client-side

        const { data } = await axios.get(`${API_BASE}/api/products?${params.toString()}&pageNumber=1`);

        let results = data.products || data || [];

        // ── Client-side category filter (fallback for production API) ──────────
        if (categoryQuery) {
          if (categoryQuery.toLowerCase() === 'new arrivals') {
            results = results.filter(p => p.isNewArrival);
          } else {
            results = results.filter(
              p => p.category?.toLowerCase() === categoryQuery.toLowerCase()
            );
          }
        }

        // ── Client-side sort ───────────────────────────────────────────────────
        if (sortQuery === 'price_asc') results = [...results].sort((a, b) => a.price - b.price);
        else if (sortQuery === 'price_desc') results = [...results].sort((a, b) => b.price - a.price);
        else if (sortQuery === 'rating') results = [...results].sort((a, b) => b.rating - a.rating);
        else results = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setProducts(results);
        setTotalCount(results.length);
        // Pagination handled server-side when category is not set
        if (!categoryQuery) {
          setPage(data.page || 1);
          setPages(data.pages || 1);
        } else {
          setPage(1);
          setPages(1); // single page after client filter
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryQuery, searchQuery, pageQuery, sortQuery]);

  const handleSortChange = (value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    newParams.delete('page'); // Reset to page 1 on sort change
    setSearchParams(newParams);
    setShowSort(false);
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortQuery)?.label || 'Newest First';

  if (loading) return <Loader text="Loading Collection" />;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] pt-32 pb-24 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif text-[#1C1917] dark:text-white mb-2"
          >
            {searchQuery
              ? `Results for "${searchQuery}"`
              : categoryQuery ? `${categoryQuery}` : 'All Products'}
          </motion.h1>
          <p className="text-gray-400 text-sm">{totalCount > 0 ? `${totalCount} items found` : 'Discover our latest arrivals and timeless pieces.'}</p>
        </div>

        {/* ── Filters Bar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 flex-wrap">
            {CATEGORIES.map(cat => {
              const isActive = (cat === 'All' && !categoryQuery) ||
                (categoryQuery?.toLowerCase() === cat.toLowerCase());
              const href = cat === 'All' ? '/shop' : `/shop?category=${encodeURIComponent(cat)}`;
              return (
                <Link
                  key={cat}
                  to={href}
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-widest border rounded-full whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#1C1917] text-white border-[#1C1917] dark:bg-white dark:text-black dark:border-white'
                      : 'border-[#E8E6E1] dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#1C1917] dark:hover:border-white bg-white dark:bg-[#1E293B]'
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1E293B] border border-[#E8E6E1] dark:border-white/10 rounded-full text-sm font-bold text-[#1C1917] dark:text-white shadow-sm hover:border-[#1C1917] dark:hover:border-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {currentSortLabel}
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1E293B] border border-[#E8E6E1] dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50"
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${
                        sortQuery === opt.value
                          ? 'bg-[#1C1917] dark:bg-[#3B82F6] text-white'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-[#FAF9F6] dark:hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Product Grid ─────────────────────────────────────────────────────── */}
        {products.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold">No products found for this filter.</p>
            <Link to="/shop" className="mt-4 inline-block text-sm text-[#8B5E3C] dark:text-[#3B82F6] underline font-bold">Clear filters</Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product, i) => {
              const isWishlisted = isInWishlist(product._id);
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className="group"
                >
                  {/* Image Container */}
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden mb-4 relative rounded-2xl">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'}
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'; }}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end justify-between p-4">
                      <Link
                        to={`/product/${product._id}`}
                        className="text-xs font-bold text-white uppercase tracking-widest bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white hover:text-black transition-all"
                      >
                        Quick View
                      </Link>
                    </div>
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product); }}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        isWishlisted
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                    {/* New Arrival Badge */}
                    {product.isNewArrival && (
                      <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest bg-[#1C1917] text-white px-2.5 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917] dark:text-white mb-1 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">₹{product.price.toFixed(0)}</p>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-bold text-gray-400">{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────────── */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-16">
            {[...Array(pages).keys()].map((x) => {
              const p = x + 1;
              const newParams = new URLSearchParams(searchParams);
              newParams.set('page', p);
              return (
                <Link
                  key={p}
                  to={`/shop?${newParams.toString()}`}
                  className={`w-11 h-11 flex justify-center items-center rounded-full border font-bold text-sm transition-all ${
                    p === page
                      ? 'bg-[#1C1917] text-white border-[#1C1917] dark:bg-white dark:text-black dark:border-white shadow-lg'
                      : 'bg-white dark:bg-[#1E293B] text-gray-500 border-[#E8E6E1] dark:border-gray-700 hover:border-[#1C1917] dark:hover:border-white'
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
