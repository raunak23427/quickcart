import API_BASE_URL from '../api.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Floating Input Component
const FloatingInput = ({ type, id, name, value, onChange, label, icon, placeholder, error, rightElement }) => (
    <div className="relative w-full mb-1 group">
        <input 
            type={type} 
            id={id} 
            name={name} 
            className={`block px-5 pb-3 pt-7 w-full text-sm text-slate-800 bg-slate-50/50 rounded-2xl border-2 appearance-none focus:outline-none focus:ring-0 focus:bg-white transition-all duration-300 shadow-sm ${
                error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-100 hover:border-slate-200 focus:border-primary-500'
            }`}
            placeholder=" "
            value={value} 
            onChange={onChange} 
        />
        <label 
            htmlFor={id} 
            className={`absolute text-[13px] duration-300 transform -translate-y-2.5 scale-[0.85] top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-[0.85] peer-focus:-translate-y-2.5 flex items-center gap-1.5 pointer-events-none transition-colors ${
                error ? 'text-rose-500' : 'text-slate-500 group-focus-within:text-primary-600 font-medium'
            }`}
        >
            {icon}
            {label}
        </label>
        {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {rightElement}
            </div>
        )}
        {error && (
            <p className="text-rose-500 text-xs mt-1.5 ml-2 font-semibold flex items-center gap-1 animate-[fadeIn_0.3s_ease-out]">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
            </p>
        )}
        
        <style>{`
            input:focus ~ label,
            input:not(:placeholder-shown) ~ label {
                transform: translateY(-9px) scale(0.85);
                font-weight: 700;
            }
        `}</style>
    </div>
);

const icons = {
    email: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    user: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    phone: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    lock: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    eye: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
    eyeOff: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
};

