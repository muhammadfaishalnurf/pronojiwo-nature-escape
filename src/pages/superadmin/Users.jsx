import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

const ROLES = ["user", "admin", "super_admin"];
// Tambahkan di atas function SAUsers()
const getRole = (user) => {
    const r = user.roles?.[0];
    return typeof r === "string" ? r : (r?.name || "user");
};

export default function SAUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
    const [saving, setSaving] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/super-admin/users");
            const data = res.data?.data || res.data || [];
            // Normalisasi roles dari objek → string
            const normalized = data.map(u => ({
                ...u,
                roles: Array.isArray(u.roles)
                    ? u.roles.map(r => typeof r === "string" ? r : r.name)
                    : []
            }));
            setUsers(normalized);
        } catch { setUsers([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openAdd = () => { setEditUser(null); setForm({ name: "", email: "", password: "", role: "user" }); setModal(true); };
    const openEdit = (u) => {
        setEditUser(u);
        setForm({
            name: u.name,
            email: u.email,
            password: "",
            role: getRole(u)  // ← pakai helper getRole
        });
        setModal(true);
    };
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editUser) {
                await api.put(`/super-admin/users/${editUser.id}`, { name: form.name, email: form.email, ...(form.password && { password: form.password }) });
                await api.post(`/super-admin/users/${editUser.id}/assign-role`, { role: form.role });
            } else {
                const res = await api.post("/super-admin/users", form);
                await api.post(`/super-admin/users/${res.data?.data?.id || res.data?.id}/assign-role`, { role: form.role });
            }
            setModal(false);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menyimpan.");
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus pengguna ini?")) return;
        try {
            await api.delete(`/super-admin/users/${id}`);
            fetchUsers();
        } catch { alert("Gagal menghapus."); }
    };

    const roleColor = (role) => {
        switch (role) {
            case "super_admin": return "bg-violet-100 text-violet-700";
            case "admin": return "bg-amber-100 text-amber-700";
            default: return "bg-emerald-100 text-emerald-700";
        }
    };

    const filtered = users.filter(u =>
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout title="Kelola Pengguna">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                    <input type="text" placeholder="Cari nama atau email..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 max-w-sm" />
                    <button onClick={openAdd}
                        className="px-4 py-2 rounded-xl bg-violet-700 hover:bg-violet-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors">
                        + Tambah Pengguna
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Memuat data...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-4xl mb-2">👥</p>
                        <p className="text-sm">Tidak ada pengguna ditemukan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    {["#", "Nama", "Email", "Role", "Bergabung", "Aksi"].map(h => (
                                        <th key={h} className="text-left px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((u, i) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 text-gray-400 text-xs">{i + 1}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-gray-800">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500 text-xs">{u.email}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${roleColor((getRole(u)))}`}>
                                                {typeof (getRole(u)) === "string" ? (getRole(u)) : (getRole(u))?.name || "user"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-400 text-xs">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "-"}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openEdit(u)}
                                                    className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(u.id)}
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

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-black text-gray-900">{editUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
                            <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                    Password {editUser && <span className="text-gray-400 normal-case font-normal">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    required={!editUser} placeholder={editUser ? "Kosongkan jika tidak diubah" : ""}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 bg-white">
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white font-bold text-sm transition-colors disabled:opacity-60">
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}