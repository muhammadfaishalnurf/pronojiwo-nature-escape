import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate  = useNavigate();
    const [searchParams] = useSearchParams();

    const [form,    setForm]    = useState({ email: "", password: "" });
    const [error,   setError]   = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Login - Pronojiwo Nature Escape";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const userData = await login(form.email, form.password);

            // Cek apakah ada redirect dari booking
            const bookingRedirect = sessionStorage.getItem("booking_redirect");
            if (bookingRedirect) {
                sessionStorage.removeItem("booking_redirect");
                navigate(bookingRedirect);
                return;
            }

            // Cek query param redirect
            const redirectParam = searchParams.get("redirect");
            if (redirectParam) {
                navigate(redirectParam);
                return;
            }

            // Default redirect berdasarkan role
            const roles = userData?.roles || [];
            if (roles.includes("super_admin")) navigate("/super-admin");
            else if (roles.includes("admin"))  navigate("/admin");
            else                                navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Email atau password salah.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
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

                    {/* Info jika diarahkan dari booking */}
                    {(searchParams.get("redirect") || sessionStorage.getItem("booking_redirect")) && (
                        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-sm">
                            🔐 Login terlebih dahulu untuk melanjutkan pemesanan tiket.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase block mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder="email@contoh.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-white/50 uppercase block mb-1.5">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Masuk...
                                </>
                            ) : "Masuk"}
                        </button>
                    </form>

                    <p className="text-center text-white/30 text-sm mt-6">
                        Belum punya akun?{" "}
                        <Link to="/register" className="text-emerald-400 font-bold hover:underline">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}