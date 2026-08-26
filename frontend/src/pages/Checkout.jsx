import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your actual publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Shipping form state
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);

  const shipping = 15.00;
  const tax = cartTotal * 0.08;
  const finalTotal = cartTotal + shipping + tax;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to place an order.');
      setTimeout(() => navigate('/account'), 2000);
      return;
    }
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      // 1. Create Payment Intent
      const { data: { clientSecret } } = await axios.post(
        'https://cura-clothing.onrender.com/api/stripe/create-payment-intent', 
        { amount: finalTotal }, 
        config
      );

      // 2. Confirm Card Payment
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email,
          }
        }
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message);
        setIsProcessing(false);
        return;
      } 

      if (paymentResult.paymentIntent.status === 'succeeded') {
        // 3. Save Order to Database
        const orderData = {
          orderItems: cartItems.map(item => ({
            name: item.product.name,
            qty: item.quantity,
            image: item.product.imageUrl,
            price: item.product.price,
            product: item.product._id,
            selectedSize: item.size,
            selectedColor: item.color,
          })),
          shippingAddress: { address, city, postalCode, country, phone },
          paymentMethod: 'Stripe',
          totalPrice: finalTotal,
          isPaid: true,
          paidAt: new Date()
        };

        let createdOrderRes;
        try {
          createdOrderRes = await axios.post('https://cura-clothing.onrender.com/api/orders', orderData, config);
        } catch (e) {
          createdOrderRes = await axios.post('https://cura-clothing.onrender.com/api/orders', orderData, config);
        }

        setCreatedOrderId(createdOrderRes.data._id);
        setIsProcessing(false);
        setIsSuccess(true);
        clearCart();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing order.');
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center pt-24 pb-20 px-4">
        <div className="bg-[#131622] border border-[#C5A059]/40 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl rounded-3xl">
          <CheckCircle2 className="w-16 h-16 text-[#C5A059] mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-serif text-white mb-2">Order Confirmed! ✨</h1>
          <p className="text-gray-300 text-sm mb-4 font-light leading-relaxed">
            Thank you for shopping with CURA Atelier. Your payment was processed successfully.
          </p>
          <div className="bg-black/50 border border-white/10 p-4 rounded-2xl mb-6 text-xs font-mono text-[#E2C792] text-left space-y-1.5">
            <p>📧 A complete order confirmation email with itemized details & receipt has been sent to <span className="text-white font-bold">{user?.email}</span>.</p>
            {createdOrderId && <p>📦 Order Reference ID: <span className="text-white font-bold">{createdOrderId}</span></p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {createdOrderId && (
              <Link to={`/track-order?id=${createdOrderId}`} className="bg-[#C5A059] text-black px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors">
                Track Shipment Live
              </Link>
            )}
            <Link to="/shop" className="bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-40 pb-24 text-center bg-[#FAF9F6] dark:bg-[#0F172A] transition-colors duration-500">
        <h2 className="text-3xl font-serif text-[#1C1917] dark:text-white mb-4 transition-colors">Your bag is empty</h2>
        <Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C] dark:text-[#3B82F6] border-b border-[#8B5E3C] dark:border-[#3B82F6] pb-1 hover:text-[#1C1917] dark:hover:text-white transition-colors">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] pt-20 pb-24 transition-colors duration-500 text-[#1C1917] dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-8 hover:text-[#8B5E3C] dark:hover:text-[#3B82F6] transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Back to Bag
        </Link>
        
        {!user && (
           <div className="bg-red-50 text-red-500 p-4 text-sm font-bold tracking-wider uppercase mb-8 border border-red-200">
             You must <Link to="/account" className="underline">sign in</Link> to checkout securely.
           </div>
        )}
        
        {error && (
           <div className="bg-red-50 text-red-500 p-4 text-sm font-bold tracking-wider uppercase mb-8 border border-red-200">
             {error}
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Checkout Form */}
          <div>
            <h1 className="text-3xl font-serif mb-8">Checkout</h1>
            
            <form onSubmit={handlePlaceOrder} className="space-y-10">
              
              {/* Shipping */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-gray-200 dark:border-gray-800 pb-2 text-[#8B5E3C] dark:text-[#3B82F6]">Shipping Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} className="col-span-2 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 p-4 outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400" />
                  <input type="text" required placeholder="City" value={city} onChange={e=>setCity(e.target.value)} className="col-span-1 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 p-4 outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400" />
                  <input type="text" required placeholder="Postal Code" value={postalCode} onChange={e=>setPostalCode(e.target.value)} className="col-span-1 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 p-4 outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400" />
                  <input type="text" required placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} className="col-span-1 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 p-4 outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400" />
                  <input type="tel" required placeholder="Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} className="col-span-1 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 p-4 outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-400" />
                </div>
              </section>

              {/* Payment (Stripe) */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 border-b border-gray-200 dark:border-gray-800 pb-2 text-[#8B5E3C] dark:text-[#3B82F6]">Payment Details (Secure)</h3>
                <div className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 p-6">
                  <CardElement options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }} />
                </div>
              </section>

              <button 
                type="submit" 
                disabled={isProcessing || !user || !stripe}
                className="w-full bg-[#1C1917] dark:bg-[#3B82F6] text-white py-5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-3 disabled:bg-gray-400 dark:disabled:bg-gray-700"
              >
                {isProcessing ? 'Processing Payment...' : `Pay ₹${finalTotal.toFixed(0)}`}
              </button>

            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:pl-8">
            <div className="bg-white dark:bg-[#1E293B] p-8 border border-gray-100 dark:border-gray-800 shadow-xl sticky top-32 transition-colors">
              <h3 className="text-xl font-serif mb-8">In Your Bag</h3>
              
              <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-20 h-24 bg-gray-100 dark:bg-[#0F172A] flex-shrink-0 relative">
                      <img 
                        src={item.product.imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'} 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'; }}
                        alt={item.product.name} 
                        className="w-full h-full object-cover dark:brightness-90" 
                      />
                      <span className="absolute -top-2 -right-2 bg-gray-400 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{item.quantity}</span>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs uppercase tracking-wider pr-4">{item.product.name}</h4>
                        <span className="font-bold text-sm">₹{(item.product.price * item.quantity).toFixed(0)}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">
                        {item.color !== 'Default' && `${item.color}`} 
                        {item.color !== 'Default' && item.size !== 'Default' && ' / '} 
                        {item.size !== 'Default' && `${item.size}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 space-y-4 text-sm font-medium text-[#57534E] dark:text-[#94A3B8]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-black dark:text-white font-bold">₹{cartTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-black dark:text-white font-bold">₹{shipping.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span className="text-black dark:text-white font-bold">₹{tax.toFixed(0)}</span>
                </div>
              </div>

              <div className="border-t border-black dark:border-white pt-6 mt-6 flex justify-between items-center text-2xl font-serif">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Wrap the checkout component with Stripe Elements Provider
const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
