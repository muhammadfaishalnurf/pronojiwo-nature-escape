import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("order_id");
    const status  = searchParams.get("status");

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Status Pembayaran - Pronojiwo Nature Escape";
        if (orderId) {
            api.get(`/payments/status/${orderId}`)
                .then(res => setPayment(res.data?.data))
                .catch(() => {})
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const formatRp = n => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

    const isSuccess = status === "success" || payment?.status === "confirmed";
    const isPending = !isSuccess && (status === "pending" || payment?.status === "pending");

    const ticket = payment?.ticket;

    // QR Code URL
    const qrUrl = ticket?.ticket_code
        ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(ticket.ticket_code)}&size=300x300&margin=10&format=png`
        : null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full">
                {loading ? (
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
                        <p className="text-gray-500 text-sm">Memuat status pembayaran...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className={`p-8 text-center ${isSuccess ? "bg-gradient-to-br from-emerald-600 to-teal-500" : isPending ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-red-500 to-rose-600"}`}>
                            <div className="text-5xl mb-3">{isSuccess ? "✅" : isPending ? "⏳" : "❌"}</div>
                            <h1 className="text-2xl font-black text-white">
                                {isSuccess ? "Pembayaran Berhasil!" : isPending ? "Menunggu Pembayaran" : "Pembayaran Gagal"}
                            </h1>
                            <p className="text-white/80 text-sm mt-1">
                                {isSuccess ? "Tiket Anda telah dikonfirmasi." : isPending ? "Selesaikan pembayaran Anda." : "Silakan coba lagi."}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {payment && (
                                <>
                                    {/* Info tiket */}
                                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Order ID</span>
                                            <span className="font-mono font-bold text-amber-600 text-xs">{payment.order_id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Destinasi</span>
                                            <span className="font-bold text-gray-800 text-right max-w-[180px]">{ticket?.destination?.nama_wisata || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Kode Tiket</span>
                                            <span className="font-mono font-bold text-emerald-700">{ticket?.ticket_code || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Ketua Rombongan</span>
                                            <span className="font-bold text-gray-800">{ticket?.nama_ketua || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Tanggal Kunjungan</span>
                                            <span className="font-bold text-gray-800">{ticket?.visit_date || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 font-semibold">Jumlah Tiket</span>
                                            <span className="font-bold text-gray-800">{ticket?.quantity || 0} orang</span>
                                        </div>
                                        {payment.payment_method && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 font-semibold">Metode Bayar</span>
                                                <span className="font-bold text-gray-800 uppercase">{payment.payment_method}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-200 pt-3 flex justify-between">
                                            <span className="font-black text-gray-700">Total Dibayar</span>
                                            <span className="font-black text-emerald-700 text-base">{formatRp(payment.amount)}</span>
                                        </div>
                                    </div>

                                    {/* QR Code — langsung tampil kalau berhasil */}
                                    {isSuccess && qrUrl && (
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">QR Code Tiket Masuk</p>
                                            <div className="flex justify-center">
                                                <div className="bg-white p-3 rounded-2xl border-2 border-emerald-200 shadow-inner inline-block">
                                                    <img src={qrUrl} alt={ticket?.ticket_code} className="w-48 h-48"/>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-3">
                                                Tunjukkan QR Code ini kepada petugas di pintu masuk wisata
                                            </p>
                                        </div>
                                    )}

                                    {/* Info pending */}
                                    {isPending && (
                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 text-center">
                                            ⏳ Selesaikan pembayaran sesuai instruksi yang dikirim ke email Anda.
                                            Setelah lunas, QR Code tiket akan muncul di sini dan di halaman Tiket Saya.
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Tombol */}
                            <div className="flex gap-3 pt-2">
                                <Link to="/tiket-saya"
                                    className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm text-center transition-colors">
                                    Tiket Saya
                                </Link>
                                <Link to="/"
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm text-center transition-colors">
                                    Beranda
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}