import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Mail, 
  PackageOpen,
  Megaphone,
  CreditCard,
  Settings,
  LogOut,
  FolderTree,
  Tag,
  Menu,
  X
} from 'lucide-react';
import Loader from '../components/Loader';

const API_BASE = 'http://localhost:5001';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Men', imageUrl: '', description: '',
    countInStock: '', sizes: 'S, M, L, XL', colors: 'Black, White', variants: []
  });
  const [uploading, setUploading] = useState(false);

  // Order Details Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Settings State
  const [marqueeText, setMarqueeText] = useState('⚡ FREE EXPRESS SHIPPING ON ALL ORDERS OVER $150 ⚡');
  const [marqueeActive, setMarqueeActive] = useState(true);
  
  // Broadcast State
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerFormData, setOfferFormData] = useState({
    type: 'promocode', title: '', code: '', discountPercentage: 10, minItems: 0, isActive: true
  });

  // Collection Modal State
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [collectionFormData, setCollectionFormData] = useState({
    title: '', description: '', imageUrl: '', products: [], isActive: true
  });

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [usersRes, ordersRes, productsRes, settingsRes, offersRes, collectionsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/users`, config).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/api/orders`, config).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/api/products`).catch(() => ({ data: { products: [] } })),
          axios.get(`${API_BASE}/api/settings`).catch(() => ({ data: null })),
          axios.get(`${API_BASE}/api/offers`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/api/collections/admin`, config).catch(() => ({ data: [] }))
        ]);
        setUsers(usersRes.data || []);
        setOrders(ordersRes.data || []);
        setProducts(productsRes.data.products || productsRes.data || []);
        setOffers(offersRes.data || []);
        setCollections(collectionsRes.data || []);
        if (settingsRes.data) {
          setMarqueeText(settingsRes.data.marqueeText || '⚡ FREE EXPRESS SHIPPING ON ALL ORDERS ⚡');
          setMarqueeActive(settingsRes.data.marqueeActive ?? true);
        }
      } catch (error) {
        console.error('Error fetching admin data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name, price: product.price, category: product.category, 
        imageUrl: product.imageUrl, description: product.description,
        countInStock: product.countInStock || 0,
        sizes: product.sizes ? product.sizes.join(', ') : '',
        colors: product.colors ? product.colors.join(', ') : '',
        variants: product.variants || []
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: 'Men', imageUrl: '', description: '', countInStock: '', sizes: 'S, M, L, XL', colors: 'Black, White', variants: [] });
    }
    setShowModal(true);
  };

  const generateVariants = () => {
    const sizeArr = formData.sizes.split(',').map(s => s.trim()).filter(s => s);
    const colorArr = formData.colors.split(',').map(c => c.trim()).filter(c => c);
    
    let newVariants = [];
    sizeArr.forEach(size => {
      colorArr.forEach(color => {
        // try to preserve existing stock if we've already generated it
        const existing = formData.variants.find(v => v.size === size && v.color === color);
        newVariants.push({
          size,
          color,
          stock: existing ? existing.stock : 0
        });
      });
    });
    
    setFormData({ ...formData, variants: newVariants });
  };

  const openOfferModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferFormData({
        type: offer.type, title: offer.title, code: offer.code,
        discountPercentage: offer.discountPercentage, minItems: offer.minItems, isActive: offer.isActive
      });
    } else {
      setEditingOffer(null);
      setOfferFormData({ type: 'promocode', title: '', code: '', discountPercentage: 10, minItems: 0, isActive: true });
    }
    setShowOfferModal(true);
  };

  const openCollectionModal = (collection = null) => {
    if (collection) {
      setEditingCollection(collection);
      setCollectionFormData({
        title: collection.title, description: collection.description, imageUrl: collection.imageUrl,
        products: collection.products.map(p => p._id), isActive: collection.isActive
      });
    } else {
      setEditingCollection(null);
      setCollectionFormData({ title: '', description: '', imageUrl: '', products: [], isActive: true });
    }
    setShowCollectionModal(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post(`${API_BASE}/api/upload`, formDataUpload, config);
      
      let url = data.imageUrl;
      if (url) {
        if (url.startsWith('http://')) url = url.replace('http://', 'https://');
        else if (url.startsWith('htp://')) url = url.replace('htp://', 'https://');
      }
      
      setFormData({ ...formData, imageUrl: url }); // Cloudinary returns a full URL
    } catch (error) {
      console.error(error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      let finalImageUrl = formData.imageUrl;
      if (finalImageUrl) {
        if (finalImageUrl.startsWith('http://')) finalImageUrl = finalImageUrl.replace('http://', 'https://');
        else if (finalImageUrl.startsWith('htp://')) finalImageUrl = finalImageUrl.replace('htp://', 'https://');
      }

      const dataToSave = {
        ...formData,
        imageUrl: finalImageUrl,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
        colors: formData.colors.split(',').map(c => c.trim()).filter(c => c)
      };

      if (editingProduct) {
        await axios.put(`${API_BASE}/api/products/${editingProduct._id}`, dataToSave, config);
      } else {
        await axios.post(`${API_BASE}/api/products`, dataToSave, config);
      }
      
      const { data } = await axios.get(`${API_BASE}/api/products`);
      setProducts(data.products || data);
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert('Error saving product');
    }
  };

  const handleDeliver = async (orderId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/api/orders/${orderId}/deliver`, {}, config);
      
      const { data } = await axios.get(`${API_BASE}/api/orders`, config);
      setOrders(data);
      if (selectedOrder && selectedOrder._id === orderId) {
         setSelectedOrder(data.find(o => o._id === orderId));
      }
    } catch (e) {
      console.error(e);
      alert('Error updating order');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_BASE}/api/orders/${orderId}`, config);
        
        // Refresh the orders list
        const { data } = await axios.get(`${API_BASE}/api/orders`, config);
        setOrders(data);
      } catch (e) {
        console.error(e);
        alert('Error deleting order');
      }
    }
  };

  const handleToggleNewArrival = async (product) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/api/products/${product._id}`, {
        ...product,
        isNewArrival: !product.isNewArrival
      }, config);
      
      const { data } = await axios.get(`${API_BASE}/api/products`);
      setProducts(data.products || data);
    } catch (e) {
      console.error(e);
      alert('Error updating new arrival status');
    }
  };

  const handlePublishSettings = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE}/api/settings`, {
        marqueeText,
        marqueeActive
      }, config);
      alert('Settings updated successfully!');
    } catch (e) {
      console.error(e);
      alert('Error updating settings');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject || !broadcastMessage) {
      return alert('Please enter a subject and message.');
    }
    
    setSendingBroadcast(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_BASE}/api/settings/broadcast`, {
        subject: broadcastSubject,
        message: broadcastMessage
      }, config);
      
      alert(`Broadcast sent successfully to ${data.recipients} users!\n\n(Since this is a development environment, emails were routed to a testing inbox. Check the backend console for the Preview URL to see what the email looks like!)`);
      setBroadcastSubject('');
      setBroadcastMessage('');
    } catch (e) {
      console.error(e);
      alert('Error sending broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (editingOffer) {
        await axios.put(`${API_BASE}/api/offers/${editingOffer._id}`, offerFormData, config);
      } else {
        await axios.post(`${API_BASE}/api/offers`, offerFormData, config);
      }
      const { data } = await axios.get(`${API_BASE}/api/offers`);
      setOffers(data);
      setShowOfferModal(false);
    } catch (e) {
      alert('Error saving offer');
    }
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      let finalImageUrl = collectionFormData.imageUrl;
      if (finalImageUrl) {
        if (finalImageUrl.startsWith('http://')) finalImageUrl = finalImageUrl.replace('http://', 'https://');
        else if (finalImageUrl.startsWith('htp://')) finalImageUrl = finalImageUrl.replace('htp://', 'https://');
      }
      
      const payload = { ...collectionFormData, imageUrl: finalImageUrl };

      if (editingCollection) {
        await axios.put(`${API_BASE}/api/collections/${editingCollection._id}`, payload, config);
      } else {
        await axios.post(`${API_BASE}/api/collections`, payload, config);
      }
      const { data } = await axios.get(`${API_BASE}/api/collections/admin`, config);
      setCollections(data);
      setShowCollectionModal(false);
    } catch (e) {
      alert('Error saving collection');
    }
  };

  const handlePromoteUser = async (userId) => {
    if(window.confirm('Promote this user to Admin?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`${API_BASE}/api/users/${userId}/promote`, {}, config);
        const { data } = await axios.get(`${API_BASE}/api/users`, config);
        setUsers(data);
      } catch (e) { console.error(e); alert('Error promoting user'); }
    }
  };

  const handleBanUser = async (userId) => {
    if(window.confirm('Ban and remove this user? This cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_BASE}/api/users/${userId}/ban`, config);
        setUsers(users.filter(u => u._id !== userId));
      } catch (e) { console.error(e); alert(e.response?.data?.message || 'Error banning user'); }
    }
  };

  if (loading) return <Loader text="Loading Workspace" />;
  if (!user || !user.isAdmin) return null;

  // --- RENDER HELPERS ---

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in-up">
      <h2 className="text-3xl font-serif dark:text-white">Store Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#1E293B] p-6 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Revenue</h3>
            <CreditCard size={18} className="text-gray-400" />
          </div>
          <p className="text-3xl font-serif dark:text-white">${orders.reduce((acc, order) => acc + order.totalPrice, 0).toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-6 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</h3>
            <PackageOpen size={18} className="text-gray-400" />
          </div>
          <p className="text-3xl font-serif dark:text-white">{orders.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-6 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customers</h3>
            <Users size={18} className="text-gray-400" />
          </div>
          <p className="text-3xl font-serif dark:text-white">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1E293B] p-6 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Products</h3>
            <ShoppingBag size={18} className="text-gray-400" />
          </div>
          <p className="text-3xl font-serif dark:text-white">{products.length}</p>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl p-8 mt-8">
        <h3 className="text-xl font-serif dark:text-white mb-6">Recommended Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => setActiveTab('products')} className="flex items-center p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4 text-blue-600 dark:text-blue-400">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="font-bold dark:text-white text-sm">Add New Inventory</p>
              <p className="text-xs text-gray-500 mt-1">Upload photos and sizes for new drops.</p>
            </div>
          </button>
          <button onClick={() => setActiveTab('marketing')} className="flex items-center p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4 text-purple-600 dark:text-purple-400">
              <Megaphone size={20} />
            </div>
            <div>
              <p className="font-bold dark:text-white text-sm">Update Store Banner</p>
              <p className="text-xs text-gray-500 mt-1">Change the marquee text for an ongoing sale.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-serif dark:text-white">Inventory Management</h2>
        <button 
          onClick={() => openModal()}
          className="bg-black dark:bg-[#3B82F6] text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] rounded-md hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors shadow-lg w-full sm:w-auto"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">Item</th>
                <th className="px-6 py-4 font-bold tracking-widest">Price</th>
                <th className="px-6 py-4 font-bold tracking-widest">Stock</th>
                <th className="px-6 py-4 font-bold tracking-widest">Category</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                    <span className="dark:text-white font-bold">{p.name}</span>
                  </td>
                  <td className="px-6 py-4 font-bold dark:text-white">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.countInStock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.countInStock} left
                    </span>
                  </td>
                  <td className="px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button 
                      onClick={() => handleToggleNewArrival(p)} 
                      className={`${p.isNewArrival ? 'text-green-500 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'} font-bold text-xs uppercase`}
                    >
                      {p.isNewArrival ? '★ New Arrival' : '☆ Make New'}
                    </button>
                    <button onClick={() => openModal(p)} className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase">Edit</button>
                    <button 
                      onClick={async () => {
                        if(window.confirm('Delete this product?')) {
                          try {
                            const config = { headers: { Authorization: `Bearer ${user.token}` } };
                            await axios.delete(`${API_BASE}/api/products/${p._id}`, config);
                            const { data } = await axios.get(`${API_BASE}/api/products`);
                            setProducts(data.products || data);
                          } catch(e) { console.error(e); }
                        }
                      }}
                      className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-3xl font-serif dark:text-white">Order Fulfillment</h2>
      
      <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">Order ID</th>
                <th className="px-6 py-4 font-bold tracking-widest">Customer</th>
                <th className="px-6 py-4 font-bold tracking-widest">Date</th>
                <th className="px-6 py-4 font-bold tracking-widest">Total</th>
                <th className="px-6 py-4 font-bold tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{o._id}</td>
                  <td className="px-6 py-4 dark:text-white font-bold">{o.user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold dark:text-white">${o.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {o.isDelivered ? (
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Delivered</span>
                    ) : (
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Processing</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button 
                      onClick={() => { setSelectedOrder(o); setShowOrderModal(true); }}
                      className="text-black dark:text-white hover:text-[#8B5E3C] dark:hover:text-[#3B82F6] font-bold text-xs uppercase"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleDeleteOrder(o._id)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-3xl font-serif dark:text-white">Customer Database</h2>
      
      <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">User ID</th>
                <th className="px-6 py-4 font-bold tracking-widest">Name</th>
                <th className="px-6 py-4 font-bold tracking-widest">Email</th>
                <th className="px-6 py-4 font-bold tracking-widest">Role</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{u._id}</td>
                  <td className="px-6 py-4 dark:text-white font-bold">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${u.isAdmin ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {u.isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    {!u.isAdmin && (
                      <button onClick={() => handlePromoteUser(u._id)} className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase transition-colors">
                        Promote to Admin
                      </button>
                    )}
                    <button onClick={() => handleBanUser(u._id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase transition-colors">
                      Ban User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMarketing = () => (
    <div className="space-y-8 animate-fade-in-up">
      <h2 className="text-3xl font-serif dark:text-white">Marketing & Storefront</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Marquee Banner Control */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="text-[#8B5E3C] dark:text-[#3B82F6]" size={24} />
            <h3 className="text-xl font-serif dark:text-white">Storewide Marquee Banner</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">Instantly change the scrolling text at the top of your website to announce sales, free shipping, or new collections.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Current Marquee Text</label>
              <input type="text" value={marqueeText} onChange={e => setMarqueeText(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={marqueeActive} onChange={e => setMarqueeActive(e.target.checked)} className="w-4 h-4 rounded text-black focus:ring-black" />
                <span className="text-sm font-bold dark:text-white">Banner Active</span>
              </label>
              <button onClick={handlePublishSettings} className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-gray-800 transition-colors">
                Publish Changes
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter Broadcast */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="text-[#8B5E3C] dark:text-[#3B82F6]" size={24} />
            <h3 className="text-xl font-serif dark:text-white">"The Insider" Newsletter</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">Send a broadcast email to all users who subscribed via the homepage footer.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Subject Line</label>
              <input type="text" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} placeholder="e.g., Early Access: The Autumn Collection is Here" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message Body</label>
              <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} placeholder="Write your campaign message..." rows="4" className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors"></textarea>
            </div>
            <button 
              onClick={handleSendBroadcast} 
              disabled={sendingBroadcast}
              className={`w-full text-white px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-colors ${sendingBroadcast ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8B5E3C] dark:bg-[#3B82F6] hover:bg-black'}`}
            >
              {sendingBroadcast ? 'Sending...' : `Send Broadcast to ${users.length} Subscribers`}
            </button>
          </div>
        </div>

        {/* Lookbook / Collection Manager */}
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl p-8 lg:col-span-2">
           <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <FolderTree className="text-[#8B5E3C] dark:text-[#3B82F6]" size={24} />
              <h3 className="text-xl font-serif dark:text-white">Curated Collections & Lookbooks</h3>
            </div>
            <button onClick={() => openCollectionModal()} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-gray-800 transition-colors">
              + New Collection
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Group specific items together to create shoppable lookbooks on the frontend (e.g., "Summer Essentials", "Minimalist Workwear").</p>
          
          {collections.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <PackageOpen className="text-gray-400" size={24} />
              </div>
              <h4 className="text-lg font-bold dark:text-white mb-2">No Active Collections</h4>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Create a collection to beautifully group related inventory items for your customers.</p>
              <button onClick={() => openCollectionModal()} className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-gray-800 transition-colors">
                + Create New Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.map(col => (
                <div key={col._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex gap-4 bg-gray-50 dark:bg-gray-900/50">
                  <img src={col.imageUrl} alt={col.title} className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                  <div className="flex-1">
                    <h4 className="font-bold dark:text-white">{col.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{col.description}</p>
                    <p className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-widest">{col.products?.length || 0} Products Included</p>
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    <button onClick={() => openCollectionModal(col)} className="text-xs font-bold text-gray-500 hover:text-black dark:hover:text-white">EDIT</button>
                    <button onClick={async () => {
                      if(window.confirm('Delete this collection?')) {
                        try {
                          const config = { headers: { Authorization: `Bearer ${user.token}` } };
                          await axios.delete(`${API_BASE}/api/collections/${col._id}`, config);
                          setCollections(collections.filter(c => c._id !== col._id));
                        } catch(e) { console.error(e); }
                      }
                    }} className="text-xs font-bold text-red-500 hover:text-red-700">DEL</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  const handleToggleOfferStatus = async (offer) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`${API_BASE}/api/offers/${offer._id}`, {
        ...offer,
        isActive: !offer.isActive
      }, config);
      setOffers(offers.map(o => o._id === offer._id ? data : o));
    } catch (e) {
      console.error(e);
      alert('Error updating offer status');
    }
  };

  const renderOffers = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif dark:text-white">Offers & Coupon Codes</h2>
          <p className="text-xs text-gray-400 mt-1">Manage, activate, or create new promotional codes and auto-discounts for your customers.</p>
        </div>
        <button 
          onClick={() => openOfferModal()}
          className="bg-black dark:bg-[#3B82F6] text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] rounded-md hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors shadow-lg"
        >
          + Add New Offer
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 font-bold tracking-widest">Type</th>
                <th className="px-6 py-4 font-bold tracking-widest">Title / Code</th>
                <th className="px-6 py-4 font-bold tracking-widest">Discount</th>
                <th className="px-6 py-4 font-bold tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    No offers created yet. Click "+ Add New Offer" to create your first coupon!
                  </td>
                </tr>
              ) : (
                offers.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold uppercase text-[10px] tracking-wider">
                      <span className={`px-2 py-1 rounded ${o.type === 'promocode' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {o.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 dark:text-white">
                      <div className="font-bold">{o.title}</div>
                      {o.type === 'promocode' && (
                        <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded inline-block mt-1 font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          {o.code}
                        </div>
                      )}
                      {o.type === 'automatic' && <div className="text-xs text-gray-400 mt-1">Min Items: {o.minItems}</div>}
                    </td>
                    <td className="px-6 py-4 font-bold dark:text-white text-base">{o.discountPercentage}% OFF</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleOfferStatus(o)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-colors ${o.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        title="Click to toggle active status"
                      >
                        {o.isActive ? '✓ Active' : '✕ Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button onClick={() => openOfferModal(o)} className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase">Edit</button>
                      <button 
                        onClick={async () => {
                          if(window.confirm(`Are you sure you want to delete offer "${o.title}"?`)) {
                            try {
                              const config = { headers: { Authorization: `Bearer ${user.token}` } };
                              await axios.delete(`${API_BASE}/api/offers/${o._id}`, config);
                              setOffers(offers.filter(off => off._id !== o._id));
                            } catch(e) { console.error(e); alert('Error deleting offer'); }
                          }
                        }}
                        className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Inventory', icon: <ShoppingBag size={18} /> },
    { id: 'orders', label: 'Orders', icon: <PackageOpen size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'offers', label: 'Offers & Discounts', icon: <Tag size={18} /> },
    { id: 'marketing', label: 'Marketing & Store', icon: <Megaphone size={18} /> },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#020617] flex transition-colors duration-500">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 fixed h-full bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800 shadow-sm z-50 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-black tracking-tighter dark:text-white cursor-pointer" onClick={() => navigate('/')}>
              CURA<span className="text-[#8B5E3C] dark:text-[#3B82F6]">.</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Admin Workspace</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-bold">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-black dark:text-white flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate dark:text-white">{user.name}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="w-full lg:ml-64 flex-1 p-4 sm:p-6 lg:p-8 xl:p-12 min-h-screen overflow-y-auto">
        
        {/* Mobile Top Bar */}
        <div className="flex items-center gap-4 mb-6 lg:hidden">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <Menu size={20} className="dark:text-white" />
          </button>
          <h2 className="text-lg font-bold dark:text-white capitalize">{activeTab}</h2>
        </div>

        {/* Conditionally Render Content Based on Active Tab */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'offers' && renderOffers()}
        {activeTab === 'marketing' && renderMarketing()}

      </main>

      {/* --- MODALS --- */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-2xl p-8 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 relative">
            <h2 className="text-2xl font-serif dark:text-white mb-6">Order Details <span className="text-xs font-mono text-gray-400 ml-2">#{selectedOrder._id}</span></h2>
            
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Customer</h4>
                <p className="dark:text-white font-bold">{selectedOrder.user?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user?.email || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Shipping Address</h4>
                <p className="text-sm dark:text-white">{selectedOrder.shippingAddress?.address}</p>
                <p className="text-sm dark:text-white">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                <p className="text-sm dark:text-white">{selectedOrder.shippingAddress?.country}</p>
                {selectedOrder.shippingAddress?.phone && (
                  <p className="text-sm text-gray-500 mt-1">📞 {selectedOrder.shippingAddress?.phone}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Items</h4>
              <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {selectedOrder.orderItems?.map(item => (
                  <div key={item._id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-bold dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty} x ${item.price}</p>
                    </div>
                    <p className="font-bold dark:text-white">${(item.qty * item.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">Status</p>
                <p className={`text-sm font-bold uppercase tracking-wider ${selectedOrder.isDelivered ? 'text-green-500' : 'text-orange-500'}`}>
                  {selectedOrder.isDelivered ? `Delivered on ${new Date(selectedOrder.deliveredAt).toLocaleDateString()}` : 'Processing'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-gray-500">Total Price</p>
                <p className="text-2xl font-serif dark:text-white">${selectedOrder.totalPrice.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowOrderModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 dark:text-white py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Close</button>
              {!selectedOrder.isDelivered && (
                <button onClick={() => handleDeliver(selectedOrder._id)} className="flex-1 bg-black text-white dark:bg-[#3B82F6] py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors">Mark as Delivered</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg p-8 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 relative">
            <h2 className="text-2xl font-serif dark:text-white mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Product Name</label>
                <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Stocks Left</label>
                  <input required type="number" value={formData.countInStock} onChange={e=>setFormData({...formData, countInStock: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors">
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sizes (comma separated)</label>
                  <input required type="text" value={formData.sizes} onChange={e=>setFormData({...formData, sizes: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" placeholder="S, M, L, XL" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Colors (comma separated)</label>
                <input required type="text" value={formData.colors} onChange={e=>setFormData({...formData, colors: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" placeholder="Black, White, Navy" />
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between items-center mb-3">
                   <label className="block text-xs font-bold uppercase text-blue-700 dark:text-blue-400">Variant Inventory Grid</label>
                   <button type="button" onClick={generateVariants} className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">Generate Grid</button>
                </div>
                {formData.variants.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {formData.variants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex-1 text-xs font-bold dark:text-white truncate" title={`${v.size} - ${v.color}`}>{v.size} / {v.color}</div>
                        <input 
                          type="number" 
                          className="w-16 p-1 text-xs border rounded outline-none dark:bg-gray-900 dark:text-white dark:border-gray-600"
                          value={v.stock} 
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[idx].stock = Number(e.target.value);
                            setFormData({...formData, variants: newVariants});
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-blue-600 dark:text-blue-300">Click generate to map sizes and colors into inventory slots.</p>
                )}
              </div>
              <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-xl relative bg-gray-50 dark:bg-gray-800/30">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Product Image</label>
                
                <div className="flex items-center gap-4">
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                  )}
                  <div className="flex-1">
                    <input type="file" id="image-upload" accept="image/*" onChange={handleUpload} className="hidden" />
                    <label htmlFor="image-upload" className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-black dark:border-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors w-full sm:w-auto text-center mb-2">
                      {uploading ? 'Uploading...' : 'Upload Image File'}
                    </label>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">OR ENTER DIRECT URL BELOW:</div>
                    <input type="text" value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} className="w-full mt-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 rounded-lg outline-none dark:text-white text-xs focus:border-black dark:focus:border-white transition-colors" placeholder="https://..." />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" rows="3"></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 dark:text-white py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-black text-white dark:bg-[#3B82F6] py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- OFFER MODAL --- */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md p-8 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 relative">
            <h2 className="text-2xl font-serif dark:text-white mb-6">{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h2>
            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Offer Type</label>
                <select value={offerFormData.type} onChange={e=>setOfferFormData({...offerFormData, type: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors">
                  <option value="promocode">Promo Code (Manual Entry)</option>
                  <option value="automatic">Automatic Cart Offer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Offer Title</label>
                <input required type="text" placeholder={offerFormData.type === 'automatic' ? 'e.g. Buy 2 Get 20% Off' : 'e.g. Summer Sale Code'} value={offerFormData.title} onChange={e=>setOfferFormData({...offerFormData, title: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
              </div>

              {offerFormData.type === 'promocode' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Promo Code</label>
                  <input required type="text" placeholder="e.g. SUMMER20" value={offerFormData.code} onChange={e=>setOfferFormData({...offerFormData, code: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white uppercase transition-colors" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Discount %</label>
                  <input required type="number" min="1" max="100" value={offerFormData.discountPercentage} onChange={e=>setOfferFormData({...offerFormData, discountPercentage: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
                </div>
                {offerFormData.type === 'automatic' && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Minimum Items</label>
                    <input required type="number" min="1" value={offerFormData.minItems} onChange={e=>setOfferFormData({...offerFormData, minItems: Number(e.target.value)})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={offerFormData.isActive} onChange={e => setOfferFormData({...offerFormData, isActive: e.target.checked})} className="w-4 h-4 rounded text-black focus:ring-black" />
                  <span className="text-sm font-bold dark:text-white">Offer Active</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowOfferModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 dark:text-white py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-black text-white dark:bg-[#3B82F6] py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COLLECTION MODAL --- */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-xl p-8 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-800 relative">
            <h2 className="text-2xl font-serif dark:text-white mb-6">{editingCollection ? 'Edit Collection' : 'Create Collection'}</h2>
            <form onSubmit={handleSaveCollection} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Collection Title</label>
                <input required type="text" placeholder="e.g. Summer Essentials" value={collectionFormData.title} onChange={e=>setCollectionFormData({...collectionFormData, title: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                <textarea required rows="2" placeholder="Describe the theme..." value={collectionFormData.description} onChange={e=>setCollectionFormData({...collectionFormData, description: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Header Image URL</label>
                <input required type="text" placeholder="https://..." value={collectionFormData.imageUrl} onChange={e=>setCollectionFormData({...collectionFormData, imageUrl: e.target.value})} className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 outline-none dark:text-white focus:border-black dark:focus:border-white transition-colors" />
                {collectionFormData.imageUrl && <img src={collectionFormData.imageUrl} alt="preview" className="mt-2 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Select Products ({collectionFormData.products.length} selected)</label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900/50">
                  {products.map(p => (
                    <label key={p._id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-800 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={collectionFormData.products.includes(p._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCollectionFormData({ ...collectionFormData, products: [...collectionFormData.products, p._id] });
                          } else {
                            setCollectionFormData({ ...collectionFormData, products: collectionFormData.products.filter(id => id !== p._id) });
                          }
                        }}
                        className="w-4 h-4" 
                      />
                      <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-cover rounded" />
                      <span className="text-sm dark:text-white truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={collectionFormData.isActive} onChange={e => setCollectionFormData({...collectionFormData, isActive: e.target.checked})} className="w-4 h-4 rounded text-black focus:ring-black" />
                  <span className="text-sm font-bold dark:text-white">Collection Active</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowCollectionModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 dark:text-white py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-black text-white dark:bg-[#3B82F6] py-3 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-[#8B5E3C] dark:hover:bg-[#2563EB] transition-colors">Save Collection</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
