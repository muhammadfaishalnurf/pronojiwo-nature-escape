import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function MyTickets() {
    const navigate = useNavigate();
    const [tickets,  setTickets]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        document.title = "Tiket Saya - Pronojiwo Nature Escape";
        api.get("/tickets")
            .then(res => setTickets(res.data?.data || []))
            .finally(() => setLoading(false));
    }, []);

    const formatRp = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

    const statusBadge = (status) => {
        const map = {
            confirmed: { label: "Aktif ✓",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
            pending:   { label: "Pending",    color: "bg-amber-100 text-amber-700 border-amber-200" },
            cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700 border-red-200" },
            used:      { label: "Terpakai",   color: "bg-gray-100 text-gray-500 border-gray-200" },
        };
        const s = map[status] || map.pending;
        return <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>;
    };

    // QR Code URL dari API qrserver
    const getQrUrl = (code) =>
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(code)}&size=300x300&margin=10&format=png`;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-950 to-gray-950 pt-16 pb-10 px-6">
                <div className="max-w-3xl mx-auto">
                    <button onClick={() => navigate("/")}
                        className="inline-flex items-center gap-2 text-emerald-400 text-sm font-bold mb-6 hover:text-emerald-300">
                        ← Kembali ke Beranda
                    </button>
                    <h1 className="text-2xl font-black text-white">Tiket Saya</h1>
                    <p className="text-white/50 text-sm mt-1">Riwayat pemesanan tiket wisata Anda</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse"/>)}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🎫</p>
                        <p className="text-gray-500 font-semibold">Belum ada tiket.</p>
                        <button onClick={() => navigate("/")}
                            className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors">
                            Pesan Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-5 flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-black text-gray-900 truncate">
                                                {ticket.destination?.nama_wisata || "Destinasi"}
                                            </span>
                                            {statusBadge(ticket.status)}
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono mb-2">{ticket.ticket_code}</p>
                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                            <span>📅 {ticket.visit_date}</span>
                                            <span>👥 {ticket.quantity} orang</span>
                                            <span>💰 {formatRp(ticket.total_price)}</span>
                                        </div>
                                        {ticket.nama_ketua && (
                                            <p className="text-xs text-gray-400 mt-1">Ketua: {ticket.nama_ketua}</p>
                                        )}
                                        {ticket.status === "used" && ticket.used_at && (
                                            <p className="text-xs text-gray-400 mt-1 font-semibold">
                                                ✓ Digunakan: {new Date(ticket.used_at).toLocaleString("id-ID")}
                                            </p>
                                        )}
                                        {ticket.status === "pending" && (
                                            <p className="text-xs text-amber-500 mt-1 font-semibold">
                                                ⏳ Menunggu pembayaran
                                            </p>
                                        )}
                                    </div>

                                    {/* QR Code thumbnail — hanya kalau confirmed */}
                                    {ticket.status === "confirmed" && (
                                        <button onClick={() => setSelected(ticket)}
                                            className="flex-shrink-0 flex flex-col items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl px-3 py-2 transition-colors">
                                            <img src={getQrUrl(ticket.ticket_code)} alt="QR" className="w-14 h-14 rounded"/>
                                            <span className="text-[10px] font-bold text-emerald-700">Lihat QR</span>
                                        </button>
                                    )}

                                    {/* Tiket used — QR grayscale */}
                                    {ticket.status === "used" && (
                                        <div className="flex-shrink-0 flex flex-col items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 opacity-40">
                                            <img src={getQrUrl(ticket.ticket_code)} alt="QR" className="w-14 h-14 rounded grayscale"/>
                                            <span className="text-[10px] font-bold text-gray-400">Terpakai</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal QR Code besar */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelected(null)}>
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <p className="font-black text-gray-900 text-lg">{selected.destination?.nama_wisata}</p>
                            <p className="text-xs font-mono text-gray-400 mt-0.5">{selected.ticket_code}</p>
                        </div>

                        <div className="flex justify-center mb-4">
                            <div className="bg-white p-3 rounded-2xl border-2 border-emerald-200 shadow-inner">
                                <img src={getQrUrl(selected.ticket_code)} alt={selected.ticket_code} className="w-56 h-56"/>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ketua Rombongan</span>
                                <span className="font-bold text-gray-800">{selected.nama_ketua || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tanggal Kunjungan</span>
                                <span className="font-bold text-gray-800">{selected.visit_date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Jumlah Tiket</span>
                                <span className="font-bold text-gray-800">{selected.quantity} orang</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-black text-gray-700">Total</span>
                                <span className="font-black text-emerald-700">{formatRp(selected.total_price)}</span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-400 mb-4">
                            Tunjukkan QR Code ini kepada petugas di pintu masuk wisata
                        </p>

                        <button onClick={() => setSelected(null)}
                            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm transition-colors">
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}