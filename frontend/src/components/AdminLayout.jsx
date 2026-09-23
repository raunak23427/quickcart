import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

function AdminLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-200 selection:text-indigo-900">
            <AdminNavbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
