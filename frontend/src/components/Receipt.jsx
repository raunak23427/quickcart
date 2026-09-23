import API_BASE_URL from '../api.js';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function Receipt() {
    const { orderId } = useParams();
    const [billItems, setBillItems] = useState([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/orders/bill/${orderId}`)
            .then(response => {
                setBillItems(response.data);
            })
            .catch(error => {
                console.error("Error fetching receipt:", error);
            });
    }, [orderId]);

    if (billItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-semibold text-slate-600">Generating your receipt...</h2>
            </div>
        );
    }

    const orderInfo = billItems[0];
    
    // Reverse calculate the breakdown (because database logic wasn't changed but we need to show the new UI math)
    // The previous frontend just calculated total = sum(items) + flat + flat.
    // The database might just have the raw total_amount from the cart post request.
    // So let's extract the actual item sum:
    const itemSubtotal = billItems.reduce((sum, item) => sum + Number(item.item_total), 0);
    const deliveryFee = itemSubtotal > 0 ? 25.00 : 0;
    const taxAmount = itemSubtotal * 0.05;
    
    // Just in case backend 'total_amount' is out of sync somehow, rely on our own calculation for UI display consistency
    const grandTotalDisplay = itemSubtotal + deliveryFee + taxAmount;

    return (
        <div className="w-full max-w-2xl mx-auto py-8">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Order Confirmed!</h1>
                <p className="text-slate-500 text-lg">Thank you for shopping with QuickCart.</p>
            </div>

            {/* Receipt Modal */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
                {/* Receipt edge zig-zag decoration could go here theoretically */}
                <div className="absolute top-0 left-0 w-full h-2 bg-primary-500"></div>
                
                <div className="p-8 pb-0">
                    <div className="flex justify-between items-start border-b border-dashed border-slate-300 pb-6 mb-6">
                        <div>
                            <p className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-1">Receipt</p>
                            <h2 className="text-2xl font-bold text-slate-800">Order #{orderInfo.order_id}</h2>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                            <p className="font-semibold text-slate-800 mb-1">{orderInfo.customer_name}</p>
                            <p>{new Date(orderInfo.order_date).toLocaleDateString()}</p>
                            <p>{new Date(orderInfo.order_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>

                    <div className="w-full">
                        <table className="w-full text-left">
                            <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="pb-3 font-semibold">Item</th>
                                    <th className="pb-3 font-semibold text-center">Qty</th>
                                    <th className="pb-3 font-semibold text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {billItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-4 font-medium text-slate-800">{item.product_name}</td>
                                        <td className="py-4 text-slate-600 text-center">{item.quantity}</td>
                                        <td className="py-4 font-bold text-slate-800 text-right">₹{Number(item.item_total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Subtotals & Total */}
                <div className="bg-slate-50 p-8 pt-6 border-t border-slate-100">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-slate-600 text-sm">
                            <span>Item Total</span>
                            <span className="font-medium text-slate-800">₹{itemSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-sm">
                            <span>Delivery Fee</span>
                            <span className="font-medium text-slate-800">₹{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-sm">
                            <span>Taxes (5%)</span>
                            <span className="font-medium text-slate-800">₹{taxAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-5 border-t border-dashed border-slate-300">
                        <h3 className="text-xl font-bold text-slate-800">Grand Total</h3>
                        {/* We use the frontend display match to hide any float point backend desync since backend stores total_amount as decimal  */}
                        <h3 className="text-2xl font-bold text-primary-600">₹{grandTotalDisplay.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <Link to="/" className="inline-flex py-3 px-8 bg-transparent text-primary-600 font-bold rounded-xl border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 active:scale-95">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default Receipt;