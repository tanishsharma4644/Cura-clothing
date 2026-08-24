import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-6">CURA.</h2>
          <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">
            Redefining modern fashion with sustainable practices, premium materials, and a commitment to timeless design and technology.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-all">in</div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-all">tw</div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-all">ig</div>
          </div>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-wider mb-6">Shop</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><Link to="/shop?category=New Arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link to="/shop?category=Men" className="hover:text-white transition-colors">Men's Collection</Link></li>
            <li><Link to="/shop?category=Women" className="hover:text-white transition-colors">Women's Collection</Link></li>
            <li><Link to="/shop?category=Accessories" className="hover:text-white transition-colors">Accessories</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-wider mb-6">Support</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
            <li><Link to="/track-order" className="hover:text-white transition-colors font-bold text-[#E2C792]">Track Order</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-wider mb-6">Legal</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-xs tracking-widest uppercase">
        &copy; 2026 CURA. All rights reserved. Built for the future.
      </div>
    </footer>
  );
};

export default Footer;
