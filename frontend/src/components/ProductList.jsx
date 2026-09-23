import API_BASE_URL from '../api.js';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ImageWithFallback = ({ src, alt, categoryName }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(!src);

    return (
        <>
            {/* Skeleton loader */}
            {!loaded && !error && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse z-20 flex items-center justify-center">
                   <div className="w-8 h-8 border-4 border-slate-300 border-t-primary-500 rounded-full animate-spin"></div>
                </div>
            )}
            
            {/* Actual image */}
            {src && !error && (
                <img 
                    src={src} 
                    alt={alt} 
                    onLoad={() => setLoaded(true)}
                    onError={() => { setError(true); setLoaded(true); }}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 z-10 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                />
            )}
            
            {/* Fallback Emoji Background (always visible underneath and shows if error) */}
            <div className={`absolute inset-0 flex items-center justify-center bg-slate-100 transition-opacity duration-300 ${loaded && !error ? 'opacity-0' : 'opacity-100'} z-0`}>
                <span className="text-5xl opacity-50 drop-shadow-sm group-hover:scale-110 transition-transform duration-300 pointer-events-none">
                    {categoryName === 'Beverages' ? '🥤' : 
                     categoryName === 'Groceries' ? '🥦' :
                     categoryName === 'Snacks' ? '🍪' : 
                     categoryName === 'Personal Care' ? '🧴' : '📦'}
                </span>
            </div>
        </>
    );
};

