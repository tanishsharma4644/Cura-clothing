import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Upload, StopCircle, X, ZoomIn, ZoomOut } from 'lucide-react';

const garments = [
  { id: 1, name: 'Basic Blue Tee', src: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Blue_Tshirt.png' },
  { id: 2, name: 'Red Cotton Shirt', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Red_t-shirt.png/640px-Red_t-shirt.png' },
  { id: 3, name: 'Classic Polo', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Polo_Shirt_Blue.png/640px-Polo_Shirt_Blue.png' }
];

const TryOn = () => {
  const [activeTab, setActiveTab] = useState('upload'); // upload or camera
  const [isStreaming, setIsStreaming] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [garmentScale, setGarmentScale] = useState(1);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check your permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const handleTabChange = (tab) => {
    if (activeTab === 'camera' && tab !== 'camera') {
      stopCamera();
    }
    setActiveTab(tab);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setSelectedGarment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (uploadedImage) URL.revokeObjectURL(uploadedImage);
      stopCamera();
    };
  }, [uploadedImage]);

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
            <span className="bg-white/10 text-white border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Powered by CURA Vision AI
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-tight">
            Virtual Try-On
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-400 font-light">
            Upload a photo or use your webcam. Drag and drop our clothing onto your body to see the fit.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex border-b border-white/10">
            <button 
              onClick={() => handleTabChange('upload')}
              className={`flex-1 py-6 font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors ${activeTab === 'upload' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <Upload className="w-5 h-5" /> Upload Photo
            </button>
            <button 
              onClick={() => handleTabChange('camera')}
              className={`flex-1 py-6 font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors ${activeTab === 'camera' ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <Camera className="w-5 h-5" /> Use Webcam
            </button>
          </div>
          
          <div className="p-4 md:p-12 min-h-[600px] flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
             
             {/* Main Viewer Area */}
             <div 
               ref={containerRef}
               className="flex-1 w-full bg-gray-900 border border-white/10 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
             >
                {/* Garment Overlay */}
                {selectedGarment && (isStreaming || uploadedImage) && (
                  <motion.div
                    drag
                    dragConstraints={containerRef}
                    dragElastic={0.2}
                    dragMomentum={false}
                    className="absolute z-50 cursor-grab active:cursor-grabbing touch-none"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ scale: garmentScale }}
                  >
                    <img src={selectedGarment.src} alt="Overlay" className="w-64 h-auto pointer-events-none drop-shadow-2xl" />
                  </motion.div>
                )}

                {/* Camera View */}
                {activeTab === 'camera' && (
                  <>
                    <video 
                      ref={videoRef} 
                      className={`w-full h-full object-cover absolute inset-0 ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
                      playsInline 
                      muted
                    ></video>
                    {!isStreaming && (
                      <div className="text-center p-8 z-10">
                        <div className="w-24 h-24 rounded-full border border-dashed border-gray-600 flex items-center justify-center mx-auto mb-6 relative">
                          <Camera className="w-8 h-8 text-gray-500" />
                          <div className="absolute inset-0 bg-white/5 rounded-full animate-ping"></div>
                        </div>
                        <h3 className="text-xl font-bold mb-4">Allow Camera Access</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">We need access to your camera to overlay clothing on your live feed.</p>
                        <button onClick={startCamera} className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-lg">
                          Enable Camera
                        </button>
                      </div>
                    )}
                    {isStreaming && (
                      <button onClick={stopCamera} className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-md text-white p-3 rounded-full hover:bg-red-600 transition-all z-40">
                        <StopCircle className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}

                {/* Upload View */}
                {activeTab === 'upload' && (
                  <>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                    
                    {uploadedImage ? (
                      <>
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-contain absolute inset-0" />
                        <button onClick={resetUpload} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/70 transition-all z-40">
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-8 z-10">
                        <div className="w-24 h-24 rounded-full border border-dashed border-gray-600 flex items-center justify-center mx-auto mb-6 relative">
                          <Upload className="w-8 h-8 text-gray-500" />
                          <div className="absolute inset-0 bg-white/5 rounded-full animate-ping"></div>
                        </div>
                        <h3 className="text-xl font-bold mb-4">Drop your photo here</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">Supports JPG, PNG. Ensure your full body is visible for best results.</p>
                        <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-lg">
                          Browse Files
                        </button>
                      </div>
                    )}
                  </>
                )}
             </div>

             {/* Sidebar: Garment Selection & Controls */}
             <div className="w-full md:w-80 flex flex-col gap-6 z-10 relative">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" /> Select Garment
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {garments.map(garment => (
                      <button
                        key={garment.id}
                        onClick={() => setSelectedGarment(garment)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedGarment?.id === garment.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-transparent hover:border-white/20 bg-white/5'}`}
                      >
                        <img src={garment.src} alt={garment.name} className="w-full h-full object-contain p-4" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-[10px] uppercase tracking-wider font-bold text-center">
                          {garment.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                {selectedGarment && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="font-bold uppercase tracking-widest text-sm mb-4 text-gray-400">Controls</h3>
                    <div className="flex items-center justify-between gap-4">
                      <button onClick={() => setGarmentScale(s => Math.max(0.5, s - 0.1))} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold tracking-widest">{(garmentScale * 100).toFixed(0)}%</span>
                      <button onClick={() => setGarmentScale(s => Math.min(2, s + 0.1))} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 text-center mt-4 uppercase tracking-widest">
                      Drag garment to position
                    </p>
                  </div>
                )}
             </div>
             
          </div>
        </div>

      </div>
    </div>
  );
};

export default TryOn;
