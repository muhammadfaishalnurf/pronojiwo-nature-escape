import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminDashboard() {
    const [stats, setStats] = useState({ total_destinasi: 0, total_tiket: 0, total_review: 0, total_pendapatan: 0 });
    const [recentTickets, setRecentTickets] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get("/admin/dashboard");
                const data = res.data;
                setStats(data.stats || {});
                setRecentTickets(data.recent_tickets || []);
                setChartData(data.chart_data || defaultChartData);
            } catch {
                setChartData(defaultChartData);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const defaultChartData = [
        { bulan: "Jan", tiket: 45, pendapatan: 900000 },
        { bulan: "Feb", tiket: 62, pendapatan: 1240000 },
        { bulan: "Mar", tiket: 78, pendapatan: 1560000 },
        { bulan: "Apr", tiket: 55, pendapatan: 1100000 },
        { bulan: "Mei", tiket: 91, pendapatan: 1820000 },
        { bulan: "Jun", tiket: 110, pendapatan: 2200000 },
    ];

    const statCards = [
        { label: "Total Destinasi", value: stats.total_destinasi || 6, icon: "🏔️", color: "from-emerald-500 to-teal-500", link: "/admin/destinasi" },
        { label: "Total Tiket Terjual", value: stats.total_tiket || 0, icon: "🎫", color: "from-amber-500 to-orange-500", link: "/admin/tiket" },
        { label: "Total Ulasan", value: stats.total_review || 0, icon: "💬", color: "from-violet-500 to-purple-500", link: "/admin/ulasan" },
        {
            label: "Total Pendapatan",
            value: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(stats.total_pendapatan || 0),
            icon: "💰",
            color: "from-blue-500 to-cyan-500",
            link: "/admin/tiket"
        },
    ];

    const statusColor = (status) => {
        switch (status) {
            case "confirmed": return "bg-emerald-100 text-emerald-700";
            case "pending":   return "bg-amber-100 text-amber-700";
            case "cancelled": return "bg-red-100 text-red-700";
            default:          return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <AdminLayout title="Dashboard">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 h-28 animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
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
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </div>
                                <p className="text-2xl font-black text-gray-900 leading-none mb-1">{card.value}</p>
                                <p className="text-xs text-gray-400 font-semibold">{card.label}</p>
                            </Link>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm mb-4">Tiket Terjual per Bulan</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="tiket" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm mb-4">Pendapatan per Bulan (Rp)</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => new Intl.NumberFormat("id-ID").format(v)} />
                                    <Line type="monotone" dataKey="pendapatan" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
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
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Tanggal</th>
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Total</th>
                                            <th className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {recentTickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 font-mono text-xs text-amber-600 font-bold">{ticket.ticket_code}</td>
                                                <td className="px-6 py-3 text-gray-700 font-medium">{ticket.user?.name || "-"}</td>
                                                <td className="px-6 py-3 text-gray-600">{ticket.destination?.nama_wisata || "-"}</td>
                                                <td className="px-6 py-3 text-gray-500 text-xs">{ticket.visit_date}</td>
                                                <td className="px-6 py-3 font-bold text-gray-800">
                                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(ticket.total_price)}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColor(ticket.status)}`}>
                                                        {ticket.status}
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