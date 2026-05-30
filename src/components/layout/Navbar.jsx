import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Popup konfirmasi logout
function LogoutConfirmModal({ onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onCancel}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={e => e.stopPropagation()}>

                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👋</span>
                </div>

                <h3 className="font-black text-gray-900 text-lg text-center mb-1">
                    Keluar dari Akun?
                </h3>
                <p className="text-gray-500 text-sm text-center mb-6">
                    Anda akan keluar dari sesi ini. Pastikan sudah menyimpan semua pekerjaan.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                        Tidak, Kembali
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-black text-sm transition-colors flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                Keluar...
                            </>
                        ) : "Ya, Keluar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Navbar({ scrolled }) {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();

    const [dropdownOpen,   setDropdownOpen]   = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutLoading,  setLogoutLoading]  = useState(false);

    const dropdownRef = useRef(null);

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogoutConfirm = async () => {
        setLogoutLoading(true);
        try {
            await logout();
            setShowLogoutModal(false);
            navigate("/login");
        } catch {
            navigate("/login");
        } finally {
            setLogoutLoading(false);
        }
    };

    // Ambil role name dengan aman
    const getRoleName = (roles) => {
        if (!roles || roles.length === 0) return "user";
        const first = roles[0];
        return typeof first === "string" ? first : first?.name || "user";
    };

    const roleName  = user ? getRoleName(user.roles) : null;
    const dashRoute = roleName === "super_admin" ? "/super-admin" : "/admin";

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-white/90 backdrop-blur-xl border-b border-emerald-100/30 shadow-xl shadow-emerald-950/5"
                    : "bg-transparent"
            }`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-105 transition-transform">
                            WAP
                        </div>
                        <div className="leading-tight">
                            <span className="block font-black text-[9px] text-emerald-600 tracking-widest uppercase">Wisata Alam</span>
                            <span className={`block font-black text-base transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>PRONOJIWO</span>
                        </div>
                    </Link>

                    {/* Nav Links — desktop */}
                    <div className="hidden lg:flex items-center gap-8">
                        {[
                            { label: "Beranda",    href: "/#beranda" },
                            { label: "Destinasi",  href: "/#destinasi" },
                            { label: "Pesan Tiket",href: "/#tiket" },
                            { label: "Testimoni",  href: "/#testimoni" },
                            { label: "Kontak",     href: "/#kontak" },
                        ].map(link => (
                            <a key={link.label} href={link.href}
                                className={`text-sm font-bold tracking-wide transition-colors hover:text-emerald-500 ${scrolled ? "text-gray-700" : "text-white/90"}`}>
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            /* Profile dropdown */
                            <div ref={dropdownRef} className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2.5 group">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className={`text-xs font-black leading-tight ${scrolled ? "text-gray-900" : "text-white"}`}>
                                            {user.name?.split(" ")[0]}
                                        </p>
                                        <p className={`text-[10px] font-semibold capitalize ${scrolled ? "text-gray-400" : "text-white/60"}`}>
                                            {roleName}
                                        </p>
                                    </div>
                                    <svg className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""} ${scrolled ? "text-gray-400" : "text-white/60"}`}
                                        fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                                    </svg>
                                </button>

                                {/* Dropdown */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden">
                                        {/* Info user */}
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="font-black text-gray-900 text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                roleName === "super_admin" ? "bg-purple-100 text-purple-700" :
                                                roleName === "admin" ? "bg-blue-100 text-blue-700" :
                                                "bg-emerald-100 text-emerald-700"
                                            }`}>
                                                {roleName === "super_admin" ? "Super Admin" : roleName === "admin" ? "Admin" : "User"}
                                            </span>
                                        </div>

                                        {/* Menu */}
                                        <div className="py-1">
                                            {(roleName === "admin" || roleName === "super_admin") && (
                                                <Link to={dashRoute}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <span>📊</span> Dashboard
                                                </Link>
                                            )}
                                            <Link to="/tiket-saya"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                                <span>🎫</span> Tiket Saya
                                            </Link>
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-50 pt-1">
                                            <button
                                                onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                                <span>🚪</span> Keluar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Belum login */
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/login"
                                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2 ${
                                        scrolled
                                            ? "border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                                            : "border-white/40 text-white hover:bg-white hover:text-emerald-950"
                                    }`}>
                                    Masuk
                                </Link>
                                <Link to="/register"
                                    className="px-5 py-2.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg transition-all hover:-translate-y-0.5">
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Modal Konfirmasi Logout */}
            {showLogoutModal && (
                <LogoutConfirmModal
                    onConfirm={handleLogoutConfirm}
                    onCancel={() => setShowLogoutModal(false)}
                    loading={logoutLoading}
                />
            )}
        </>
    );
}