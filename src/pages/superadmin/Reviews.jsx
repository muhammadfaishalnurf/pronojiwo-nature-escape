import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

const TANGGAL_OPTIONS = [
    "Baru saja", "1 hari yang lalu", "2 hari yang lalu",
    "3 hari yang lalu", "1 minggu yang lalu", "2 minggu yang lalu",
    "3 minggu yang lalu", "1 bulan yang lalu", "2 bulan yang lalu",
    "3 bulan yang lalu", "6 bulan yang lalu", "1 tahun yang lalu",
];

const emptyForm = {
    nama: "", destination_id: "", rating: 5, ulasan: "", tanggal_label: "1 minggu yang lalu"
};

export default function SuperAdminReviews() {
    const [reviews,      setReviews]      = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [modal,        setModal]        = useState(false);
    const [editData,     setEditData]     = useState(null);
    const [form,         setForm]         = useState(emptyForm);
    const [saving,       setSaving]       = useState(false);
    const [error,        setError]        = useState("");
    const [search,       setSearch]       = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        document.title = "Kelola Ulasan - Super Admin";
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [revRes, destRes] = await Promise.all([
                api.get("/super-admin/reviews"),
                api.get("/destinations"),
            ]);
            setReviews(revRes.data?.data || []);
            setDestinations(destRes.data?.data || []);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditData(null);
        setForm(emptyForm);
        setError("");
        setModal(true);
    };

    const openEdit = (r) => {
        setEditData(r);
        setForm({
            nama:          r.nama_display || r.nama || "",
            destination_id:String(r.destination_id || ""),
            rating:        r.rating || 5,
            ulasan:        r.ulasan || "",
            tanggal_label: r.tanggal_label || "1 minggu yang lalu",
        });
        setError("");
        setModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true); setError("");
        try {
            if (editData) {
                await api.put(`/super-admin/reviews/${editData.id}`, form);
            } else {
                await api.post("/super-admin/reviews", form);
            }
            await fetchAll();
            setModal(false);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan ulasan.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/super-admin/reviews/${id}`);
            setReviews(prev => prev.filter(r => r.id !== id));
            setDeleteConfirm(null);
        } catch {
            alert("Gagal menghapus ulasan.");
        }
    };

    const filtered = reviews.filter(r =>
        !search ||
        (r.nama_display || r.nama || "").toLowerCase().includes(search.toLowerCase()) ||
        r.destination?.nama_wisata?.toLowerCase().includes(search.toLowerCase()) ||
        r.ulasan?.toLowerCase().includes(search.toLowerCase())
    );

    const StarInput = ({ value, onChange }) => (
        <div className="flex gap-1">
            {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => onChange(s)}
                    className={`text-2xl transition-transform hover:scale-110 ${s <= value ? "text-amber-400" : "text-gray-200"}`}>
                    ★
                </button>
            ))}
        </div>
    );

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Kelola Ulasan</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Input ulasan manual dari Google Maps atau sumber lain</p>
                    </div>
                    <button onClick={openAdd}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                        + Tambah Ulasan
                    </button>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <div className="relative max-w-sm">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                        </svg>
                        <input type="text" placeholder="Cari nama, destinasi, ulasan..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"/>
                    </div>
                </div>

                {/* Tabel */}
                {loading ? (
                    <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-4xl mb-3">💬</p>
                        <p className="text-gray-400 text-sm">Belum ada ulasan.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Nama</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Destinasi</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Rating</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Ulasan</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                                                    {(r.nama_display || "?").charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-800">{r.nama_display}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">
                                            {r.destination?.nama_wisata || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-0.5">
                                                {[1,2,3,4,5].map(s => (
                                                    <span key={s} className={`text-sm ${s <= r.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs">
                                            <p className="text-gray-600 text-xs line-clamp-2">{r.ulasan}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                                            {r.tanggal_label || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(r)}
                                                    className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => setDeleteConfirm(r)}
                                                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modal Tambah/Edit ── */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}>

                        <h3 className="font-black text-gray-900 text-lg mb-4">
                            {editData ? "Edit Ulasan" : "Tambah Ulasan"}
                        </h3>

                        {error && (
                            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">{error}</div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Nama */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nama Pengulas</label>
                                <input type="text" value={form.nama}
                                    onChange={e => setForm({...form, nama: e.target.value})}
                                    placeholder="cth: Budi Santoso" required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"/>
                            </div>

                            {/* Destinasi */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Destinasi yang Dikunjungi</label>
                                <select value={form.destination_id}
                                    onChange={e => setForm({...form, destination_id: e.target.value})}
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 bg-white">
                                    <option value="">-- Pilih Destinasi --</option>
                                    {destinations.map(d => (
                                        <option key={d.id} value={d.id}>{d.nama_wisata}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Rating</label>
                                <StarInput value={form.rating} onChange={v => setForm({...form, rating: v})}/>
                                <p className="text-xs text-gray-400 mt-1">{form.rating} dari 5 bintang</p>
                            </div>

                            {/* Ulasan */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Isi Ulasan</label>
                                <textarea rows="4" value={form.ulasan}
                                    onChange={e => setForm({...form, ulasan: e.target.value})}
                                    placeholder="Tuliskan ulasan pengunjung..." required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 resize-none"/>
                            </div>

                            {/* Tanggal label */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Keterangan Waktu</label>
                                <select value={form.tanggal_label}
                                    onChange={e => setForm({...form, tanggal_label: e.target.value})}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 bg-white">
                                    {TANGGAL_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Pilih sesuai kapan ulasan dibuat di Google Maps</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm disabled:opacity-60">
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Konfirmasi Hapus ── */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🗑️</span>
                        </div>
                        <h3 className="font-black text-gray-900 text-center mb-1">Hapus Ulasan?</h3>
                        <p className="text-gray-500 text-sm text-center mb-4">
                            Ulasan dari <span className="font-bold">{deleteConfirm.nama_display}</span> akan dihapus permanen.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">
                                Batal
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm.id)}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}