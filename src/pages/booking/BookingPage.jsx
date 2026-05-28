import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";

const KEBANGSAAN = [
    "Indonesia", "Malaysia", "Singapura", "Australia", "Amerika Serikat",
    "Inggris", "Belanda", "Jerman", "Prancis", "Jepang", "Korea Selatan",
    "China", "India", "Lainnya"
];

export default function BookingPage() {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const [searchParams] = useSearchParams();

    const destId    = searchParams.get("dest") || "";
    const dateParam = searchParams.get("date") || "";
    const qtyParam  = parseInt(searchParams.get("qty") || "1");

    const [destinations, setDestinations] = useState([]);
    const [selectedDest, setSelectedDest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    const [form, setForm] = useState({
        destination_id: destId,
        visit_date:     dateParam,
        quantity:       qtyParam,
        nama_ketua:     "",
        jenis_kelamin:  "",
        no_hp:          "",
        kebangsaan:     "Indonesia",
    });

    // Load Midtrans Snap.js
    useEffect(() => {
        document.title = "Pesan Tiket - Pronojiwo Nature Escape";
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "");
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    useEffect(() => {
        api.get("/destinations").then(res => {
            const data = res.data?.data || [];
            setDestinations(data);
            if (destId) setSelectedDest(data.find(d => String(d.id) === String(destId)));
        });
    }, []);

    useEffect(() => {
        if (form.destination_id) {
            setSelectedDest(destinations.find(d => String(d.id) === String(form.destination_id)));
        }
    }, [form.destination_id, destinations]);

    // Auto-isi nama dari akun user
    useEffect(() => {
        if (user?.name) {
            setForm(f => ({ ...f, nama_ketua: f.nama_ketua || user.name }));
        }
    }, [user]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const subtotal = selectedDest ? parseFloat(selectedDest.harga_tiket) * form.quantity : 0;
    const tax      = selectedDest ? Math.round(subtotal * 0.05) : 0;
    const total    = subtotal + tax;
    const formatRp = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

    const checkAndUpdateStatus = async (orderId) => {
        try { await api.post("/payments/check-status", { order_id: orderId }); }
        catch (e) { console.error("Gagal cek status:", e); }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        if (!user) { navigate("/login?redirect=/pesan-tiket"); return; }
        if (!form.destination_id) { setError("Pilih destinasi terlebih dahulu."); return; }
        if (!form.visit_date)     { setError("Pilih tanggal kunjungan."); return; }
        if (!form.nama_ketua)     { setError("Isi nama ketua rombongan."); return; }
        if (!form.jenis_kelamin)  { setError("Pilih jenis kelamin ketua."); return; }
        if (!form.no_hp)          { setError("Isi nomor HP ketua."); return; }

        setLoading(true);
        setError("");

        try {
            const res = await api.post("/payments/create", form);
            const { snap_token, order_id } = res.data;

            window.snap.pay(snap_token, {
                onSuccess: async () => {
                    await checkAndUpdateStatus(order_id);
                    navigate(`/pembayaran/selesai?order_id=${order_id}&status=success`);
                },
                onPending: async () => {
                    await checkAndUpdateStatus(order_id);
                    navigate(`/pembayaran/selesai?order_id=${order_id}&status=pending`);
                },
                onError: () => {
                    setError("Pembayaran gagal. Silakan coba lagi.");
                    setLoading(false);
                },
                onClose: async () => {
                    await checkAndUpdateStatus(order_id);
                    setError("Popup ditutup. Cek status di halaman Tiket Saya.");
                    setLoading(false);
                },
            });
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan. Coba lagi.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-950 to-gray-950 pt-16 pb-10 px-6">
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-emerald-400 text-sm font-bold mb-6 hover:text-emerald-300">
                        ← Kembali
                    </button>
                    <h1 className="text-2xl font-black text-white">Pesan Tiket Wisata</h1>
                    <p className="text-white/50 text-sm mt-1">Isi data pemesanan dengan lengkap dan benar</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handlePay} className="space-y-6">

                    {/* ── Pilih Destinasi ── */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-900 text-sm mb-4">1. Pilih Destinasi & Jadwal</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Destinasi Wisata</label>
                                <select
                                    value={form.destination_id}
                                    onChange={e => set("destination_id", e.target.value)}
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                                >
                                    <option value="">-- Pilih Destinasi --</option>
                                    {destinations.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama_wisata} — {formatRp(d.harga_tiket)}/orang
                                        </option>
                                    ))}
                                </select>

                                {selectedDest && (
                                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
                                        {selectedDest.foto && (
                                            <img src={selectedDest.foto} alt={selectedDest.nama_wisata}
                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"/>
                                        )}
                                        <div>
                                            <p className="font-bold text-emerald-800 text-sm">{selectedDest.nama_wisata}</p>
                                            <p className="text-xs text-emerald-600 mt-0.5">{selectedDest.lokasi_rute}</p>
                                            <p className="text-xs text-emerald-700 font-bold mt-1">{formatRp(selectedDest.harga_tiket)}/orang</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Tanggal Kunjungan</label>
                                    <input
                                        type="date"
                                        value={form.visit_date}
                                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                                        onChange={e => set("visit_date", e.target.value)}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Jumlah Tiket</label>
                                    <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2.5">
                                        <button type="button"
                                            onClick={() => set("quantity", Math.max(1, form.quantity - 1))}
                                            className="w-8 h-8 rounded-lg bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200 text-lg">−</button>
                                        <span className="flex-1 text-center font-black text-sm">{form.quantity} orang</span>
                                        <button type="button"
                                            onClick={() => set("quantity", form.quantity + 1)}
                                            className="w-8 h-8 rounded-lg bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200 text-lg">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Data Ketua Rombongan ── */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-900 text-sm mb-1">2. Data Ketua Rombongan</h3>
                        <p className="text-xs text-gray-400 mb-4">Isi data ketua/penanggung jawab rombongan</p>

                        <div className="space-y-4">
                            {/* Nama Ketua */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Nama Lengkap</label>
                                <input
                                    type="text"
                                    placeholder="Nama lengkap ketua rombongan"
                                    value={form.nama_ketua}
                                    onChange={e => set("nama_ketua", e.target.value)}
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Jenis Kelamin & No HP */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Jenis Kelamin</label>
                                    <div className="flex gap-3">
                                        {[
                                            { val: "laki-laki",  label: "Laki-laki",  icon: "👨" },
                                            { val: "perempuan",  label: "Perempuan",  icon: "👩" },
                                        ].map(opt => (
                                            <button
                                                key={opt.val}
                                                type="button"
                                                onClick={() => set("jenis_kelamin", opt.val)}
                                                className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                                                    form.jenis_kelamin === opt.val
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                                                }`}
                                            >
                                                <span className="text-lg">{opt.icon}</span>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Nomor HP / WhatsApp</label>
                                    <input
                                        type="tel"
                                        placeholder="08xx-xxxx-xxxx"
                                        value={form.no_hp}
                                        onChange={e => set("no_hp", e.target.value)}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Kebangsaan */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Kebangsaan</label>
                                <select
                                    value={form.kebangsaan}
                                    onChange={e => set("kebangsaan", e.target.value)}
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                                >
                                    {KEBANGSAAN.map(k => (
                                        <option key={k} value={k}>{k}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Rincian Biaya ── */}
                    {selectedDest && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm mb-4">3. Rincian Pembayaran</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>{selectedDest.nama_wisata} × {form.quantity} orang</span>
                                    <span>{formatRp(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Biaya Layanan (5%)</span>
                                    <span>{formatRp(tax)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-base">
                                    <span>Total Pembayaran</span>
                                    <span className="text-emerald-700 text-lg">{formatRp(total)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Info Akun ── */}
                    {user && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-lg">Login</span>
                        </div>
                    )}

                    {/* ── Tombol Bayar ── */}
                    <button
                        type="submit"
                        disabled={loading || !selectedDest}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            <>🔒 Lanjut ke Pembayaran {selectedDest ? `— ${formatRp(total)}` : ""}</>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                        🔒 Pembayaran diamankan oleh <span className="font-bold text-gray-600">Midtrans</span> · SSL Encrypted
                    </p>
                </form>
            </div>
        </div>
    );
}