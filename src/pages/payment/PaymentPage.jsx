import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";

// Komponen pemilih destinasi & tanggal — reuse dari Home
export default function PaymentPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [destinations, setDestinations] = useState([]);
    const [form, setForm] = useState({
        destination_id: searchParams.get("dest") || "",
        visit_date: "",
        quantity: 1,
    });
    const [selectedDest, setSelectedDest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load Midtrans Snap.js
    useEffect(() => {
        document.title = "Pembayaran - Pronojiwo Nature Escape";
        console.log("Client Key:", import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        api.get("/destinations").then((res) => {
            const data = res.data?.data || [];
            setDestinations(data);
            if (form.destination_id) {
                setSelectedDest(data.find((d) => String(d.id) === String(form.destination_id)));
            }
        });
    }, []);

    useEffect(() => {
        if (form.destination_id) {
            setSelectedDest(destinations.find((d) => String(d.id) === String(form.destination_id)));
        }
    }, [form.destination_id, destinations]);

    const subtotal = selectedDest ? parseFloat(selectedDest.harga_tiket) * form.quantity : 0;
    const tax = selectedDest ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + tax;

    const formatPrice = (n) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

    const handlePay = async (e) => {
        e.preventDefault();
        if (!user) { navigate("/login"); return; }
        if (!form.destination_id) { setError("Pilih destinasi terlebih dahulu."); return; }
        if (!form.visit_date) { setError("Pilih tanggal kunjungan."); return; }

        setLoading(true);
        setError("");

        try {
            // 1. Buat transaksi di backend → dapat snap_token
            const res = await api.post("/payments/create", form);
            const { snap_token, order_id } = res.data;

            // 2. Buka Midtrans Snap popup
            window.snap.pay(snap_token, {
                onSuccess: (result) => {
                    console.log("Pembayaran berhasil:", result);
                    navigate(`/pembayaran/selesai?order_id=${order_id}&status=success`);
                },
                onPending: (result) => {
                    console.log("Pembayaran pending:", result);
                    navigate(`/pembayaran/selesai?order_id=${order_id}&status=pending`);
                },
                onError: (result) => {
                    console.error("Pembayaran error:", result);
                    setError("Pembayaran gagal. Silakan coba lagi.");
                },
                onClose: () => {
                    setError("Pembayaran dibatalkan.");
                },
            });
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan. Coba lagi.");
        } finally {
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
                    <h1 className="text-2xl font-black text-white">Pembayaran Tiket</h1>
                    <p className="text-white/50 text-sm mt-1">Aman & terenkripsi via Midtrans</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handlePay} className="space-y-6">
                    {/* Pilih Destinasi */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-900 text-sm mb-4">Detail Pemesanan</h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Destinasi Wisata</label>
                                <select
                                    value={form.destination_id}
                                    onChange={e => setForm({ ...form, destination_id: e.target.value })}
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                                >
                                    <option value="">-- Pilih Destinasi --</option>
                                    {destinations.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.nama_wisata} — {formatPrice(d.harga_tiket)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tanggal Kunjungan</label>
                                    <input
                                        type="date"
                                        value={form.visit_date}
                                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                                        onChange={e => setForm({ ...form, visit_date: e.target.value })}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Jumlah Tiket</label>
                                    <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2">
                                        <button type="button" onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                                            className="w-8 h-8 rounded-lg bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200">-</button>
                                        <span className="flex-1 text-center font-black text-sm">{form.quantity}</span>
                                        <button type="button" onClick={() => setForm(f => ({ ...f, quantity: f.quantity + 1 }))}
                                            className="w-8 h-8 rounded-lg bg-gray-100 font-bold flex items-center justify-center hover:bg-gray-200">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rincian Biaya */}
                    {selectedDest && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm mb-4">Rincian Pembayaran</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>{selectedDest.nama_wisata}</span>
                                    <span>{formatPrice(selectedDest.harga_tiket)} × {form.quantity}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Biaya Layanan (5%)</span>
                                    <span>{formatPrice(tax)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-base">
                                    <span>Total Pembayaran</span>
                                    <span className="text-emerald-700 text-lg">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info User */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>

                    {/* Metode Pembayaran */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-gray-900 text-sm mb-3">Metode Pembayaran</h3>
                        <p className="text-xs text-gray-500 mb-4">Pilih metode pembayaran di halaman Midtrans yang akan muncul.</p>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: "Transfer Bank", icon: "🏦" },
                                { label: "GoPay", icon: "💚" },
                                { label: "OVO", icon: "💜" },
                                { label: "QRIS", icon: "📱" },
                            ].map(m => (
                                <div key={m.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <span className="text-2xl">{m.icon}</span>
                                    <span className="text-[10px] text-gray-500 font-semibold text-center">{m.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tombol Bayar */}
                    <button
                        type="submit"
                        disabled={loading || !selectedDest}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            <>🔒 Bayar Sekarang {selectedDest ? `— ${formatPrice(total)}` : ""}</>
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