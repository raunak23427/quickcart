import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function OrderTracking() {
    const { orderId } = useParams();
    const [step, setStep] = useState(1); // 1: Confirmed, 2: Packing, 3: Out for Delivery, 4: Near You

    useEffect(() => {
        const timer1 = setTimeout(() => setStep(2), 3000);
        const timer2 = setTimeout(() => setStep(3), 8000);
        const timer3 = setTimeout(() => setStep(4), 15000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    const steps = [
        { id: 1, label: 'Order Confirmed', icon: '✅', desc: 'We have received your order' },
        { id: 2, label: 'Packing Items', icon: '📦', desc: 'Items are being picked and packed' },
        { id: 3, label: 'Out for Delivery', icon: '🛵', desc: 'Rider is on the way to you' },
        { id: 4, label: 'Arriving Soon', icon: '📍', desc: 'Rider is less than 500m away' }
    ];

    return (
        <div className="w-full max-w-2xl mx-auto py-10 px-4">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header Map Simulation */}
                <div className="h-64 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.209,28.613,12,0/600x400?access_token=pk.xxx')] bg-cover"></div>
                    <div className="relative z-10 bg-white p-4 rounded-3xl shadow-xl flex items-center gap-4 animate-bounce">
                        <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-2xl">🛵</div>
                        <div>
                            <p className="font-black text-slate-800 leading-none">Rishi is on the way</p>
                            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest mt-1">8 min delivery</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-black text-slate-800 font-serif">Track Order</h2>
                        <span className="bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary-100">Live</span>
                    </div>

                    <div className="space-y-10 relative">
                        {/* Vertical Progress Line */}
                        <div className="absolute left-6 top-2 bottom-2 w-1 bg-slate-100 z-0">
                            <div className="w-full bg-primary-500 transition-all duration-1000 origin-top" style={{ height: `${(step - 1) * 33.33}%` }}></div>
                        </div>

                        {steps.map((s) => (
                            <div key={s.id} className={`flex gap-6 relative z-10 transition-all duration-500 ${step >= s.id ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 transition-all ${step >= s.id ? 'bg-white border-primary-500 shadow-primary-500/20' : 'bg-slate-50 border-slate-100 shadow-none'}`}>
                                    {s.icon}
                                </div>
                                <div>
                                    <h3 className={`font-black text-lg leading-tight ${step >= s.id ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</h3>
                                    <p className="text-sm font-medium text-slate-400 mt-1">{s.desc}</p>
                                </div>
                                {step === s.id && (
                                    <div className="ml-auto">
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="Rider" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Delivery Partner</p>
                                <p className="font-black text-slate-800">Rishi Kumar</p>
                            </div>
                            <button className="ml-auto w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">📞</button>
                        </div>
                    </div>
                    
                    <Link to="/" className="block text-center mt-8 text-xs font-black text-slate-300 hover:text-primary-500 transition-colors uppercase tracking-widest">Back to Shopping</Link>
                </div>
            </div>
        </div>
    );
}

export default OrderTracking;
