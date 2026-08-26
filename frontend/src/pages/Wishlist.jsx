import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { HeartCrack, ShoppingCart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    // Add item to cart with default selections (assuming first size and color)
    addToCart({
      ...item,
      qty: 1,
      selectedSize: item.sizes?.[0] || 'One Size',
      selectedColor: item.colors?.[0] || 'Standard'
    });
    // Remove from wishlist
    removeFromWishlist(item._id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF9F6] dark:bg-[#0F172A] px-4 text-center">
        <HeartCrack className="w-24 h-24 text-gray-300 dark:text-gray-700 mb-6" />
        <h2 className="text-3xl font-serif font-black dark:text-white mb-4">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">You haven't saved any items yet. Start exploring our collections and favorite the pieces you love.</p>
        <Link to="/shop" className="bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#8B5E3C] transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6] dark:bg-[#020617] transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-black dark:text-white tracking-tighter">
              YOUR <span className="text-[#8B5E3C] dark:text-[#3B82F6]">WISHLIST</span>.
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-4">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((item, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item._id} 
              className="group bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Link to={`/product/${item._id}`}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                </Link>
                <button 
                  onClick={() => removeFromWishlist(item._id)}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur text-red-500 hover:bg-red-50 rounded-full transition-colors shadow-sm"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <Link to={`/product/${item._id}`}>
                  <h3 className="font-bold text-lg dark:text-white mb-2 hover:text-[#8B5E3C] dark:hover:text-[#3B82F6] transition-colors line-clamp-1">{item.name}</h3>
                </Link>
                <p className="text-xl font-serif dark:text-gray-300 mb-6">₹{item.price.toFixed(0)}</p>
                
                <button 
                  onClick={() => handleMoveToCart(item)}
                  className="w-full py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#8B5E3C] dark:hover:bg-[#3B82F6] hover:text-white transition-colors rounded-lg"
                >
                  <ShoppingCart className="w-4 h-4" /> Move to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Wishlist;
