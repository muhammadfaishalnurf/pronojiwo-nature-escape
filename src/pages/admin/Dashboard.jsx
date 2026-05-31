import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminDashboard() {
    const [stats,         setStats]         = useState({ destinasi: null, total_tiket: 0, total_review: 0, total_pendapatan: 0 });
    const [recentTickets, setRecentTickets] = useState([]);
    const [chartData,     setChartData]     = useState(null); // null = belum load
    const [loading,       setLoading]       = useState(true);


    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res  = await api.get("/admin/dashboard");
                const data = res.data;
                setStats(data.stats || {});
                setRecentTickets(data.recent_tickets || []);
                // Pakai data API saja — jangan gabung dengan defaultChartData
                if (Array.isArray(data.chart_data) && data.chart_data.length > 0) {
                    setChartData(data.chart_data);
                } else {
                    setChartData([]);
                }
            } catch {
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const formatRp = (n) => new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0
    }).format(n || 0);

    // Kartu 1: nama destinasi yang dikelola (bukan jumlah)
    const statCards = [
        {
            label:   "Destinasi Dikelola",
            value:   stats.destinasi || "—",
            isText:  true, // flag: value adalah string (nama), bukan angka
            icon:    "🏔️",
            color:   "from-emerald-500 to-teal-500",
            link:    "/admin/destinasi",
        },
        {
            label:   "Total Tiket Terjual",
            value:   stats.total_tiket || 0,
            icon:    "🎫",
            color:   "from-amber-500 to-orange-500",
            link:    "/admin/tiket",
        },
        {
            label:   "Total Ulasan",
            value:   stats.total_review || 0,
            icon:    "💬",
            color:   "from-violet-500 to-purple-500",
            link:    "/admin/ulasan",
        },
        {
            label:   "Total Pendapatan",
            value:   formatRp(stats.total_pendapatan),
            isText:  true,
            icon:    "💰",
            color:   "from-blue-500 to-cyan-500",
            link:    "/admin/tiket",
        },
    ];

    const statusColor = (status) => ({
        confirmed: "bg-emerald-100 text-emerald-700",
        used:      "bg-gray-100 text-gray-500",
        pending:   "bg-amber-100 text-amber-700",
        cancelled: "bg-red-100 text-red-700",
    }[status] || "bg-gray-100 text-gray-600");

    const statusLabel = (status) => ({
        confirmed: "Aktif",
        used:      "Terpakai",
        pending:   "Pending",
        cancelled: "Batal",
    }[status] || status);

    return (
        <AdminLayout title="Dashboard">
            {loading || chartData === null ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 h-28 animate-pulse"/>
                    ))}
                </div>
            ) : (
                <>
                    {/* Warning kalau belum di-assign */}
                    {!stats.destinasi && (
                        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-semibold">
                            ⚠️ Akun Anda belum di-assign ke destinasi. Hubungi Super Admin.
                        </div>
                    )}

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((card) => (
                            <Link key={card.label} to={card.link}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                                        {card.icon}
                                    </div>
                                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
                                    </svg>
                                </div>
                                {/* Nama destinasi & pendapatan pakai teks lebih kecil supaya tidak overflow */}
                                <p className={`font-black text-gray-900 leading-tight mb-1 ${card.isText ? "text-sm" : "text-2xl"}`}>
                                    {card.value}
                                </p>
                                <p className="text-xs text-gray-400 font-semibold">{card.label}</p>
                            </Link>
                        ))}
                    </div>

                    {/* Breakdown Status Tiket */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Aktif",       value: stats.tiket_confirmed || 0, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                            { label: "Terpakai",    value: stats.tiket_used      || 0, color: "bg-gray-50 text-gray-500 border-gray-200" },
                            { label: "Pending",     value: stats.tiket_pending   || 0, color: "bg-amber-50 text-amber-700 border-amber-100" },
                            { label: "Dibatalkan",  value: stats.tiket_cancelled || 0, color: "bg-red-50 text-red-600 border-red-100" },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                                <p className="text-2xl font-black">{s.value}</p>
                                <p className="text-xs font-semibold mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm mb-4">Tiket Terjual per Bulan</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                    <XAxis dataKey="bulan" tick={{ fontSize: 11 }}/>
                                    <YAxis tick={{ fontSize: 11 }}/>
                                    <Tooltip/>
                                    <Bar dataKey="tiket" fill="#10b981" radius={[6, 6, 0, 0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm mb-4">Pendapatan per Bulan (Rp)</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={chartData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                    <XAxis dataKey="bulan" tick={{ fontSize: 11 }}/>
                                    <YAxis tick={{ fontSize: 11 }}/>
                                    <Tooltip formatter={(v) => new Intl.NumberFormat("id-ID").format(v)}/>
                                    <Line type="monotone" dataKey="pendapatan" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Tickets */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm">Tiket Terbaru</h3>
                            <Link to="/admin/tiket" className="text-xs text-emerald-600 font-bold hover:text-emerald-700">
                                Lihat Semua →
                            </Link>
                        </div>
                        {recentTickets.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-sm">
                                <p className="text-3xl mb-2">🎫</p>
                                Belum ada tiket masuk.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Kode</th>
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Pemesan</th>
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Destinasi</th>
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Kunjungan</th>
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Total</th>
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentTickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 font-mono text-xs text-amber-600 font-bold">{ticket.ticket_code}</td>
                                                <td className="px-6 py-3 text-gray-700 font-medium">{ticket.nama_ketua || ticket.user?.name || "—"}</td>
                                                <td className="px-6 py-3 text-gray-600 text-xs">{ticket.destination?.nama_wisata || "—"}</td>
                                                <td className="px-6 py-3 text-gray-500 text-xs">{ticket.visit_date}</td>
                                                <td className="px-6 py-3 font-bold text-gray-800 text-xs">{formatRp(ticket.total_price)}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColor(ticket.status)}`}>
                                                        {statusLabel(ticket.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}