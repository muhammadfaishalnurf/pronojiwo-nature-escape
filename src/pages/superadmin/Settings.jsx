import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

export default function SASettings() {
    const [form, setForm] = useState({ app_name: "Pronojiwo Nature Escape", contact_phone: "", contact_email: "", contact_address: "", about_text: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get("/super-admin/settings");
                if (res.data) setForm(prev => ({ ...prev, ...res.data }));
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put("/super-admin/settings", form);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch { alert("Gagal menyimpan pengaturan."); }
        finally { setSaving(false); }
    };

    const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

    return (
        <AdminLayout title="Pengaturan Sistem">
            {loading ? (
                <div className="bg-white rounded-2xl p-8 animate-pulse h-64" />
            ) : (
                <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                    {saved && (
                        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                            ✅ Pengaturan berhasil disimpan!
                        </div>
                    )}

                    {/* App Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-black text-gray-900 text-sm border-b border-gray-100 pb-3">Informasi Aplikasi</h3>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nama Aplikasi</label>
                            <input type="text" value={form.app_name} onChange={e => setForm({...form, app_name: e.target.value})} className={inputClass} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tentang Aplikasi</label>
                            <textarea rows="3" value={form.about_text} onChange={e => setForm({...form, about_text: e.target.value})}
                                className={`${inputClass} resize-none`} placeholder="Deskripsi singkat tentang aplikasi..." />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-black text-gray-900 text-sm border-b border-gray-100 pb-3">Informasi Kontak</h3>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nomor Telepon / WhatsApp</label>
                            <input type="text" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})}
                                placeholder="+62 812-3456-7890" className={inputClass} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email Kontak</label>
                            <input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})}
                                placeholder="hello@pronojiwonature.id" className={inputClass} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Alamat Lengkap</label>
                            <textarea rows="2" value={form.contact_address} onChange={e => setForm({...form, contact_address: e.target.value})}
                                placeholder="Kecamatan Pronojiwo, Lumajang..." className={`${inputClass} resize-none`} />
                        </div>
                    </div>

                    <button type="submit" disabled={saving}
                        className="px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wider shadow-lg transition-all disabled:opacity-60">
                        {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                    </button>
                </form>
            )}
        </AdminLayout>
    );
}