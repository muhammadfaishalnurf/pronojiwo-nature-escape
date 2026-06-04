import { Link } from "react-router-dom";

// ── GANTI KONFIGURASI DI SINI ──
const LOGO_IMAGE   = "/images/logo.png";
const LOGO_TEKS1   = "PRONOJIWO";  // teks besar
const LOGO_TEKS2   = "NATURE ESCAPE";      // teks kecil

// Ganti dengan link Google Maps destinasi kamu
// Cara ambil: buka Google Maps → klik Share → Embed a map → copy src URL
const GOOGLE_MAPS_SRC = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3951.234!2d112.9157!3d-8.2291!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMTMnNDQuOCJTIDExMsKwNTQnNTYuNSJF!5e0!3m2!1sen!2sid!4v1234567890";

const navLinks = [
    { name: "Beranda",          href: "/#beranda" },
    { name: "Destinasi Favorit",href: "/#destinasi" },
    { name: "Pesan Tiket",      href: "/#tiket" },
    { name: "Testimoni",        href: "/#testimoni" },
    { name: "Kontak",           href: "/#kontak" },
];

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-emerald-950 via-gray-950 to-emerald-950 text-white/70 pt-16 pb-8 px-6 lg:px-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">

                    {/* ── Kolom 1: Brand + deskripsi ── */}
                    <div className="md:col-span-4 space-y-5">
                        {/* Logo — sama persis dengan Navbar */}
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <img
                                src={LOGO_IMAGE}
                                alt={LOGO_TEKS2}
                                className="h-10 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform"
                                onError={e => { e.target.style.display = "none"; }}
                            />
                            <div className="leading-tight">
                                <span className="block font-black text-base text-white">{LOGO_TEKS1}</span>
                                <span className="block font-black text-[9px] text-emerald-400 tracking-widest uppercase">{LOGO_TEKS2}</span>
                            </div>
                        </Link>
                        <p className="text-sm text-white/50 leading-relaxed max-w-xs font-light">
                            Platform resmi reservasi & wisata alam terpadu kawasan Kecamatan Pronojiwo, Lumajang, Jawa Timur.
                        </p>
                    </div>

                    {/* ── Kolom 2: Navigasi ── */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-emerald-500 pl-3">
                            Navigasi
                        </h4>
                        <div className="flex flex-col gap-3 text-sm font-semibold">
                            {navLinks.map(link => (
                                <a key={link.name} href={link.href}
                                    className="hover:text-emerald-400 transition-colors w-fit">
                                    → {link.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── Kolom 3: Google Maps ── */}
                    <div className="md:col-span-6 space-y-4">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-emerald-500 pl-3">
                            Lokasi Kami
                        </h4>
                        {/* Ganti GOOGLE_MAPS_SRC di bagian atas file untuk ubah lokasi */}
                        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-xl" style={{ height: 200 }}>
                            <iframe
                                src={GOOGLE_MAPS_SRC}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lokasi Pronojiwo Nature Escape"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Copyright ── */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-white/30">
                    <p>© {new Date().getFullYear()} Pronojiwo Nature Escape. Hak cipta dilindungi undang-undang.</p>
                    <p className="flex items-center gap-1.5">
                        Terbuat dengan <span className="text-red-500 animate-pulse text-sm">♥</span> untuk pariwisata lestari Lumajang.
                    </p>
                </div>
            </div>
        </footer>
    );
}