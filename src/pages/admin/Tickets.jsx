import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

const statusColor = (s) => {
    switch (s) {
        case "confirmed": return "bg-emerald-100 text-emerald-700";
        case "pending":   return "bg-amber-100 text-amber-700";
        case "cancelled": return "bg-red-100 text-red-600";
        default:          return "bg-gray-100 text-gray-500";
    }
};

export default function AdminTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("semua");
    const [selectedTicket, setSelectedTicket] = useState(null);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/tickets");
            setTickets(res.data?.data || res.data || []);
        } catch { setTickets([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/admin/tickets/${id}/status`, { status });
            fetchTickets();
            if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status });
        } catch { alert("Gagal mengubah status."); }
    };

    const formatPrice = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
    const formatDate = (d) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

    const filtered = tickets.filter(t => {
        const s = search.toLowerCase();
        const matchSearch = !search ||
            t.ticket_code?.toLowerCase().includes(s) ||
            t.user?.name?.toLowerCase().includes(s) ||
            t.destination?.nama_wisata?.toLowerCase().includes(s);
        const matchStatus = filterStatus === "semua" || t.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalPendapatan = filtered.filter(t => t.status === "confirmed").reduce((a, t) => a + parseFloat(t.total_price || 0), 0);

    return (
        <AdminLayout title="Kelola Tiket">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Total Tiket", value: tickets.length, color: "text-gray-900" },
                    { label: "Confirmed", value: tickets.filter(t => t.status === "confirmed").length, color: "text-emerald-600" },
                    { label: "Pending", value: tickets.filter(t => t.status === "pending").length, color: "text-amber-600" },
                    { label: "Pendapatan (Confirmed)", value: formatPrice(tickets.filter(t => t.status === "confirmed").reduce((a, t) => a + parseFloat(t.total_price || 0), 0)), color: "text-emerald-700" },
                ].map(c => (
                    <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
                        <p className="text-xs text-gray-400 font-semibold mt-0.5">{c.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <input type="text" placeholder="Cari kode, nama pemesan, destinasi..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-emerald-500">
                        <option value="semua">Semua Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <span className="text-xs text-gray-400 font-semibold whitespace-nowrap">
                        {filtered.length} tiket
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 space-y-3">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-2">🎫</p>
                        <p className="text-sm">Tidak ada tiket ditemukan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    {["Kode Tiket", "Pemesan", "Destinasi", "Tgl Kunjungan", "Qty", "Total", "Status", "Aksi"].map(h => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">{t.ticket_code}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div>
                                                <p className="font-bold text-gray-800 text-xs">{t.user?.name || "-"}</p>
                                                <p className="text-gray-400 text-[10px]">{t.user?.email || ""}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600 text-xs max-w-[150px]">
                                            <p className="truncate">{t.destination?.nama_wisata || "-"}</p>
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(t.visit_date)}</td>
                                        <td className="px-5 py-3 text-center font-bold text-gray-700">{t.quantity}</td>
                                        <td className="px-5 py-3 font-bold text-gray-800 text-xs whitespace-nowrap">{formatPrice(t.total_price)}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusColor(t.status)}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => setSelectedTicket(t)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-colors border border-gray-200">
                                                    Detail
                                                </button>
                                                <select value={t.status}
                                                    onChange={e => handleStatusUpdate(t.id, e.target.value)}
                                                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-emerald-500">
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 p-5 text-white flex items-start justify-between">
                            <div>
                                <p className="text-emerald-200 text-[10px] font-black uppercase">Detail Tiket</p>
                                <h3 className="font-black text-lg mt-0.5">{selectedTicket.destination?.nama_wisata}</h3>
                                <span className="font-mono text-amber-300 text-xs">{selectedTicket.ticket_code}</span>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="text-white/60 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-3">
                            {[
                                { label: "Pemesan", value: selectedTicket.user?.name },
                                { label: "Email", value: selectedTicket.user?.email },
                                { label: "Tanggal Kunjungan", value: formatDate(selectedTicket.visit_date) },
                                { label: "Jumlah Tiket", value: `${selectedTicket.quantity} orang` },
                                { label: "Total Harga", value: formatPrice(selectedTicket.total_price) },
                                { label: "Dipesan pada", value: formatDate(selectedTicket.created_at) },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-800">{item.value || "-"}</span>
                                </div>
                            ))}

                            <div className="pt-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-2">Ubah Status</label>
                                <div className="flex gap-2">
                                    {["pending", "confirmed", "cancelled"].map(s => (
                                        <button key={s} onClick={() => handleStatusUpdate(selectedTicket.id, s)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${selectedTicket.status === s ? statusColor(s) + " ring-2 ring-offset-1 ring-current" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}