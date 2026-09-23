import API_BASE_URL from '../api.js';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Admin() {
    const [topProducts, setTopProducts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [categoryRollups, setCategoryRollups] = useState([]);
    const [ratingAnalytics, setRatingAnalytics] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    // Confirm delete modal state
    const [deleteModal, setDeleteModal] = useState({ show: false, type: '', id: null, name: '' });

    // Sale management state
    const [saleModal, setSaleModal] = useState({ show: false, productId: null, productName: '' });
    const [saleData, setSaleData] = useState({ discount_percentage: '', sale_start: '', sale_end: '' });

    // Form state
    const [newProduct, setNewProduct] = useState({ product_name: '', unit_quantity: '', price: '', quantity_available: '', category_name: '' });

    const user = JSON.parse(localStorage.getItem('quickcart_user'));

    const fetchOrders = () => {
        let url = `${API_BASE_URL}/api/orders/all`;
        if (dateRange.start && dateRange.end) {
            url += `?start=${dateRange.start}&end=${dateRange.end}`;
        }
        axios.get(url).then(res => setOrders(res.data)).catch(console.error);
    };

    const fetchCategories = () => {
        axios.get(`${API_BASE_URL}/api/categories`)
            .then(res => {
                setCategories(res.data);
                // Set default category if none selected
                if (!newProduct.category_name && res.data.length > 0) {
                    setNewProduct(prev => ({ ...prev, category_name: res.data[0].category_name }));
                }
            })
            .catch(console.error);
    };

    const fetchData = () => {
        axios.get(`${API_BASE_URL}/api/analytics/top-products`).then(res => setTopProducts(res.data)).catch(console.error);
        axios.get(`${API_BASE_URL}/api/notifications`).then(res => setNotifications(res.data)).catch(console.error);
        fetchOrders();
        axios.get(`${API_BASE_URL}/api/products`).then(res => setProducts(res.data)).catch(console.error);
        axios.get(`${API_BASE_URL}/api/users`).then(res => setCustomers(res.data)).catch(console.error);
        axios.get(`${API_BASE_URL}/api/suggestions`).then(res => setSuggestions(res.data)).catch(console.error);
        axios.get(`${API_BASE_URL}/api/analytics/low-stock`).then(res => setLowStock(res.data)).catch(console.error);
        axios.get(`${API_BASE_URL}/api/analytics/category-rollups`).then(res => setCategoryRollups(res.data.rollups || [])).catch(console.error);
        axios.get(`${API_BASE_URL}/api/analytics/ratings`).then(res => setRatingAnalytics(res.data)).catch(console.error);
        axios.get(`${API_BASE_URL}/api/support/admin/all`).then(res => setTickets(res.data)).catch(console.error);
        fetchCategories();
    };

    const handleSuggestionAction = async (id, status) => {
        try {
            await axios.put(`${API_BASE_URL}/api/suggestions/${id}`, { status });
            fetchData();
        } catch (err) {
            alert('Failed to update suggestion');
        }
    };

    const handleDeleteSuggestion = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/suggestions/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete suggestion');
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const handleInputChange = (e) => {
        setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/products`, newProduct);
            fetchData();
            setNewProduct({ product_name: '', unit_quantity: '', price: '', quantity_available: '', category_name: categories[0]?.category_name || '' });
            alert("Product added!");
        } catch (error) {
            alert("Failed to add product");
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            await axios.post(`${API_BASE_URL}/api/categories`, { category_name: newCategoryName.trim() });
            setNewCategoryName('');
            setShowNewCategoryInput(false);
            fetchCategories();
            // Set the newly created category as selected
            setNewProduct(prev => ({ ...prev, category_name: newCategoryName.trim() }));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create category');
        }
    };

    // Confirm delete flow
    const openDeleteModal = (type, id, name) => {
        setDeleteModal({ show: true, type, id, name });
    };

    const confirmDelete = async () => {
        const { type, id } = deleteModal;
        try {
            if (type === 'product') {
                await axios.delete(`${API_BASE_URL}/api/products/${id}`);
            } else if (type === 'user') {
                await axios.delete(`${API_BASE_URL}/api/users/${id}`, {
                    headers: { 'x-user-id': user?.user_id }
                });
            }
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || `Failed to delete ${type}`);
        }
        setDeleteModal({ show: false, type: '', id: null, name: '' });
    };

    const handleUpdateProduct = async (id, field, value) => {
        try {
            await axios.put(`${API_BASE_URL}/api/products/${id}`, { [field]: value });
            setProducts(prev => prev.map(p => p.product_id === id ? { ...p, [field]: value } : p));
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateUserRole = async (userId, newRole) => {
        try {
            await axios.put(`${API_BASE_URL}/api/users/${userId}/role`, { role: newRole });
            fetchData();
        } catch (err) {
            alert("Role update failed");
        }
    };

    // Sale management
    const openSaleModal = (product) => {
        setSaleModal({ show: true, productId: product.product_id, productName: product.product_name });
        setSaleData({
            discount_percentage: product.discount_percentage || '',
            sale_start: product.sale_start ? new Date(product.sale_start).toISOString().slice(0, 16) : '',
            sale_end: product.sale_end ? new Date(product.sale_end).toISOString().slice(0, 16) : ''
        });
    };

    const handleSaveSale = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/products/${saleModal.productId}`, {
                discount_percentage: parseFloat(saleData.discount_percentage) || 0,
                sale_start: saleData.sale_start || null,
                sale_end: saleData.sale_end || null
            });
            setSaleModal({ show: false, productId: null, productName: '' });
            fetchData();
        } catch (err) {
            alert('Failed to update sale');
        }
    };

    const handleRemoveSale = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/products/${saleModal.productId}`, {
                discount_percentage: 0,
                sale_start: null,
                sale_end: null
            });
            setSaleData({ discount_percentage: 0, sale_start: '', sale_end: '' });
            setSaleModal({ show: false, productId: null, productName: '' });
            fetchData();
        } catch (err) {
            alert('Failed to remove sale');
        }
    };

    const handleUpdateTicket = async (ticketId, reply, status, priority) => {
        try {
            await axios.put(`${API_BASE_URL}/api/support/reply/${ticketId}`, {
                admin_reply: reply,
                status: status,
                priority: priority
            });
            fetchData();
        } catch (err) {
            alert("Failed to respond to ticket");
        }
    };

    const isOnSale = (product) => {
        if (!product.discount_percentage || product.discount_percentage <= 0) return false;
        const now = new Date();
        if (product.sale_start && new Date(product.sale_start) > now) return false;
        if (product.sale_end && new Date(product.sale_end) < now) return false;
        return true;
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            <div className="mb-8 border-b-2 border-primary-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="text-4xl text-emerald-500 drop-shadow-sm">⚙️</span> QuickCart Admin
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Manage your store's operations and analytics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Product Form - 1/3 width */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-8 hover:shadow-md transition-all duration-300">
                        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                            <span className="bg-primary-50 text-primary-600 w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-primary-100">+</span>
                            Add Product
                        </h3>
                        
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Product Name</label>
                                <input type="text" name="product_name" value={newProduct.product_name} onChange={handleInputChange} required className="input-field" placeholder="e.g., Organic Bananas" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Unit Quantity (e.g. 1kg, 500ml)</label>
                                <input type="text" name="unit_quantity" value={newProduct.unit_quantity} onChange={handleInputChange} required className="input-field" placeholder="e.g., 500g or 1L" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Category</label>
                                {showNewCategoryInput ? (
                                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            className="w-full px-4 py-2 bg-transparent focus:outline-none text-sm font-medium"
                                            placeholder="Enter new category..."
                                            autoFocus
                                        />
                                        <button type="button" onClick={handleCreateCategory} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-primary-500/30 hover:bg-primary-700 transition-colors">Save</button>
                                        <button type="button" onClick={() => setShowNewCategoryInput(false)} className="px-3 py-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors">✕</button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <select 
                                                name="category_name" 
                                                value={newProduct.category_name} 
                                                onChange={handleInputChange} 
                                                className="input-field cursor-pointer appearance-none bg-slate-50 border-slate-200/60 w-full"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.category_id} value={cat.category_name} className="font-medium text-slate-700">{cat.category_name}</option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewCategoryInput(true)}
                                            className="px-4 py-3 bg-white text-primary-600 rounded-2xl text-xs font-black uppercase tracking-wider border-2 border-primary-100 hover:border-primary-300 hover:bg-primary-50 transition-colors shadow-sm whitespace-nowrap"
                                            title="Create new category"
                                        >
                                            + New
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Price (₹)</label>
                                    <input type="number" step="0.01" name="price" value={newProduct.price} onChange={handleInputChange} required className="input-field" placeholder="100.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Stock Amount</label>
                                    <input type="number" name="quantity_available" value={newProduct.quantity_available} onChange={handleInputChange} required className="input-field" placeholder="50" />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn-primary w-full mt-4">
                                Save Product
                            </button>
                        </form>
                    </div>

                    {/* Low Stock Notifications */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-lg flex items-center justify-center text-lg">⚠️</span>
                            Stock Alerts
                        </h3>
                        
                        {notifications.length === 0 ? (
                            <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                                Inventory levels look good!
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {notifications.map(alert => (
                                    <div key={alert.notification_id} className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-xl">
                                        <p className="text-rose-700 font-semibold text-sm mb-1">{alert.message}</p>
                                        <p className="text-xs text-rose-400">{new Date(alert.created_at).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Data Lists - 2/3 width */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Analytics Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="bg-gradient-to-br from-emerald-50 to-primary-100/30 rounded-3xl p-6 sm:p-7 border border-emerald-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-emerald-200/40 rounded-full blur-2xl group-hover:bg-emerald-300/40 transition-colors duration-500"></div>
                            <div className="relative z-10 flex flex-col justify-center h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-sm text-emerald-600 rounded-2xl shadow-sm">💰</span>
                                    <h4 className="text-emerald-700 font-extrabold text-[11px] tracking-widest uppercase opacity-80">Total Revenue</h4>
                                </div>
                                <p className="text-4xl font-black text-emerald-900 tracking-tight">₹{orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-3xl p-6 sm:p-7 border border-blue-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-blue-200/40 rounded-full blur-2xl group-hover:bg-blue-300/40 transition-colors duration-500"></div>
                            <div className="relative z-10 flex flex-col justify-center h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-sm text-blue-600 rounded-2xl shadow-sm">📦</span>
                                    <h4 className="text-blue-700 font-extrabold text-[11px] tracking-widest uppercase opacity-80">Total Orders</h4>
                                </div>
                                <p className="text-4xl font-black text-blue-900 tracking-tight">{orders.length}</p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50/30 rounded-3xl p-6 sm:p-7 border border-rose-100/50 shadow-sm col-span-2 lg:col-span-1 relative overflow-hidden group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-rose-200/40 rounded-full blur-2xl group-hover:bg-rose-300/40 transition-colors duration-500"></div>
                            <div className="relative z-10 flex flex-col justify-center h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-sm text-rose-600 rounded-2xl shadow-sm">⚠️</span>
                                    <h4 className="text-rose-700 font-extrabold text-[11px] tracking-widest uppercase opacity-80">Low Stock Items</h4>
                                </div>
                                <p className="text-4xl font-black text-rose-900 tracking-tight">{lowStock.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rating Analytics Cards */}
                    {ratingAnalytics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex flex-col justify-center">
                                <h4 className="text-amber-700 font-bold text-sm mb-1 flex items-center gap-1">⭐ Platform Average</h4>
                                <p className="text-3xl font-black text-amber-900">{Number(ratingAnalytics.platformAvg).toFixed(1)} / 5.0</p>
                            </div>
                            <div className="bg-fuchsia-50 rounded-2xl p-5 border border-fuchsia-100 flex flex-col justify-center">
                                <h4 className="text-fuchsia-700 font-bold text-sm mb-1 flex items-center gap-1">🏆 Top Rated Product</h4>
                                <p className="text-lg font-black text-fuchsia-900 leading-tight truncate">{ratingAnalytics.topRated[0]?.product_name || 'N/A'}</p>
                                <p className="text-xs text-fuchsia-600 font-bold mt-1">⭐ {Number(ratingAnalytics.topRated[0]?.avg_rating || 0).toFixed(1)} ({ratingAnalytics.topRated[0]?.total_ratings || 0} reviews)</p>
                            </div>
                            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 flex flex-col justify-center">
                                <h4 className="text-indigo-700 font-bold text-sm mb-1 flex items-center gap-1">💬 Most Reviewed</h4>
                                <p className="text-lg font-black text-indigo-900 leading-tight truncate">{ratingAnalytics.mostReviewed?.product_name || 'N/A'}</p>
                                <p className="text-xs text-indigo-600 font-bold mt-1">{ratingAnalytics.mostReviewed?.total_ratings || 0} Total Reviews</p>
                            </div>
                        </div>
                    )}

                    {/* Top Products Analytics */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-2xl drop-shadow-sm">📈</span>
                                Top Selling Items
                            </h3>
                        </div>
                        
                        <div className="p-4">
                            {topProducts.length === 0 ? (
                                <div className="text-center py-6 text-slate-500">No sales data yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {topProducts.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-primary-50 text-primary-600'}`}>
                                                    #{idx + 1}
                                                </span>
                                                <span className="font-semibold text-slate-800 truncate max-w-[120px]" title={p.product_name}>{p.product_name}</span>
                                            </div>
                                            <div className="font-bold text-slate-600 flex-shrink-0">
                                                {p.total_sold} <span className="text-slate-400 text-sm font-normal">units</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Rollups Analytics */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-2xl drop-shadow-sm">📊</span>
                                Sales By Category
                            </h3>
                        </div>
                        <div className="p-6">
                            {categoryRollups.length === 0 ? (
                                <div className="text-center py-4 text-slate-500">No category sales data.</div>
                            ) : (
                                <div className="space-y-4">
                                    {categoryRollups.map((cat, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="font-semibold text-slate-700">{cat.category_name}</span>
                                                <div className="text-right">
                                                    <span className="font-bold text-slate-800 text-sm">₹{cat.revenue.toLocaleString()}</span>
                                                    <span className="text-xs text-slate-500 ml-2">({cat.percentage}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                <div className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-indigo-500' : 'bg-primary-500'}`} style={{ width: `${cat.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Products Inventory Table */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-lg flex items-center justify-center text-lg">📦</span>
                                Inventory Management
                            </h3>
                            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{products.length} Items</span>
                        </div>
                        
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 sticky top-0">
                                        <th className="p-4 font-semibold w-16">ID</th>
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">Unit</th>
                                        <th className="p-4 font-semibold text-right">Price</th>
                                        <th className="p-4 font-semibold text-center">Stock</th>
                                        <th className="p-4 font-semibold text-center">Sale</th>
                                        <th className="p-4 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {products.map(product => (
                                        <tr key={product.product_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-xs font-bold text-slate-400">#{product.product_id}</td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-transparent border-b border-transparent focus:border-primary-400 focus:outline-none font-bold text-slate-700"
                                                    defaultValue={product.product_name}
                                                    onBlur={(e) => handleUpdateProduct(product.product_id, 'product_name', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input 
                                                    type="text" 
                                                    className="w-20 bg-transparent border-b border-transparent focus:border-primary-400 focus:outline-none text-slate-500 text-sm font-medium"
                                                    defaultValue={product.unit_quantity}
                                                    placeholder="1kg, etc"
                                                    onBlur={(e) => handleUpdateProduct(product.product_id, 'unit_quantity', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <span className="text-xs text-slate-400 font-bold">₹</span>
                                                    <input 
                                                        type="number" 
                                                        className="w-20 bg-transparent border-b border-transparent focus:border-primary-400 focus:outline-none text-right font-black text-primary-600"
                                                        defaultValue={product.price}
                                                        onBlur={(e) => handleUpdateProduct(product.product_id, 'price', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <input 
                                                    type="number" 
                                                    className={`w-16 bg-slate-100 rounded-lg px-2 py-1 text-center font-black focus:ring-2 focus:ring-primary-500/20 focus:outline-none ${product.quantity_available <= 5 ? 'text-rose-600' : 'text-emerald-600'}`}
                                                    defaultValue={product.quantity_available}
                                                    onBlur={(e) => handleUpdateProduct(product.product_id, 'quantity_available', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => openSaleModal(product)}
                                                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${isOnSale(product) ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                >
                                                    {isOnSale(product) ? `${product.discount_percentage}% OFF` : '+ Sale'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => openDeleteModal('product', product.product_id, product.product_name)} 
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors focus:outline-none"
                                                    title="Delete Product"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {products.length === 0 && (
                                <div className="text-center py-8 text-slate-500">No products found. Add one above.</div>
                            )}
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center text-lg">💰</span>
                                Recent Orders
                            </h3>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{orders.length} Orders</span>
                                <div className="flex items-center gap-2 text-xs">
                                    <input 
                                        type="date" 
                                        value={dateRange.start} 
                                        onChange={e => setDateRange({...dateRange, start: e.target.value})} 
                                        className="bg-white border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-primary-500 outline-none"
                                    />
                                    <span className="text-slate-400">to</span>
                                    <input 
                                        type="date" 
                                        value={dateRange.end} 
                                        onChange={e => setDateRange({...dateRange, end: e.target.value})} 
                                        className="bg-white border border-slate-200 rounded-md px-2 py-1 focus:ring-1 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                {(dateRange.start || dateRange.end) && (
                                    <button 
                                        onClick={() => setDateRange({start: '', end: ''})}
                                        className="text-xs text-rose-500 hover:text-rose-700 font-bold"
                                    >Clear</button>
                                )}
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 sticky top-0">
                                        <th className="p-4 font-semibold w-16">ID</th>
                                        <th className="p-4 font-semibold">Customer</th>
                                        <th className="p-4 font-semibold">Date</th>
                                        <th className="p-4 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orders.map(order => (
                                        <tr key={order.order_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-sm font-medium text-slate-500">#{order.order_id}</td>
                                            <td className="p-4 font-semibold text-slate-800">
                                                {order.customer_name}
                                                <p className="text-xs text-slate-500 font-normal">{order.email}</p>
                                            </td>
                                            <td className="p-4 text-slate-600 text-sm">{new Date(order.order_date).toLocaleDateString()}</td>
                                            <td className="p-4 font-bold text-emerald-600 text-right">₹{Number(order.total_amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* User Management Table */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-lg">👤</span>
                                User Management
                            </h3>
                            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">{customers.length} Users</span>
                        </div>
                        
                        <div className="overflow-x-auto max-h-[400px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100 sticky top-0">
                                        <th className="p-4 font-semibold">Name & Role</th>
                                        <th className="p-4 font-semibold">Contact Info</th>
                                        <th className="p-4 font-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {customers.map(u => (
                                        <tr key={u.user_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{u.name}</p>
                                                        <select 
                                                            className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border-none focus:ring-0 cursor-pointer"
                                                            value={u.role}
                                                            onChange={(e) => handleUpdateUserRole(u.user_id, e.target.value)}
                                                        >
                                                            <option value="customer">Customer</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-slate-600">{u.email}</p>
                                                <p className="text-xs text-slate-400">{u.phone}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                {u.user_id === user?.user_id ? (
                                                    <span className="text-xs text-slate-400 font-bold">You</span>
                                                ) : (
                                                    <button 
                                                        onClick={() => openDeleteModal('user', u.user_id, u.name)}
                                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* ===== PRODUCT SUGGESTIONS SECTION ===== */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="bg-violet-100 text-violet-600 w-8 h-8 rounded-lg flex items-center justify-center">💡</span>
                    Product Suggestions
                    {suggestions.filter(s => s.status === 'pending').length > 0 && (
                        <span className="ml-2 px-2.5 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                            {suggestions.filter(s => s.status === 'pending').length} new
                        </span>
                    )}
                </h3>

                {suggestions.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No product suggestions yet.</p>
                ) : (
                    <div className="space-y-3">
                        {suggestions.map(s => (
                            <div key={s.suggestion_id} className={`p-4 rounded-2xl border transition-all ${
                                s.status === 'pending' ? 'border-violet-200 bg-violet-50/30' :
                                s.status === 'approved' ? 'border-emerald-200 bg-emerald-50/30' :
                                'border-slate-200 bg-slate-50/30'
                            }`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-slate-800">{s.product_name}</h4>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                                s.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                s.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-slate-200 text-slate-500'
                                            }`}>
                                                {s.status.toUpperCase()}
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-xs">{s.category}</span>
                                        </div>
                                        {s.description && <p className="text-sm text-slate-500 mt-1">{s.description}</p>}
                                        <p className="text-xs text-slate-400 mt-1.5">
                                            Suggested by <span className="font-semibold text-slate-500">{s.user_name}</span> ({s.user_email}) · {new Date(s.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {s.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleSuggestionAction(s.suggestion_id, 'approved')}
                                                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition-colors"
                                                >✓ Approve</button>
                                                <button
                                                    onClick={() => handleSuggestionAction(s.suggestion_id, 'rejected')}
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
                                                >✕ Reject</button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDeleteSuggestion(s.suggestion_id)}
                                            className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== SUPPORT TICKETS SECTION ===== */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mt-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">🎧</span>
                    Help & Support Tickets
                    {tickets.filter(t => t.status === 'open').length > 0 && (
                        <span className="ml-2 px-2.5 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                            {tickets.filter(t => t.status === 'open').length} new
                        </span>
                    )}
                </h3>

                {tickets.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center gap-3">
                        <span className="text-5xl grayscale opacity-30">🎫</span>
                        <p className="text-slate-400 font-bold">No support tickets found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {tickets.map(t => (
                            <div key={t.ticket_id} className={`p-6 rounded-3xl border transition-all ${t.status === 'resolved' ? 'bg-slate-50/50 border-slate-100' : 'bg-white border-slate-200 shadow-xl shadow-slate-100/30'}`}>
                                <div className="flex flex-col xl:flex-row justify-between items-start gap-6">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                t.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 
                                                t.status === 'in_progress' ? 'bg-amber-100 text-amber-600' : 
                                                'bg-blue-100 text-blue-600'}`}>
                                                {t.status.replace('_', ' ')}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                t.priority === 'high' ? 'text-rose-500' : 
                                                t.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                                                {t.priority} Priority
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-auto lg:ml-0">
                                                ID #{t.ticket_id} · {t.category} Issue
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-black text-xs">
                                                {t.user_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800 leading-tight">{t.subject}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                    By {t.user_name} ({t.user_email}) · {new Date(t.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-sm italic font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                                            "{t.message}"
                                        </p>
                                        
                                        {/* Response Actions */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Admin Response</label>
                                                <textarea 
                                                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none min-h-[120px] resize-none"
                                                    defaultValue={t.admin_reply}
                                                    placeholder="Provide help to the user..."
                                                    onBlur={(e) => {
                                                        if (e.target.value !== t.admin_reply) {
                                                            handleUpdateTicket(t.ticket_id, e.target.value, t.status, t.priority);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                <button 
                                                    onClick={() => handleUpdateTicket(t.ticket_id, t.admin_reply, 'in_progress', t.priority)}
                                                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${t.status === 'in_progress' ? 'bg-amber-100 text-amber-600 cursor-default' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    Mark In Progress
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdateTicket(t.ticket_id, t.admin_reply, 'resolved', t.priority)}
                                                    className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${t.status === 'resolved' ? 'bg-emerald-100 text-emerald-600 cursor-default' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600'}`}
                                                >
                                                    {t.status === 'resolved' ? 'Ticket Resolved ✓' : 'Mark as Resolved'}
                                                </button>
                                                {t.status === 'resolved' && (
                                                    <button 
                                                        onClick={() => handleUpdateTicket(t.ticket_id, t.admin_reply, 'open', t.priority)}
                                                        className="px-4 py-2 text-xs font-black rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                    >
                                                        Reopen Ticket
                                                    </button>
                                                )}
                                                
                                                <div className="ml-auto flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">Change Priority:</span>
                                                    <select 
                                                        className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-lg focus:ring-0 px-2 py-1 cursor-pointer"
                                                        value={t.priority}
                                                        onChange={(e) => handleUpdateTicket(t.ticket_id, t.admin_reply, t.status, e.target.value)}
                                                    >
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right flex-shrink-0 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Created At</p>
                                        <p className="text-sm font-bold text-slate-500">{new Date(t.created_at).toLocaleDateString()}</p>
                                        <p className="text-sm font-bold text-slate-500 mb-4">{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Last Update</p>
                                        <p className="text-sm font-bold text-slate-400">{new Date(t.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== CONFIRM DELETE MODAL ===== */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ show: false, type: '', id: null, name: '' })}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete {deleteModal.type === 'product' ? 'Product' : 'User'}?</h3>
                            <p className="text-slate-500 mb-6">
                                Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteModal.name}"</span>? 
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteModal({ show: false, type: '', id: null, name: '' })}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >Cancel</button>
                                <button 
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors"
                                >Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== SALE MODAL ===== */}
            {saleModal.show && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSaleModal({ show: false, productId: null, productName: '' })}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSaleModal({ show: false, productId: null, productName: '' })} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">✕</button>
                        
                        <div className="text-center mb-6">
                            <span className="text-4xl">🏷️</span>
                            <h3 className="text-xl font-bold text-slate-800 mt-2">Manage Sale</h3>
                            <p className="text-slate-500 text-sm mt-1">{saleModal.productName}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Discount Percentage (%)</label>
                                <input 
                                    type="number" min="0" max="99" step="1"
                                    value={saleData.discount_percentage}
                                    onChange={e => setSaleData({...saleData, discount_percentage: e.target.value})}
                                    className="input-field"
                                    placeholder="e.g., 20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Sale Start</label>
                                <input 
                                    type="datetime-local"
                                    value={saleData.sale_start}
                                    onChange={e => setSaleData({...saleData, sale_start: e.target.value})}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Sale End</label>
                                <input 
                                    type="datetime-local"
                                    value={saleData.sale_end}
                                    onChange={e => setSaleData({...saleData, sale_end: e.target.value})}
                                    className="input-field"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={handleRemoveSale}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                                >Remove Sale</button>
                                <button 
                                    onClick={handleSaveSale}
                                    className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors text-sm"
                                >Save Sale</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;