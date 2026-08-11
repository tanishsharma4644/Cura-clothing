import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const TryOn = () => {
  const [products, setProducts] = useState([]);
  const [userImageBase64, setUserImageBase64] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch real products from the backend API
    const fetchProducts = async () => {
      try {
        const res = await axios.get('https://cura-clothing.onrender.com/api/products');
        setProducts(res.data.products || res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImageBase64(reader.result);
        setResultImage(null); // Reset result if new image uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userImageBase64 || !selectedProduct) return;
    
    setIsProcessing(true);
    setError('');

    try {
      // Connect to the local backend /api/tryon endpoint
      // Ensure backend is running on localhost:5001
      const response = await axios.post('http://localhost:5001/api/tryon', {
        userImageBase64: userImageBase64,
        garmentImageUrl: selectedProduct.imageUrl
      });

      if (response.data.success) {
        setResultImage(response.data.resultUrl);
      } else {
        setError(response.data.message || "Failed to generate try-on.");
      }
    } catch (err) {
      console.error(err);
      setError("AI Processing failed. Make sure your backend server is running and the API key is valid.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] pt-28 pb-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
            <span className="bg-[#1C1917] dark:bg-[#3B82F6] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <Sparkles className="w-3 h-3" /> Powered by Replicate AI
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-serif text-[#1C1917] dark:text-white mb-6">
            AI Virtual Try-On
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-[#57534E] dark:text-[#94A3B8] font-light max-w-2xl mx-auto">
            Upload your photo and select a garment from our collection. Our AI will realistically drape the clothing onto your body.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {isProcessing ? (
            /* Loading State */
            <motion.div 
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto bg-white dark:bg-[#1E293B] rounded-3xl p-16 shadow-2xl flex flex-col items-center justify-center min-h-[500px] border border-[#E8E6E1] dark:border-white/10"
            >
              <Loader2 className="w-16 h-16 text-[#8B5E3C] dark:text-[#3B82F6] animate-spin mb-8" />
              <h2 className="text-3xl font-serif mb-4 text-center text-[#1C1917] dark:text-white">Generating your fit...</h2>
              <p className="text-[#57534E] dark:text-[#94A3B8] text-center max-w-md">
                Our AI is currently analyzing your body structure, mapping the fabric, and rendering realistic shadows and lighting. This typically takes a few seconds.
              </p>
            </motion.div>
          ) : resultImage ? (
            /* Result State */
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white dark:bg-[#1E293B] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E6E1] dark:border-white/10">
                <div className="relative aspect-[3/4] md:aspect-video w-full bg-[#EAE7DF] dark:bg-black">
                  <img src={resultImage} alt="Try-On Result" className="w-full h-full object-contain" />
                </div>
                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-serif text-[#1C1917] dark:text-white mb-2">Looks great on you!</h3>
                    <p className="text-[#57534E] dark:text-[#94A3B8]">{selectedProduct?.name}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setResultImage(null)}
                      className="px-6 py-3 border border-[#1C1917] dark:border-white/20 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Try Another
                    </button>
                    <button className="bg-[#1C1917] dark:bg-[#3B82F6] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:-translate-y-1 transition-transform">
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Setup State */
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
            >
              {/* Step 1: Upload Photo */}
              <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 shadow-xl border border-[#E8E6E1] dark:border-white/10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-[#1C1917] dark:bg-[#3B82F6] text-white flex items-center justify-center font-bold">1</div>
                  <h2 className="text-2xl font-serif text-[#1C1917] dark:text-white">Upload Your Photo</h2>
                </div>
                
                <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-dashed border-[#D7C9BA] dark:border-gray-600 bg-[#FAF9F6] dark:bg-black/20 flex flex-col items-center justify-center p-8 group min-h-[400px]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                  
                  {userImageBase64 ? (
                    <>
                      <img src={userImageBase64} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                      <div className="relative z-10 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="font-bold text-[#1C1917] dark:text-white">Photo Uploaded</p>
                        <button onClick={() => fileInputRef.current?.click()} className="text-xs text-[#8B5E3C] dark:text-[#3B82F6] uppercase tracking-widest mt-2 underline">Change Photo</button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white dark:bg-[#1E293B] rounded-full shadow-md flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-[#57534E] dark:text-gray-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-[#1C1917] dark:text-white">Drag & drop or browse</h3>
                      <p className="text-sm text-[#78716C] dark:text-gray-500 max-w-xs mx-auto mb-6">
                        For best results, upload a photo where you are standing straight, facing forward.
                      </p>
                      <button onClick={() => fileInputRef.current?.click()} className="bg-[#1C1917] dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:-translate-y-1 transition-transform">
                        Upload Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Select Garment */}
              <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-8 shadow-xl border border-[#E8E6E1] dark:border-white/10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-[#1C1917] dark:bg-[#3B82F6] text-white flex items-center justify-center font-bold">2</div>
                  <h2 className="text-2xl font-serif text-[#1C1917] dark:text-white">Select Garment</h2>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                  {products.map(product => (
                    <button
                      key={product._id}
                      onClick={() => setSelectedProduct(product)}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all group ${selectedProduct?._id === product._id ? 'border-[#8B5E3C] dark:border-[#3B82F6] shadow-lg scale-[0.98]' : 'border-transparent bg-[#FAF9F6] dark:bg-black/20 hover:border-[#D7C9BA] dark:hover:border-gray-600'}`}
                    >
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-white text-xs font-bold leading-tight">{product.name}</span>
                      </div>
                      {selectedProduct?._id === product._id && (
                        <div className="absolute top-2 right-2 bg-[#8B5E3C] dark:bg-[#3B82F6] rounded-full p-1 shadow-md">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Generate Button */}
                <div className="mt-8 pt-8 border-t border-[#E8E6E1] dark:border-white/10">
                  {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</p>}
                  
                  <button 
                    onClick={handleGenerate}
                    disabled={!userImageBase64 || !selectedProduct || isProcessing}
                    className={`w-full py-5 rounded-full font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${(!userImageBase64 || !selectedProduct) ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-[#1C1917] dark:bg-[#3B82F6] text-white shadow-xl hover:shadow-2xl hover:-translate-y-1'}`}
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Try-On
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TryOn;
