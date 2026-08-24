import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Package, RotateCcw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'https://cura-clothing.onrender.com';

// AI response logic
const getAIResponse = async (input, orders = [], userName = '') => {
  const msg = input.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|hola|namaste|sup|yo)\b/.test(msg)) {
    const name = userName ? `, ${userName.split(' ')[0]}` : '';
    return {
      text: `Hey${name}! 👋 I'm CURA Assistant. I can help you with:\n\n• **Track your order**\n• **Return & refund policy**\n• **Shipping info**\n• **Size guide**\n• **Contact support**\n\nWhat do you need help with?`,
      type: 'greeting',
    };
  }

  // Order tracking lookup
  const orderIdMatch = msg.match(/(cura-trk-[a-z0-9]+|[a-f0-9]{24})/i);
  if (orderIdMatch) {
    const idToTrack = orderIdMatch[1];
    try {
      const res = await axios.get(`http://localhost:5001/api/orders/track/${idToTrack}`)
        .catch(() => axios.get(`https://cura-clothing.onrender.com/api/orders/track/${idToTrack}`));
      const data = res.data;
      return {
        text: `📦 **Live Order Tracking Update**\n\n• **Order Ref**: #${data.shortId}\n• **Status**: ${data.currentStatus}\n• **Courier**: ${data.courierPartner} (${data.trackingNumber})\n• **Est. Delivery**: ${new Date(data.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n• **Total Amount**: ₹${data.totalPrice?.toLocaleString('en-IN')}\n\n👉 [Open Full Visual Tracking Map](/track-order?id=${data.orderId})`,
        type: 'order_detail'
      };
    } catch (e) {
      // Ignore fallback
    }
  }

  // Order tracking
  if (/track|order|where|status|package|deliver|shipment/.test(msg)) {
    if (orders.length === 0) {
      return {
        text: "You can track any package by typing your **Order ID** or **Tracking Number** directly in chat, or use our [Track Order Page](/track-order)!\n\nNeed assistance? Share your Order ID!",
        type: 'order',
      };
    }
    const recent = orders.slice(0, 3);
    const orderList = recent.map(o => {
      const status = o.isDelivered ? '✅ Delivered' : o.isPaid ? '🚚 In Transit' : '⏳ Processing';
      const date = new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return `• **Order #${o._id.slice(-6).toUpperCase()}** (${date}) — ${status} — ₹${o.totalPrice.toFixed(0)}\n  👉 [Track Order #${o._id.slice(-6).toUpperCase()}](/track-order?id=${o._id})`;
    }).join('\n\n');
    return {
      text: `Here are your recent orders:\n\n${orderList}\n\nYou can click any link above or visit our [Track Order Page](/track-order)!`,
      type: 'order',
    };
  }

  // Returns & refunds
  if (/return|refund|exchange|replace|wrong|damage|defect/.test(msg)) {
    return {
      text: "**CURA Return Policy** 🔄\n\n• Returns accepted within **30 days** of delivery\n• Items must be **unworn, unwashed** with original tags\n• **Damaged or wrong items**: Full refund + free return pickup\n• Refunds are processed within **5–7 business days**\n\nTo initiate a return, email us at **support@cura.com** with your Order ID and reason.",
      type: 'return',
    };
  }

  // Shipping
  if (/ship|delivery|dispatch|fast|express|time|days/.test(msg)) {
    return {
      text: "**CURA Shipping Info** 📦\n\n• **Standard Delivery**: 5–7 business days — FREE on orders above ₹999\n• **Express Delivery**: 2–3 business days — ₹149\n• **Same-Day** (select cities): ₹299\n\nOrders are dispatched within **24–48 hours** of payment confirmation. You'll receive a tracking link via email!",
      type: 'shipping',
    };
  }

  // Size guide
  if (/size|fit|measurement|chest|waist|small|medium|large|xl/.test(msg)) {
    return {
      text: "**CURA Size Guide** 📏\n\n| Size | Chest | Waist | Hip |\n|------|-------|-------|-----|\n| XS | 32\" | 26\" | 34\" |\n| S | 34\" | 28\" | 36\" |\n| M | 36\" | 30\" | 38\" |\n| L | 38\" | 32\" | 40\" |\n| XL | 40\" | 34\" | 42\" |\n| XXL | 42\" | 36\" | 44\" |\n\nTip: If you're between sizes, **size up** for a relaxed fit. Our **AI Try-On** feature lets you see exactly how a garment looks on you! 👗",
      type: 'size',
    };
  }

  // Payment
  if (/pay|payment|card|upi|cod|cash|stripe|online/.test(msg)) {
    return {
      text: "**CURA Payment Options** 💳\n\n• **Credit/Debit Cards** (Visa, Mastercard, Amex)\n• **UPI** (Google Pay, PhonePe, Paytm)\n• **Net Banking**\n• **Cash on Delivery** (available on orders under ₹5,000)\n• **Stripe** secure payment gateway\n\nAll transactions are **256-bit SSL encrypted** for your security. 🔒",
      type: 'payment',
    };
  }

  // Contact / Human support
  if (/contact|human|agent|talk|call|email|support|help/.test(msg)) {
    return {
      text: "**Connect with CURA Support** 📞\n\n• 📧 **Email**: support@cura.com\n• ⏰ **Hours**: Mon–Sat, 9 AM – 6 PM IST\n• 📱 **Response Time**: Within 24 hours\n\nFor urgent order issues, email us with your **Order ID** and we'll prioritize your case!",
      type: 'contact',
    };
  }

  // Try-on
  if (/try.?on|virtual|ai|wear|look|outfit/.test(msg)) {
    return {
      text: "✨ **AI Virtual Try-On** is one of CURA's flagship features!\n\nHere's how it works:\n1. Go to **Try-On** page\n2. Upload a full-body photo (facing forward)\n3. Select any garment from our catalogue\n4. Our **Replicate AI** generates a realistic preview of you wearing it!\n\nThis usually takes 15–30 seconds. Try it now! 👉",
      type: 'tryon',
    };
  }

  // Thank you
  if (/thank|thanks|thx|great|awesome|helpful|perfect/.test(msg)) {
    return {
      text: "You're very welcome! 😊 Is there anything else I can help you with?\n\nFeel free to ask about orders, returns, shipping, or anything else CURA-related!",
      type: 'thanks',
    };
  }

  // Default fallback
  return {
    text: "I'm not sure I understood that perfectly. Here's what I can help with:\n\n• **Track Order** — Check your order status\n• **Returns** — Return & refund policy\n• **Shipping** — Delivery times & charges\n• **Sizing** — Find your perfect fit\n• **Contact** — Reach our support team\n\nOr try rephrasing your question! 😊",
    type: 'fallback',
  };
};

