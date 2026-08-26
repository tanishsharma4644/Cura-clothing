import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Copy, Check, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5001'
  : 'https://cura-clothing.onrender.com';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const handleTrack = async (queryToSearch) => {
    const term = queryToSearch || searchQuery;
    if (!term || !term.trim()) {
      setError('Please enter a valid Order ID or Tracking Number');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await axios.get(`${API_BASE}/api/orders/track/${term.trim()}`)
        .catch(() => axios.get(`https://cura-clothing.onrender.com/api/orders/track/${term.trim()}`));

      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'No active order found with this Tracking ID. Please double check.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setSearchQuery(queryId);
      handleTrack(queryId);
    }
  }, [queryId]);

  const copyTrackingNumber = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#F9F6F0] pt-28 pb-24 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#C5A059] selection:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#C5A059]/10 border border-[#C5A059]/30 px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#C5A059]" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E2C792]">Real-Time Order Logistics</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif text-white mb-4">Track Shipment Status</h1>
          <p className="text-gray-400 text-sm max-w-lg mx-auto font-light">
            Enter your Order ID or Tracking Number to monitor your atelier garment delivery status live.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-[#131622] border border-[#C5A059]/30 p-4 sm:p-6 rounded-3xl shadow-2xl mb-12">
          <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. 64f1a... or CURA-TRK-892347)" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-[#C5A059] transition-colors"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#C5A059] text-black px-8 py-4 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl whitespace-nowrap disabled:opacity-50"
            >
              {loading ? 'Searching Logistics...' : 'Track Package'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-mono text-center">
              ⚠️ {error}
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Connecting to Express Logistics Server...</p>
          </div>
        )}

        {/* Order Details */}
        {order && !loading && (
          <div className="space-y-8 animate-fadeIn">
            
            <div className="bg-[#131622] border border-[#C5A059]/40 p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest block mb-1">
                    Order Ref: #{order.shortId}
                  </span>
                  <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                    Status: <span className="text-[#E2C792]">{order.currentStatus}</span>
                  </h2>
                </div>

                <div className="bg-black/50 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">Courier Waybill</span>
                    <span className="text-xs font-mono font-bold text-white">{order.trackingNumber}</span>
                  </div>
                  <button 
                    onClick={() => copyTrackingNumber(order.trackingNumber)}
                    className="p-2 hover:bg-white/10 rounded-lg text-[#C5A059] transition-colors"
                    title="Copy Waybill Number"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 text-xs">
                <div>
                  <span className="text-gray-400 font-mono uppercase block mb-1">Carrier Partner</span>
                  <p className="font-serif text-white font-bold text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#C5A059]" /> {order.courierPartner}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-mono uppercase block mb-1">Est. Delivery</span>
                  <p className="font-serif text-[#E2C792] font-bold text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#C5A059]" /> 
                    {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-mono uppercase block mb-1">Payment Method</span>
                  <p className="font-mono text-white font-bold">{order.paymentMethod} ({order.isPaid ? 'Paid' : 'COD'})</p>
                </div>

                <div>
                  <span className="text-gray-400 font-mono uppercase block mb-1">Total Amount</span>
                  <p className="font-mono text-[#E2C792] font-bold text-sm">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#131622] border border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl">
              <h3 className="text-lg font-serif text-white mb-8 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C5A059]" /> Live Journey Milestone
              </h3>

              <div className="relative">
                <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-white/10 z-0">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C5A059] to-[#E2C792] transition-all duration-1000"
                    style={{ width: `${(order.currentStepIndex / (order.steps.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                  {order.steps.map((step, idx) => (
                    <div key={idx} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                        step.done 
                          ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/30 ring-4 ring-[#C5A059]/20' 
                          : 'bg-white/5 border border-white/10 text-gray-500'
                      }`}>
                        {step.done ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      <div>
                        <h4 className={`text-xs font-serif font-bold ${step.done ? 'text-white' : 'text-gray-500'}`}>
                          {step.label}
                        </h4>
                        <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                          {step.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Items & Address */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              <div className="md:col-span-7 bg-[#131622] border border-white/10 p-6 rounded-3xl shadow-xl">
                <h3 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest mb-6">
                  Items In This Package ({order.orderItems?.length || 0})
                </h3>

                <div className="space-y-4">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/5">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=80'} 
                        alt={item.name} 
                        className="w-14 h-16 object-cover rounded-xl border border-white/10" 
                      />
                      <div className="flex-grow">
                        <h4 className="text-sm font-serif text-white">{item.name}</h4>
                        <p className="text-[11px] font-mono text-gray-400">Qty: {item.qty} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-[#E2C792]">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col gap-6">
                
                {order.shippingAddress && (
                  <div className="bg-[#131622] border border-white/10 p-6 rounded-3xl shadow-xl flex-grow">
                    <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C5A059]" /> Destination Address
                    </h3>
                    <div className="text-xs font-light text-gray-300 leading-relaxed space-y-1">
                      <p className="font-serif font-bold text-white text-sm">{order.customerName}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && <p className="font-mono text-gray-400 pt-1">📞 {order.shippingAddress.phone}</p>}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-[#C5A059]/20 to-black border border-[#C5A059]/40 p-6 rounded-3xl shadow-xl text-center">
                  <MessageCircle className="w-6 h-6 text-[#C5A059] mx-auto mb-2" />
                  <h4 className="text-sm font-serif text-white mb-1">Need Logistics Help?</h4>
                  <p className="text-[11px] font-light text-gray-300 mb-4">Our CURA AI Chatbot can provide real-time updates directly in chat.</p>
                  <Link 
                    to="/shop" 
                    className="inline-flex items-center gap-2 bg-[#C5A059] text-black px-5 py-2.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Continue Atelier Shopping <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;
