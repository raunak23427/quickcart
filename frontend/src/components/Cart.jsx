import API_BASE_URL from '../api.js';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PaymentGateway from './PaymentGateway';

function Cart() {
    const user = JSON.parse(localStorage.getItem('quickcart_user'));

    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [originalTotal, setOriginalTotal] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');
    const navigate = useNavigate();
    const activeCartId = user ? user.user_id : null;

    // Delivery fee and tax
    const deliveryFee = cartTotal > 0 ? 25.00 : 0;
    const taxRate = 0.05;
    
    const saleDiscountSaved = originalTotal - cartTotal;
    const couponDiscountSaved = (cartTotal * discount) / 100;
    const totalSaved = saleDiscountSaved + couponDiscountSaved;
    
    const taxableAmount = cartTotal - couponDiscountSaved;
    const taxAmount = Math.max(0, taxableAmount * taxRate);
    const grandTotal = Math.max(0, taxableAmount + deliveryFee + taxAmount);

    // Check if there are any items that block checkout
    const hasInvalidItems = cartItems.some(
        item => item.stock_status === 'out_of_stock' || item.stock_status === 'insufficient'
    );

    const fetchCartData = () => {
        axios.get(`${API_BASE_URL}/api/carts/${activeCartId}`)
            .then(response => {
                setCartItems(response.data);
                // Only count valid items for the total
                let origSum = 0;
                let finalSum = 0;
                response.data.forEach(item => {
                    if (item.stock_status !== 'out_of_stock') {
                        const qty = Math.min(item.quantity, item.quantity_available);
                        origSum += Number(item.price) * qty;
                        finalSum += Number(item.final_price) * qty;
                    }
                });
                setOriginalTotal(origSum);
                setCartTotal(finalSum);
                setCheckoutError('');
            })
            .catch(error => console.error("Error fetching cart items:", error));
    };

    useEffect(() => {
        if (user && user.user_id) {
            fetchCartData();
            // Refresh stock status every 30 seconds
            const interval = setInterval(fetchCartData, 30000);
            return () => clearInterval(interval);
        }
    }, []);

    const handleQuantityChange = (productId, currentQty, change, maxStock) => {
        const newQty = currentQty + change;

        if (newQty > maxStock) {
            alert(`Sorry! We only have ${maxStock} of these in stock right now. You cannot add more.`);
            return;
        }

        if (newQty === 0) {
            axios.delete(`${API_BASE_URL}/api/carts/remove/${activeCartId}/${productId}`)
                .then(() => fetchCartData());
        } else {
            axios.put(`${API_BASE_URL}/api/carts/update`, {
                cart_id: activeCartId,
                product_id: productId,
                quantity: newQty
            }).then(() => fetchCartData())
              .catch(err => {
                  if (err.response?.data?.available !== undefined) {
                      alert(`Only ${err.response.data.available} available in stock.`);
                  }
                  fetchCartData();
              });
        }
    };

    const handleRemoveItem = (productId) => {
        axios.delete(`${API_BASE_URL}/api/carts/remove/${activeCartId}/${productId}`)
            .then(() => fetchCartData());
    };

    // Auto-fix: set quantity to what's available
    const handleFixQuantity = (productId, availableQty) => {
        if (availableQty <= 0) {
            handleRemoveItem(productId);
            return;
        }
        axios.put(`${API_BASE_URL}/api/carts/update`, {
            cart_id: activeCartId,
            product_id: productId,
            quantity: availableQty
        }).then(() => fetchCartData());
    };

    const handleApplyCoupon = () => {
        if (!couponCode) return;
        axios.get(`${API_BASE_URL}/api/coupons/${couponCode}?amount=${cartTotal}`)
            .then(res => {
                setDiscount(res.data.discount_percent);
                alert(`${res.data.message} (${res.data.discount_percent}% off)`);
            })
            .catch(err => {
                setDiscount(0);
                alert(err.response?.data?.message || "Invalid coupon");
            });
    };

    const triggerCheckout = () => {
        if (cartItems.length === 0) return;
        if (hasInvalidItems) {
            setCheckoutError('Please fix or remove out-of-stock items before checking out.');
            return;
        }
        setCheckoutError('');
        setIsPaymentProcessing(true);
    };

    const handlePaymentComplete = (paymentResult) => {
        setIsPaymentProcessing(false);
        axios.post(`${API_BASE_URL}/api/orders/checkout`, {
            userId: user.user_id,
            cartId: activeCartId,
            totalAmount: grandTotal,
            paymentMethod: paymentResult.method,
            transactionId: paymentResult.transactionId
        })
            .then(response => {
                setCartItems([]);
                setCartTotal(0);
                navigate(`/success/${response.data.orderId}`);
            })
            .catch(error => {
                console.error("Checkout error:", error);
                const msg = error.response?.data?.message || "Failed to place order.";
                setCheckoutError(msg);
                // Refresh cart to show updated stock
                fetchCartData();
            });
    };

    // Helper to render stock status badge
    const StockBadge = ({ item }) => {
        if (item.stock_status === 'out_of_stock') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg">
                    <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                    Out of Stock
                </span>
            );
        }
        if (item.stock_status === 'insufficient') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    Only {item.quantity_available} available
                </span>
            );
        }
        if (item.stock_status === 'low_stock') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-lg">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Low Stock ({item.quantity_available} left)
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                In Stock
            </span>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="mb-8 border-b-2 border-primary-100 pb-4">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="text-4xl drop-shadow-sm">🛒</span> Your Cart
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Review your items before checkout</p>
            </div>

            {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="text-6xl mb-6 opacity-40">🛍️</div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">Your cart is empty</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Looks like you haven't added any fresh groceries to your cart yet.</p>
                    <Link to="/" className="btn-primary inline-block w-auto px-8">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT COLUMN: Item List */}
                    <div className="flex-1 space-y-4">
                        {/* Stock warning banner */}
                        {hasInvalidItems && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                                <svg className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <div>
                                    <p className="font-bold text-rose-700 text-sm">Some items are no longer available</p>
                                    <p className="text-rose-600 text-xs mt-1">Please update quantities or remove unavailable items to proceed with checkout.</p>
                                </div>
                            </div>
                        )}

                        {cartItems.map(item => {
                            const isInvalid = item.stock_status === 'out_of_stock' || item.stock_status === 'insufficient';
                            
                            return (
                                <div key={item.cart_item_id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${isInvalid ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'}`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border ${isInvalid ? 'bg-rose-50 border-rose-100 opacity-60' : 'bg-slate-50 border-slate-100'}`}>
                                                <span className="text-3xl opacity-60">🥬</span>
                                            </div>
                                            <div>
                                                <h3 className={`font-semibold mb-1 ${isInvalid ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{item.product_name}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.unit_quantity || '1 unit'}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-primary-600 font-bold">₹{Number(item.final_price).toFixed(2)}</p>
                                                    {Number(item.final_price) < Number(item.price) && (
                                                        <>
                                                            <span className="text-slate-400 text-sm line-through">₹{Number(item.price).toFixed(2)}</span>
                                                            <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                                                {item.discount_percentage}% OFF
                                                            </span>
                                                        </>
                                                    )}
                                                    <span className="text-slate-400 font-normal text-sm ml-1">each</span>
                                                </div>
                                                <div className="mt-1.5">
                                                    <StockBadge item={item} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6">
                                            {/* Action buttons for invalid items */}
                                            {isInvalid ? (
                                                <div className="flex items-center gap-2">
                                                    {item.stock_status === 'insufficient' && item.quantity_available > 0 && (
                                                        <button
                                                            onClick={() => handleFixQuantity(item.product_id, item.quantity_available)}
                                                            className="px-3 py-2 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200 transition-colors"
                                                        >
                                                            Set to {item.quantity_available}
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleRemoveItem(item.product_id)}
                                                        className="px-3 py-2 bg-rose-100 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-200 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Qty Controls */}
                                                    <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                                                        <button 
                                                            onClick={() => handleQuantityChange(item.product_id, item.quantity, -1, item.quantity_available)}
                                                            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100 rounded-l-lg transition-colors text-xl font-medium focus:outline-none"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-10 text-center font-bold text-slate-800">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => handleQuantityChange(item.product_id, item.quantity, 1, item.quantity_available)}
                                                            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-primary-600 hover:bg-primary-50 active:bg-primary-100 rounded-r-lg transition-colors text-xl font-medium focus:outline-none"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Item Total */}
                                                    <div className="font-bold text-lg text-slate-800 min-w-[5rem] text-right">
                                                        ₹{(item.final_price * item.quantity).toFixed(2)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        <div className="hidden lg:block mt-6">
                            <Link to="/" className="text-primary-600 font-semibold flex items-center gap-2 hover:text-primary-700 transition-colors w-fit">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Bill Summary Sidebar */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100 sticky top-24">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Bill Summary
                            </h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-slate-800">₹{originalTotal.toFixed(2)}</span>
                                </div>
                                {totalSaved > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-medium">
                                        <span>Discount Saved</span>
                                        <span>- ₹{totalSaved.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-600">
                                    <span>Delivery Fee</span>
                                    <span className="font-medium text-slate-800">₹{deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Taxes (5%)</span>
                                    <span className="font-medium text-slate-800">₹{taxAmount.toFixed(2)}</span>
                                </div>
                                
                                <div className="pt-4 border-t border-dashed border-slate-300">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg text-slate-800">To Pay</span>
                                        <span className="font-bold text-2xl text-primary-600">₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                    <p className="text-right text-xs text-slate-500 mt-1 pb-1">Includes all applicable taxes</p>
                                </div>
                            </div>
                            
                            {/* Coupon Section */}
                            <div className="mb-6 p-4 bg-primary-50 rounded-2xl border border-primary-100">
                                <label className="block text-xs font-bold text-primary-700 uppercase tracking-wider mb-2">Apply Coupon</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="SAVE20 or FIRSTBUY" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                    <button 
                                        onClick={handleApplyCoupon}
                                        className="px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {discount > 0 && <p className="text-emerald-600 text-xs mt-2 font-bold">✓ Coupon Applied!</p>}
                            </div>

                            {/* Checkout error message */}
                            {checkoutError && (
                                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {checkoutError}
                                </div>
                            )}

                            <button 
                                onClick={triggerCheckout} 
                                disabled={hasInvalidItems}
                                className={`w-full py-4 text-lg rounded-2xl font-semibold transition-all duration-300 ${
                                    hasInvalidItems 
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                        : 'btn-primary'
                                }`}
                            >
                                {hasInvalidItems ? 'Fix Items to Checkout' : 'Proceed to Checkout'}
                            </button>
                            
                            {isPaymentProcessing && (
                                <PaymentGateway 
                                    amount={grandTotal} 
                                    onPaymentSuccess={handlePaymentComplete}
                                    onCancel={() => setIsPaymentProcessing(false)}
                                />
                            )}
                            
                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                100% Safe & Secure Payments
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;