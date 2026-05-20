import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#8b5cf6", "#3b82f6"];

export default function SADashboard() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await api.get("/super-admin/dashboard");
            setStats(res.data.stats || {});        // ← ambil .stats
            setChartData(res.data.chart_data || defaultChartData);
        } catch {
            setChartData(defaultChartData);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
    }, []);

    const statCards = [
        { label: "Total Pengguna", value: stats.total_users || 0, icon: "👥", color: "from-violet-500 to-purple-600" },
        { label: "Total Destinasi", value: stats.total_destinasi || 0, icon: "🏔️", color: "from-emerald-500 to-teal-600" },
        { label: "Total Tiket", value: stats.total_tiket || 0, icon: "🎫", color: "from-amber-500 to-orange-500" },
        { label: "Total Pendapatan", value: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(stats.total_pendapatan || 0), icon: "💰", color: "from-blue-500 to-cyan-500" },
    ];

    const roleData = [
        { name: "User", value: stats.total_users_role || 0 },
        { name: "Admin", value: stats.total_admins || 0 },
        { name: "Super Admin", value: stats.total_super_admins || 1 },
    ];

    const chartData = stats.chart_data || [
        { bulan: "Jan", pengguna: 12, tiket: 45 },
        { bulan: "Feb", pengguna: 18, tiket: 62 },
        { bulan: "Mar", pengguna: 25, tiket: 78 },
        { bulan: "Apr", pengguna: 20, tiket: 55 },
        { bulan: "Mei", pengguna: 35, tiket: 91 },
        { bulan: "Jun", pengguna: 42, tiket: 110 },
    ];

    return (
        <AdminLayout title="Super Admin Dashboard">
            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />)}
                </div>
            ) : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map(c => (
                            <div key={c.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-2xl shadow-md mb-4`}>{c.icon}</div>
                                <p className="text-2xl font-black text-gray-900 leading-none mb-1">{c.value}</p>
                                <p className="text-xs text-gray-400 font-semibold">{c.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm mb-4">Pertumbuhan Pengguna & Tiket</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="pengguna" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Pengguna" />
                                    <Bar dataKey="tiket" fill="#10b981" radius={[6, 6, 0, 0]} name="Tiket" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 text-sm mb-4">Distribusi Role</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={roleData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                                        {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-3 mt-2 justify-center">
                                {roleData.map((r, i) => (
                                    <div key={r.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                                        {r.name}: {r.value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Kelola Pengguna & Role", desc: "Tambah, edit, dan atur role pengguna", icon: "👥", link: "/super-admin/pengguna", color: "emerald" },
                            { label: "Kelola Destinasi", desc: "CRUD data wisata Pronojiwo", icon: "🏔️", link: "/admin/destinasi", color: "amber" },
                            { label: "Pengaturan Sistem", desc: "Konfigurasi nama app, kontak, dsb", icon: "⚙️", link: "/super-admin/pengaturan", color: "violet" },
                        ].map(q => (
                            <a key={q.label} href={q.link}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center text-2xl transition-colors flex-shrink-0">{q.icon}</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{q.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{q.desc}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}