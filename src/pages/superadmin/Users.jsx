import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

// Helper normalize roles — bisa array of string atau array of object
const getRoleName = (roles) => {
    if (!roles || roles.length === 0) return "user";
    const first = roles[0];
    return typeof first === "string" ? first : first?.name || "user";
};

export default function SuperAdminUsers() {
    const [users,        setUsers]        = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [modal,        setModal]        = useState(null);
    const [selected,     setSelected]     = useState(null);
    const [form,         setForm]         = useState({ name: "", email: "", password: "", role: "user", destination_id: "" });
    const [roleForm,     setRoleForm]     = useState({ role: "user", destination_id: "" });
    const [saving,       setSaving]       = useState(false);
    const [error,        setError]        = useState("");

    useEffect(() => {
        document.title = "Kelola Pengguna - Super Admin";
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [usersRes, destRes] = await Promise.all([
                api.get("/super-admin/users"),
                api.get("/destinations"),
            ]);
            setUsers(usersRes.data?.data || []);
            setDestinations(destRes.data?.data || []);
        } finally {
            setLoading(false);
        }
    };

    const openAdd  = () => { setForm({ name: "", email: "", password: "", role: "user", destination_id: "" }); setError(""); setModal("add"); };
    const openEdit = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, password: "", role: getRoleName(u.roles), destination_id: u.destination_id || "" }); setError(""); setModal("edit"); };
    const openRole = (u) => { setSelected(u); setRoleForm({ role: getRoleName(u.roles), destination_id: u.destination_id || "" }); setError(""); setModal("role"); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true); setError("");
        try {
            if (modal === "add") {
                await api.post("/super-admin/users", form);
            } else {
                await api.put(`/super-admin/users/${selected.id}`, form);
            }
            await fetchAll();
            setModal(null);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal menyimpan.");
        } finally {
            setSaving(false);
        }
    };

    const handleAssignRole = async (e) => {
        e.preventDefault();
        setSaving(true); setError("");
        try {
            await api.post(`/super-admin/users/${selected.id}/assign-role`, roleForm);
            await fetchAll();
            setModal(null);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal update role.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Hapus pengguna ini?")) return;
        try {
            await api.delete(`/super-admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menghapus.");
        }
    };

    const roleBadge = (roles) => {
        const role = getRoleName(roles);
        const map = {
            super_admin: "bg-purple-100 text-purple-700 border-purple-200",
            admin:       "bg-blue-100 text-blue-700 border-blue-200",
            user:        "bg-gray-100 text-gray-600 border-gray-200",
        };
        return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${map[role] || map.user}`}>{role}</span>;
    };

    return (
        <AdminLayout>
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Kelola Pengguna</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Atur akun, role, dan assign destinasi untuk admin</p>
                    </div>
                    <button onClick={openAdd}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                        + Tambah Pengguna
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Pengguna</th>
                                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Role</th>
                                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Destinasi (Admin)</th>
                                    <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{u.name}</p>
                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{roleBadge(u.roles)}</td>
                                        <td className="px-4 py-3">
                                            {getRoleName(u.roles) === "admin" ? (
                                                u.destination ? (
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                                        📍 {u.destination.nama_wisata}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-red-500 font-semibold">⚠️ Belum di-assign</span>
                                                )
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => openRole(u)}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                                    Set Role
                                                </button>
                                                <button onClick={() => openEdit(u)}
                                                    className="text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(u.id)}
                                                    className="text-xs font-bold text-red-600 hover:text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
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

            {/* Modal Add/Edit */}
            {(modal === "add" || modal === "edit") && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-black text-gray-900 mb-4">{modal === "add" ? "Tambah Pengguna" : "Edit Pengguna"}</h3>
                        {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">{error}</div>}
                        <form onSubmit={handleSave} className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nama</label>
                                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                                    Password {modal === "edit" && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                                    {...(modal === "add" ? {required: true} : {})}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"/>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal(null)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm disabled:opacity-60">
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Set Role + Assign Destinasi */}
            {modal === "role" && selected && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-black text-gray-900 mb-1">Set Role Pengguna</h3>
                        <p className="text-sm text-gray-400 mb-4">{selected.name} · {selected.email}</p>
                        {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">{error}</div>}
                        <form onSubmit={handleAssignRole} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Role</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["user", "admin", "super_admin"].map(r => (
                                        <button key={r} type="button"
                                            onClick={() => setRoleForm({...roleForm, role: r, destination_id: r !== "admin" ? "" : roleForm.destination_id})}
                                            className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${roleForm.role === r ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                                            {r === "super_admin" ? "Super Admin" : r === "admin" ? "Admin" : "User"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {roleForm.role === "admin" && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                                        Assign Destinasi <span className="text-red-400">*</span>
                                    </label>
                                    <p className="text-xs text-gray-400 mb-2">Admin hanya bisa kelola data destinasi yang di-assign.</p>
                                    <select value={roleForm.destination_id}
                                        onChange={e => setRoleForm({...roleForm, destination_id: e.target.value})}
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 bg-white">
                                        <option value="">-- Pilih Destinasi --</option>
                                        {destinations.map(d => (
                                            <option key={d.id} value={d.id}>{d.nama_wisata}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setModal(null)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm disabled:opacity-60">
                                    {saving ? "Menyimpan..." : "Simpan Role"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}