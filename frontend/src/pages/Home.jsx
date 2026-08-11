import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ShoppingBag, ArrowRight, Sparkles, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import { HeroScene, EnhancedFabricScene, ParticleAtmosphere, Tilt3DCard } from '../components/Scene3D';

gsap.registerPlugin(ScrollTrigger);

// --- Animated Counter ---
const AnimatedCounter = ({ target, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// --- Marquee Ticker ---
const MarqueeTicker = () => {
  const items = ['NEW AUTUMN COLLECTION', 'FREE SHIPPING OVER $150', 'AI VIRTUAL TRY-ON', 'SUSTAINABLE FASHION', 'HANDCRAFTED QUALITY'];
  return (
    <div className="overflow-hidden bg-[#1C1917] dark:bg-[#3B82F6] py-4 select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-white/90 text-xs font-bold tracking-[0.3em] uppercase mx-12 flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />{item}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Hero Slideshow (Ken Burns Effect) ---
const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const slides = [
    { id: 1, src: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80', label: 'The Autumn Edit' },
    { id: 2, src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80', label: 'Minimalist Form' },
    { id: 3, src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80', label: 'Silk Collection' },
    { id: 4, src: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80', label: 'Winter Layers' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#EAE7DF] dark:bg-[#0B1120]">
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img 
            src={slide.src} 
            alt={slide.label} 
            className={`w-full h-full object-cover dark:brightness-75 transition-transform duration-[10000ms] ease-linear origin-center ${
              index === currentIndex ? 'scale-110' : 'scale-100'
            }`}
          />
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        </div>
      ))}
      
      {/* Slideshow Controls */}
      <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end">
        <div className="flex flex-col gap-3">
           <span className="text-white text-xs sm:text-sm font-bold tracking-[0.3em] uppercase drop-shadow-md">
             {slides[currentIndex].label}
           </span>
           <div className="flex gap-2">
             {slides.map((_, idx) => (
               <button 
                 key={idx}
                 onClick={() => setCurrentIndex(idx)}
                 className={`h-[2px] transition-all duration-500 rounded-full ${
                   idx === currentIndex ? 'w-10 bg-white' : 'w-4 bg-white/40 hover:bg-white/80'
                 }`}
                 aria-label={`Go to slide ${idx + 1}`}
               />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

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
                  gsap.to(e.currentTarget.querySelector('.product-img'), { scale: 1.06, duration: 0.6, ease: 'power2.out' });
                  gsap.to(e.currentTarget.querySelector('.product-title'), { y: -4, duration: 0.4, ease: 'power2.out' });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget.querySelector('.product-img'), { scale: 1, duration: 0.4, ease: 'power2.out' });
                  gsap.to(e.currentTarget.querySelector('.product-title'), { y: 0, duration: 0.4, ease: 'power2.out' });
                }}
              >
                <Tilt3DCard className="h-full">
                <Link to={`/product/${product._id}`} className="group block h-full">
                  <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-[#E8E6E1] dark:bg-[#1E293B] rounded-2xl shadow-sm group-hover:shadow-2xl transition-all duration-500">
                    <img src={product.imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'} onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'; }} alt={product.name} className="product-img absolute inset-0 w-full h-full object-cover dark:brightness-90 origin-center" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
                      <button 
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="bg-white/90 dark:bg-[#3B82F6] backdrop-blur-md text-[#1C1917] dark:text-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#1C1917] hover:text-white dark:hover:bg-[#2563EB] transition-all flex items-center gap-2 translate-y-8 group-hover:translate-y-0 duration-500 rounded-full shadow-xl"
                      >
                        <ShoppingBag className="w-4 h-4" /> Add to Bag
                      </button>
                    </div>
                    
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  </div>
                  <div className="flex justify-between items-start px-2">
                    <div>
                      <h4 className="product-title font-serif text-xl mb-1 group-hover:text-[#8B5E3C] dark:group-hover:text-[#3B82F6] transition-colors text-[#1C1917] dark:text-white block">{product.name}</h4>
                      <p className="text-xs text-[#78716C] dark:text-[#94A3B8] font-bold tracking-[0.1em] uppercase">{product.category}</p>
                    </div>
                    <span className="font-serif text-lg text-[#1C1917] dark:text-white">${product.price}</span>
                  </div>
                </Link>
                </Tilt3DCard>
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

    // 2. Hero Parallax (removed - hero is now 3D scene)


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

        {/* Right Side - Cinematic Slideshow */}
        <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-full relative overflow-hidden transition-colors duration-500">
          <HeroSlideshow />
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <MarqueeTicker />

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

            {/* ENHANCED THREE.JS FABRIC MESH */}
            <div className="md:col-span-3 md:col-start-10 relative aspect-[4/5] overflow-hidden mt-12 md:mt-32 rounded-xl z-10 shadow-xl bg-gradient-to-br from-[#FAF9F6] to-[#E8E6E1] dark:from-[#0F172A] dark:to-[#1E293B] flex items-center justify-center border border-white/20 cursor-grab active:cursor-grabbing">
              <EnhancedFabricScene />
              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-black/40 dark:text-white/40 font-bold bg-white/10 dark:bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">✦ Interactive Fabric</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CINEMATIC VIDEO SECTION */}
      <section className="relative h-[80vh] overflow-hidden group">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover dark:brightness-75 scale-105 group-hover:scale-100 transition-transform duration-[3s]">
          <source src="https://cdn.pixabay.com/video/2024/03/19/204680-924732498_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} viewport={{ once: true }}>
            <div className="w-20 h-20 rounded-full border-2 border-white/40 flex items-center justify-center mb-8 mx-auto backdrop-blur-sm bg-white/5 hover:bg-white/20 hover:scale-110 transition-all duration-500 cursor-pointer">
              <Play className="w-8 h-8 ml-1" />
            </div>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="text-4xl md:text-6xl lg:text-7xl font-serif mb-4">Behind the Craft</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} viewport={{ once: true }} className="text-white/60 text-lg font-light max-w-lg">From thread to runway — a glimpse into our atelier.</motion.p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 md:py-28 bg-[#FAF9F6] dark:bg-[#0F172A] border-y border-[#E8E6E1] dark:border-[#1E293B] transition-colors">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { num: 50, suffix: '+', label: 'Collections' },
              { num: 12, suffix: 'K+', label: 'Happy Customers' },
              { num: 98, suffix: '%', label: 'Organic Materials' },
              { num: 35, suffix: '+', label: 'Countries' }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.1 }} viewport={{ once: true }}>
                <div className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1C1917] dark:text-white mb-2">
                  <AnimatedCounter target={stat.num} suffix={stat.suffix} />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#78716C] dark:text-[#94A3B8]">{stat.label}</p>
              </motion.div>
            ))}
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

      {/* EDITORIAL LOOKBOOK GRID */}
      <section className="py-24 md:py-32 bg-[#FAF9F6] dark:bg-[#0B1120] transition-colors overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-[#8B5E3C] dark:text-[#3B82F6] text-xs font-bold tracking-[0.2em] uppercase block mb-4">Editorial</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1C1917] dark:text-white">The Lookbook</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {[
              { src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', span: 'md:col-span-8 md:row-span-2', aspect: 'aspect-[16/10]', label: 'Autumn Layers' },
              { src: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80', span: 'md:col-span-4', aspect: 'aspect-[4/5]', label: 'Minimal Chic' },
              { src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', span: 'md:col-span-4', aspect: 'aspect-[4/5]', label: 'Street Style' },
              { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', span: 'md:col-span-4', aspect: 'aspect-[4/5]', label: 'Evening Edit' },
              { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80', span: 'md:col-span-4', aspect: 'aspect-[4/5]', label: 'Resort Wear' },
              { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80', span: 'md:col-span-4', aspect: 'aspect-[4/5]', label: 'Urban Elegance' }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: i * 0.08 }} viewport={{ once: true }} className={`${item.span} relative overflow-hidden rounded-2xl group cursor-pointer`}>
                <div className={`${item.aspect} w-full`}>
                  <img src={item.src} alt={item.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out dark:brightness-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-white text-sm font-bold uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI TRY-ON CTA */}
      <section className="py-24 md:py-32 bg-[#1C1917] dark:bg-[#0F172A] relative overflow-hidden transition-colors">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#8B5E3C] dark:bg-[#3B82F6] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#8B5E3C] dark:bg-[#3B82F6] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <span className="text-[#D7C9BA] dark:text-[#3B82F6] text-xs font-bold tracking-[0.2em] uppercase block mb-6 flex items-center gap-2"><Sparkles className="w-3 h-3" />AI Powered</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">Try Before<br/>You Buy.</h2>
              <p className="text-white/50 font-light text-lg mb-10 max-w-md">Our AI-powered virtual try-on lets you see exactly how every piece fits — right from your browser. No guessing, no returns.</p>
              <Link to="/try-on" className="group inline-flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#8B5E3C] dark:hover:bg-[#3B82F6] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Try It Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="relative">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-[#8B5E3C]/20 to-[#8B5E3C]/5 dark:from-[#3B82F6]/20 dark:to-[#3B82F6]/5 border border-white/10 backdrop-blur-sm flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80" alt="Virtual Try-On" className="w-full h-full object-cover rounded-3xl opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 text-center">
                    <Sparkles className="w-8 h-8 text-white mx-auto mb-3" />
                    <p className="text-white font-bold text-sm uppercase tracking-widest">AI Try-On</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. THE PHILOSOPHY (GSAP ScrollTrigger Text) */}
      <section className="quote-section py-32 md:py-48 px-4 text-center bg-[#2C413D] dark:bg-[#000000] text-[#FAF9F6] relative overflow-hidden transition-colors duration-500">
        <ParticleAtmosphere />
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
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default Home;
