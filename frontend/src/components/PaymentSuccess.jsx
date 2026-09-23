import API_BASE_URL from '../api.js';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PaymentSuccess() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [showCheck, setShowCheck] = useState(false);

    const [orderDetails, setOrderDetails] = useState(null);
    const user = JSON.parse(localStorage.getItem('quickcart_user'));

    useEffect(() => {
        // Progress bar simulation
        const progressInterval = setInterval(() => {
            setProgress(prev => (prev >= 100 ? 100 : prev + 1));
        }, 100);

        // Show checkmark after a brief delay
        setTimeout(() => setShowCheck(true), 600);

        // Fetch order details for the summary
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/orders/order/${orderId}`);
                setOrderDetails(response.data);
            } catch (err) {
                console.error("Error fetching order details:", err);
            }
        };
        fetchOrderDetails();

        return () => clearInterval(progressInterval);
    }, [orderId]);

    return (
        <div className="w-full flex-1 flex flex-col items-center py-8 px-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-xl w-full relative overflow-hidden">
                
                {/* Blinkit Style Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-green-100 font-bold text-xs uppercase tracking-widest mb-1">Arriving in</p>
                            <h2 className="text-5xl font-black flex items-end gap-2 leading-none">
                                8 <span className="text-2xl font-bold mb-1">mins</span>
                            </h2>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
                            <span className="text-4xl" style={{ animation: 'bounceIn 0.8s ease-out' }}>🛵</span>
                        </div>
                    </div>
                    {/* Progress Loader Inline */}
                    <div className="mt-8 h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Success Animation */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${showCheck ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                            🎉
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 leading-tight">Order Confirmed!</h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">ID: #ORD-{orderId}</p>
                        </div>
                    </div>

                    {/* Order Details List */}
                    <div className="mb-8 space-y-3">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-50 pb-2">Your Items</h4>
                        {orderDetails && orderDetails.items ? (
                            orderDetails.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 text-xl shadow-sm">
                                            {item.product_name.toLowerCase().includes('milk') ? '🥛' : 
                                             item.product_name.toLowerCase().includes('bread') ? '🍞' :
                                             item.product_name.toLowerCase().includes('egg') ? '🥚' :
                                             item.product_name.toLowerCase().includes('rice') ? '🍚' : '📦'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight">{item.product_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                Qty: {item.quantity} {item.unit_quantity ? `(${item.unit_quantity})` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-black text-slate-800 text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center py-6 gap-2">
                                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-400 text-sm font-medium">Loading order summary...</p>
                            </div>
                        )}
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📍</span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivering to</span>
                        </div>
                        <p className="text-slate-700 font-bold text-sm ml-6 leading-relaxed">
                            {user?.address || "H-12, Sector 62, Noida, UP - 201301"}
                        </p>
                    </div>

                    {/* Payment Summary */}
                    <div className="border-t-2 border-dashed border-slate-100 pt-6 mb-8 flex justify-between items-center px-2">
                        <span className="text-slate-400 font-black uppercase tracking-tighter text-sm">Amount Paid</span>
                        <span className="text-2xl font-black text-slate-800">₹{orderDetails ? Number(orderDetails.total_amount).toFixed(2) : '--.--'}</span>
                    </div>

                    {/* Action Buttons — NO DUPLICATES */}
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => navigate(`/track/${orderId}`)}
                            className="btn-primary flex items-center justify-center gap-2 py-4"
                        >
                            <span>📡</span> Track Order Live
                        </button>
                        <Link to="/" className="w-full text-center py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-2xl transition-colors border border-slate-200 flex justify-center items-center gap-2">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;
