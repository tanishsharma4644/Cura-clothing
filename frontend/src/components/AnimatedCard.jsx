import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, CreditCard } from 'lucide-react';

const getCardBrand = (number) => {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'VISA';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'MASTERCARD';
  if (/^3[47]/.test(n)) return 'AMEX';
  if (/^6(?:011|5)/.test(n)) return 'DISCOVER';
  if (/^35/.test(n)) return 'JCB';
  return '';
};

const BrandLogo = ({ brand }) => {
  if (brand === 'VISA') return (
    <div className="text-white font-black text-2xl italic tracking-tighter" style={{ fontFamily: 'serif' }}>VISA</div>
  );
  if (brand === 'MASTERCARD') return (
    <div className="flex items-center gap-[-8px]">
      <div className="w-8 h-8 rounded-full bg-red-500 opacity-90" />
      <div className="w-8 h-8 rounded-full bg-yellow-400 opacity-90 -ml-3" />
    </div>
  );
  if (brand === 'AMEX') return (
    <div className="text-white font-black text-lg tracking-wider">AMEX</div>
  );
  return <CreditCard className="w-8 h-8 text-white/60" />;
};

const formatDisplay = (num) => {
  const clean = num.replace(/\s/g, '');
  const padded = clean.padEnd(16, '•');
  return `${padded.slice(0,4)}  ${padded.slice(4,8)}  ${padded.slice(8,12)}  ${padded.slice(12,16)}`;
};

const AnimatedCard = ({ cardNumber = '', cardName = '', expiry = '', cvv = '', isFlipped = false }) => {
  const brand = getCardBrand(cardNumber);

  return (
    <div className="w-full max-w-[400px] mx-auto" style={{ perspective: '1200px' }}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full aspect-[1.586/1]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ── FRONT ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#0C0A09]" />
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/[0.04]" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-white/[0.05]" />
          {/* Shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent w-1/3 skew-x-12"
          />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-6">
            {/* Top row */}
            <div className="flex justify-between items-start">
              {/* Chip */}
              <div className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px p-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-amber-500/40 rounded-[1px]" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-white/40 rotate-90" />
                <BrandLogo brand={brand} />
              </div>
            </div>

            {/* Card Number */}
            <div className="mt-auto mb-1">
              <p className="text-white text-xl sm:text-2xl font-mono tracking-[0.2em] select-none" style={{ letterSpacing: '0.15em' }}>
                {formatDisplay(cardNumber)}
              </p>
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end mt-3">
              <div>
                <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-1">Card Holder</p>
                <p className="text-white text-sm font-bold uppercase tracking-wider truncate max-w-[200px]">
                  {cardName || 'YOUR NAME'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] mb-1">Expires</p>
                <p className="text-white text-sm font-bold font-mono tracking-wider">
                  {expiry || 'MM/YY'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#292524] via-[#1C1917] to-[#0C0A09]" />
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/[0.04]" />

          <div className="relative h-full flex flex-col">
            {/* Magnetic strip */}
            <div className="w-full h-12 bg-[#0a0a0a] mt-8" />

            {/* Signature + CVV */}
            <div className="flex items-center gap-4 px-6 mt-6">
              <div className="flex-1 h-10 bg-white/10 rounded-md flex items-center px-3">
                <div className="flex gap-[2px]">
                  {[...Array(30)].map((_, i) => (
                    <div key={i} className="w-[2px] h-3 bg-white/20 rounded-full" style={{ height: `${8 + Math.random() * 8}px` }} />
                  ))}
                </div>
              </div>
              <div className="w-16 h-10 bg-white rounded-md flex items-center justify-center">
                <span className="text-[#1C1917] font-bold font-mono text-lg tracking-widest">
                  {cvv || '•••'}
                </span>
              </div>
            </div>

            {/* Bottom info */}
            <div className="mt-auto px-6 pb-6 flex justify-between items-end">
              <p className="text-white/30 text-[9px] leading-tight max-w-[200px]">
                This card is property of CURA Atelier. Unauthorized use is prohibited.
              </p>
              <BrandLogo brand={brand} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedCard;
