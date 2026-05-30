import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

export default function AdminTicketScanner() {
    const [mode,       setMode]       = useState("manual");
    const [inputCode,  setInputCode]  = useState("");
    const [scanResult, setScanResult] = useState(null);
    const [loading,    setLoading]    = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [message,    setMessage]    = useState(null);
    const [cameraOn,   setCameraOn]   = useState(false);

    const inputRef   = useRef(null);
    const html5QrRef = useRef(null);
    const scannedRef = useRef(false); // cegah scan ganda

    useEffect(() => {
        document.title = "Scan Tiket - Admin Pronojiwo";
    }, []);

    // Auto focus input manual
    useEffect(() => {
        if (mode === "manual" && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [mode]);

    // Kelola kamera — pastikan stop saat unmount atau ganti mode
    useEffect(() => {
        if (mode === "camera") {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera(); // cleanup saat unmount
    }, [mode]);

    const loadScript = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement("script");
        s.src = src; s.onload = resolve; s.onerror = reject;
        document.body.appendChild(s);
    });

    const startCamera = async () => {
        try {
            if (!window.Html5Qrcode) {
                await loadScript("https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js");
            }
            if (html5QrRef.current) return;

            scannedRef.current = false;
            const scanner = new window.Html5Qrcode("qr-reader-box");
            html5QrRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                async (decodedText) => {
                    if (scannedRef.current) return;
                    scannedRef.current = true;
                    await stopCamera();
                    setMode("manual");
                    setInputCode(decodedText);
                    handleScan(decodedText);
                },
                () => {}
            );
            setCameraOn(true);
        } catch (err) {
            setMessage({ type: "error", text: "Kamera tidak bisa diakses. Gunakan input manual." });
            setMode("manual");
        }
    };

    const stopCamera = async () => {
        if (html5QrRef.current) {
            try {
                const state = html5QrRef.current.getState?.();
                if (state === 2) await html5QrRef.current.stop();
            } catch {}
            try { html5QrRef.current.clear?.(); } catch {}
            html5QrRef.current = null;
        }
        setCameraOn(false);
    };

    const handleScan = async (code) => {
        if (!code?.trim() || loading) return;
        setLoading(true);
        setScanResult(null);
        setMessage(null);

        try {
            const res = await api.get(`/admin/tickets/scan/${code.trim()}`);
            setScanResult(res.data);
        } catch (err) {
            setScanResult(err.response?.data || { valid: false, message: "Tiket tidak ditemukan." });
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        handleScan(inputCode);
    };

    const handleConfirmEntry = async () => {
        if (!scanResult?.ticket?.id) return;
        setConfirming(true);
        try {
            const res = await api.post(`/admin/tickets/${scanResult.ticket.id}/use`);
            setMessage({ type: "success", text: res.data.message });
            setScanResult(prev => ({ ...prev, valid: false, message: "Tiket sudah dikonfirmasi.", ticket: res.data.ticket }));
        } catch (err) {
            setMessage({ type: "error", text: err.response?.data?.message || "Gagal konfirmasi." });
        } finally {
            setConfirming(false);
        }
    };

    const reset = () => {
        setScanResult(null);
        setInputCode("");
        setMessage(null);
        scannedRef.current = false;
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const formatRp = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

    const ticket = scanResult?.ticket;

    const statusColor = (s) => ({
        confirmed: "text-emerald-600 bg-emerald-50 border-emerald-200",
        used:      "text-gray-500 bg-gray-50 border-gray-200",
        pending:   "text-amber-600 bg-amber-50 border-amber-200",
        cancelled: "text-red-600 bg-red-50 border-red-200",
    }[s] || "text-gray-500 bg-gray-50 border-gray-200");

    const statusLabel = (s) => ({ confirmed: "Aktif", used: "Sudah Digunakan", pending: "Pending", cancelled: "Dibatalkan" }[s] || s);

    // URL foto — handle path relatif dari storage
    const fotoUrl = (foto) => {
        if (!foto) return null;
        if (foto.startsWith("http")) return foto;
        return `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${foto}`;
    };

    return (
        <AdminLayout>
            <div className="max-w-xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-900">Scan Tiket Masuk</h1>
                    <p className="text-gray-500 text-sm mt-1">Validasi tiket pengunjung sebelum masuk wisata</p>
                </div>

                {/* Mode Switch */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl mb-5">
                    {[{ key: "manual", label: "✏️ Input Manual" }, { key: "camera", label: "📷 Kamera" }].map(m => (
                        <button key={m.key} onClick={() => { if (mode !== m.key) { setScanResult(null); setMessage(null); setMode(m.key); } }}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === m.key ? "bg-white shadow text-emerald-700" : "text-gray-500 hover:text-gray-700"}`}>
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Input Manual */}
                {mode === "manual" && (
                    <form onSubmit={handleManualSubmit} className="mb-5">
                        <div className="relative">
                            <input ref={inputRef} type="text" value={inputCode}
                                onChange={e => setInputCode(e.target.value.toUpperCase())}
                                placeholder="Scan QR atau ketik kode tiket (TKT-XXXXXX)"
                                className="w-full border-2 border-gray-200 focus:border-emerald-500 rounded-xl px-4 py-4 text-sm font-mono uppercase tracking-wider focus:outline-none pr-24"
                                autoComplete="off"/>
                            <button type="submit" disabled={loading || !inputCode.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors">
                                {loading ? "..." : "Cek"}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 text-center">
                            Jika menggunakan QR reader fisik, arahkan ke QR — kode otomatis terisi
                        </p>
                    </form>
                )}

                {/* Kamera */}
                {mode === "camera" && (
                    <div className="mb-5">
                        <div className="bg-gray-900 rounded-2xl overflow-hidden relative" style={{ minHeight: 300 }}>
                            <div id="qr-reader-box" className="w-full"/>
                            {!cameraOn && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                                        <p className="text-sm">Memuat kamera...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">Arahkan kamera ke QR Code tiket pengunjung</p>
                    </div>
                )}

                {/* Pesan */}
                {message && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                        {message.type === "success" ? "✅" : "⚠️"} {message.text}
                    </div>
                )}

                {/* Hasil Scan */}
                {scanResult && (
                    <div className={`rounded-2xl border-2 overflow-hidden ${scanResult.valid ? "border-emerald-400" : ticket?.status === "used" ? "border-gray-300" : "border-red-300"}`}>
                        {/* Banner */}
                        <div className={`px-5 py-3 flex items-center gap-3 ${scanResult.valid ? "bg-emerald-500" : ticket?.status === "used" ? "bg-gray-500" : "bg-red-500"}`}>
                            <span className="text-2xl">
                                {scanResult.valid ? "✅" : ticket?.status === "used" ? "🚫" : "❌"}
                            </span>
                            <div>
                                <p className="font-black text-white text-sm">{scanResult.message}</p>
                                {ticket && <p className="text-white/70 text-xs font-mono">{ticket.ticket_code}</p>}
                            </div>
                        </div>

                        {ticket && (
                            <div className="bg-white p-5 space-y-4">
                                {/* Destinasi + foto */}
                                <div className="flex gap-3 items-center">
                                    {ticket.destination?.foto ? (
                                        <img
                                            src={fotoUrl(ticket.destination.foto)}
                                            alt={ticket.destination?.nama_wisata}
                                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
                                            onError={e => { e.target.style.display = "none"; }}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl">🌿</span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-black text-gray-900">{ticket.destination?.nama_wisata}</p>
                                        <p className="text-xs text-gray-400">{ticket.destination?.lokasi_rute}</p>
                                        <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor(ticket.status)}`}>
                                            {statusLabel(ticket.status)}
                                        </span>
                                    </div>
                                </div>

                                {/* Detail */}
                                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Ketua Rombongan</p>
                                        <p className="font-bold text-gray-800">{ticket.nama_ketua || ticket.user?.name || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">No HP</p>
                                        <p className="font-bold text-gray-800">{ticket.no_hp || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Kebangsaan</p>
                                        <p className="font-bold text-gray-800">{ticket.kebangsaan || "Indonesia"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Jenis Kelamin</p>
                                        <p className="font-bold text-gray-800 capitalize">{ticket.jenis_kelamin || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Tanggal Kunjungan</p>
                                        <p className="font-bold text-gray-800">{ticket.visit_date}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase">Jumlah Tiket</p>
                                        <p className="font-bold text-gray-800">{ticket.quantity} orang</p>
                                    </div>
                                    <div className="col-span-2 border-t pt-3 flex justify-between">
                                        <span className="font-black text-gray-700">Total Pembayaran</span>
                                        <span className="font-black text-emerald-700">{formatRp(ticket.total_price)}</span>
                                    </div>
                                    {ticket.status === "used" && ticket.used_at && (
                                        <div className="col-span-2 bg-gray-100 rounded-lg p-2 text-center">
                                            <p className="text-xs text-gray-500 font-bold">
                                                ✓ Digunakan: {new Date(ticket.used_at).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Tombol */}
                                <div className="flex gap-3">
                                    <button onClick={reset}
                                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                                        Scan Berikutnya
                                    </button>
                                    {scanResult.valid && ticket.status === "confirmed" && (
                                        <button onClick={handleConfirmEntry} disabled={confirming}
                                            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-black text-sm transition-colors flex items-center justify-center gap-2">
                                            {confirming ? (
                                                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Proses...</>
                                            ) : "✓ Konfirmasi Masuk"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {!ticket && (
                            <div className="bg-white p-5 text-center">
                                <p className="text-gray-400 text-sm mb-3">Tiket tidak ditemukan di database.</p>
                                <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">Coba Lagi</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Panduan */}
                {!scanResult && !loading && (
                    <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
                        <h3 className="font-black text-gray-900 text-sm mb-4">Cara Validasi Tiket</h3>
                        <div className="space-y-3">
                            {[
                                { icon: "📱", step: "Pengunjung buka halaman Tiket Saya di HP mereka" },
                                { icon: "🔍", step: "Scan QR Code menggunakan kamera atau QR reader fisik" },
                                { icon: "✅", step: "Sistem menampilkan detail tiket dan status" },
                                { icon: "🚪", step: "Klik Konfirmasi Masuk — tiket langsung tidak bisa dipakai lagi" },
                            ].map((g, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="text-xl flex-shrink-0">{g.icon}</span>
                                    <p className="text-sm text-gray-600">{g.step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}