import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Trash2, Plus, Minus, Tag, Check, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [automaticOffer, setAutomaticOffer] = useState(null);
  const [availablePromoCodes, setAvailablePromoCodes] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await axios.get('https://cura-clothing.onrender.com/api/offers');
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
      const { data } = await axios.post('https://cura-clothing.onrender.com/api/offers/apply', { code: code.toUpperCase() });
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

  const activeOffer = appliedPromo || automaticOffer;
  const discountAmount = activeOffer ? cartTotal * (activeOffer.discountPercentage / 100) : 0;
  const finalTotal = cartTotal - discountAmount;

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-12">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
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
                {cartItems.map((item, index) => (
                  <div key={`${item.product._id}-${item.size}-${item.color}-${index}`} className="flex gap-6 pb-8 border-b border-gray-100 relative group">
                    <button 
                      onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                      className="absolute top-0 right-0 p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    <Link to={`/product/${item.product._id}`} className="w-32 h-40 bg-gray-100 overflow-hidden flex-shrink-0">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </Link>
                    
                    <div className="flex flex-col flex-grow py-1">
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/product/${item.product._id}`}>
                          <h3 className="text-lg font-bold uppercase tracking-tight hover:text-gray-500 transition-colors">{item.product.name}</h3>
                        </Link>
                        <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <p className="text-gray-500 text-sm mb-4">
                        {item.color !== 'Default' && `Color: ${item.color}`} 
                        {item.color !== 'Default' && item.size !== 'Default' && ' | '} 
                        {item.size !== 'Default' && `Size: ${item.size}`}
                      </p>
                      
                      <div className="mt-auto flex items-center gap-6">
                        <div className="flex items-center border border-gray-200">
                          <button 
                            onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 h-10 flex items-center justify-center font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                          className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black underline underline-offset-4 lg:hidden"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-8 border border-gray-100 sticky top-32">
                <h3 className="text-xl font-black tracking-widest mb-8 uppercase">Order Summary</h3>
                <div className="space-y-4 mb-6 text-gray-600 font-medium text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-black font-bold">${cartTotal.toFixed(2)}</span>
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
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({activeOffer.discountPercentage}%)</span>
                      <span className="font-bold">- ${discountAmount.toFixed(2)}</span>
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
                            placeholder="Promo code" 
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

                {/* Available Coupons (Reebok Style) */}
                {availablePromoCodes.length > 0 && (
                  <div className="mt-8 mb-8 border-t border-gray-200 pt-6">
                    <button 
                      onClick={() => setShowCoupons(!showCoupons)}
                      className="flex items-center gap-2 text-sm font-bold text-red-500 uppercase tracking-widest mb-4 hover:text-red-600 transition-colors"
                    >
                      More Coupons 
                      <motion.div animate={{ rotate: showCoupons ? 90 : 0 }}>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </button>
                    
                    {showCoupons && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                        {availablePromoCodes.map(promo => (
                          <div key={promo._id} className="relative bg-white border border-gray-200 rounded-lg p-4 pl-6 shadow-sm flex items-start justify-between overflow-hidden group">
                            {/* Ticket Dashed Border Effect */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-500 flex items-center justify-center overflow-hidden">
                               {/* Create dashed effect */}
                               <div className="w-[1px] h-full border-l-[3px] border-dashed border-white opacity-50 mix-blend-overlay"></div>
                            </div>
                            
                            <div className="flex-1 ml-2">
                              <div className="inline-block border border-dashed border-green-500 bg-green-50 px-2 py-1 mb-2 text-green-700 font-mono text-[10px] font-bold uppercase tracking-widest rounded-sm">
                                {promo.code}
                              </div>
                              <p className="text-sm font-bold mb-1 text-gray-800">{promo.title}</p>
                              <p className="text-xs text-gray-400 underline mb-3 cursor-pointer hover:text-black">T&C</p>
                              <p className="font-black text-sm">Get {promo.discountPercentage}% Off</p>
                            </div>
                            
                            <div className="flex flex-col items-end justify-between h-[100px]">
                              <button 
                                onClick={() => {
                                  setPromoCode(promo.code);
                                  handleApplyPromo(promo.code);
                                }}
                                disabled={appliedPromo?.code === promo.code}
                                className={`text-xs font-bold uppercase tracking-widest ${appliedPromo?.code === promo.code ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:text-green-800'}`}
                              >
                                {appliedPromo?.code === promo.code ? 'Applied' : 'Apply'}
                              </button>
                              <span className="font-black text-lg tracking-tighter text-gray-200 group-hover:text-gray-300 transition-colors">OC.</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6 mb-8 flex justify-between items-center text-2xl font-black uppercase tracking-tighter">
                  <span>Total</span>
                  <div className="text-right">
                    {activeOffer && <div className="text-sm text-gray-400 line-through mb-1">${cartTotal.toFixed(2)}</div>}
                    <span>${finalTotal.toFixed(2)}</span>
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
