import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const adminMenus = [
    { path: "/admin", label: "Dashboard", icon: "📊", exact: true },
    { path: "/admin/destinasi", label: "Destinasi", icon: "🏔️" },
    { path: "/admin/tiket", label: "Tiket", icon: "🎫" },
    { path: "/admin/ulasan", label: "Ulasan", icon: "💬" },
    { path: "/admin/scan-tiket", label: "Scan Tiket", icon: "🔍" }
];

const superAdminMenus = [
    { path: "/super-admin", label: "Dashboard", icon: "📊", exact: true },
    { path: "/super-admin/pengguna", label: "Pengguna", icon: "👥" },
    { path: "/super-admin/pengaturan", label: "Pengaturan", icon: "⚙️" },
    ...adminMenus.slice(1),
];

export default function AdminLayout({ children, title = "" }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    const isSuperAdmin = user?.roles?.includes("super_admin");
    const menus = isSuperAdmin ? superAdminMenus : adminMenus;
    const panelLabel = isSuperAdmin ? "Super Admin" : "Admin";
    const panelColor = isSuperAdmin ? "from-purple-700 to-indigo-600" : "from-emerald-700 to-teal-600";

    const isActive = (menu) => {
        if (menu.exact) return location.pathname === menu.path;
        return location.pathname.startsWith(menu.path);
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        await logout();
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* ── SIDEBAR ── */}
            <aside className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col bg-gray-900 transition-all duration-300 flex-shrink-0 relative`}>
                {/* Header */}
                <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${!sidebarOpen && "justify-center"}`}>
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${panelColor} flex items-center justify-center text-white font-black text-xs flex-shrink-0`}>
                        {isSuperAdmin ? "SA" : "AD"}
                    </div>
                    {sidebarOpen && (
                        <div className="leading-tight overflow-hidden">
                            <span className="block text-[8px] font-black text-white/40 tracking-widest uppercase">{panelLabel} Panel</span>
                            <span className="block font-black text-sm text-white truncate">Pronojiwo</span>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {menus.map((menu) => (
                        <Link key={menu.path} to={menu.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive(menu)
                                ? `bg-gradient-to-r ${panelColor} text-white shadow-lg`
                                : "text-white/50 hover:bg-white/5 hover:text-white"
                            } ${!sidebarOpen && "justify-center"}`}>
                            <span className="text-base flex-shrink-0">{menu.icon}</span>
                            {sidebarOpen && <span className="text-sm font-semibold truncate">{menu.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User info + logout */}
                <div className="px-2 py-4 border-t border-white/5 space-y-2">
                    {sidebarOpen && (
                        <div className="px-3 py-2.5 rounded-xl bg-white/5 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-white text-xs font-bold truncate">{user?.name}</p>
                                <p className="text-white/40 text-[10px] truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleLogout} disabled={loggingOut}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-semibold ${!sidebarOpen && "justify-center"}`}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        {sidebarOpen && (loggingOut ? "Keluar..." : "Keluar")}
                    </button>
                </div>

                {/* Toggle button */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors shadow-md">
                    <svg className={`w-3 h-3 transition-transform duration-300 ${sidebarOpen ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-lg font-black text-gray-900">{title}</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/" target="_blank"
                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-colors flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                            Lihat Website
                        </Link>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xs">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}