import API_BASE_URL from '../api.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminProfile() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('quickcart_user'));

    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }

        setFormData({ name: user.name || '', phone: user.phone || '', address: user.address || '' });

        // Fetch admin stats
        const fetchStats = async () => {
            try {
                const [productsRes, usersRes, ordersRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/products`),
                    axios.get(`${API_BASE_URL}/api/users`),
                    axios.get(`${API_BASE_URL}/api/orders/all`),
                ]);
                setStats({
                    totalProducts: productsRes.data.length,
                    totalUsers: usersRes.data.length,
                    totalOrders: ordersRes.data.length,
                    totalRevenue: ordersRes.data.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

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

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* Admin Profile Header */}
            <div className="mb-2">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg">👤</span>
                    Admin Profile
                </h2>
                <p className="text-slate-500 mt-2 font-medium ml-[52px]">Manage your administrator account</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Side: Admin Info Card */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
                        {/* Admin-themed gradient: slate/indigo instead of green */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-slate-800 via-indigo-700 to-indigo-500"></div>
                        
                        <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-md mx-auto relative z-10 flex items-center justify-center text-4xl mt-8 mb-4">
                            🛡️
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
                        <p className="text-slate-500">{user.email}</p>
                        <span className="inline-block mt-3 px-4 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-widest">
                            Administrator
                        </span>
                        
                        <div className="mt-8 pt-6 border-t border-slate-100 pb-2">
                            <button onClick={handleLogout} className="btn-danger w-full flex items-center justify-center gap-2 mb-4">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Sign Out
                            </button>
                        </div>

                        {/* Admin Quick Links */}
                        <div className="flex flex-col gap-3 mt-2 text-left">
                            <button onClick={() => navigate('/admin')} className="w-full text-slate-600 bg-slate-50 hover:bg-slate-100 font-semibold py-3 px-4 rounded-xl flex items-center justify-between transition-colors border border-slate-200">
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    Dashboard
                                </span>
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <button onClick={() => alert("Help & Support coming soon!")} className="w-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-semibold py-3 px-4 rounded-xl flex items-center justify-between transition-colors border border-indigo-100 mt-2">
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" /></svg> 
                                    Help & Support
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Edit Profile Form */}
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Edit Profile
                        </h3>
                        
                        {message && (
                            <div className={`mb-4 p-3 rounded-xl font-medium text-sm text-center border ${message.includes('Error') ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Office / Building, Street, City" className="input-field min-h-[80px] resize-y" />
                            </div>
                            <button type="submit" className="btn-primary w-full mt-2" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side: Admin Stats Overview */}
                <div className="w-full md:w-2/3 space-y-6">

                    {/* Account Details Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Account Details
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-sm font-semibold text-slate-500">User ID</span>
                                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">#{user.user_id}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-sm font-semibold text-slate-500">Full Name</span>
                                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-sm font-semibold text-slate-500">Email Address</span>
                                    <span className="text-sm font-bold text-slate-800">{user.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-sm font-semibold text-slate-500">Phone</span>
                                    <span className="text-sm font-bold text-slate-800">{user.phone || 'Not set'}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-sm font-semibold text-slate-500">Role</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full border border-indigo-100">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                        Administrator
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="text-sm font-semibold text-slate-500">Address</span>
                                    <span className="text-sm font-bold text-slate-800 text-right max-w-[60%]">{user.address || 'Not set'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-lg text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">QuickCart Admin</h4>
                                <p className="text-slate-400 text-sm">System Information</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-slate-400 text-xs mb-1">Version</p>
                                <p className="font-bold">v1.0.0</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-slate-400 text-xs mb-1">Status</p>
                                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-slate-400 text-xs mb-1">Database</p>
                                <p className="font-bold">MySQL</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-slate-400 text-xs mb-1">Backend</p>
                                <p className="font-bold">Express.js</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;
