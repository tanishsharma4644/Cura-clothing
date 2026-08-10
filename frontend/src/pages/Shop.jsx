import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link } from 'react-router-dom';
import Loader from '../components/Loader';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryQuery = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageQuery = searchParams.get('page') || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // We now pass pageNumber and keyword directly to backend
        const endpoint = searchQuery 
          ? `https://cura-clothing.onrender.com/api/products?keyword=${searchQuery}&pageNumber=${pageQuery}`
          : `https://cura-clothing.onrender.com/api/products?pageNumber=${pageQuery}`;
          
        const { data } = await axios.get(endpoint);
        
        let filtered = data.products || data;
        
        if (categoryQuery) {
          if (categoryQuery.toLowerCase() === 'new arrivals') {
            filtered = filtered.filter(p => p.isNewArrival);
          } else {
            // If we had more time we'd filter this on the backend too, 
            // but for now we'll do it client side for categories.
            filtered = filtered.filter(p => p.category?.toLowerCase() === categoryQuery.toLowerCase());
          }
        }
        
        setProducts(filtered);
        setPage(data.page || 1);
        setPages(data.pages || 1);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryQuery, searchQuery, pageQuery]);

  if (loading) {
    return <Loader text="Loading Collection" />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] pt-32 pb-24 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#1C1917] dark:text-white mb-4">
            {searchQuery 
              ? `Search Results for "${searchQuery}"` 
              : categoryQuery ? `${categoryQuery}'s Collection` : 'All Products'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Discover our latest arrivals and timeless pieces.</p>
        </div>

        <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
          {['All', 'Men', 'Women', 'Kids', 'Accessories'].map(cat => (
            <Link 
              key={cat}
              to={cat === 'All' ? '/shop' : `/shop?category=${cat}`}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-widest border transition-colors whitespace-nowrap ${
                (cat === 'All' && !categoryQuery) || (categoryQuery && categoryQuery.toLowerCase() === cat.toLowerCase())
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-black dark:hover:border-white'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No products found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <Link to={`/product/${product._id}`} key={product._id} className="group cursor-pointer">
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden mb-4 relative">
                  <img 
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80'; }}
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out dark:brightness-90"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#1C1917] dark:text-white mb-1 group-hover:text-gray-500 transition-colors truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
            </div>
          )}

          {/* Pagination Component */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-16">
              {[...Array(pages).keys()].map((x) => {
                const p = x + 1;
                // Preserve category/search queries while changing page
                let url = `/shop?page=${p}`;
                if (categoryQuery) url += `&category=${categoryQuery}`;
                if (searchQuery) url += `&search=${searchQuery}`;
                
                return (
                  <Link 
                    key={p} 
                    to={url}
                    className={`w-10 h-10 flex justify-center items-center border font-bold text-sm transition-colors ${
                      p === page 
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-black dark:bg-[#1E293B] dark:border-gray-700 dark:hover:border-white'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}

      </div>
    </div>
  );
};

export default Shop;
