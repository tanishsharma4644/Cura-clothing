import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = true, text = "Curating Elegance" }) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#FAF9F6] dark:bg-[#0F172A] transition-colors duration-500" 
    : "w-full h-64 flex flex-col items-center justify-center bg-transparent";

  return (
    <div className={containerClasses}>
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated minimal logo */}
        <div className="relative w-16 h-16 mb-8 flex justify-center items-center">
          <motion.span 
            className="absolute text-4xl font-black font-serif text-[#1C1917] dark:text-white"
            initial={{ opacity: 0.2, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5, ease: 'easeInOut' }}
          >
            C<span className="text-[#8B5E3C] dark:text-[#3B82F6]">.</span>
          </motion.span>
          
          <motion.div 
            className="absolute w-full h-full border border-[#8B5E3C] dark:border-[#3B82F6] rounded-full"
            initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 360, scale: 1.2, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          
          <motion.div 
            className="absolute w-[120%] h-[120%] border-t-2 border-[#1C1917] dark:border-white rounded-full opacity-50"
            initial={{ rotate: -90 }}
            animate={{ rotate: 270 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
        </div>
        
        {/* Animated text */}
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#57534E] dark:text-[#94A3B8]"
          >
            {text}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ...
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Loader;
