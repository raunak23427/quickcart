import { NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminSearch from './AdminSearch';

function AdminNavbar() {
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
            ? base + "bg-white/15 text-white shadow-inner"
            : base + "text-slate-300 hover:bg-white/10 hover:text-white";
    };

    const handleLogout = () => {
        localStorage.removeItem('quickcart_user');
        window.location.href = '/';
    };

    return (
        <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700/50 shadow-lg shadow-slate-950/20 text-white py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center transition-all duration-300">
            <h1 className="m-0 shrink-0 flex items-center gap-3">
                <Link to="/admin" className="text-white decoration-none flex items-center gap-2.5 hover:scale-105 transition-transform duration-200">
                    <span className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-lg shadow-md shadow-indigo-500/30">⚙️</span>
                    <div className="hidden sm:flex flex-col">
                        <span className="text-lg font-bold tracking-tight leading-tight">QuickCart</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 leading-tight">Admin Panel</span>
                    </div>
                </Link>
            </h1>

            {/* Universal Search Bar */}
            <AdminSearch />

            <nav className="flex items-center gap-1 sm:gap-2">
                {/* Dark Mode Toggle */}
                <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors mr-1 sm:mr-2"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {darkMode ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l-.707-.707M7.757 7.757l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>

                <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>

                <NavLink to="/admin" end className={getNavClass}>
                    <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    <span className="hidden lg:inline">Dashboard</span>
                </NavLink>

                <NavLink to="/admin/profile" className={getNavClass}>
                    <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="hidden lg:inline">Profile</span>
                </NavLink>

                <div className="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>

                {/* Admin user badge */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mr-2">
                    <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-tight">{user?.name}</span>
                        <span className="text-[10px] text-indigo-400 font-semibold leading-tight uppercase tracking-wider">Administrator</span>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-all duration-200"
                    title="Sign Out"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    <span className="hidden lg:inline">Sign Out</span>
                </button>
            </nav>
        </header>
    );
}

export default AdminNavbar;
