import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function LogoutConfirmModal({ onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onCancel}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={e => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">👋</span>
                </div>
                <h3 className="font-black text-gray-900 text-lg text-center mb-1">Keluar dari Akun?</h3>
                <p className="text-gray-500 text-sm text-center mb-6">
                    Anda akan keluar dari sesi ini. Pastikan sudah menyimpan semua pekerjaan.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                        Tidak, Kembali
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-black text-sm transition-colors flex items-center justify-center gap-2">
                        {loading ? (
                            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Keluar...</>
                        ) : "Ya, Keluar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── GANTI PATH LOGO DAN TEKS DI SINI ──
const LOGO_IMAGE   = "/images/logo.png";
const LOGO_TEKS1   = "PRONOJIWO";  // teks besar atas
const LOGO_TEKS2   = "NATURE ESCAPE";          // teks kecil bawah

const navLinks = [
    { name: "Beranda",          href: "/#beranda" },
    { name: "Destinasi Favorit",href: "/#destinasi" },
    { name: "Pesan Tiket",      href: "/#tiket" },
    { name: "Testimoni",        href: "/#testimoni" },
    { name: "Kontak",           href: "/#kontak" },
];

export default function Navbar({ scrolled }) {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();

    const [menuOpen,        setMenuOpen]        = useState(false);
    const [dropdownOpen,    setDropdownOpen]    = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutLoading,   setLogoutLoading]   = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handle = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    // Tutup menu saat resize ke desktop
    useEffect(() => {
        const handle = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
        window.addEventListener("resize", handle);
        return () => window.removeEventListener("resize", handle);
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

    const getRoleName = (roles) => {
        if (!roles || roles.length === 0) return "user";
        const first = roles[0];
        return typeof first === "string" ? first : first?.name || "user";
    };

    const roleName  = user ? getRoleName(user.roles) : null;
    const dashRoute = roleName === "super_admin" ? "/super-admin" : "/admin";

    return (
        <>
            {/* ── NAVBAR ── */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-white/90 backdrop-blur-xl border-b border-emerald-100/30 shadow-xl shadow-emerald-950/5"
                    : "bg-transparent"
            }`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src={LOGO_IMAGE}
                            alt={LOGO_TEKS2}
                            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
                            onError={e => { e.target.style.display = "none"; }}
                        />
                        <div className="leading-tight">
                            <span className={`block font-black text-base transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>{LOGO_TEKS1}</span>
                            <span className="block font-black text-[9px] text-emerald-500 tracking-widest uppercase">{LOGO_TEKS2}</span>
                        </div>
                    </Link>

                    {/* Nav Links — desktop */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map(link => (
                            <a key={link.name} href={link.href}
                                className={`text-sm font-bold tracking-wide transition-colors hover:text-emerald-500 ${scrolled ? "text-gray-700" : "text-white/90"}`}>
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            /* Profile dropdown */
                            <div ref={dropdownRef} className="relative hidden md:block">
                                <button onClick={() => setDropdownOpen(!dropdownOpen)}
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
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden z-50">
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
                                        <div className="py-1">
                                            {(roleName === "admin" || roleName === "super_admin") && (
                                                <Link to={dashRoute} onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                                    <span>📊</span> Dashboard
                                                </Link>
                                            )}
                                            <Link to="/tiket-saya" onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                                <span>🎫</span> Tiket Saya
                                            </Link>
                                        </div>
                                        <div className="border-t border-gray-50 pt-1">
                                            <button onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                                <span>🚪</span> Keluar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Belum login — desktop */
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

                        {/* ── HAMBURGER — selalu tampil di mobile & tablet ── */}
                        <button
                            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl gap-1.5 hover:bg-white/10 transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menu">
                            <span className={`block h-[2.5px] w-6 rounded-full transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''} ${scrolled ? 'bg-gray-900' : 'bg-white'}`}/>
                            <span className={`block h-[2.5px] w-6 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''} ${scrolled ? 'bg-gray-900' : 'bg-white'}`}/>
                            <span className={`block h-[2.5px] w-6 rounded-full transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''} ${scrolled ? 'bg-gray-900' : 'bg-white'}`}/>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── MOBILE MENU OVERLAY ── */}
            <div className={`lg:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMenuOpen(false)} />

            {/* ── MOBILE MENU DRAWER ── */}
            <div className={`lg:hidden fixed top-0 right-0 bottom-0 z-[9999] w-[85vw] max-w-sm flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ background: 'linear-gradient(160deg, #022c22 0%, #041c14 60%, #021a10 100%)' }}>

                {/* Header drawer */}
                <div className="flex items-center justify-between px-6 pt-8 pb-5">
                    <div className="flex items-center gap-3">
                        <img
                            src={LOGO_IMAGE}
                            alt={LOGO_TEKS2}
                            className="h-9 w-auto object-contain brightness-0 invert"
                            onError={e => { e.target.style.display = "none"; }}
                        />
                        <div className="leading-tight">
                            <span className="block font-black text-base text-white">{LOGO_TEKS1}</span>
                            <span className="block text-[9px] font-black text-emerald-400 tracking-[0.2em] uppercase">{LOGO_TEKS2}</span>
                        </div>
                    </div>
                    <button className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all"
                        onClick={() => setMenuOpen(false)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Nav links */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {/* Info user kalau sudah login */}
                    {user && (
                        <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-white/5 rounded-2xl border border-white/10">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-white text-sm truncate">{user.name}</p>
                                <p className="text-xs text-white/40 truncate capitalize">{roleName}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5 mt-2">
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href}
                                className="flex items-center px-4 py-3.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-sm transition-all"
                                onClick={() => setMenuOpen(false)}>
                                {link.name}
                            </a>
                        ))}

                        {/* Menu extra kalau sudah login */}
                        {user && (
                            <>
                                {(roleName === "admin" || roleName === "super_admin") && (
                                    <Link to={dashRoute}
                                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-sm transition-all"
                                        onClick={() => setMenuOpen(false)}>
                                        📊 Dashboard
                                    </Link>
                                )}
                                <Link to="/tiket-saya"
                                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-sm transition-all"
                                    onClick={() => setMenuOpen(false)}>
                                    🎫 Tiket Saya
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer drawer */}
                <div className="px-4 pt-3 pb-8 border-t border-white/10 mt-2">
                    {user ? (
                        <button
                            onClick={() => { setMenuOpen(false); setShowLogoutModal(true); }}
                            className="w-full py-3.5 rounded-2xl font-bold text-sm text-red-400 border border-red-400/30 bg-red-400/5 hover:bg-red-400/10 transition-all">
                            🚪 Keluar dari Akun
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <Link to="/login"
                                className="flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-sm text-white border border-white/15 bg-white/[0.05] hover:bg-white/[0.10] transition-all"
                                onClick={() => setMenuOpen(false)}>
                                Masuk ke Akun
                            </Link>
                            <Link to="/register"
                                className="flex items-center justify-center w-full py-4 rounded-2xl font-black text-sm text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-xl transition-all"
                                onClick={() => setMenuOpen(false)}>
                                Daftar Sekarang — Gratis!
                            </Link>
                        </div>
                    )}
                </div>
            </div>

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