import { NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
    const user = JSON.parse(localStorage.getItem('quickcart_user'));
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('quickcart_theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('quickcart_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('quickcart_theme', 'light');
        }
    }, [darkMode]);

    const getNavClass = ({ isActive }) => {
        const base = "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ";
        return isActive 
            ? base + "bg-primary-800 text-white shadow-inner"
            : base + "text-primary-50 hover:bg-primary-700 hover:text-white";
    };

    const getCartClass = ({ isActive }) => {
        const base = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border-2 ";
        return isActive 
            ? base + "bg-white text-primary-700 border-white shadow-md shadow-primary-900/20"
            : base + "border-primary-300 text-white hover:bg-primary-500 hover:border-white shadow-sm";
    };

    return (
        <header className="sticky top-0 z-50 bg-primary-600 border-b border-primary-700 shadow-md shadow-primary-900/5 text-white py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center transition-all duration-300">
            <h1 className="m-0 shrink-0 flex items-center gap-2">
                <Link to="/" className="text-white decoration-none flex items-center gap-2 hover:scale-105 transition-transform duration-200">
                    <span className="text-2xl drop-shadow-sm">🛒</span> 
                    <span className="hidden sm:inline text-xl font-bold tracking-tight drop-shadow-sm">QuickCart</span>
                </Link>
            </h1>

            <nav className="flex items-center gap-1 sm:gap-2">
                {/* Dark Mode Toggle */}
                <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2.5 rounded-xl bg-primary-700/50 hover:bg-primary-700 text-primary-50 transition-colors mr-1 sm:mr-2"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {darkMode ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l-.707-.707M7.757 7.757l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>

                <div className="w-px h-6 bg-primary-500/50 mx-1 hidden sm:block mr-2"></div>

                <NavLink to="/" className={getNavClass}>
                    <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="hidden lg:inline">Home</span>
                </NavLink>
                
                <NavLink to="/wishlist" className={getNavClass}>
                    <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <span className="hidden lg:inline">Wishlist</span>
                </NavLink>
                
                <NavLink to="/profile" className={getNavClass}>
                    <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="hidden lg:inline">Profile</span>
                </NavLink>

                <NavLink to="/support" className={getNavClass}>
                    <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 12.021l-3.536-3.536M12 8a4 4 0 110 8 4 4 0 010-8z" /></svg>
                    <span className="hidden lg:inline">Support</span>
                </NavLink>

                <div className="w-px h-6 bg-primary-500/50 mx-1 lg:mx-2 hidden sm:block"></div>

                <NavLink to="/cart" className={getCartClass}>
                    <svg className="w-5 h-5 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    <span className="hidden sm:inline">Cart</span>
                </NavLink>
            </nav>
        </header>
    );
}

export default Navbar;