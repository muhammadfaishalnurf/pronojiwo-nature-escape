import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navLinks = [
    { name: "Beranda", id: "beranda" },
    { name: "Destinasi Favorit", id: "destinasi" },
    { name: "Pesan Tiket", id: "tiket" },
    { name: "Testimoni", id: "testimoni" },
    { name: "Kontak", id: "kontak" },
];

export default function Navbar({ scrolled }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/");
        setProfileOpen(false);
    };

    const getInitials = (name) =>
        name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

    const getRoleLabel = (roles) => {
        if (!roles) return "";
        if (roles.includes("super_admin")) return "Super Admin";
        if (roles.includes("admin")) return "Admin";
        return "Member";
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-white/90 backdrop-blur-xl border-b border-emerald-100/30 shadow-xl shadow-emerald-950/5"
                : "bg-transparent"}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between" style={{ height: 72 }}>

                    {/* Logo */}
                    <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                            WAP
                        </div>
                        <div className="leading-tight">
                            <span className="block font-black text-[10px] text-emerald-700 tracking-widest uppercase">WISATA ALAM</span>
                            <span className={`block font-black text-xl transition-colors duration-300 ${scrolled ? "text-gray-950" : "text-white"}`}>PRONOJIWO</span>
                        </div>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a key={link.id} href={`#${link.id}`}
                                className={`relative text-sm font-bold tracking-wide transition-all duration-300 group ${scrolled ? "text-gray-700 hover:text-emerald-700" : "text-white/90 hover:text-white"}`}>
                                {link.name}
                                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                    </div>

                    {/* Desktop Right — Auth or Profile */}
                    <div className="hidden lg:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* Admin panel link */}
                                {(user.roles?.includes("admin") || user.roles?.includes("super_admin")) && (
                                    <Link to={user.roles?.includes("super_admin") ? "/super-admin" : "/admin"}
                                        className={`px-4 py-2 rounded-full font-bold text-xs tracking-wide transition-all duration-300 border ${scrolled
                                            ? "border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                                            : "border-white/40 text-white hover:bg-white/10"}`}>
                                        Panel Admin
                                    </Link>
                                )}

                                {/* Profile dropdown */}
                                <div ref={profileRef} className="relative">
                                    <button onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-full transition-all duration-300 hover:bg-white/10 group">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xs shadow-md">
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-xs font-bold leading-none ${scrolled ? "text-gray-900" : "text-white"}`}>{user.name?.split(" ")[0]}</p>
                                            <p className={`text-[10px] leading-none mt-0.5 ${scrolled ? "text-gray-400" : "text-white/50"}`}>{getRoleLabel(user.roles)}</p>
                                        </div>
                                        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${profileOpen ? "rotate-180" : ""} ${scrolled ? "text-gray-400" : "text-white/50"}`}
                                            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>

                                    {/* Dropdown */}
                                    <div className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 origin-top-right ${profileOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
                                        {/* User info */}
                                        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                                            <p className="font-black text-sm text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                                            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-700">
                                                {getRoleLabel(user.roles)}
                                            </span>
                                        </div>

                                        <div className="py-2">
                                            <Link to="/tiket-saya" onClick={() => setProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <span>🎫</span> Tiket Saya
                                            </Link>
                                            {(user.roles?.includes("admin") || user.roles?.includes("super_admin")) && (
                                                <Link to={user.roles?.includes("super_admin") ? "/super-admin" : "/admin"}
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <span>⚙️</span> Panel Admin
                                                </Link>
                                            )}
                                            <div className="h-px bg-gray-100 mx-3 my-1" />
                                            <button onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <span>🚪</span> Keluar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to="/login"
                                    className={`px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 border-2 ${scrolled
                                        ? "border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                                        : "border-white/40 text-white hover:bg-white hover:text-emerald-950"}`}>
                                    Masuk
                                </Link>
                                <Link to="/register"
                                    className="px-6 py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                                    Daftar Baru
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button className="lg:hidden p-3 rounded-2xl hover:bg-emerald-500/10 transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}>
                        <div className="w-6 space-y-1.5">
                            <span className={`block h-[3px] bg-current rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""} ${scrolled ? "text-gray-900" : "text-white"}`} />
                            <span className={`block h-[3px] bg-current rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""} ${scrolled ? "text-gray-900" : "text-white"}`} />
                            <span className={`block h-[3px] bg-current rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""} ${scrolled ? "text-gray-900" : "text-white"}`} />
                        </div>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-all duration-500 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setMenuOpen(false)} />
            <div className={`lg:hidden fixed top-0 right-0 bottom-0 z-[9999] w-[85vw] max-w-sm flex flex-col transform transition-all duration-500 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
                style={{ background: "linear-gradient(160deg, #022c22 0%, #041c14 60%, #021a10 100%)" }}>

                <div className="flex items-center justify-between px-6 pt-8 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xs">WAP</div>
                        <span className="font-black text-white text-lg">PRONOJIWO</span>
                    </div>
                    <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/70" onClick={() => setMenuOpen(false)}>✕</button>
                </div>

                {user && (
                    <div className="mx-4 mb-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm">
                            {getInitials(user.name)}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">{user.name}</p>
                            <p className="text-white/40 text-[10px]">{getRoleLabel(user.roles)}</p>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 space-y-1">
                    {navLinks.map((link) => (
                        <a key={link.id} href={`#${link.id}`}
                            className="flex items-center px-4 py-3.5 rounded-2xl text-white font-bold text-sm border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] transition-all"
                            onClick={() => setMenuOpen(false)}>
                            {link.name}
                        </a>
                    ))}
                    {user && (
                        <Link to="/tiket-saya"
                            className="flex items-center gap-2 px-4 py-3.5 rounded-2xl text-white font-bold text-sm border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] transition-all"
                            onClick={() => setMenuOpen(false)}>
                            🎫 Tiket Saya
                        </Link>
                    )}
                    {user && (user.roles?.includes("admin") || user.roles?.includes("super_admin")) && (
                        <Link to={user.roles?.includes("super_admin") ? "/super-admin" : "/admin"}
                            className="flex items-center gap-2 px-4 py-3.5 rounded-2xl text-amber-300 font-bold text-sm border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 transition-all"
                            onClick={() => setMenuOpen(false)}>
                            ⚙️ Panel Admin
                        </Link>
                    )}
                </div>

                <div className="px-4 py-6 space-y-2">
                    {user ? (
                        <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                            className="w-full py-3.5 rounded-2xl font-bold text-sm text-red-300 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all">
                            🚪 Keluar dari Akun
                        </button>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-sm text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-all">
                                Masuk
                            </Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-center w-full py-4 rounded-2xl font-black text-sm text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-400 transition-all">
                                Daftar Sekarang — Gratis!
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}