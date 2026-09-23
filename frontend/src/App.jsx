import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Receipt from './components/Receipt';
import Wishlist from './components/Wishlist';
import Admin from './components/Admin';
import Login from './components/Login';
import Profile from './components/Profile';
import PaymentSuccess from './components/PaymentSuccess';
import OrderTracking from './components/OrderTracking';
import Support from './components/Support';
import AdminLayout from './components/AdminLayout';
import AdminProfile from './components/AdminProfile';
import './App.css';

function App() {
    // Check if the user is currently logged in
    const user = JSON.parse(localStorage.getItem('quickcart_user'));
    const isAdmin = user?.role === 'admin';

    return (
        <Routes>
            {/* ========== ADMIN ROUTES ========== */}
            {/* Admin gets a completely separate layout with its own navbar */}
            <Route
                path="/admin"
                element={isAdmin ? <AdminLayout /> : <Navigate to={user ? "/" : "/login"} />}
            >
                <Route index element={<Admin />} />
                <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* ========== CUSTOMER / PUBLIC ROUTES ========== */}
            <Route
                path="/*"
                element={
                    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-primary-200 selection:text-primary-900">
                        {/* Only show the customer Navbar if a NON-admin user is logged in */}
                        {user && !isAdmin && <Navbar />}

                        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
                            <Routes>
                                {/* Home: admin goes to admin dashboard, customer goes to products, guest goes to login */}
                                <Route path="/" element={
                                    isAdmin ? <Navigate to="/admin" /> :
                                    user ? <ProductList /> : <Navigate to="/login" />
                                } />

                                {/* Login: logged-in users shouldn't see login page */}
                                <Route path="/login" element={
                                    !user ? <Login /> :
                                    isAdmin ? <Navigate to="/admin" /> : <Navigate to="/" />
                                } />

                                {/* Protected Customer Routes */}
                                <Route path="/cart" element={user && !isAdmin ? <Cart /> : <Navigate to="/login" />} />
                                <Route path="/receipt/:orderId" element={user ? <Receipt /> : <Navigate to="/login" />} />
                                <Route path="/success/:orderId" element={user ? <PaymentSuccess /> : <Navigate to="/login" />} />
                                <Route path="/wishlist" element={user && !isAdmin ? <Wishlist /> : <Navigate to="/login" />} />
                                <Route path="/profile" element={user && !isAdmin ? <Profile /> : <Navigate to="/login" />} />
                                <Route path="/track/:orderId" element={user ? <OrderTracking /> : <Navigate to="/login" />} />
                                <Route path="/support" element={user && !isAdmin ? <Support /> : <Navigate to="/login" />} />

                                {/* Catch-all: redirect to home */}
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                    </div>
                }
            />
        </Routes>
    );
}

export default App;