// Markdown renderer
const renderMessage = (text) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline font-semibold">$1</a>');

    if (line.startsWith('• ')) {
      return <li key={i} className="ml-2" dangerouslySetInnerHTML={{ __html: line.replace('• ', '') }} />;
    }
    if (line.startsWith('|')) {
      return null;
    }
    if (!line.trim()) return <br key={i} />;
    return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: line }} />;
  });
};

const QUICK_REPLIES = ['Track my order', 'Return policy', 'Shipping info', 'Size guide', 'Contact support'];

// Main chatbot component
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hi! I'm **CURA Assistant** 👋\n\nHow can I help you today? You can ask me about orders, returns, shipping, sizing, or anything else!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-close chatbot on route/page change
  const { pathname } = useLocation();
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      // Load user orders if logged in
      if (user && orders.length === 0) {
        axios.get(`${API_BASE}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }).then(res => setOrders(res.data)).catch(() => {});
      }
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const userMsg = { id: Date.now(), role: 'user', text: userText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate natural typing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = await getAIResponse(userText, orders, user?.name);
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: response.text, time: new Date() }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'bot',
      text: "Chat cleared! How can I help you?",
      time: new Date(),
    }]);
  };

  return (
    <>
      {/* ── Floating Bubble — Premium Animated ────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Outer glow ring */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400"
            style={{ filter: 'blur(12px)' }}
          />
        )}
        {/* Spinning gradient border */}
        {!isOpen && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-[3px] rounded-full"
            style={{ background: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6, #8b5cf6)' }}
          />
        )}
        {/* Main button */}
        <motion.button
          onClick={() => setIsOpen(o => !o)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.8 }}
          whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}
          whileTap={{ scale: 0.9 }}
          className="relative w-[56px] h-[56px] bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#1C1917] dark:from-[#3B82F6] dark:via-[#6366F1] dark:to-[#8B5CF6] text-white rounded-full shadow-2xl flex items-center justify-center overflow-hidden"
          aria-label="Open chat support"
        >
          {/* Shimmer sweep */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
          />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: 180, scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <X className="w-6 h-6 relative z-10" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                exit={{ rotate: -180, scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative"
              >
                <MessageCircle className="w-6 h-6 relative z-10" />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Notification dot with ping */}
          {!isOpen && (
            <span className="absolute top-0 right-0 z-20">
              <span className="absolute w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
              <span className="relative block w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#6366F1]" />
            </span>
          )}
        </motion.button>
        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.4 }}
            className="absolute right-[68px] top-1/2 -translate-y-1/2 bg-white dark:bg-[#1E293B] text-[#1C1917] dark:text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg border border-[#E8E6E1] dark:border-white/10 whitespace-nowrap pointer-events-none"
          >
            Need help? 💬
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-[#1E293B] border-r border-b border-[#E8E6E1] dark:border-white/10 rotate-[-45deg]" />
          </motion.div>
        )}
      </div>

      {/* ── Chat Window ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white dark:bg-[#1E293B] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-[#E8E6E1] dark:border-white/10 flex flex-col overflow-hidden"
            style={{ height: '540px' }}
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-[#1C1917] via-[#292524] to-[#1C1917] dark:from-[#3B82F6] dark:via-[#6366F1] dark:to-[#8B5CF6] px-5 py-4 flex items-center gap-3 flex-shrink-0 overflow-hidden">
              {/* Animated shimmer across header */}
              <motion.div
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/3"
              />
              {/* Bot avatar with animated ring */}
              <div className="relative flex-shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-[2px] rounded-full"
                  style={{ background: 'conic-gradient(from 0deg, #10b981, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #10b981)' }}
                />
                <div className="relative w-9 h-9 bg-[#1C1917] dark:bg-[#4F46E5] rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <p className="font-bold text-white text-sm">CURA Assistant</p>
                <div className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                  <p className="text-white/70 text-xs">Online — Replies instantly</p>
                </div>
              </div>
              <button onClick={resetChat} title="Clear chat" className="relative z-10 text-white/50 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6] dark:bg-[#0F172A]">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-[#1C1917] dark:bg-[#3B82F6]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {msg.role === 'bot' ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-300" />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1C1917] dark:bg-[#3B82F6] text-white rounded-tr-sm'
                        : 'bg-white dark:bg-[#1E293B] text-[#1C1917] dark:text-gray-100 border border-[#E8E6E1] dark:border-white/10 rounded-tl-sm shadow-sm'
                    }`}>
                      <ul className="space-y-0.5 list-none">
                        {renderMessage(msg.text)}
                      </ul>
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">
                      {msg.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#1C1917] dark:bg-[#3B82F6] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-[#1E293B] border border-[#E8E6E1] dark:border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 pt-2 flex gap-2 overflow-x-auto pb-1 flex-shrink-0 bg-[#FAF9F6] dark:bg-[#0F172A]">
                {QUICK_REPLIES.map(reply => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="flex-shrink-0 text-xs font-semibold bg-white dark:bg-[#1E293B] border border-[#E8E6E1] dark:border-white/10 text-[#1C1917] dark:text-gray-300 px-3 py-1.5 rounded-full hover:border-[#1C1917] dark:hover:border-white hover:text-[#1C1917] dark:hover:text-white transition-all shadow-sm"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-[#E8E6E1] dark:border-white/10 flex gap-2 flex-shrink-0 bg-white dark:bg-[#1E293B]">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-[#FAF9F6] dark:bg-black/20 border border-[#E8E6E1] dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#1C1917] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C1917] dark:focus:ring-[#3B82F6] transition-all"
              />
              <motion.button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gradient-to-br from-[#1C1917] to-[#44403C] dark:from-[#3B82F6] dark:to-[#8B5CF6] text-white rounded-xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-md hover:shadow-lg"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
