import API_BASE_URL from '../api.js';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Profile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('quickcart_user'));

    const [orderHistory, setOrderHistory] = useState([]);
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('orders'); // orders, settings

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '' });

        axios.get(`${API_BASE_URL}/api/orders/history/${user.user_id}`)
            .then(response => setOrderHistory(response.data))
            .catch(error => console.error("Error fetching order history:", error));
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_BASE_URL}/api/auth/update`, {
                userId: user.user_id,
                name: formData.name,
                phone: formData.phone,
                address: formData.address
            });
            
            const updatedUser = { ...user, name: formData.name, phone: formData.phone, address: formData.address };
            localStorage.setItem('quickcart_user', JSON.stringify(updatedUser));
            setMessage("Profile updated successfully!");
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage("Error updating profile.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('quickcart_user');
        window.location.href = '/';
    };

    if (!user) return null;

    // Simple tier logic based on total orders
    const getTier = () => {
        if (orderHistory.length > 20) return { name: 'Gold Tier', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        if (orderHistory.length > 5) return { name: 'Silver Tier', color: 'bg-slate-200 text-slate-700 border-slate-300' };
        return { name: 'Bronze Tier', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    };
    const tier = getTier();

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
            
            {/* Header Section */}
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="w-32 h-32 bg-slate-50 rounded-full border-4 border-white shadow-lg relative z-10 flex items-center justify-center text-5xl shrink-0">
                    👤
                </div>
                
                <div className="flex-1 text-center md:text-left relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                        <h1 className="text-3xl font-extrabold text-slate-800">{user.name}</h1>
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${tier.color}`}>
                            {tier.name}
                        </span>
                    </div>
                    <p className="text-slate-500 text-lg">{user.email}</p>
                    <p className="text-slate-400 text-sm mt-1">{user.phone} • Member since {new Date().getFullYear()}</p>
                </div>
                
                <div className="relative z-10 shrink-0">
                    <button onClick={handleLogout} className="btn-danger flex items-center gap-2 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Profile Navigation Links (Card UI) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/" className="bg-white group p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏠</div>
                    <span className="font-bold text-slate-700 group-hover:text-primary-600">Home</span>
                </Link>
                <Link to="/cart" className="bg-white group p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🛒</div>
                    <span className="font-bold text-slate-700 group-hover:text-emerald-600">My Cart</span>
                </Link>
                <Link to="/wishlist" className="bg-white group p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">❤️</div>
                    <span className="font-bold text-slate-700 group-hover:text-rose-600">Wishlist</span>
                </Link>
                <div onClick={() => setActiveTab('settings')} className={`bg-white group p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${activeTab === 'settings' ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">⚙️</div>
                    <span className="font-bold text-slate-700 group-hover:text-blue-600">Account Settings</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left side nav (Desktop) */}
                <div className="hidden md:flex w-1/4 flex-col gap-2">
                    <button onClick={() => setActiveTab('orders')} className={`text-left px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50'}`}>
                        📦 My Orders
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`text-left px-5 py-4 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50'}`}>
                        ⚙️ Account Settings
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="w-full md:w-3/4">
                    {activeTab === 'orders' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        📦 Order History
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">View your previous grocery purchases and receipts</p>
                                </div>
                                <div className="text-sm font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-lg">
                                    Total Orders: {orderHistory.length}
                                </div>
                            </div>
                            
                            <div className="p-6 md:p-8">
                                {orderHistory.length === 0 ? (
                                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                                        <div className="text-6xl mb-4 opacity-40">🛍️</div>
                                        <h4 className="text-xl font-bold text-slate-700">No orders yet</h4>
                                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">Start exploring our catalog and place your first order. It will appear here.</p>
                                        <Link to="/" className="btn-primary mt-6 inline-block">Start Shopping</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orderHistory.map((order, idx) => {
                                            let itemsArr = [];
                                            try {
                                                if (typeof order.items === 'string') {
                                                    itemsArr = order.items.split(',').map(s => ({ product_name: s.trim(), quantity: 1 }));
                                                } else if (Array.isArray(order.items)) {
                                                    itemsArr = order.items;
                                                }
                                            } catch(e) {}

                                            return (
                                                <div key={order.order_id || idx} className="border border-slate-200 rounded-2xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all bg-white group">
                                                    
                                                    {/* Order Header */}
                                                    <div className="bg-slate-50 p-5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                                                        <div className="flex gap-6">
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Placed</p>
                                                                <p className="text-sm font-semibold text-slate-700">{new Date(order.order_date).toLocaleDateString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                                                                <p className="text-sm font-semibold text-slate-700">₹{Number(order.total_amount).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex items-center gap-4">
                                                            <div className="text-left">
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order #</p>
                                                                <p className="text-sm font-semibold text-slate-700">{order.order_id}</p>
                                                            </div>
                                                            <Link 
                                                                to={`/receipt/${order.order_id}`}
                                                                className="bg-white border text-slate-600 hover:text-primary-700 hover:border-primary-500 hover:bg-primary-50 text-sm font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                                            >
                                                                🧾 View Receipt
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Order Status & Items */}
                                                    <div className="p-5 flex flex-col md:flex-row gap-6 justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <h4 className="font-bold text-emerald-600 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Delivered
                                                                </h4>
                                                            </div>
                                                            
                                                            {itemsArr.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {itemsArr.map((item, index) => (
                                                                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-sm border border-slate-200 group-hover:border-primary-100 transition-colors">
                                                                            {item.quantity && <span className="font-bold mr-1.5 text-primary-600">{item.quantity}x</span>} {item.product_name || item}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                ⚙️ Account Settings
                            </h3>
                            
                            {message && (
                                <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm text-center border border-emerald-200">
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field bg-slate-50" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field bg-slate-50" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                                        <input type="email" value={user.email} disabled className="input-field bg-slate-100 text-slate-500 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Delivery Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Apartment / House no, Street, City" className="input-field min-h-[100px] bg-slate-50 resize-y" />
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <button type="submit" className="btn-primary px-8">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;