import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

gsap.registerPlugin(ScrollTrigger);

// --- 3D Fabric Component ---
const FabricMesh = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle zero-gravity sway
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      
      // Mouse interaction
      const targetRotationY = state.pointer.x * 0.3;
      const targetRotationX = -state.pointer.y * 0.3;
      
      // Smooth interpolation for luxury feel
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * 0.05;
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[4, 5, 64, 64]} />
      <MeshDistortMaterial
        color="#8B5E3C"
        envMapIntensity={1}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        metalness={0.2}
        roughness={0.6}
        distort={0.4}
        speed={1.5}
      />
    </mesh>
  );
};

// --- Product Carousel with GSAP ---
const ProductCarousel = ({ title, subtitle, products, loading, handleQuickAdd, linkUrl = "/shop" }) => {
  return (
    <section className="product-grid-section py-24 md:py-32 bg-[#FAF9F6] dark:bg-[#0B1120] border-t border-[#E8E6E1] dark:border-[#1E293B] overflow-hidden transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 flex justify-between items-end">
        <div>
          <span className="text-[#8B5E3C] dark:text-[#3B82F6] text-xs font-bold tracking-[0.2em] uppercase block mb-4 transition-colors">{subtitle}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1C1917] dark:text-[#FFFFFF] transition-colors">{title}</h2>
        </div>
        <Link to={linkUrl} className="hidden md:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-[#1C1917] dark:border-[#FFFFFF] pb-1 hover:text-[#8B5E3C] dark:hover:text-[#3B82F6] transition-colors">
          View All
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto pl-4 sm:pl-6 lg:pl-8 overflow-x-auto hide-scrollbar pb-12 cursor-grab active:cursor-grabbing">
        <div className="flex gap-8 w-max pr-8">
          {loading ? (
             [1,2,3,4].map(n => <div key={n} className="w-[300px] aspect-[3/4] bg-[#E8E6E1] dark:bg-[#1E293B] animate-pulse rounded-xl"></div>)
          ) : (
            products.map((product) => (
              <div 
                key={product._id} 
                className="product-card-gsap w-[300px] md:w-[400px] opacity-0"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget.querySelector('.product-img'), { scale: 1.04, duration: 0.4, ease: 'power2.out' });
                  gsap.to(e.currentTarget.querySelector('.product-title'), { y: -4, duration: 0.4, ease: 'power2.out' });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget.querySelector('.product-img'), { scale: 1, duration: 0.4, ease: 'power2.out' });
                  gsap.to(e.currentTarget.querySelector('.product-title'), { y: 0, duration: 0.4, ease: 'power2.out' });
                }}
              >
                <Link to={`/product/${product._id}`} className="group block h-full">
                  <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-[#E8E6E1] dark:bg-[#1E293B] rounded-2xl shadow-sm group-hover:shadow-xl transition-all duration-500">
                    <img src={product.imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'; }} alt={product.name} className="product-img absolute inset-0 w-full h-full object-cover dark:brightness-90 origin-center" />
                    <img src={(product.imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80').replace('80', '81')} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'; }} alt="Alternate" className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:scale-105 dark:brightness-90" />
                    
                    <div className="absolute inset-0 bg-[#FAF9F6]/50 dark:bg-[#0F172A]/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <button 
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="bg-[#1C1917] dark:bg-[#3B82F6] text-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors flex items-center gap-2 translate-y-4 group-hover:translate-y-0 duration-500 rounded-full shadow-lg"
                      >
                        <ShoppingBag className="w-4 h-4" /> Add to Bag
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-start px-2">
                    <div>
                      <h4 className="product-title font-serif text-xl mb-1 group-hover:text-[#8B5E3C] dark:group-hover:text-[#3B82F6] transition-colors text-[#1C1917] dark:text-white block">{product.name}</h4>
                      <p className="text-xs text-[#78716C] dark:text-[#94A3B8] font-bold tracking-[0.1em] uppercase">{product.category}</p>
                    </div>
                    <span className="font-serif text-lg text-[#1C1917] dark:text-white">${product.price}</span>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, collectionsRes] = await Promise.all([
          axios.get('https://cura-clothing.onrender.com/api/products'),
          axios.get('https://cura-clothing.onrender.com/api/collections')
        ]);
        setProducts(productsRes.data.products || productsRes.data);
        setCollections(collectionsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useLayoutEffect(() => {
    if (loading) return; // Wait for content to load

    // 1. Hero Headline Animation
    gsap.fromTo('.hero-text-line', 
      { y: '100%' }, 
      { y: '0%', duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
    );

    // 2. Hero Parallax
    gsap.to('.hero-image', {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: '.hero-section',
        start: "top top",
        end: "bottom top",
        scrub: 0.8
      }
    });

    // 3. Section Scroll Triggers (Product Grids)
    gsap.utils.toArray('.product-grid-section').forEach((section) => {
      const cards = section.querySelectorAll('.product-card-gsap');
      if (cards.length > 0) {
        gsap.fromTo(cards, 
          { opacity: 0, y: 40 },
          { 
            opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
            }
          }
        );
      }
    });

    // 4. Dark Green Quote Section (Word-by-Word)
    gsap.fromTo('.quote-word',
      { opacity: 0.1 },
      { 
        opacity: 1, 
        stagger: 0.1, 
        ease: 'none',
        scrollTrigger: {
          trigger: '.quote-section',
          start: 'top 75%',
          end: 'center center',
          scrub: true
        }
      }
    );

    // Cleanup GSAP ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [loading, products, collections]);

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || 'Default', product.colors?.[0] || 'Default');
  };

  const headlineLines = ["The Art", "of Quiet", "Elegance."];
  const quoteText = "True luxury is found in the absence of excess. It is the perfect cut, the finest thread, and the courage to remain simple.";
  const quoteWords = quoteText.split(' ');

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC] min-h-screen overflow-hidden transition-colors duration-500">
      
      {/* 1. HERO SECTION */}
      <section className="hero-section relative min-h-[90vh] flex flex-col md:flex-row border-b border-[#E8E6E1] dark:border-[#1E293B]">
        
        {/* Left Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24 py-16 md:py-0 bg-[#FAF9F6] dark:bg-[#0F172A] z-10 transition-colors duration-500">
          <div className="relative">
            <div className="text-[#8B5E3C] dark:text-[#3B82F6] text-xs font-bold tracking-[0.2em] uppercase mb-4 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
              Collection 01 — Autumn 26
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-[#1C1917] dark:text-[#FFFFFF] leading-[1] mb-6 md:mb-8 transition-colors">
              {headlineLines.map((line, idx) => (
                <span key={idx} className="block overflow-hidden pb-1">
                  <span className="hero-text-line block">{line}</span>
                </span>
              ))}
            </h1>
            
            <p className="text-[#57534E] dark:text-[#94A3B8] text-base md:text-lg max-w-md mb-10 md:mb-12 font-light leading-relaxed transition-colors opacity-0 animate-[fadeIn_1s_ease-out_1.2s_forwards]">
              Meticulously crafted garments that transcend seasons. We source the finest organic materials to create silhouettes that define modern elegance.
            </p>
            
            <button 
              onClick={() => document.getElementById('collection').scrollIntoView({behavior: 'smooth'})}
              className="group flex items-center gap-4 w-max opacity-0 animate-[fadeIn_1s_ease-out_1.4s_forwards]"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] border-b border-[#1C1917] dark:border-[#FFFFFF] pb-1 group-hover:text-[#8B5E3C] dark:group-hover:text-[#3B82F6] group-hover:border-[#8B5E3C] dark:group-hover:border-[#3B82F6] transition-colors">
                Explore Collection
              </span>
              <div className="w-8 h-8 rounded-full border border-[#1C1917] dark:border-[#FFFFFF] flex items-center justify-center group-hover:border-[#8B5E3C] dark:group-hover:border-[#3B82F6] group-hover:text-[#8B5E3C] dark:group-hover:text-[#3B82F6] transition-all group-hover:translate-x-2">
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 h-[50vw] sm:h-[60vw] md:h-auto min-h-[300px] relative overflow-hidden bg-[#EAE7DF] dark:bg-[#1E293B]">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80" alt="Editorial Campaign" 
            className="hero-image absolute inset-0 w-full h-full object-cover object-top dark:brightness-90 scale-[1.15] origin-top"
          />
        </div>
      </section>

      {/* 2. HIGHLIGHTS & 3D INTERACTION */}
      <section className="bg-[#EBE5D9] dark:bg-[#1E293B] py-24 md:py-32 transition-colors duration-500">
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-4 md:col-start-1">
              <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-[#1C1917] dark:text-[#FFFFFF] transition-colors">Crafted for <br/> movement.</h2>
              <p className="text-[#57534E] dark:text-[#94A3B8] font-light mb-8 transition-colors">Every piece is designed with utility and grace in mind, ensuring you feel as good as you look from morning to midnight.</p>
              <div>
                <Link to="/" className="text-xs font-bold uppercase tracking-[0.2em] text-[#8B5E3C] dark:text-[#3B82F6] hover:text-[#1C1917] dark:hover:text-white transition-colors border-b border-transparent hover:border-[#1C1917] dark:hover:border-white pb-1">Discover Materials</Link>
              </div>
            </div>

            <div className="md:col-span-4 md:col-start-6 relative aspect-[3/4] overflow-hidden group rounded-xl shadow-md">
              <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" alt="Highlight 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out dark:brightness-90" />
            </div>

            {/* THREE.JS FABRIC MESH */}
            <div className="md:col-span-3 md:col-start-10 relative aspect-[4/5] overflow-hidden mt-12 md:mt-32 rounded-xl z-10 shadow-xl bg-gradient-to-br from-[#FAF9F6] to-[#E8E6E1] dark:from-[#0F172A] dark:to-[#1E293B] flex items-center justify-center border border-white/20">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={2.5} color="#ffffff" />
                <directionalLight position={[-5, -10, -5]} intensity={1} color="#8B5E3C" />
                <FabricMesh />
              </Canvas>
              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-bold">Interactive Fabric</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. COLLECTIONS (GSAP Animated) */}
      <div id="collection" className="border-b border-[#E8E6E1] dark:border-[#1E293B]">
        <ProductCarousel 
          title="The Curated Edit" subtitle="Latest Arrivals" linkUrl="/shop"
          products={products.slice(0, 8)} loading={loading} handleQuickAdd={handleQuickAdd}
        />
        {collections.map((collection, idx) => (
          <ProductCarousel 
            key={collection._id || idx}
            title={collection.title} 
            subtitle={collection.description} 
            linkUrl="/shop"
            products={collection.products || []} 
            loading={loading} 
            handleQuickAdd={handleQuickAdd}
          />
        ))}
      </div>

      {/* 4. THE PHILOSOPHY (GSAP ScrollTrigger Text) */}
      <section className="quote-section py-32 md:py-48 px-4 text-center bg-[#2C413D] dark:bg-[#000000] text-[#FAF9F6] relative overflow-hidden transition-colors duration-500">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="text-[#D7C9BA] dark:text-[#3B82F6] text-xs font-bold tracking-[0.2em] uppercase block mb-12 transition-colors">Our Philosophy</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif leading-tight mb-16 text-[#FAF9F6] dark:text-white transition-colors flex flex-wrap justify-center gap-x-3 gap-y-2">
            {quoteWords.map((word, i) => (
              <span key={i} className="quote-word inline-block">{word}</span>
            ))}
          </h2>
          <div className="w-16 h-[1px] bg-[#D7C9BA] dark:bg-[#3B82F6] mx-auto mb-12 transition-colors"></div>
          <p className="text-[#A3B3B0] dark:text-[#94A3B8] font-light max-w-xl mx-auto text-lg leading-relaxed transition-colors">
            We believe in slow fashion. Every garment is crafted with intention, designed to last a lifetime and age beautifully alongside you.
          </p>
        </div>
      </section>

      {/* 5. NEWSLETTER */}
      <section className="py-32 px-4 bg-[#D7C9BA] dark:bg-[#1E293B] text-center transition-colors duration-500">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-6 text-[#1C1917] dark:text-white transition-colors">Become an Insider</h2>
          <p className="text-[#57534E] dark:text-[#94A3B8] mb-12 font-light transition-colors">Join our private mailing list to receive early access to new collections and exclusive editorial content.</p>
          
          <form className="flex flex-col sm:flex-row gap-6 justify-center" onSubmit={(e)=>e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your Email Address" 
              className="bg-transparent border-b-2 border-[#1C1917]/20 dark:border-white/20 px-4 py-4 w-full sm:w-96 outline-none focus:border-[#1C1917] dark:focus:border-white transition-colors text-center sm:text-left text-sm font-light placeholder:text-[#57534E] dark:placeholder:text-[#94A3B8] text-[#1C1917] dark:text-white"
              required
            />
            <button type="submit" className="bg-[#1C1917] dark:bg-[#3B82F6] text-[#FAF9F6] dark:text-white px-10 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors rounded-full shadow-md hover:shadow-xl hover:-translate-y-1 duration-300">
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>
      
      {/* Simple Keyframes for initial load of non-GSAP elements */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
};

export default Home;