function Login() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) return { level: 1, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500' };
        if (score <= 3) return { level: 2, label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500' };
        return { level: 3, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
    };

    const validateForm = () => {
        const errors = {};
        if (!isLoginMode) {
            if (!formData.name.trim()) errors.name = 'Name is required';
            if (!formData.phone.trim()) {
                errors.phone = 'Phone is required';
            } else if (!/^\d{10}$/.test(formData.phone.trim())) {
                errors.phone = 'Valid 10-digit phone required';
            }
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Valid email is required';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (!isLoginMode && formData.password.length < 6) {
            errors.password = 'Password must be 6+ chars';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        try {
            if (isLoginMode) {
                const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                    email: formData.email.trim(),
                    password: formData.password
                });
                localStorage.setItem('quickcart_user', JSON.stringify(response.data.user));
                if (response.data.user.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }
            } else {
                await axios.post(`${API_BASE_URL}/api/auth/register`, {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    password: formData.password,
                    role: 'customer'
                });
                setSuccess('Registration successful! Please log in.');
                setTimeout(() => {
                    setIsLoginMode(true);
                    setSuccess('');
                }, 2000);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Something went wrong.';
            if (errorMsg.toLowerCase().includes('phone')) {
                setFieldErrors({ ...fieldErrors, phone: errorMsg });
            } else if (errorMsg.toLowerCase().includes('email')) {
                setFieldErrors({ ...fieldErrors, email: errorMsg });
            } else {
                setError(errorMsg);
            }
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!formData.email.trim()) {
            setFieldErrors({ email: 'Email is required' });
            return;
        }
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
                email: formData.email.trim()
            });
            setResetToken(res.data.resetToken);
            setSuccess('Reset token generated! Enter your new password below.');
            setIsResetMode(true);
            setIsForgotMode(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                token: resetToken,
                newPassword
            });
            setSuccess(res.data.message);
            setTimeout(() => {
                setIsResetMode(false);
                setIsLoginMode(true);
                setSuccess('');
                setResetToken('');
                setNewPassword('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        }
    };

    const passwordStrength = getPasswordStrength(formData.password);


    return (
        <div className="flex-1 flex items-center justify-center min-h-[80vh] relative overflow-hidden py-10 px-4">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-primary-100/30 -z-10"></div>
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl -z-10 animate-[pulse_10s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-0 -left-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -z-10 animate-[pulse_10s_ease-in-out_infinite_1s]"></div>

            <div 
                className="w-full max-w-md p-8 sm:p-10 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] border border-white relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.25)]"
                style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                {/* Top decorative gradient bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-primary-500 to-teal-500"></div>
                
                <div className="text-center mb-8 relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 shadow-sm border border-white">
                        <span className="text-4xl translate-y-0.5">
                            {isResetMode ? '🔐' : isForgotMode ? '📨' : isLoginMode ? '👋' : '✨'}
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                        {isResetMode ? 'Reset Password' : isForgotMode ? 'Forgot Password' : isLoginMode ? 'Welcome Back!' : 'Create Account'}
                    </h2>
                    <p className="text-slate-500 font-medium">
                        {isResetMode ? 'Enter your new secure password.' :
                         isForgotMode ? 'We will send you a reset link.' :
                         isLoginMode ? 'Sign in to access fresh deliveries.' : 'Join QuickCart for fast groceries.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm text-center border border-rose-100 flex items-center justify-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm text-center border border-emerald-100 flex items-center justify-center gap-2 animate-[fadeIn_0.3s_ease-out]">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{success}</span>
                    </div>
                )}

                <div className="w-full relative min-h-[100px] transition-all duration-500">
                    {/* Reset Password Form */}
                    {isResetMode ? (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-5 animate-[fadeIn_0.4s_ease-out]">
                            <FloatingInput 
                                type={showPassword ? 'text' : 'password'} 
                                id="newPassword" 
                                name="newPassword" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                label="New Password" 
                                icon={icons.lock} 
                                rightElement={
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
                                        {showPassword ? icons.eyeOff : icons.eye}
                                    </button>
                                }
                            />
                            <button type="submit" className="btn-primary mt-2 text-lg shadow-lg shadow-primary-500/30 py-4">Reset Password</button>
                            <button type="button" onClick={() => { setIsResetMode(false); setIsLoginMode(true); }} className="text-sm text-primary-600 font-bold hover:text-primary-800 transition-colors">
                                ← Back to Login
                            </button>
                        </form>
                    ) : isForgotMode ? (
                        /* Forgot Password Form */
                        <form onSubmit={handleForgotPassword} className="flex flex-col gap-5 animate-[fadeIn_0.4s_ease-out]">
                            <FloatingInput 
                                type="email" id="forgot-email" name="email" value={formData.email} onChange={handleChange} 
                                label="Email Address" icon={icons.email} error={fieldErrors.email} 
                            />
                            <button type="submit" className="btn-primary mt-2 text-lg shadow-lg shadow-primary-500/30 py-4">Send Reset Token</button>
                            <button type="button" onClick={() => { setIsForgotMode(false); setIsLoginMode(true); setError(''); }} className="text-sm text-primary-600 font-bold hover:text-primary-800 transition-colors">
                                ← Back to Login
                            </button>
                        </form>
                    ) : (
                        /* Login / Register Form */
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-[fadeIn_0.4s_ease-out]">
                            {!isLoginMode && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FloatingInput 
                                        type="text" id="name" name="name" value={formData.name} onChange={handleChange} 
                                        label="Full Name" icon={icons.user} error={fieldErrors.name} 
                                    />
                                    <FloatingInput 
                                        type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} 
                                        label="Phone Number" icon={icons.phone} error={fieldErrors.phone} 
                                    />
                                </div>
                            )}

                            <FloatingInput 
                                type="email" id="email" name="email" value={formData.email} onChange={handleChange} 
                                label="Email Address" icon={icons.email} error={fieldErrors.email} 
                            />
                            
                            <div className="relative">
                                <FloatingInput 
                                    type={showPassword ? 'text' : 'password'} 
                                    id="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    label="Password" 
                                    icon={icons.lock} 
                                    error={fieldErrors.password}
                                    rightElement={
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-600 transition-colors p-2">
                                            {showPassword ? icons.eyeOff : icons.eye}
                                        </button>
                                    }
                                />
                                
                                {/* Password Strength Meter */}
                                {!isLoginMode && formData.password && (
                                    <div className="mt-3 mx-2 animate-[fadeIn_0.3s_ease-out]">
                                        <div className="flex gap-1.5 mb-1.5">
                                            {[1, 2, 3].map(level => (
                                                <div 
                                                    key={level} 
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                                                        level <= passwordStrength.level ? passwordStrength.color : 'bg-slate-100'
                                                    } ${level <= passwordStrength.level && passwordStrength.level === 3 ? 'shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`}
                                                ></div>
                                            ))}
                                        </div>
                                        <p className={`text-xs font-bold ${passwordStrength.textColor} transition-colors duration-300`}>
                                            Password is {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {isLoginMode && (
                                <div className="text-right -mt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsForgotMode(true); setError(''); setFieldErrors({}); }}
                                        className="text-sm text-primary-600 hover:text-primary-800 font-bold transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button type="submit" className="btn-primary mt-4 text-lg shadow-lg shadow-primary-500/20 py-4">
                                {isLoginMode ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>
                    )}
                </div>

                {!isForgotMode && !isResetMode && (
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 font-medium">
                            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                            <button 
                                type="button"
                                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setSuccess(''); setFieldErrors({}); setFormData({ name: '', email: '', phone: '', password: ''}); }}
                                className="font-bold text-primary-600 hover:text-primary-800 transition-colors ml-1 focus:outline-none focus:underline"
                            >
                                {isLoginMode ? 'Register here' : 'Login here'}
                            </button>
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default Login;