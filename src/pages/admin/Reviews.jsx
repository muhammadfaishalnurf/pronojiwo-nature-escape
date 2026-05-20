import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/reviews");
            setReviews(res.data?.data || res.data || []);
        } catch { setReviews([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReviews(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus ulasan ini?")) return;
        try {
            await api.delete(`/admin/reviews/${id}`);
            fetchReviews();
        } catch { alert("Gagal menghapus ulasan."); }
    };

    return (
        <AdminLayout title="Kelola Ulasan">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 text-sm">Semua Ulasan Pengunjung</h3>
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-2">💬</p>
                        <p className="text-sm">Belum ada ulasan.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {reviews.map((r) => (
                            <div key={r.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-start justify-between gap-4">
                                <div className="flex gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                                        {(r.user?.name || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="font-bold text-sm text-gray-900">{r.user?.name || "Anonim"}</span>
                                            <span className="text-[10px] text-gray-400">·</span>
                                            <span className="text-xs text-emerald-600 font-semibold">{r.destination?.nama_wisata || "Wisata"}</span>
                                            <span className="text-[10px] text-gray-400">·</span>
                                            <span className="text-amber-500 text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{r.ulasan}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(r.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors flex-shrink-0">
                                    Hapus
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}