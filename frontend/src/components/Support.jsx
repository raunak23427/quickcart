import API_BASE_URL from '../api.js';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Support() {
    const user = JSON.parse(localStorage.getItem('quickcart_user'));
    const [tickets, setTickets] = useState([]);
    const [newTicket, setNewTicket] = useState({ 
        subject: '', 
        message: '', 
        category: 'other', 
        priority: 'medium' 
    });
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        if (user) {
            fetchUserTickets();
        }
    }, []);

    const fetchUserTickets = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/support/user/${user.user_id}`);
            setTickets(res.data);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Submitting ticket:', { user_id: user.user_id, ...newTicket });
            const response = await axios.post(`${API_BASE_URL}/api/support/create`, {
                user_id: user.user_id,
                ...newTicket
            });
            console.log('Ticket response:', response.data);
            setMsg({ text: "Ticket submitted successfully!", type: 'success' });
            setNewTicket({ subject: '', message: '', category: 'other', priority: 'medium' });
            fetchUserTickets();
        } catch (err) {
            console.error('Submission error:', err.response?.data || err.message);
            setMsg({ text: err.response?.data?.message || "Failed to submit ticket.", type: 'error' });
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'open': return 'bg-blue-100 text-blue-600';
            case 'in_progress': return 'bg-amber-100 text-amber-600';
            case 'resolved': return 'bg-emerald-100 text-emerald-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return 'text-rose-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-blue-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
            <div className="mb-10 text-center">
                <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                    Help & <span className="text-primary-600">Support</span>
                </h2>
                <p className="mt-2 text-slate-500 font-medium">We're here to assist you with any issues.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submit Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">📝</span> Create Ticket
                        </h3>
                        
                        {msg.text && (
                            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {msg.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Category</label>
                                <select 
                                    value={newTicket.category}
                                    onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                                    className="input-field"
                                >
                                    <option value="order">Order Issue</option>
                                    <option value="payment">Payment Issue</option>
                                    <option value="refund">Refund Request</option>
                                    <option value="product">Product Issue</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Subject</label>
                                <input 
                                    type="text" required
                                    value={newTicket.subject}
                                    onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                                    className="input-field" 
                                    placeholder="Briefly describe the issue"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Priority</label>
                                <select 
                                    value={newTicket.priority}
                                    onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                                    className="input-field"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">Message</label>
                                <textarea 
                                    required
                                    value={newTicket.message}
                                    onChange={e => setNewTicket({...newTicket, message: e.target.value})}
                                    className="input-field min-h-[120px] resize-none" 
                                    placeholder="Describe your problem in detail..."
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full py-3.5">
                                Submit Ticket
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tickets History */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-2xl">🕒</span> Ticket History
                        </h3>
                        
                        {tickets.length === 0 ? (
                            <div className="text-center py-24 flex flex-col items-center gap-3">
                                <span className="text-6xl opacity-20">🎫</span>
                                <p className="text-slate-400 font-medium text-lg">No tickets found</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {tickets.map(ticket => (
                                    <div key={ticket.ticket_id} className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority} Priority
                                                    </span>
                                                </div>
                                                <h4 className="font-extrabold text-slate-800 text-lg leading-tight">{ticket.subject}</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                    {ticket.category} · #{ticket.ticket_id} · {new Date(ticket.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm">
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">"{ticket.message}"</p>
                                        </div>
                                        
                                        {ticket.admin_reply ? (
                                            <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-100 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <span className="text-xs">👋</span> Support Response
                                                </p>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">{ticket.admin_reply}</p>
                                                <p className="text-[10px] text-primary-400 mt-2 font-bold uppercase tracking-widest">
                                                    Updated {new Date(ticket.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 italic text-xs font-semibold py-2">
                                                <span className="animate-pulse">⏳</span> Awaiting response from support...
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Support;
