import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function ToastSuccess({ message, onClose }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 2500);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className={`fixed top-6 right-6 z-[9999] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[260px]">
                <span className="text-xl">✅</span>
                <p className="font-bold text-sm flex-1">{message}</p>
            </div>
        </div>
    );
}

export default function Login() {
    const { login }  = useAuth();
    const navigate   = useNavigate();
    const [searchParams] = useSearchParams();

    const [form,      setForm]      = useState({ email: "", password: "" });
    const [error,     setError]     = useState("");
    const [loading,   setLoading]   = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => { document.title = "Login - Pronojiwo Nature Escape"; }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const userData = await login(form.email, form.password);
            setShowToast(true);

            setTimeout(() => {
                const roles     = userData?.roles || [];
                const roleNames = roles.map(r => typeof r === "string" ? r : r?.name);

                // Admin/super admin → dashboard
                if (roleNames.includes("super_admin")) { navigate("/super-admin", { replace: true }); return; }
                if (roleNames.includes("admin"))        { navigate("/admin",       { replace: true }); return; }

                // User biasa — cek redirect param
                const redirectParam = searchParams.get("redirect");
                if (redirectParam) { navigate(redirectParam, { replace: true }); return; }

                // Hapus booking redirect kalau ada — user diarahkan ke home
                sessionStorage.removeItem("booking_redirect");
                navigate("/", { replace: true });
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || "Email atau password salah.");
        } finally {
            setLoading(false);
        }
    };

    const fromBooking = false; // sudah diarahkan ke home setelah login

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            {showToast && (
                <ToastSuccess message="Anda berhasil login! Selamat datang 👋" onClose={() => setShowToast(false)} />
            )}

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <p className="text-2xl font-black text-emerald-400">Pronojiwo</p>
                        <p className="text-white/30 text-xs">Nature Escape</p>
                    </Link>
                </div>

                <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
                    <h1 className="text-2xl font-black text-white mb-1">Masuk</h1>
                    <p className="text-white/40 text-sm mb-8">Selamat datang kembali!</p>

                    {error && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/50 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {fromBooking && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-sm">
                            🔐 Login terlebih dahulu untuk melanjutkan pemesanan tiket.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase block mb-1.5">Email</label>
                            <input type="email" placeholder="email@contoh.com" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} required
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500"/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase block mb-1.5">Password</label>
                            <input type="password" placeholder="••••••••" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500"/>
                        </div>

                        <button type="submit" disabled={loading || showToast}
                            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                            {loading ? (
                                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Masuk...</>
                            ) : showToast ? "Mengalihkan..." : "Masuk"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-700"/>
                        <span className="text-white/30 text-xs font-semibold">atau</span>
                        <div className="flex-1 h-px bg-gray-700"/>
                    </div>

                    {/* Google Login */}
                    <button
                        type="button"
                        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/google`}
                        className="w-full py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-900 font-bold text-sm transition-colors flex items-center justify-center gap-3 border border-gray-200">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Masuk dengan Google
                    </button>

                    <p className="text-center text-white/30 text-sm mt-6">
                        Belum punya akun?{" "}
                        <Link to="/register" className="text-emerald-400 font-bold hover:underline">Daftar sekarang</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}