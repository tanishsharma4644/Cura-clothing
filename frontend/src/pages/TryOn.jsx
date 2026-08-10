import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Upload, StopCircle } from 'lucide-react';

const TryOn = () => {
  const [activeTab, setActiveTab] = useState('upload'); // upload or camera
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);

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

  return (
    <div className="min-h-screen bg-slate-900 text-white pt-20">
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
            Upload a photo or use your webcam to see how our clothing fits your body in real-time.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
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
          
          <div className="p-12 min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden">
             
             {activeTab === 'camera' && (
                <video 
                  ref={videoRef} 
                  className={`w-full max-w-2xl rounded-2xl bg-gray-900 border border-white/10 shadow-2xl mb-8 ${isStreaming ? 'block' : 'hidden'}`}
                  playsInline 
                  muted
                ></video>
             )}

             {!isStreaming && (
               <>
                 <div className="w-32 h-32 rounded-full border border-dashed border-gray-600 flex items-center justify-center mb-8 relative">
                    {activeTab === 'upload' ? <Upload className="w-10 h-10 text-gray-500" /> : <Camera className="w-10 h-10 text-gray-500" />}
                    <div className="absolute inset-0 bg-white/5 rounded-full animate-ping"></div>
                 </div>
                 <h3 className="text-2xl font-bold mb-4">{activeTab === 'upload' ? 'Drop your photo here' : 'Allow Camera Access'}</h3>
                 <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                   {activeTab === 'upload' ? 'Supports JPG, PNG (Max 5MB). Ensure your full body is visible for best results.' : 'We need access to your camera to overlay the clothing on your live feed.'}
                 </p>
               </>
             )}
             
             {activeTab === 'upload' ? (
                <button className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Browse Files
                </button>
             ) : (
                isStreaming ? (
                  <button onClick={stopCamera} className="bg-red-500 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2">
                    <StopCircle className="w-5 h-5" /> Stop Camera
                  </button>
                ) : (
                  <button onClick={startCamera} className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Enable Camera
                  </button>
                )
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TryOn;
