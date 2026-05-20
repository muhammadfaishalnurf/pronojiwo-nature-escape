import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";

const statusColor = (s) => {
    switch (s) {
        case "confirmed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "pending":   return "bg-amber-100 text-amber-700 border-amber-200";
        case "cancelled": return "bg-red-100 text-red-600 border-red-200";
        default:          return "bg-gray-100 text-gray-600 border-gray-200";
    }
};

const statusIcon = (s) => {
    switch (s) {
        case "confirmed": return "✅";
        case "pending":   return "⏳";
        case "cancelled": return "❌";
        default:          return "🎫";
    }
};

export default function MyTickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("semua");
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        document.title = "Tiket Saya - Pronojiwo Nature Escape";
        const fetch = async () => {
            try {
                const res = await api.get("/tickets");
                setTickets(res.data?.data || res.data || []);
            } catch {
                setTickets([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const formatPrice = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
    const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

    const tabs = [
        { key: "semua", label: "Semua" },
        { key: "confirmed", label: "Confirmed" },
        { key: "pending", label: "Pending" },
        { key: "cancelled", label: "Dibatalkan" },
    ];

    const filtered = activeTab === "semua" ? tickets : tickets.filter(t => t.status === activeTab);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-950 to-gray-950 pt-16 pb-10 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-emerald-400 text-sm font-bold mb-6 hover:text-emerald-300 transition-colors">
                        ← Kembali ke Beranda
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-xl">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">Tiket Saya</h1>
                            <p className="text-white/50 text-sm mt-0.5">{user?.name} · {tickets.length} total pemesanan</p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                            { label: "Total Tiket", value: tickets.length, color: "text-white" },
                            { label: "Confirmed", value: tickets.filter(t => t.status === "confirmed").length, color: "text-emerald-400" },
                            { label: "Pending", value: tickets.filter(t => t.status === "pending").length, color: "text-amber-400" },
                        ].map(s => (
                            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-white/40 text-xs mt-0.5 font-semibold">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeTab === t.key
                                ? "bg-emerald-800 text-white shadow-md"
                                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
                            {t.label}
                            {t.key !== "semua" && (
                                <span className="ml-1.5 text-[10px] opacity-70">
                                    ({tickets.filter(x => t.key === "semua" || x.status === t.key).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Ticket List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-5xl mb-4">🎫</p>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">Belum Ada Tiket</h3>
                        <p className="text-gray-400 text-sm mb-6">Yuk pesan tiket wisata Pronojiwo sekarang!</p>
                        <Link to="/#tiket"
                            className="inline-block px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm transition-colors">
                            Pesan Tiket Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((ticket) => (
                            <div key={ticket.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                                {/* Top stripe by status */}
                                <div className={`h-1 w-full ${ticket.status === "confirmed" ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                    : ticket.status === "pending" ? "bg-gradient-to-r from-amber-400 to-orange-400"
                                    : "bg-gradient-to-r from-red-400 to-rose-400"}`} />

                                <div className="p-5 flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2.5 mb-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusColor(ticket.status)}`}>
                                                {statusIcon(ticket.status)} {ticket.status}
                                            </span>
                                            <span className="font-mono text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-lg">
                                                {ticket.ticket_code}
                                            </span>
                                        </div>

                                        <h3 className="font-black text-gray-900 text-base leading-tight mb-1">
                                            {ticket.destination?.nama_wisata || "Destinasi Wisata"}
                                        </h3>
                                        <p className="text-gray-400 text-xs flex items-center gap-1">
                                            📍 {ticket.destination?.lokasi_rute || "Pronojiwo, Lumajang"}
                                        </p>

                                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Tanggal Kunjungan</p>
                                                <p className="font-bold text-gray-800 text-xs mt-0.5">{formatDate(ticket.visit_date)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Jumlah Tiket</p>
                                                <p className="font-bold text-gray-800 text-xs mt-0.5">{ticket.quantity} orang</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Total Bayar</p>
                                                <p className="font-black text-emerald-700 text-sm mt-0.5">{formatPrice(ticket.total_price)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={() => setSelectedTicket(ticket)}
                                        className="flex-shrink-0 px-4 py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 hover:border-emerald-200 text-xs font-bold transition-all">
                                        Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        {/* Ticket header */}
                        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 p-6 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-emerald-200 text-[10px] font-black uppercase tracking-wider">E-Tiket Wisata</p>
                                    <h3 className="font-black text-xl mt-0.5">{selectedTicket.destination?.nama_wisata}</h3>
                                    <p className="text-emerald-200 text-xs mt-1">📍 {selectedTicket.destination?.lokasi_rute}</p>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="text-white/60 hover:text-white text-xl leading-none">✕</button>
                            </div>
                        </div>

                        {/* Ticket body */}
                        <div className="p-6">
                            {/* Dashed border separator */}
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-5 h-5 rounded-full bg-gray-100 -ml-9" />
                                <div className="flex-1 border-t-2 border-dashed border-gray-200" />
                                <div className="w-5 h-5 rounded-full bg-gray-100 -mr-9" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-5">
                                {[
                                    { label: "Kode Tiket", value: selectedTicket.ticket_code, mono: true },
                                    { label: "Status", value: selectedTicket.status.toUpperCase(), badge: true },
                                    { label: "Tanggal Kunjungan", value: formatDate(selectedTicket.visit_date) },
                                    { label: "Jumlah Tiket", value: `${selectedTicket.quantity} Orang` },
                                    { label: "Harga Satuan", value: formatPrice(selectedTicket.total_price / selectedTicket.quantity) },
                                    { label: "Total Pembayaran", value: formatPrice(selectedTicket.total_price), highlight: true },
                                    { label: "Tanggal Pemesanan", value: formatDate(selectedTicket.created_at) },
                                ].map(item => (
                                    <div key={item.label} className={item.highlight ? "col-span-2 bg-emerald-50 rounded-xl p-3" : ""}>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{item.label}</p>
                                        {item.badge ? (
                                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusColor(selectedTicket.status)}`}>
                                                {statusIcon(selectedTicket.status)} {item.value}
                                            </span>
                                        ) : (
                                            <p className={`mt-0.5 font-black ${item.mono ? "font-mono text-amber-600 text-sm" : item.highlight ? "text-emerald-700 text-base" : "text-gray-800 text-sm"}`}>
                                                {item.value}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Mock QR */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div>
                                    <p className="text-xs font-bold text-gray-500">Tunjukkan ke petugas</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Powered by E-Pronojiwo</p>
                                </div>
                                <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 p-1.5 flex items-center justify-center">
                                    <div className="grid grid-cols-5 gap-0.5 w-full h-full">
                                        {[...Array(25)].map((_, i) => (
                                            <div key={i} className={`rounded-sm ${(i % 3 === 0 || i % 7 === 1) ? "bg-gray-900" : "bg-transparent"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => window.print()}
                                className="w-full mt-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm transition-colors">
                                🖨️ Cetak Tiket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}