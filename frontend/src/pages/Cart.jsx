import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Trash2, Plus, Minus, Tag, Check, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001'
  : 'https://cura-clothing.onrender.com';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [automaticOffer, setAutomaticOffer] = useState(null);
  const [availablePromoCodes, setAvailablePromoCodes] = useState([]);
  const [showCoupons, setShowCoupons] = useState(true);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/offers`);
        const autoOffers = data.filter(o => o.type === 'automatic' && o.isActive);
        const promos = data.filter(o => o.type === 'promocode' && o.isActive);
        setAvailablePromoCodes(promos);
        
        const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const validOffers = autoOffers.filter(o => totalQty >= o.minItems);
        
        if (validOffers.length > 0) {
          const best = validOffers.reduce((prev, current) => (prev.discountPercentage > current.discountPercentage) ? prev : current);
          setAutomaticOffer(best);
        } else {
          setAutomaticOffer(null);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (cartItems.length > 0) {
      fetchOffers();
    } else {
      setAutomaticOffer(null);
      setAppliedPromo(null);
    }
  }, [cartItems]);

  const handleApplyPromo = async (codeToApply = null) => {
    const code = (typeof codeToApply === 'string' ? codeToApply : promoCode).trim();
    if (!code) return;
    setPromoError('');
    try {
      const { data } = await axios.post(`${API_BASE}/api/offers/apply`, { code: code.toUpperCase() });
      setAppliedPromo(data);
      if (typeof codeToApply !== 'string') setPromoCode('');
    } catch (error) {
      setPromoError(error.response?.data?.message || 'Invalid promo code');
      setAppliedPromo(null);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  // Filter out any corrupted or malformed cart items stored in localStorage
  const validCartItems = cartItems.filter(item => item && item.product && typeof item.product === 'object');
  const safeCartTotal = validCartItems.reduce((total, item) => total + ((item.product?.price || 0) * (item.quantity || 1)), 0);

  const activeOffer = appliedPromo || automaticOffer;
  const discountAmount = activeOffer ? safeCartTotal * (activeOffer.discountPercentage / 100) : 0;
  const finalTotal = safeCartTotal - discountAmount;

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-12">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {validCartItems.length === 0 ? (
              <div className="bg-gray-50 rounded-sm p-12 text-center border border-gray-100">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 uppercase">Your cart is empty</h3>
                <p className="text-gray-500 mb-8 font-light">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors mx-auto max-w-xs text-sm">
                  Continue Shopping <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {validCartItems.map((item, index) => {
                  const prod = item.product || {};
                  const price = prod.price || 0;
                  const qty = item.quantity || 1;
                  const itemTotal = price * qty;
                  return (
                    <div key={`${prod._id || index}-${item.size}-${item.color}-${index}`} className="flex gap-6 pb-8 border-b border-gray-100 relative group">
                      <Link to={`/product/${prod._id}`} className="w-32 h-40 bg-gray-100 overflow-hidden flex-shrink-0 rounded-lg">
                        <img 
                          src={prod.imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'} 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'; }}
                          alt={prod.name || 'Product'} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                        />
                      </Link>
                      
                      <div className="flex flex-col flex-grow py-1 justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <Link to={`/product/${prod._id}`}>
                              <h3 className="text-lg font-bold uppercase tracking-tight hover:text-gray-500 transition-colors">{prod.name || 'Clothing Item'}</h3>
                            </Link>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-lg">₹{itemTotal.toFixed(0)}</span>
                              <button 
                                onClick={() => removeFromCart(prod._id, item.size, item.color)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                                title="Remove item"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-gray-500 text-sm">
                            {item.color && item.color !== 'Default' && `Color: ${item.color}`} 
                            {item.color && item.color !== 'Default' && item.size && item.size !== 'Default' && ' | '} 
                            {item.size && item.size !== 'Default' && `Size: ${item.size}`}
                          </p>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-6">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(prod._id, item.size, item.color, qty - 1)}
                              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-10 h-10 flex items-center justify-center font-bold text-sm bg-gray-50">
                              {qty}
                            </span>
                            <button 
                              onClick={() => updateQuantity(prod._id, item.size, item.color, qty + 1)}
                              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          {validCartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-8 border border-gray-100 sticky top-32">
                <h3 className="text-xl font-black tracking-widest mb-8 uppercase">Order Summary</h3>
                <div className="space-y-4 mb-6 text-gray-600 font-medium text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-black font-bold">₹{safeCartTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  {activeOffer && (
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Discount ({activeOffer.discountPercentage}%)</span>
                      <span>- ₹{discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                </div>
                
                {/* Promo Code Input */}
                <div className="mb-6">
                  {appliedPromo ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Check size={16} /> Promo '{appliedPromo.code}' applied!
                      </div>
                      <button onClick={removePromo} className="hover:text-green-900"><X size={16} /></button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Try FIRST10 or CURA20" 
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="w-full pl-9 pr-3 py-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-black uppercase font-bold"
                          />
                        </div>
                        <button onClick={handleApplyPromo} className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-800">
                          Apply
                        </button>
                      </div>
                      {promoError && <p className="text-red-500 text-xs font-bold mt-2">{promoError}</p>}
                      {automaticOffer && !appliedPromo && (
                        <p className="text-green-600 text-xs font-bold mt-3 bg-green-50 p-2 rounded border border-green-100">
                          🎉 Auto-applied: {automaticOffer.title}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Available Coupons */}
                <div className="mt-6 mb-8 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Available Coupons</p>
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase">Tap to apply</span>
                  </div>

                  <div className="space-y-3">
                    {(availablePromoCodes.length > 0 ? availablePromoCodes : [
                      { code: 'FIRST10', title: 'New Customer Special', discountPercentage: 10 },
                      { code: 'CURA20', title: 'Luxury Festival Sale', discountPercentage: 20 },
                      { code: 'WELCOME15', title: 'VIP Pass', discountPercentage: 15 }
                    ]).map(coupon => (
                      <div 
                        key={coupon.code} 
                        onClick={() => {
                          setPromoCode(coupon.code);
                          handleApplyPromo(coupon.code);
                        }}
                        className={`p-3 rounded-xl border border-dashed transition-all cursor-pointer flex items-center justify-between ${appliedPromo?.code === coupon.code ? 'border-green-500 bg-green-50/50' : 'border-gray-300 hover:border-black bg-white shadow-sm'}`}
                      >
                        <div>
                          <span className="inline-block bg-black text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded mb-1">
                            {coupon.code}
                          </span>
                          <p className="text-xs font-bold text-gray-900">{coupon.title}</p>
                          <p className="text-[11px] text-gray-500">{coupon.discountPercentage}% OFF discount</p>
                        </div>
                        <button className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ${appliedPromo?.code === coupon.code ? 'bg-green-600 text-white' : 'bg-gray-100 text-black hover:bg-black hover:text-white'}`}>
                          {appliedPromo?.code === coupon.code ? 'Applied' : 'Apply'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-8 flex justify-between items-center text-2xl font-black uppercase tracking-tighter">
                  <span>Total</span>
                  <div className="text-right">
                    {activeOffer && <div className="text-sm text-gray-400 line-through mb-1">₹{safeCartTotal.toFixed(0)}</div>}
                    <span>₹{finalTotal.toFixed(0)}</span>
                  </div>
                </div>
                <Link to="/checkout" className="w-full block text-center bg-black text-white py-5 font-black uppercase tracking-widest hover:bg-gray-800 transition-colors mb-4 text-sm shadow-xl">
                  Proceed to Checkout
                </Link>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest font-bold">
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
