import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

export default function AdminTickets() {
    const [tickets,  setTickets]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [updating, setUpdating] = useState(null);

    // State untuk popup konfirmasi batalkan
    const [cancelConfirm, setCancelConfirm] = useState(null); // ticket object atau null

    useEffect(() => {
        document.title = "Manajemen Tiket - Admin";
        api.get("/admin/tickets")
            .then(res => setTickets(res.data?.data || []))
            .finally(() => setLoading(false));
    }, []);

    const formatRp = n => new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0
    }).format(n || 0);

    const statusBadge = (status) => {
        const map = {
            confirmed: { label: "Aktif",     color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
            pending:   { label: "Pending",   color: "bg-amber-100 text-amber-700 border-amber-200" },
            cancelled: { label: "Dibatalkan",color: "bg-red-100 text-red-700 border-red-200" },
            used:      { label: "Terpakai",  color: "bg-gray-100 text-gray-500 border-gray-200" },
        };
        const s = map[status] || map.pending;
        return <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>;
    };

    const handleStatusChange = async (ticket, newStatus) => {
        setUpdating(ticket.id);
        try {
            const res = await api.patch(`/admin/tickets/${ticket.id}/status`, { status: newStatus });
            setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, ...res.data.data } : t));
        } catch (err) {
            alert(err.response?.data?.message || "Gagal update status.");
        } finally {
            setUpdating(null);
            setCancelConfirm(null);
        }
    };

    // Tombol aksi berdasarkan status
    const renderActions = (ticket) => {
        if (ticket.status === "used") {
            return <span className="text-xs text-gray-400 italic">Selesai dipakai</span>;
        }
        if (ticket.status === "cancelled") {
            return <span className="text-xs text-gray-400 italic">Sudah dibatalkan</span>;
        }
        return (
            <div className="flex gap-2 flex-wrap">
                {ticket.status === "pending" && (
                    <button
                        disabled={updating === ticket.id}
                        onClick={() => handleStatusChange(ticket, "confirmed")}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-500 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {updating === ticket.id ? "..." : "✓ Konfirmasi"}
                    </button>
                )}
                {(ticket.status === "pending" || ticket.status === "confirmed") && (
                    <button
                        disabled={updating === ticket.id}
                        onClick={() => setCancelConfirm(ticket)}
                        className="text-xs font-bold text-red-600 hover:text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        Batalkan
                    </button>
                )}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-900">Manajemen Tiket</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Daftar semua tiket di destinasi Anda</p>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_,i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-3">🎫</p>
                        <p className="text-gray-500">Belum ada tiket.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Kode Tiket</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Pemesan</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Destinasi</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Kunjungan</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Total</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Status</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tickets.map(ticket => (
                                        <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-mono font-bold text-gray-900 text-xs">{ticket.ticket_code}</p>
                                                <p className="text-xs text-gray-400">{ticket.quantity} orang</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-gray-800">{ticket.nama_ketua || ticket.user?.name || "-"}</p>
                                                <p className="text-xs text-gray-400">{ticket.user?.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-gray-700 text-xs">{ticket.destination?.nama_wisata || "-"}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-gray-700 text-xs">{ticket.visit_date}</p>
                                                {ticket.status === "used" && ticket.used_at && (
                                                    <p className="text-xs text-gray-400">
                                                        ✓ {new Date(ticket.used_at).toLocaleDateString("id-ID")}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-emerald-700 text-xs">{formatRp(ticket.total_price)}</p>
                                            </td>
                                            <td className="px-4 py-3">{statusBadge(ticket.status)}</td>
                                            <td className="px-4 py-3">{renderActions(ticket)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ── POPUP KONFIRMASI BATALKAN ── */}
            {cancelConfirm && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setCancelConfirm(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}>

                        {/* Icon peringatan */}
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">⚠️</span>
                        </div>

                        <h3 className="font-black text-gray-900 text-lg text-center mb-1">
                            Batalkan Tiket?
                        </h3>
                        <p className="text-gray-500 text-sm text-center mb-2">
                            Tindakan ini tidak dapat diurungkan.
                        </p>

                        {/* Info tiket */}
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Kode Tiket</span>
                                <span className="font-mono font-bold text-gray-800">{cancelConfirm.ticket_code}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Pemesan</span>
                                <span className="font-bold text-gray-800">{cancelConfirm.nama_ketua || cancelConfirm.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Destinasi</span>
                                <span className="font-bold text-gray-800">{cancelConfirm.destination?.nama_wisata}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total</span>
                                <span className="font-bold text-red-600">{formatRp(cancelConfirm.total_price)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelConfirm(null)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                Tidak, Kembali
                            </button>
                            <button
                                disabled={updating === cancelConfirm.id}
                                onClick={() => handleStatusChange(cancelConfirm, "cancelled")}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-black text-sm transition-colors">
                                {updating === cancelConfirm.id ? "Membatalkan..." : "Ya, Batalkan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}