import API_BASE_URL from '../api.js';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Highlight matched text in search results
function HighlightMatch({ text, query }) {
    if (!query || !text) return <span>{text}</span>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = String(text).split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-amber-200/70 text-amber-900 rounded-sm px-0.5 font-bold">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
}

// Category icon mapping
const SECTION_CONFIG = {
    products:   { icon: '📦', label: 'Products',   color: 'emerald' },
    users:      { icon: '👤', label: 'Users',      color: 'indigo' },
    orders:     { icon: '💰', label: 'Orders',     color: 'blue' },
    categories: { icon: '🏷️', label: 'Categories', color: 'violet' },
    inventory:  { icon: '⚠️', label: 'Low Stock',  color: 'rose' },
    support:    { icon: '🎧', label: 'Support',    color: 'amber' },
};

function AdminSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    // Flatten results into a navigable list for keyboard nav
    const flatItems = useCallback(() => {
        if (!results) return [];
        const items = [];
        for (const [section, config] of Object.entries(SECTION_CONFIG)) {
            const sectionResults = results[section] || [];
            sectionResults.forEach(item => items.push({ section, item }));
        }
        return items;
    }, [results]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setResults(null);
            setIsOpen(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/admin/search?q=${encodeURIComponent(query.trim())}`);
                setResults(res.data);
                setIsOpen(true);
                setActiveIndex(-1);
            } catch (err) {
                console.error('Search error:', err);
                setResults(null);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard shortcut (Ctrl+K / Cmd+K)
    useEffect(() => {
        const handleShortcut = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleShortcut);
        return () => document.removeEventListener('keydown', handleShortcut);
    }, []);

    // Navigate to the relevant dashboard section
    const handleResultClick = (section, item) => {
        setIsOpen(false);
        setQuery('');
        // All admin sections are on /admin dashboard — scroll to the section
        // For simplicity, navigate to /admin and the user sees the dashboard
        navigate('/admin');
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        const items = flatItems();
        if (!isOpen || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % items.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            const { section, item } = items[activeIndex];
            handleResultClick(section, item);
        }
    };

    // Check if we have any results at all
    const hasResults = results && Object.values(results).some(arr => arr.length > 0);
    const totalCount = results ? Object.values(results).reduce((sum, arr) => sum + arr.length, 0) : 0;

    // Render a single result item
    const renderItem = (section, item, globalIdx) => {
        const isActive = globalIdx === activeIndex;

        switch (section) {
            case 'products':
                return (
                    <button
                        key={`p-${item.product_id}`}
                        onClick={() => handleResultClick(section, item)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-100 ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                        <span className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-sm flex-shrink-0">📦</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">
                                <HighlightMatch text={item.product_name} query={query} />
                            </p>
                            <p className="text-xs text-slate-500">
                                <HighlightMatch text={item.category_name || 'Uncategorized'} query={query} />
                                <span className="mx-1">·</span>
                                ₹{Number(item.price).toFixed(2)}
                                <span className="mx-1">·</span>
                                Stock: {item.quantity_available ?? 'N/A'}
                            </p>
                        </div>
                        {item.discount_percentage > 0 && (
                            <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full flex-shrink-0">
                                {item.discount_percentage}% OFF
                            </span>
                        )}
                    </button>
                );
            case 'users':
                return (
                    <button
                        key={`u-${item.user_id}`}
                        onClick={() => handleResultClick(section, item)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-100 ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                        <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0">
                            {item.name?.charAt(0)?.toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">
                                <HighlightMatch text={item.name} query={query} />
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                <HighlightMatch text={item.email} query={query} />
                                {item.phone && <><span className="mx-1">·</span><HighlightMatch text={item.phone} query={query} /></>}
                            </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${item.role === 'admin' ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {item.role}
                        </span>
                    </button>
                );
            case 'orders':
                return (
                    <button
                        key={`o-${item.order_id}`}
                        onClick={() => handleResultClick(section, item)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-100 ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                        <span className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-sm flex-shrink-0">💰</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800">
                                Order <HighlightMatch text={`#${item.order_id}`} query={query} />
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                <HighlightMatch text={item.customer_name} query={query} />
                                <span className="mx-1">·</span>
                                {new Date(item.order_date).toLocaleDateString()}
                            </p>
                        </div>
                        <span className="font-black text-emerald-600 text-sm flex-shrink-0">
                            ₹{Number(item.total_amount).toFixed(0)}
                        </span>
                    </button>
                );
            case 'categories':
                return (
                    <button
                        key={`c-${item.category_id}`}
                        onClick={() => handleResultClick(section, item)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-100 ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                        <span className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center text-sm flex-shrink-0">🏷️</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800">
                                <HighlightMatch text={item.category_name} query={query} />
                            </p>
                            <p className="text-xs text-slate-500">{item.product_count} products</p>
                        </div>
                    </button>
                );
            case 'inventory':
                return (
                    <button
                        key={`i-${item.product_id}`}
                        onClick={() => handleResultClick(section, item)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-100 ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                        <span className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center text-sm flex-shrink-0">⚠️</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">
                                <HighlightMatch text={item.product_name} query={query} />
                            </p>
                            <p className="text-xs text-slate-500">
                                <span className="text-rose-500 font-bold">{item.quantity_available}</span> left
                                <span className="mx-1">·</span>
                                Threshold: {item.low_stock_threshold}
                            </p>
                        </div>
                        <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full flex-shrink-0 animate-pulse">
                            LOW
                        </span>
                    </button>
                );
            case 'support':
                return (
                    <button
                        key={`s-${item.ticket_id}`}
                        onClick={() => handleResultClick(section, item)}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-100 ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                        <span className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-sm flex-shrink-0">🎧</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">
                                <HighlightMatch text={item.subject} query={query} />
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                <HighlightMatch text={item.user_name} query={query} />
                                <span className="mx-1">·</span>
                                {item.category}
                            </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                            item.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' :
                            item.status === 'in_progress' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                            {item.status?.replace('_', ' ')}
                        </span>
                    </button>
                );
            default:
                return null;
        }
    };

    // Build global index counter for keyboard navigation
    let globalIdx = 0;

    return (
        <div className="relative flex-1 max-w-md mx-4">
            {/* Search Input */}
            <div className="relative group">
                <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => query.trim() && results && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products, users, orders..."
                    className="w-full pl-10 pr-20 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 focus:bg-slate-800 transition-all duration-200"
                    id="admin-search-input"
                />
                {/* Keyboard shortcut badge */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isLoading && (
                        <svg className="animate-spin w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    )}
                    {!query && (
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-700/60 border border-slate-600/40 rounded-md px-1.5 py-0.5">
                            <span className="text-[9px]">⌘</span>K
                        </kbd>
                    )}
                    {query && !isLoading && (
                        <button
                            onClick={() => { setQuery(''); setResults(null); setIsOpen(false); }}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200/80 overflow-hidden z-[100] max-h-[70vh] overflow-y-auto"
                    style={{ animation: 'searchDropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                    {/* Results header */}
                    {hasResults && (
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                {totalCount} result{totalCount !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                                ↑↓ navigate · ↵ select · esc close
                            </span>
                        </div>
                    )}

                    {/* Grouped results */}
                    {hasResults ? (
                        (() => {
                            globalIdx = 0;
                            return Object.entries(SECTION_CONFIG).map(([section, config]) => {
                                const items = results[section] || [];
                                if (items.length === 0) return null;

                                const sectionStart = globalIdx;
                                const rendered = items.map((item, i) => {
                                    const idx = sectionStart + i;
                                    globalIdx++;
                                    return renderItem(section, item, idx);
                                });

                                return (
                                    <div key={section}>
                                        <div className="px-4 py-2 bg-slate-50/80 border-b border-t border-slate-100/80 flex items-center gap-2">
                                            <span className="text-sm">{config.icon}</span>
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{config.label}</span>
                                            <span className="text-[10px] bg-slate-200/80 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">{items.length}</span>
                                        </div>
                                        <div className="divide-y divide-slate-100/60">{rendered}</div>
                                    </div>
                                );
                            });
                        })()
                    ) : (
                        /* No results state */
                        <div className="px-6 py-10 text-center">
                            <div className="text-4xl grayscale opacity-30 mb-3">🔍</div>
                            <p className="text-sm font-bold text-slate-400">No results for "<span className="text-slate-600">{query}</span>"</p>
                            <p className="text-xs text-slate-400 mt-1">Try searching for products, users, or order IDs</p>
                        </div>
                    )}
                </div>
            )}

            {/* CSS animation */}
            <style>{`
                @keyframes searchDropdownIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}

export default AdminSearch;
