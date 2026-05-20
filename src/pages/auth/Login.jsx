import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const user = await login(form.email, form.password);
            if (user.roles?.includes("super_admin")) {
                navigate("/super-admin");
            } else if (user.roles?.includes("admin")) {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Email atau password salah. Silakan coba lagi."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-950 to-emerald-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-base shadow-xl group-hover:scale-110 transition-transform duration-300">
                            WAP
                        </div>
                        <div className="text-left leading-tight">
                            <span className="block font-black text-[9px] text-emerald-400 tracking-widest uppercase">Wisata Alam</span>
                            <span className="block font-black text-xl text-white">PRONOJIWO</span>
                        </div>
                    </Link>
                    <p className="text-white/50 text-sm mt-4">Masuk ke akun Anda untuk melanjutkan petualangan</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Selamat Datang Kembali 👋</h2>

                    {error && (
                        <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-white/70 font-bold text-xs uppercase tracking-wider">Alamat Email</label>
                            <input
                                type="email" name="email" value={form.email}
                                onChange={handleChange} placeholder="contoh@email.com" required
                                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-white/70 font-bold text-xs uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} name="password"
                                    value={form.password} onChange={handleChange}
                                    placeholder="Masukkan password" required
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : "Masuk Sekarang"}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/30 text-xs font-semibold">ATAU</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <p className="text-center text-white/50 text-sm">
                        Belum punya akun?{" "}
                        <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                            Daftar Gratis →
                        </Link>
                    </p>
                </div>

                <p className="text-center text-white/25 text-xs mt-6">🔒 Data Anda aman dan terenkripsi</p>
            </div>
        </div>
    );
}

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";

// export default function Login() {
//     const navigate = useNavigate();
//     const { login } = useAuth();

//     const [form, setForm] = useState({ email: "", password: "" });
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const handleChange = (e) => {
//         setForm({ ...form, [e.target.name]: e.target.value });
//         setError("");
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError("");

//         try {
//             const user = await login(form.email, form.password);

//             // Redirect berdasarkan role
//             if (user.roles?.includes("super_admin")) {
//                 navigate("/super-admin");
//             } else if (user.roles?.includes("admin")) {
//                 navigate("/admin");
//             } else {
//                 navigate("/");
//             }
//         } catch (err) {
//             const msg = err.response?.data?.message || "Email atau password salah.";
//             setError(msg);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-950 to-emerald-950 flex items-center justify-center px-4 py-12">

//             {/* Background blobs */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none">
//                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
//                 <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
//             </div>

//             <div className="relative w-full max-w-md">

//                 {/* Logo */}
//                 <div className="text-center mb-8">
//                     <Link to="/" className="inline-flex items-center gap-3 group">
//                         <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-110 transition-transform">
//                             WAP
//                         </div>
//                         <div className="leading-tight text-left">
//                             <span className="block font-black text-[9px] text-emerald-400 tracking-widest uppercase">Wisata Alam</span>
//                             <span className="block font-black text-lg text-white">PRONOJIWO</span>
//                         </div>
//                     </Link>
//                     <h1 className="text-2xl font-bold text-white mt-6">Selamat Datang Kembali</h1>
//                     <p className="text-white/50 text-sm mt-1">Masuk ke akun Pronojiwo Nature Escape Anda</p>
//                 </div>

//                 {/* Card */}
//                 <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

//                     {/* Error message */}
//                     {error && (
//                         <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
//                             <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
//                             </svg>
//                             {error}
//                         </div>
//                     )}

//                     <form onSubmit={handleSubmit} className="space-y-5">

//                         {/* Email */}
//                         <div className="space-y-1.5">
//                             <label className="text-white/70 font-bold text-xs uppercase tracking-wider block">
//                                 Alamat Email
//                             </label>
//                             <div className="relative">
//                                 <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
//                                 </svg>
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={form.email}
//                                     onChange={handleChange}
//                                     placeholder="email@contoh.com"
//                                     required
//                                     className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all"
//                                 />
//                             </div>
//                         </div>

//                         {/* Password */}
//                         <div className="space-y-1.5">
//                             <label className="text-white/70 font-bold text-xs uppercase tracking-wider block">
//                                 Kata Sandi
//                             </label>
//                             <div className="relative">
//                                 <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
//                                 </svg>
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="password"
//                                     value={form.password}
//                                     onChange={handleChange}
//                                     placeholder="Masukkan kata sandi"
//                                     required
//                                     className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
//                                 >
//                                     {showPassword ? (
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
//                                         </svg>
//                                     ) : (
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                         </svg>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Submit */}
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
//                         >
//                             {loading ? (
//                                 <>
//                                     <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                                     </svg>
//                                     Memproses...
//                                 </>
//                             ) : "Masuk Sekarang"}
//                         </button>
//                     </form>

//                     {/* Divider */}
//                     <div className="flex items-center gap-3 my-6">
//                         <div className="flex-1 h-px bg-white/10"></div>
//                         <span className="text-white/30 text-xs font-semibold">atau</span>
//                         <div className="flex-1 h-px bg-white/10"></div>
//                     </div>

//                     {/* Register link */}
//                     <p className="text-center text-sm text-white/50">
//                         Belum punya akun?{" "}
//                         <Link to="/register" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
//                             Daftar Gratis
//                         </Link>
//                     </p>
//                 </div>

//                 {/* Back to home */}
//                 <div className="text-center mt-6">
//                     <Link to="/" className="text-white/30 hover:text-white/60 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
//                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
//                         </svg>
//                         Kembali ke Beranda
//                     </Link>
//                 </div>
//             </div>
//         </div>
//     );
// }