function ProductList() {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [saleProducts, setSaleProducts] = useState([]);

    // Product Suggestion Feature
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    const [suggestion, setSuggestion] = useState({ product_name: '', category: 'Groceries', description: '' });
    const [suggestionMsg, setSuggestionMsg] = useState('');

    // DBMS Advanced Features
    const [trending, setTrending] = useState([]);
    const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    // Ratings State
    const [ratingScore, setRatingScore] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [ratingMsg, setRatingMsg] = useState('');

    const user = JSON.parse(localStorage.getItem('quickcart_user'));
    const activeUserId = user ? user.user_id : null;
    const activeCartId = activeUserId;

    // Sale helpers
    const isOnSale = (product) => {
        if (!product.discount_percentage || product.discount_percentage <= 0) return false;
        const now = new Date();
        if (product.sale_start && new Date(product.sale_start) > now) return false;
        if (product.sale_end && new Date(product.sale_end) < now) return false;
        return true;
    };

    const getSalePrice = (product) => {
        if (!isOnSale(product)) return null;
        return (product.price * (1 - product.discount_percentage / 100)).toFixed(2);
    };

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/products`)
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching products:", error));

        // Fetch sale products
        axios.get(`${API_BASE_URL}/api/products/on-sale`)
            .then(response => setSaleProducts(response.data))
            .catch(error => console.error("Error fetching sale products:", error));

        if (activeCartId) fetchCartData();
        if (activeUserId) fetchWishlistData();

        axios.get(`${API_BASE_URL}/api/products/trending`)
            .then(response => setTrending(response.data))
            .catch(error => console.error("Error fetching trending:", error));

        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewedIds(viewed);
    }, [activeUserId, activeCartId]);

    const fetchCartData = () => {
        axios.get(`${API_BASE_URL}/api/carts/${activeCartId}`)
            .then(response => setCartItems(response.data))
            .catch(error => console.error("Error fetching cart items:", error));
    };

    const fetchWishlistData = () => {
        axios.get(`${API_BASE_URL}/api/wishlist/${activeUserId}`)
            .then(response => {
                const items = Array.isArray(response.data) ? response.data : [];
                setWishlistItems(items.map(item => item.product_id));
            })
            .catch(error => console.error("Error fetching wishlist:", error));
    };

    const handleAddToCart = (product) => {
        if (!activeUserId) return alert("Please log in first!");
        if (product.quantity_available <= 0) {
            alert(`Sorry! ${product.product_name} is completely out of stock right now.`);
            return;
        }
        axios.post(`${API_BASE_URL}/api/carts/add`, {
            cart_id: activeCartId,
            product_id: product.product_id,
            quantity: 1
        }).then(() => fetchCartData())
          .catch(error => console.error("Error adding to cart:", error));
    };

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
            }).then(() => fetchCartData());
        }
    };

    const getProductCartQuantity = (productId) => {
        const item = cartItems.find(cartItem => cartItem.product_id === productId);
        return item ? item.quantity : 0;
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setRatingScore(0);
        setReviewText('');
        setRatingMsg('');
        let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        viewed = [product.product_id, ...viewed.filter(id => id !== product.product_id)].slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
        setRecentlyViewedIds(viewed);

        axios.get(`${API_BASE_URL}/api/products/${product.product_id}/recommendations`)
            .then(res => setRecommendations(res.data))
            .catch(error => console.error("Error fetching recommendations:", error));
    };

    const handleSubmitRating = async (e) => {
        e.preventDefault();
        if (!activeUserId) return alert("Log in to submit a rating!");
        if (ratingScore === 0) return alert("Please select a star rating!");
        try {
            await axios.post(`${API_BASE_URL}/api/ratings`, {
                user_id: activeUserId,
                product_id: selectedProduct.product_id,
                rating: ratingScore,
                review_text: reviewText
            });
            setRatingMsg("Rating submitted successfully!");
            axios.get(`${API_BASE_URL}/api/products`).then(res => setProducts(res.data));
            setTimeout(() => setRatingMsg(''), 3000);
        } catch (error) {
            console.error("Failed to submit rating", error);
            setRatingMsg("Failed to submit rating.");
        }
    };

    const handleToggleWishlist = (productId) => {
        if (!activeUserId) return alert("Please log in first!");
        const isSaved = wishlistItems.includes(productId);
        if (isSaved) {
            axios.delete(`${API_BASE_URL}/api/wishlist/remove/${activeUserId}/${productId}`)
                .then(() => fetchWishlistData())
                .catch(error => console.error("Failed to remove from wishlist:", error.response?.data || error));
        } else {
            axios.post(`${API_BASE_URL}/api/wishlist/add`, {
                user_id: activeUserId,
                userId: activeUserId,
                product_id: productId,
                productId: productId
            })
                .then(() => fetchWishlistData())
                .catch(error => {
                    console.error("Failed to add to wishlist:", error.response?.data || error.message);
                    alert("Database rejected the wishlist save! Check the console.");
                });
        }
    };

    const uniqueCategories = ["All", ...new Set(products.map(p => p.category_name).filter(Boolean))];

    // Product Card rendering directly (to preserve state if we extract later or just to avoid redefining)
    const ProductCard = ({ product, showSaleBadge = true }) => {
        const quantityInCart = getProductCartQuantity(product.product_id);
        const isWishlisted = wishlistItems.includes(product.product_id);
        const onSale = isOnSale(product);
        const salePrice = getSalePrice(product);

        return (
            <div key={product.product_id} className="product-card flex flex-col h-full bg-white group hover:border-primary-200 transition-all duration-300">
                {/* Product Image */}
                <div 
                    className="w-full h-48 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden cursor-pointer shadow-[inset_0_0_20px_rgba(0,0,0,0.03)]"
                    onClick={() => handleProductClick(product)}
                >
                    <ImageWithFallback src={product.image_url} alt={product.product_name} categoryName={product.category_name} />

                    {/* Sale Badge */}
                    {showSaleBadge && onSale && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-lg z-30 flex items-center gap-1">
                            🔥 {product.discount_percentage}% OFF
                        </span>
                    )}

                    {!onSale && product.quantity_available <= 5 && product.quantity_available > 0 && (
                        <span className="absolute top-3 left-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm z-30">
                            Only {product.quantity_available} left
                        </span>
                    )}
                    {product.quantity_available <= 0 && (
                        <span className="absolute top-3 left-3 bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm z-30">
                            Out of stock
                        </span>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800 leading-tight">
                                {product.product_name}
                            </h3>
                            <button 
                                onClick={() => handleToggleWishlist(product.product_id)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors focus:outline-none shrink-0 ${isWishlisted ? 'text-primary-600' : 'text-slate-400 hover:text-primary-500'}`}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <svg className={`w-6 h-6 transition-transform ${isWishlisted ? 'fill-current scale-110' : 'stroke-current'}`} viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{product.unit_quantity || '1 unit'}</p>

                        <div className="flex items-center gap-1.5 mb-3">
                            <span className="text-amber-400 text-sm">{"★".repeat(Math.round(product.avg_rating || 0)) + "☆".repeat(5 - Math.round(product.avg_rating || 0))}</span>
                            <span className="text-xs font-bold text-slate-700">{Number(product.avg_rating || 0).toFixed(1)}</span>
                            <span className="text-xs text-slate-400">({product.total_ratings || 0} reviews)</span>
                        </div>

                        {/* Price with sale display */}
                        <div className="mb-4">
                            {onSale ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-rose-600">₹{salePrice}</span>
                                    <span className="text-sm text-slate-400 line-through">₹{Number(product.price).toFixed(2)}</span>
                                </div>
                            ) : (
                                <div className="text-xl font-bold text-primary-600">
                                    ₹{Number(product.price).toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CART BUTTONS */}
                    <div className="mt-auto">
                        {quantityInCart === 0 ? (
                            <button
                                onClick={() => handleAddToCart(product)} 
                                disabled={product.quantity_available <= 0}
                                className={`w-full py-2.5 px-4 font-semibold rounded-xl text-center transition-all duration-200 active:scale-95 ${
                                    product.quantity_available <= 0 
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                    : "bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 shadow-sm"
                                }`}
                            >
                                {product.quantity_available <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        ) : (
                            <div className="flex justify-between items-center bg-primary-600 text-white rounded-xl shadow-md shadow-primary-500/20 px-1 py-1">
                                <button 
                                    onClick={() => handleQuantityChange(product.product_id, quantityInCart, -1, product.quantity_available)} 
                                    className="w-10 h-9 flex items-center justify-center text-xl font-medium rounded-lg hover:bg-white/20 active:bg-white/30 transition-colors"
                                >
                                    −
                                </button>
                                <span className="font-bold text-lg w-8 text-center">{quantityInCart}</span>
                                <button 
                                    onClick={() => handleQuantityChange(product.product_id, quantityInCart, 1, product.quantity_available)} 
                                    className="w-10 h-9 flex items-center justify-center text-xl font-medium rounded-lg hover:bg-white/20 active:bg-white/30 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="mb-8 md:mb-12 text-center">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight flex flex-col sm:flex-row items-center justify-center gap-3">
                    Superfast <span className="text-primary-600 bg-primary-50 px-4 py-1.5 rounded-2xl shadow-sm border border-primary-100">Delivery in 8 minutes</span>
                </h2>
                <p className="mt-4 text-slate-500 max-w-2xl mx-auto font-medium text-lg">
                    Handpicked daily from local farms straight to your kitchen.
                </p>
                <div className="mt-8 max-w-xl mx-auto relative">
                    <input 
                        type="text" 
                        placeholder="Search for fresh groceries..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-3.5 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-700 placeholder-slate-400 font-medium" 
                    />
                    <svg className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                
                {/* Category Filters */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 px-2">
                    {uniqueCategories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                                selectedCategory === category 
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 ring-2 ring-primary-600 ring-offset-2' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* ===== ON SALE SECTION ===== */}
            {saleProducts.length > 0 && selectedCategory === 'All' && !searchQuery && (
                <div className="mb-10">
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl p-6 md:p-8 border border-rose-100">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="text-3xl">🔥</span> On Sale — Limited Time Deals
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">Best discounts on your favorites. Grab them before they're gone!</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {saleProducts.slice(0, 5).map(product => (
                                <ProductCard key={`sale-${product.product_id}`} product={product} showSaleBadge={true} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                {trending.length > 0 && selectedCategory === 'All' && !searchQuery && (
                    <div className="col-span-full mb-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-3xl">🔥</span> Trending Now
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {trending.map(product => (
                                <div key={product.product_id} 
                                    className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="w-full h-32 bg-slate-50 rounded-xl mb-3 overflow-hidden flex items-center justify-center relative">
                                        <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10">HOT</span>
                                        {product.image_url ? <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <span className="text-4xl">📦</span>}
                                    </div>
                                    <h4 className="font-semibold text-slate-800 text-sm truncate">{product.product_name}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{product.unit_quantity || '1 unit'}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-amber-400 text-xs">{"★".repeat(Math.round(product.avg_rating || 0)) + "☆".repeat(5 - Math.round(product.avg_rating || 0))}</span>
                                        <span className="text-[10px] text-slate-400">({product.total_ratings || 0})</span>
                                    </div>
                                    {isOnSale(product) ? (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="font-bold text-rose-600">₹{getSalePrice(product)}</span>
                                            <span className="text-xs text-slate-400 line-through">₹{Number(product.price).toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <p className="font-bold text-primary-600 mt-1">₹{Number(product.price).toFixed(2)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {recentlyViewedIds.length > 0 && selectedCategory === 'All' && !searchQuery && (
                    <div className="col-span-full mb-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-3xl">👁️</span> Recently Viewed
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {recentlyViewedIds.map(id => {
                                const p = products.find(prod => prod.product_id === id);
                                if (!p) return null;
                                return (
                                    <div key={p.product_id} 
                                        className="bg-white border text-center border-slate-100 rounded-2xl p-3 shadow-sm cursor-pointer hover:border-primary-200 transition-all opacity-80 hover:opacity-100"
                                        onClick={() => handleProductClick(p)}
                                    >
                                        <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full mb-2 overflow-hidden flex items-center justify-center">
                                            {p.image_url ? <img src={p.image_url} alt={p.product_name} className="w-full h-full object-cover" /> : <span>📦</span>}
                                        </div>
                                        <h4 className="font-medium text-slate-700 text-xs truncate">{p.product_name}</h4>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {products
                    .filter(p => selectedCategory === 'All' || p.category_name === selectedCategory)
                    .filter(p => (p.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(product => (
                        <ProductCard key={product.product_id} product={product} />
                    ))}
            </div>

            {/* Product Suggestion Button */}
            <div className="mt-12 text-center">
                <div className="inline-flex flex-col items-center gap-3 bg-white rounded-3xl p-8 shadow-sm border border-slate-100 max-w-md mx-auto">
                    <span className="text-3xl">💡</span>
                    <h4 className="text-lg font-bold text-slate-800">Can't find what you need?</h4>
                    <p className="text-slate-500 text-sm">Suggest a product and we'll consider adding it to our catalog!</p>
                    <button 
                        onClick={() => { setShowSuggestionModal(true); setSuggestionMsg(''); }}
                        className="btn-outline mt-2 w-auto px-6 py-2.5 text-sm"
                    >
                        Suggest a Product
                    </button>
                </div>
            </div>

            {/* Suggestion Modal */}
            {showSuggestionModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSuggestionModal(false)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowSuggestionModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                            ✕
                        </button>
                        
                        <div className="text-center mb-6">
                            <span className="text-4xl">💡</span>
                            <h3 className="text-xl font-bold text-slate-800 mt-2">Suggest a Product</h3>
                            <p className="text-slate-500 text-sm mt-1">We'll review your suggestion and add it if there's enough demand!</p>
                        </div>

                        {suggestionMsg && (
                            <div className={`mb-4 p-3 rounded-xl text-sm font-semibold text-center ${suggestionMsg.includes('Thank') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {suggestionMsg}
                            </div>
                        )}

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const res = await axios.post(`${API_BASE_URL}/api/suggestions`, {
                                    user_id: user?.user_id,
                                    ...suggestion
                                });
                                setSuggestionMsg(res.data.message);
                                setSuggestion({ product_name: '', category: 'Groceries', description: '' });
                                setTimeout(() => setShowSuggestionModal(false), 2000);
                            } catch (err) {
                                setSuggestionMsg(err.response?.data?.message || 'Failed to submit suggestion');
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Product Name *</label>
                                <input type="text" required value={suggestion.product_name} onChange={e => setSuggestion({...suggestion, product_name: e.target.value})} className="input-field" placeholder="e.g., Almond Milk" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Category</label>
                                <select value={suggestion.category} onChange={e => setSuggestion({...suggestion, category: e.target.value})} className="input-field cursor-pointer">
                                    <option value="Groceries">Groceries</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Personal Care">Personal Care</option>
                                    <option value="Fresh Produce">Fresh Produce</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Why do you want this?</label>
                                <textarea value={suggestion.description} onChange={e => setSuggestion({...suggestion, description: e.target.value})} className="input-field min-h-[80px] resize-y" placeholder="Optional: tell us why you'd like this product" />
                            </div>
                            <button type="submit" className="btn-primary w-full mt-2">
                                Submit Suggestion
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Details & Recommendations Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors z-10">✕</button>
                        
                        <div className="flex flex-col md:flex-row gap-6 mb-8">
                            <div className="w-full md:w-1/2 h-64 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                {selectedProduct.image_url ? (
                                    <img src={selectedProduct.image_url} alt={selectedProduct.product_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-6xl">📦</span>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col justify-center">
                                <span className="text-sm font-bold text-primary-600 mb-1">{selectedProduct.category_name}</span>
                                <h3 className="text-2xl font-black text-slate-800 mb-1">{selectedProduct.product_name}</h3>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">{selectedProduct.unit_quantity || '1 unit'}</p>
                                
                                <div className="flex items-center gap-1.5 mb-4">
                                    <span className="text-amber-400 text-lg tracking-widest">{"★".repeat(Math.round(selectedProduct.avg_rating || 0)) + "☆".repeat(5 - Math.round(selectedProduct.avg_rating || 0))}</span>
                                    <span className="text-sm font-bold text-slate-700 ml-1">{Number(selectedProduct.avg_rating || 0).toFixed(1)}</span>
                                    <span className="text-sm text-slate-400">({selectedProduct.total_ratings || 0} reviews)</span>
                                </div>

                                {/* Price with sale in modal */}
                                {isOnSale(selectedProduct) ? (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl font-bold text-rose-600">₹{getSalePrice(selectedProduct)}</span>
                                            <span className="text-lg text-slate-400 line-through">₹{Number(selectedProduct.price).toFixed(2)}</span>
                                        </div>
                                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md">
                                            🔥 {selectedProduct.discount_percentage}% OFF
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-3xl font-bold text-slate-700 mb-4">₹{Number(selectedProduct.price).toFixed(2)}</p>
                                )}
                                
                                <div className="mt-auto">
                                    <button 
                                        onClick={() => handleAddToCart(selectedProduct)}
                                        disabled={selectedProduct.quantity_available <= 0}
                                        className="btn-primary w-full py-3 mb-4"
                                    >
                                        {selectedProduct.quantity_available <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Rating Section */}
                        {activeUserId && (
                            <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="text-xl">✍️</span> Rate & Review
                                </h4>
                                {ratingMsg && (
                                    <div className="mb-4 p-2 text-sm text-center bg-emerald-50 text-emerald-600 font-bold rounded-lg border border-emerald-100">
                                        {ratingMsg}
                                    </div>
                                )}
                                <form onSubmit={handleSubmitRating} className="space-y-4 max-w-lg">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-bold text-slate-700">Your Rating:</label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button 
                                                    key={star} 
                                                    type="button" 
                                                    onClick={() => setRatingScore(star)}
                                                    className={`text-2xl transition-transform hover:scale-110 ${star <= ratingScore ? 'text-amber-400' : 'text-slate-300'}`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <textarea 
                                            value={reviewText} 
                                            onChange={e => setReviewText(e.target.value)} 
                                            placeholder="Write your review here (optional)..." 
                                            className="input-field min-h-[80px] bg-white resize-y"
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary px-6 py-2">Submit Rating</button>
                                </form>
                            </div>
                        )}

                        {recommendations.length > 0 && (
                            <div>
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="text-xl">🤝</span> Customers also bought
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {recommendations.map(rec => (
                                        <div key={rec.product_id} 
                                            className="bg-slate-50 border border-slate-100 rounded-xl p-3 cursor-pointer hover:border-primary-300 transition-colors"
                                            onClick={() => handleProductClick(rec)}
                                        >
                                            <div className="w-full h-24 bg-white rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                                                {rec.image_url ? <img src={rec.image_url} alt={rec.product_name} className="w-full h-full object-cover" /> : <span>📦</span>}
                                            </div>
                                            <p className="font-semibold text-slate-700 text-sm truncate">{rec.product_name}</p>
                                            {isOnSale(rec) ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-rose-600">₹{getSalePrice(rec)}</span>
                                                    <span className="text-xs text-slate-400 line-through">₹{Number(rec.price).toFixed(2)}</span>
                                                </div>
                                            ) : (
                                                <p className="font-bold text-primary-600">₹{Number(rec.price).toFixed(2)}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductList;