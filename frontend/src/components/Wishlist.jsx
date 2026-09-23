import API_BASE_URL from '../api.js';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);

    // Grab the actual logged-in user!
    const user = JSON.parse(localStorage.getItem('quickcart_user'));
    const activeUserId = user ? user.user_id : null;

    useEffect(() => {
        if (activeUserId) {
            // BULLETPROOF FETCH: We fetch the Wishlist AND the Products at the same time,
            // then match them together so we guarantee we have the names and prices!
            Promise.all([
                axios.get(`${API_BASE_URL}/api/wishlist/${activeUserId}`),
                axios.get(`${API_BASE_URL}/api/products`)
            ])
                .then(([wishlistRes, productsRes]) => {
                    const userWishlist = wishlistRes.data;
                    const allProducts = productsRes.data;

                    // Match the saved IDs to the actual product details
                    const populatedWishlist = userWishlist.map(savedItem => {
                        const productDetails = allProducts.find(p => p.product_id === savedItem.product_id);
                        return { ...savedItem, ...productDetails };
                    }).filter(item => item.product_name || item.name); // Ignore broken items

                    setWishlistItems(populatedWishlist);
                })
                .catch(error => console.error("Error fetching wishlist data:", error));
        }
    }, [activeUserId]);

    const handleRemoveFromWishlist = (productId) => {
        axios.delete(`${API_BASE_URL}/api/wishlist/remove/${activeUserId}/${productId}`)
            .then(() => {
                // Instantly remove it from the screen
                setWishlistItems(prevItems => prevItems.filter(item => item.product_id !== productId));
            })
            .catch(error => console.error("Error removing from wishlist:", error));
    };

    const handleAddToCart = (product) => {
        if (!activeUserId) return alert("Please log in first!");
        
        if (product.quantity_available <= 0) {
            alert(`Sorry! ${product.product_name} is completely out of stock right now.`);
            return;
        }

        axios.post(`${API_BASE_URL}/api/carts/add`, {
            cart_id: activeUserId, // Same as activeCartId
            product_id: product.product_id,
            quantity: 1
        })
        .then(() => alert(`${product.product_name || product.name} added to cart!`))
        .catch(error => console.error("Error adding to cart:", error));
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="mb-8 border-b-2 border-primary-100 pb-4">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="text-4xl drop-shadow-sm">💜</span> My Wishlist
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Saved items you love</p>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="text-6xl mb-6 opacity-40">🤍</div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">Your wishlist is empty</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Save your favorite groceries here so you don't forget to buy them later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {wishlistItems.map(item => (
                        <div key={item.product_id} className="product-card group flex flex-col h-full bg-white">
                            {/* Image Placeholder */}
                            <div className="w-full h-40 bg-pink-50 rounded-xl mb-4 flex items-center justify-center group-hover:bg-pink-100 transition-colors duration-300">
                                <span className="text-5xl opacity-40 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">🍉</span>
                            </div>

                            <div className="flex flex-col flex-1 justify-between">
                                <div className="mb-4">
                                    <h3 className="font-semibold text-slate-800 leading-tight mb-2">
                                        {item.product_name || item.name}
                                    </h3>
                                    <div className="text-xl font-bold text-primary-600">
                                        ₹{Number(item.price).toFixed(2)}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 mt-auto">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.quantity_available <= 0}
                                        className={`w-full py-2 px-4 text-sm font-semibold rounded-xl text-center transition-all duration-200 active:scale-95 ${
                                            item.quantity_available <= 0 
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                            : "bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 shadow-sm"
                                        }`}
                                    >
                                        {item.quantity_available <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    <button
                                        onClick={() => handleRemoveFromWishlist(item.product_id)}
                                        className="btn-danger w-full py-2 flex items-center justify-center gap-1.5 text-sm"
                                        title="Remove from wishlist"
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        <span>Remove</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Wishlist;