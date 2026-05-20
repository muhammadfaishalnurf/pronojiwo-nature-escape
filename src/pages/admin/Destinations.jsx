import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

const emptyForm = {
    nama_wisata: "", deskripsi: "", lokasi_rute: "",
    harga_tiket: "", kapasitas: "", is_active: true, foto: null
};

export default function AdminDestinations() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const fileRef = useRef(null);

    const fetchDestinations = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/destinations");
            setDestinations(res.data?.data || res.data || []);
        } catch { setDestinations([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDestinations(); }, []);

    const openAdd = () => {
        setEditData(null);
        setForm(emptyForm);
        setPreview(null);
        setModal(true);
    };

    const openEdit = (d) => {
        setEditData(d);
        setForm({
            nama_wisata: d.nama_wisata || "",
            deskripsi: d.deskripsi || "",
            lokasi_rute: d.lokasi_rute || "",
            harga_tiket: d.harga_tiket || "",
            kapasitas: d.kapasitas || "",
            is_active: d.is_active ?? true,
            foto: null
        });
        setPreview(d.foto || null);
        setModal(true);
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setForm({ ...form, foto: file });
        setPreview(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append("nama_wisata", form.nama_wisata);
            fd.append("deskripsi", form.deskripsi || "");
            fd.append("lokasi_rute", form.lokasi_rute || "");
            fd.append("harga_tiket", form.harga_tiket);
            fd.append("kapasitas", form.kapasitas);
            fd.append("is_active", form.is_active ? "1" : "0");
            if (form.foto) {
                fd.append("foto", form.foto); // file object langsung
            }

            if (editData) {
                fd.append("_method", "PUT");
                
                await api.post(`/admin/destinations/${editData.id}`, fd);
            } else {
                await api.post("/admin/destinations", fd);
            }
            setModal(false);
            fetchDestinations();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menyimpan.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus destinasi ini?")) return;
        try {
            await api.delete(`/admin/destinations/${id}`);
            fetchDestinations();
        } catch { alert("Gagal menghapus."); }
    };

    const filtered = destinations.filter(d =>
        !search || d.nama_wisata?.toLowerCase().includes(search.toLowerCase()) ||
        d.lokasi_rute?.toLowerCase().includes(search.toLowerCase())
    );

    const formatPrice = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

    return (
        <AdminLayout title="Kelola Destinasi">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                    <input type="text" placeholder="Cari nama atau lokasi destinasi..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 max-w-sm" />
                    <button onClick={openAdd}
                        className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-md shadow-emerald-700/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Tambah Destinasi
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="p-8">
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-3">🏔️</p>
                        <p className="font-semibold">Belum ada destinasi.</p>
                        <button onClick={openAdd} className="mt-4 px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-sm">Tambah Sekarang</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase">Foto</th>
                                    <th className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase">Nama Wisata</th>
                                    <th className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase">Lokasi</th>
                                    <th className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase">Harga</th>
                                    <th className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase">Kapasitas</th>
                                    <th className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase">Status</th>
                                    <th className="text-left px-5 py-3 text-xs font-black text-gray-400 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                {d.foto ? (
                                                    <img src={d.foto.startsWith("http") ? d.foto : `/storage/${d.foto}`}
                                                        alt={d.nama_wisata} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🏔️</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 font-bold text-gray-900 max-w-[180px]">
                                            <p className="truncate">{d.nama_wisata}</p>
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 text-xs max-w-[140px]">
                                            <p className="truncate">{d.lokasi_rute}</p>
                                        </td>
                                        <td className="px-5 py-3 font-bold text-emerald-700 text-xs whitespace-nowrap">{formatPrice(d.harga_tiket)}</td>
                                        <td className="px-5 py-3 text-gray-600 text-xs">{d.kapasitas}/hari</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${d.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                                {d.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(d)}
                                                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(d.id)}
                                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors">
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

            {/* Modal Form */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <h3 className="font-black text-gray-900">{editData ? "Edit Destinasi" : "Tambah Destinasi Baru"}</h3>
                            <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>

                        <form onSubmit={handleSave} className="overflow-y-auto flex-1">
                            <div className="p-6 space-y-4">

                                {/* Foto Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Foto Destinasi</label>
                                    <div className="relative">
                                        {preview ? (
                                            <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200 group">
                                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => fileRef.current.click()}
                                                        className="px-4 py-2 rounded-xl bg-white text-gray-900 font-bold text-xs">
                                                        Ganti Foto
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={() => fileRef.current.click()}
                                                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center text-xl transition-colors">📷</div>
                                                <p className="text-sm text-gray-400 font-semibold">Klik untuk upload foto</p>
                                                <p className="text-xs text-gray-300">JPG, PNG, WEBP — Maks 2MB</p>
                                            </button>
                                        )}
                                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                                    </div>
                                </div>

                                {/* Nama */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nama Wisata <span className="text-red-400">*</span></label>
                                    <input type="text" value={form.nama_wisata} required
                                        onChange={e => setForm({ ...form, nama_wisata: e.target.value })}
                                        placeholder="cth: Air Terjun Tumpak Sewu"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                </div>

                                {/* Deskripsi */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Deskripsi</label>
                                    <textarea rows="3" value={form.deskripsi}
                                        onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                                        placeholder="Deskripsikan keindahan destinasi ini..."
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none" />
                                </div>

                                {/* Lokasi */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Lokasi / Rute</label>
                                    <input type="text" value={form.lokasi_rute}
                                        onChange={e => setForm({ ...form, lokasi_rute: e.target.value })}
                                        placeholder="cth: Desa Sidomulyo, Pronojiwo"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                </div>

                                {/* Harga & Kapasitas */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Harga Tiket (Rp) <span className="text-red-400">*</span></label>
                                        <input type="number" value={form.harga_tiket} required min="0"
                                            onChange={e => setForm({ ...form, harga_tiket: e.target.value })}
                                            placeholder="20000"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Kapasitas/Hari <span className="text-red-400">*</span></label>
                                        <input type="number" value={form.kapasitas} required min="1"
                                            onChange={e => setForm({ ...form, kapasitas: e.target.value })}
                                            placeholder="100"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                    </div>
                                </div>

                                {/* Status toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">Status Destinasi</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Destinasi nonaktif tidak tampil di halaman publik</p>
                                    </div>
                                    <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.is_active ? "bg-emerald-500" : "bg-gray-300"}`}>
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${form.is_active ? "translate-x-7" : "translate-x-1"}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Footer buttons */}
                            <div className="px-6 pb-6 flex gap-3">
                                <button type="button" onClick={() => setModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                    {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                                    {saving ? "Menyimpan..." : "Simpan Destinasi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}