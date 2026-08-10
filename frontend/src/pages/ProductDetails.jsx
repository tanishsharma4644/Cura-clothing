import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Star, ShieldCheck, Truck, ArrowLeft, Check, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const isFavorited = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`https://cura-clothing.onrender.com/api/products/${id}`);
        setProduct(data);
        if(data.sizes?.length) setSelectedSize(data.sizes[0]);
        if(data.colors?.length) setSelectedColor(data.colors[0]);

        const offersRes = await axios.get('https://cura-clothing.onrender.com/api/offers');
        setOffers(offersRes.data.filter(o => o.isActive));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching product', error);
        setLoading(false);
      }
    };
    
    // Reset state when ID changes
    setLoading(true);
    setAdded(false);
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setReviewError('');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`https://cura-clothing.onrender.com/api/products/${id}/reviews`, { rating, comment }, config);
      alert('Review submitted successfully');
      setRating(0);
      setComment('');
      // refetch product to show new review
      const { data } = await axios.get(`https://cura-clothing.onrender.com/api/products/${id}`);
      setProduct(data);
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Error submitting review');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-20"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div></div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center pt-20 text-2xl font-bold">Product not found</div>;
  }

  return (
    <div className="bg-white min-h-screen pt-20 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-8 hover:text-gray-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 relative group"
          >
            <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500" />
            <img src={product.imageUrl.replace('80', '81')} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:scale-105" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <span className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold">${product.price}</span>
              <div className="flex items-center gap-1 text-sm font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-black text-black" /> {product.rating ? product.rating.toFixed(1) : 'No Ratings'} ({product.numReviews} Reviews)
              </div>
            </div>

            <p className="text-gray-600 mb-8 text-lg font-light leading-relaxed">{product.description}</p>

            {/* Active Offers Banner */}
            {offers.length > 0 && (
              <div className="mb-10 space-y-3">
                {offers.map(offer => (
                  <div key={offer._id} className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3">
                    <Tag className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-green-800 uppercase tracking-widest text-xs mb-1">
                        {offer.type === 'promocode' ? 'Promo Code Available' : 'Special Offer'}
                      </h4>
                      <p className="text-green-700 text-sm font-bold">
                        {offer.title} <span className="font-normal text-green-600">— get {offer.discountPercentage}% OFF!</span>
                      </p>
                      {offer.type === 'promocode' && (
                        <p className="text-xs text-green-600 mt-1 font-mono font-bold">Use code: {offer.code}</p>
                      )}
                      {offer.type === 'automatic' && (
                        <p className="text-xs text-green-600 mt-1">Discount applied automatically at checkout.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-black uppercase tracking-wider mb-3">Color: <span className="text-gray-500">{selectedColor}</span></h3>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-black scale-110' : 'border-transparent hover:border-gray-300 shadow-sm'}`}
                      style={{ backgroundColor: color.toLowerCase().replace(' ', '') === 'darkwash' ? '#1e3a8a' : color.toLowerCase().replace(' ', '') === 'lightblue' ? '#bfdbfe' : color.toLowerCase().replace(' ', '') === 'khaki' ? '#d4d4d8' : color.toLowerCase() }}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider">Size</h3>
                  <button className="text-sm font-bold text-gray-500 underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => {
                    // Check if this specific color+size is out of stock
                    const variant = product.variants?.find(v => v.size === size && v.color === selectedColor);
                    const isOutOfStock = variant && variant.stock === 0;

                    return (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`w-14 h-14 rounded-full border flex items-center justify-center font-bold transition-all ${isOutOfStock ? 'opacity-30 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50' : selectedSize === size ? 'border-black bg-black text-white shadow-md' : 'border-gray-200 hover:border-black text-gray-700 bg-white'}`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              {(() => {
                const currentVariant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
                const isOutOfStock = (currentVariant && currentVariant.stock === 0) || (product.countInStock === 0 && (!product.variants || product.variants.length === 0));
                
                return (
                  <button 
                    disabled={isOutOfStock}
                    onClick={() => {
                      addToCart(product, 1, selectedSize || 'Default', selectedColor || 'Default');
                      setAdded(true);
                      setTimeout(() => setAdded(false), 2000);
                    }}
                    className={`flex-1 text-white py-5 rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed shadow-none hover:scale-100 text-gray-500' : added ? 'bg-green-600' : 'bg-black hover:bg-gray-800'}`}
                  >
                    {isOutOfStock ? 'Out of Stock' : added ? <><Check className="w-5 h-5" /> Added to Cart</> : <><ShoppingBag className="w-5 h-5" /> Add to Cart</>}
                  </button>
                );
              })()}
              
              <button 
                onClick={() => {
                  if (isFavorited) {
                    removeFromWishlist(product._id);
                  } else {
                    addToWishlist(product);
                  }
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all hover:scale-[1.05] ${isFavorited ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-black'}`}
                title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-8 mt-4">
               <div className="flex items-center gap-3">
                 <Truck className="w-6 h-6 text-gray-400" />
                 <span className="text-sm font-bold text-gray-600 uppercase">Free Express Shipping</span>
               </div>
               <div className="flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-gray-400" />
                 <span className="text-sm font-bold text-gray-600 uppercase">Lifetime Warranty</span>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 border-t border-gray-100 pt-16 max-w-4xl">
          <h2 className="text-3xl font-black uppercase tracking-widest mb-8">Reviews</h2>
          
          <div className="mb-12">
            {product.reviews.length === 0 && <div className="text-gray-500 bg-gray-50 p-6 rounded-xl">No reviews yet.</div>}
            <div className="space-y-6">
              {product.reviews.map(review => (
                <div key={review._id} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">{review.name}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-black text-black' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">{new Date(review.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold uppercase tracking-wider mb-6">Write a Customer Review</h3>
            {user ? (
              <form onSubmit={submitHandler} className="bg-gray-50 p-8 rounded-2xl">
                {reviewError && <p className="text-red-500 mb-4 font-bold">{reviewError}</p>}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Rating</label>
                  <select required value={rating} onChange={(e) => setRating(e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-xl outline-none focus:border-black transition-colors">
                    <option value="">Select...</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Comment</label>
                  <textarea required rows="4" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-xl outline-none focus:border-black transition-colors"></textarea>
                </div>
                <button type="submit" className="bg-black text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-gray-800 transition-colors">
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 p-8 rounded-2xl text-center">
                <p className="text-gray-600 mb-4">Please <Link to="/account" className="font-bold underline text-black">sign in</Link> to write a review</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
