import { useState, useEffect } from 'react';

function PaymentGateway({ amount, onPaymentSuccess, onCancel }) {
    const [status, setStatus] = useState('selection'); // selection, processing, verifying, success
    const [method, setMethod] = useState(''); // card, cod

    const handleMethodSelect = (selectedMethod) => {
        setMethod(selectedMethod);
        setStatus('processing');
        
        if (selectedMethod === 'cod') {
            // COD is instant approval simulation
            setTimeout(() => {
                setStatus('success');
                setTimeout(() => {
                    onPaymentSuccess({ transactionId: 'COD_' + Date.now(), method: 'Cash on Delivery' });
                }, 1000);
            }, 1000);
        } else {
            // Card simulation
            setTimeout(() => setStatus('verifying'), 2000);
            setTimeout(() => {
                setStatus('success');
                setTimeout(() => {
                    onPaymentSuccess({ transactionId: 'TXN_' + Date.now(), method: 'Credit/Debit Card' });
                }, 1000);
            }, 4000);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl transition-all duration-500">
            <div className="bg-white dark:bg-slate-100 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-100/40 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 text-center">
                    {status === 'selection' ? (
                        <>
                            <h2 className="text-2xl font-black text-slate-800 mb-6 font-serif">Select Payment Method</h2>
                            <div className="space-y-4 mb-8">
                                <button 
                                    onClick={() => handleMethodSelect('card')}
                                    className="w-full flex items-center justify-between p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl hover:border-primary-500 hover:bg-primary-50 transition-all group active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm">💳</span>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800">Card / UPI</p>
                                            <p className="text-xs text-slate-500 font-medium tracking-wide font-sans">Pay securely now</p>
                                        </div>
                                    </div>
                                    <svg className="w-6 h-6 text-slate-300 group-hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </button>

                                <button 
                                    onClick={() => handleMethodSelect('cod')}
                                    className="w-full flex items-center justify-between p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group active:scale-95"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm">💵</span>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800">Cash on Delivery</p>
                                            <p className="text-xs text-slate-500 font-medium tracking-wide font-sans">Pay when items arrive</p>
                                        </div>
                                    </div>
                                    <svg className="w-6 h-6 text-slate-300 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center relative">
                                    {(status === 'processing' || status === 'verifying') && (
                                        <div className="absolute inset-0 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                    )}
                                    <span className="text-4xl">
                                        {status === 'success' ? '✅' : method === 'cod' ? '💵' : '🛡️'}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-2xl font-extrabold text-slate-800 mb-2 font-serif">
                                {status === 'processing' && (method === 'cod' ? 'Preparing Order...' : 'Securing Connection...')}
                                {status === 'verifying' && 'Verifying Transaction...'}
                                {status === 'success' && 'Ready to Deliver!'}
                            </h2>
                            
                            <p className="text-slate-500 font-medium mb-8 font-sans">
                                {status !== 'success' 
                                    ? `Total payable: ₹${Number(amount).toFixed(2)}` 
                                    : 'Redirecting to your delivery tracker...'}
                            </p>
                        </>
                    )}

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between mb-8">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Final Total</span>
                        <span className="text-xl font-black text-slate-800 font-serif">₹{Number(amount).toFixed(2)}</span>
                    </div>

                    <button 
                        onClick={onCancel}
                        className="text-slate-400 hover:text-rose-500 font-bold transition-colors text-xs uppercase tracking-widest font-sans"
                    >
                        {status === 'success' ? '' : 'Cancel Transaction'}
                    </button>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center gap-6 opacity-30">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">SECURE ENCRYPTION</span>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">BLINKIT-SPEED</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentGateway;
