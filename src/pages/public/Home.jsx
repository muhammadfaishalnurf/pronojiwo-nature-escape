import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from '../../api/axios';
import Navbar from "../../components/layout/Navbar";

// ── Semua konstanta dan komponen helper tetap sama ──
const getDestImage = (dbPhoto, index) => {
    if (dbPhoto && !dbPhoto.includes("placeholder") && !dbPhoto.includes("build/assets")) {
        return dbPhoto;
    }
    const unsplashPics = [
        "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1432406186267-e85d9921434f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80"
    ];
    return unsplashPics[index % unsplashPics.length];
};

const getDestCategory = (name) => {
    if (!name) return "Wisata Alam";
    const lowerName = name.toLowerCase();
    if (lowerName.includes("air terjun")) return "Air Terjun";
    if (lowerName.includes("panorama") || lowerName.includes("bukit")) return "Panorama";
    if (lowerName.includes("hutan") || lowerName.includes("pinus")) return "Hutan";
    return "Wisata Alam";
};

const defaultDestinations = [
    { id: 1, name: "Air Terjun Tumpak Sewu", location: "Desa Sidomulyo, Pronojiwo", category: "Air Terjun", rating: 4.9, reviewCount: 120, image: "https://i.postimg.cc/3rGp9PfJ/pexels-onesecondbeforesunset-31934675.jpg", description: "Air terjun spektakuler setinggi 120 meter dengan pemandangan menakjubkan, sering dijuluki 'Niagara-nya Indonesia'. Dikelilingi oleh tebing hijau melingkar yang megah.", price: 20000, capacity: 200, facilities: ["Pemandu lokal", "Gazebo santai", "Spot foto", "Warung makan", "Area parkir", "Toilet umum"], coordinates: "8.2291° S, 112.9157° E" },
    { id: 2, name: "Panorama Kapas Biru", location: "Pronojiwo, Lumajang", category: "Panorama", rating: 4.7, reviewCount: 85, image: "https://i.postimg.cc/MT83Hynz/Wisata-ini-lagi-hits-di-Lumajang.jpg", description: "Pemandangan bukit hijau dengan kabut pagi yang memesona. Spot foto terbaik untuk menikmati sunrise di atas awan berlatar belakang Gunung Semeru.", price: 15000, capacity: 150, facilities: ["Spot foto estetik", "Camping area", "Pemandangan sunrise", "Warung lokal"], coordinates: "8.2195° S, 112.9234° E" },
    { id: 3, name: "Air Terjun Kapas Biru", location: "Pronojiwo, Lumajang", category: "Air Terjun", rating: 4.8, reviewCount: 98, image: "https://i.postimg.cc/RZJNVfrG/pexels-joni-agung-438595839-32292604.jpg", description: "Air terjun tersembunyi dengan kolam alami yang jernih dan segar di kelilingi tebing tinggi kemerahan. Tempat ideal untuk rekreasi air dan relaksasi pikiran.", price: 15000, capacity: 100, facilities: ["Kolam alami", "Jalur trekking aman", "Gazebo istirahat", "Mushola", "Warung kopi"], coordinates: "8.2324° S, 112.9212° E" },
    { id: 4, name: "Kabut Pelangi", location: "Pronojiwo, Lumajang", category: "Air Terjun", rating: 4.8, reviewCount: 74, image: "https://i.postimg.cc/cLzwF0WB/Full-Size-Render.avif", description: "Fenomena pelangi magis di tengah kabut percikan air terjun setinggi 100 meter. Terjadi setiap pagi hari ketika cahaya matahari menembus butiran kabut air.", price: 10000, capacity: 120, facilities: ["Spot pelangi alami", "Warung camilan", "Spot foto", "Toilet"], coordinates: "8.2201° S, 112.9305° E" },
    { id: 5, name: "Kali Kebo", location: "Pronojiwo, Lumajang", category: "Panorama", rating: 4.6, reviewCount: 52, image: "https://i.postimg.cc/zGTHFWdy/6d0be126412a1bd4253ebee9430be30c.jpg", description: "Simfoni Alam Kali Kebo: Gagahnya Semeru dalam Pantulan Air yang Tenang. Tempat ideal untuk camping keluarga, berfoto, dan menikmati ketenangan.", price: 10000, capacity: 300, facilities: ["Area camping", "Spot foto estetik", "Warung makan", "Area parkir"], coordinates: "8.2111° S, 112.9102° E" },
    { id: 6, name: "Panorama Coban Sriti", location: "Pronojiwo, Lumajang", category: "Panorama", rating: 4.7, reviewCount: 40, image: "https://i.postimg.cc/T2Wb3Zrb/14094-panorama-coban-sriti-dok-pribadialfaalfnsyh.jpg", description: "Potret megah Coban Sriti dengan aliran airnya yang deras berselimut kabut tebal di tengah rimbunnya hutan tropis.", price: 15000, capacity: 100, facilities: ["Gazebo santai", "Area parkir"], coordinates: "8.2045° S, 112.9056° E" }
];

const defaultTestimonials = [
    { name: "Andi Pratama", location: "Air Terjun Tumpak Sewu", rating: 5, text: "Pengalaman luar biasa! Air terjun Tumpak Sewu benar-benar memukau. Pemandu wisata sangat profesional dan ramah.", avatar: "AP", date: "2 minggu lalu" },
    { name: "Sari Dewi", location: "Panorama Kapas Biru", rating: 5, text: "Pronojiwo adalah surga tersembunyi! Alam yang masih asri dan udara yang segar membuat saya ingin kembali lagi.", avatar: "SD", date: "1 bulan lalu" },
    { name: "Budi Santoso", location: "Air Terjun Kapas Biru", rating: 5, text: "Destinasi yang wajib dikunjungi! Pemandangan bukit dan hutan pinus sangat indah. Pelayanan sangat memuaskan.", avatar: "BS", date: "3 minggu lalu" }
];

const features = [
    { icon: "🌿", title: "Kawasan Asri & Lestari", desc: "Komitmen penuh menjaga keaslian ekosistem alam demi kelangsungan flora dan fauna lokal.", gradient: "from-emerald-500 to-teal-500" },
    { icon: "🗺️", title: "Local Guides Berlisensi", desc: "Didampingi warga lokal berpengalaman yang sangat mengenal sejarah dan rute teraman alam liar.", gradient: "from-teal-500 to-cyan-500" },
    { icon: "🎟️", title: "E-Ticketing Praktis", desc: "Kemudahan memesan tiket secara daring kapan saja dengan kalkulator biaya transparan.", gradient: "from-amber-500 to-yellow-500" },
    { icon: "🛡️", title: "Prioritas Keamanan", desc: "Jaminan mitigasi risiko menyeluruh dan pemeliharaan fasilitas jalur trekking berkala.", gradient: "from-emerald-600 to-emerald-400" }
];

const navLinks = [
    { name: "Beranda", id: "beranda" },
    { name: "Destinasi Favorit", id: "destinasi" },
    { name: "Pesan Tiket", id: "tiket" },
    { name: "Testimoni", id: "testimoni" },
    { name: "Kontak", id: "kontak" }
];

const INDO_MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const WEEK_DAYS = ["M", "S", "S", "R", "K", "J", "S"];

const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    const startDayOfWeek = date.getDay();
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDate - i, month: month - 1 === -1 ? 11 : month - 1, year: month - 1 === -1 ? year - 1 : year, isCurrentMonth: false, isPast: true });
    }
    const daysCount = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= daysCount; i++) {
        const currentDate = new Date(year, month, i);
        days.push({ day: i, month, year, isCurrentMonth: true, isPast: currentDate < today });
    }
    const totalCells = days.length > 35 ? 42 : 35;
    for (let i = 1; i <= totalCells - days.length; i++) {
        days.push({ day: i, month: month + 1 === 12 ? 0 : month + 1, year: month + 1 === 12 ? year + 1 : year, isCurrentMonth: false, isPast: false });
    }
    return days;
};

const getCategoryIcon = (category) => {
    switch (category) {
        case "Air Terjun": return "🌊";
        case "Panorama": return "⛰️";
        case "Hutan": return "🌲";
        default: return "🌿";
    }
};

function CustomSelect({ value, onChange, options, placeholder, isDark }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => { if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const selectedOption = options.find(opt => String(opt.id) === String(value));
    const formatPrice = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
    return (
        <div ref={containerRef} className="relative w-full text-left">
            <button type="button" onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none focus:ring-1 ${isDark ? 'bg-emerald-950/50 border border-white/20 text-white focus:border-emerald-400 focus:ring-emerald-400' : 'bg-stone-50 border border-gray-200 text-gray-900 focus:border-emerald-600 focus:ring-emerald-600'}`}>
                <div className="flex items-center gap-2 truncate">
                    {selectedOption ? (
                        <><span className="text-base flex-shrink-0">{getCategoryIcon(selectedOption.category)}</span><span className="font-medium truncate">{selectedOption.name}</span><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>{formatPrice(selectedOption.price)}</span></>
                    ) : (<span className={isDark ? 'text-white/40' : 'text-gray-400'}>{placeholder}</span>)}
                </div>
                <svg className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/60' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            <div className={`absolute z-50 mt-1.5 w-full rounded-2xl p-2 shadow-2xl border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top transform ${isOpen ? 'opacity-100 scale-100 pointer-events-auto visible translate-y-0' : 'opacity-0 scale-95 pointer-events-none invisible -translate-y-2'} ${isDark ? 'bg-[#052217] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {options.map((opt) => {
                        const isSelected = String(opt.id) === String(value);
                        return (
                            <button key={opt.id} type="button" onClick={() => { onChange(String(opt.id)); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 ${isSelected ? isDark ? 'bg-emerald-800/80 text-white font-bold' : 'bg-emerald-50 text-emerald-900 font-black' : isDark ? 'hover:bg-white/10 text-white/80' : 'hover:bg-stone-50 text-gray-700'}`}>
                                <div className="flex items-center gap-2.5 truncate"><span className="text-base flex-shrink-0">{getCategoryIcon(opt.category)}</span><div className="truncate"><span className="block font-semibold truncate">{opt.name}</span><span className={`text-[10px] ${isDark ? 'text-white/50' : 'text-gray-400'}`}>{opt.location}</span></div></div>
                                <div className="flex items-center gap-2 flex-shrink-0"><span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>{formatPrice(opt.price)}</span>{isSelected && <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function CustomDatePicker({ value, onChange, isDark }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const initialDate = value ? new Date(value) : new Date();
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    useEffect(() => { if (value) { const d = new Date(value); setViewMonth(d.getMonth()); setViewYear(d.getFullYear()); } }, [value]);
    useEffect(() => {
        const handleClickOutside = (event) => { if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handlePrevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
    const handleNextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };
    const days = getDaysInMonth(viewMonth, viewYear);
    const formatDateDisplay = (dateStr) => { if (!dateStr) return "-- Pilih Tanggal --"; const d = new Date(dateStr); return `${d.getDate()} ${INDO_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
    const handleDaySelect = (d) => { if (d.isPast) return; const formattedMonth = String(d.month + 1).padStart(2, "0"); const formattedDay = String(d.day).padStart(2, "0"); onChange(`${d.year}-${formattedMonth}-${formattedDay}`); setIsOpen(false); };
    return (
        <div ref={containerRef} className="relative w-full text-left">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-300 focus:outline-none focus:ring-1 ${isDark ? 'bg-emerald-950/50 border border-white/20 text-white focus:border-emerald-400 focus:ring-emerald-400' : 'bg-stone-50 border border-gray-200 text-gray-900 focus:border-emerald-600 focus:ring-emerald-600'}`}>
                <div className="flex items-center gap-2 truncate"><svg className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg><span className={value ? 'font-medium truncate' : isDark ? 'text-white/40' : 'text-gray-400'}>{formatDateDisplay(value)}</span></div>
                <svg className={`w-4 h-4 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/60' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            <div className={`absolute z-50 mt-1.5 w-[290px] md:w-[310px] rounded-2xl p-4 shadow-2xl border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right md:origin-top transform ${isOpen ? 'opacity-100 scale-100 pointer-events-auto visible translate-y-0' : 'opacity-0 scale-95 pointer-events-none invisible -translate-y-2'} ${isDark ? 'bg-[#052217] border-white/10 text-white right-0 lg:left-0' : 'bg-white border-gray-100 text-gray-900 right-0'}`}>
                <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={handlePrevMonth} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/80' : 'hover:bg-stone-100 text-gray-700'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg></button>
                    <span className="font-bold text-xs uppercase tracking-wider">{INDO_MONTHS[viewMonth]} {viewYear}</span>
                    <button type="button" onClick={handleNextMonth} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/80' : 'hover:bg-stone-100 text-gray-700'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">{WEEK_DAYS.map((day, i) => (<span key={i} className={`text-[10px] font-black uppercase ${i === 0 ? 'text-rose-500' : isDark ? 'text-white/40' : 'text-gray-400'}`}>{day}</span>))}</div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((d, i) => {
                        if (!d.isCurrentMonth) return <div key={i} className="aspect-square w-full"></div>;
                        const dateStr = `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
                        const isSelected = value === dateStr;
                        const isToday = today.getDate() === d.day && today.getMonth() === d.month && today.getFullYear() === d.year;
                        return (
                            <button key={i} type="button" onClick={() => handleDaySelect(d)} disabled={d.isPast}
                                className={`aspect-square w-full text-xs font-bold rounded-lg flex flex-col items-center justify-center relative transition-all duration-200 ${d.isPast ? isDark ? 'text-white/20 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed' : isSelected ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-emerald-950 font-black shadow-lg scale-105' : isDark ? 'hover:bg-white/10 text-white/80' : 'hover:bg-stone-100 text-gray-700'}`}>
                                <span>{d.day}</span>
                                {isToday && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── MAIN HOME COMPONENT ──
export default function Home() {
    const { user }  = useAuth();
    const navigate  = useNavigate();

    const [destinations, setDestinations] = useState([]);
    const [reviews,      setReviews]      = useState([]);
    const [loadingData,  setLoadingData]  = useState(true);

    const [menuOpen,   setMenuOpen]   = useState(false);
    const [scrolled,   setScrolled]   = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [visibleStats, setVisibleStats] = useState(false);
    const [counts,     setCounts]     = useState({ wisata: 0, pengunjung: 0, rating: 0 });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [selectedDestDetails, setSelectedDestDetails] = useState(null);

    const [bookingDestId, setBookingDestId] = useState("");
    const [bookingQty,    setBookingQty]    = useState(1);
    const [bookingDate,   setBookingDate]   = useState("");

    const statsRef = useRef(null);

    useEffect(() => { document.title = "Pronojiwo Nature Escape - Surga Tersembunyi Lumajang"; }, []);

    useEffect(() => {
        const fetchData = async () => {
            try { const res = await api.get('/destinations'); const d = res.data?.data || res.data || []; setDestinations(Array.isArray(d) ? d : []); } catch { setDestinations([]); }
            try { const res = await api.get('/reviews'); const d = res.data?.data || res.data || []; setReviews(Array.isArray(d) ? d : []); } catch { setReviews([]); }
            setLoadingData(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => setMousePosition({ x: (e.clientX / window.innerWidth - 0.5) * 15, y: (e.clientY / window.innerHeight - 0.5) * 15 });
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisibleStats(true); }, { threshold: 0.2 });
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visibleStats) return;
        const steps = 60;
        let step = 0;
        const targetWisata = destinations.length || 6;
        const targetReview = 1500;
        const targetRating = 4.8;
        const timer = setInterval(() => {
            step++;
            const ease = 1 - Math.pow(1 - step / steps, 3);
            setCounts({ wisata: Math.floor(ease * targetWisata), pengunjung: Math.floor(ease * targetReview), rating: parseFloat((ease * targetRating).toFixed(1)) });
            if (step >= steps) clearInterval(timer);
        }, 1500 / steps);
        return () => clearInterval(timer);
    }, [visibleStats, destinations.length]);

    useEffect(() => {
        const total = activeTestimonials.length;
        if (total === 0) return;
        const timer = setInterval(() => setActiveTestimonial((prev) => (prev + 1) % total), 6000);
        return () => clearInterval(timer);
    }, [reviews]);

    const formatPrice = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);

    const activeDestinations = destinations.length > 0
        ? destinations.map((d, index) => ({
            id: d.id,
            name: d.nama_wisata || "Destinasi Wisata",
            location: d.lokasi_rute || "Pronojiwo, Lumajang",
            category: getDestCategory(d.nama_wisata),
            rating: parseFloat(d.rating) || 4.8,
            reviewCount: 20 + index * 13,
            image: getDestImage(d.foto, index),
            description: d.deskripsi || "Keindahan alam Pronojiwo yang menakjubkan dan asri.",
            price: parseFloat(d.harga_tiket) || 15000,
            capacity: d.kapasitas || 150,
            facilities: ["Spot foto", "Toilet", "Area parkir"],
            coordinates: "8.2195° S, 112.9234° E"
        }))
        : defaultDestinations;

    const activeTestimonials = reviews.length > 0
        ? reviews.map((r) => ({
            name: r.nama || r.user?.name || "Pengunjung Anonim",
            location: r.destinasi || r.destination?.nama_wisata || "Wisata Alam",
            rating: r.rating || 5,
            text: r.ulasan || "Pengalaman liburan yang luar biasa di Pronojiwo.",
            avatar: (r.nama || r.user?.name || "PA").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
            date: r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Baru-baru ini"
        }))
        : defaultTestimonials;

    const selectedBookingDest = activeDestinations.find(d => String(d.id) === String(bookingDestId));
    const bookingSubtotal = selectedBookingDest ? selectedBookingDest.price * bookingQty : 0;
    const bookingTax      = selectedBookingDest ? Math.round(bookingSubtotal * 0.05) : 0;
    const bookingTotal    = bookingSubtotal + bookingTax;

    // ── UPDATED: redirect ke halaman booking, cek login ──
    const goToBooking = (destId, date, qty) => {
        const params = new URLSearchParams({ dest: destId });
        if (date) params.set("date", date);
        params.set("qty", qty || 1);
        const bookingUrl = `/pesan-tiket?${params.toString()}`;

        if (!user) {
            sessionStorage.setItem("booking_redirect", bookingUrl);
            navigate("/login");
            return;
        }
        navigate(bookingUrl);
    };

    const handleQuickBookingSubmit = (e) => {
        e.preventDefault();
        if (!bookingDestId) { alert("Pilih destinasi wisata terlebih dahulu!"); return; }
        if (!bookingDate)   { alert("Pilih tanggal kunjungan Anda!"); return; }
        goToBooking(bookingDestId, bookingDate, bookingQty);
    };

    const handleDirectBook = (dest) => {
        setSelectedDestDetails(null);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        goToBooking(dest.id, tomorrow.toISOString().split("T")[0], 1);
    };

    const categories = ["Semua", "Air Terjun", "Panorama", "Hutan"];
    const filteredDestinations = selectedCategory === "Semua" ? activeDestinations : activeDestinations.filter(d => d.category === selectedCategory);

    return (
        <div className="font-sans text-gray-900 overflow-x-hidden antialiased bg-white selection:bg-emerald-600 selection:text-white">

            <button className={`fixed bottom-8 right-8 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-emerald-500/50 hover:rotate-6 ${scrolled ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-50 pointer-events-none'}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <svg className="w-6 h-6 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5"></path></svg>
            </button>

            <Navbar scrolled={scrolled} />

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)} />
            <div className={`lg:hidden fixed top-0 right-0 bottom-0 z-[9999] w-[88vw] max-w-sm flex flex-col transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ background: 'linear-gradient(160deg, #022c22 0%, #041c14 60%, #021a10 100%)' }}>
                <div className="flex items-center justify-between px-6 pt-8 pb-5">
                    <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shadow-xl">WAP</div><div className="leading-tight"><span className="block text-[9px] font-black text-emerald-400 tracking-[0.2em] uppercase">Wisata Alam</span><span className="block font-black text-lg text-white">PRONOJIWO</span></div></div>
                    <button className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white transition-all" onClick={() => setMenuOpen(false)}><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4"><div className="flex flex-col gap-2 mt-4">{navLinks.map((link) => (<a key={link.id} href={`#${link.id}`} className="flex items-center gap-4 px-4 py-4 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.07] text-white font-bold text-sm transition-all" onClick={() => setMenuOpen(false)}>{link.name}</a>))}</div></div>
                <div className="px-5 pt-4 pb-8">
                    <Link to="/login" className="flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-sm text-white border border-white/15 bg-white/[0.05] hover:bg-white/[0.10] transition-all mb-3" onClick={() => setMenuOpen(false)}>Masuk ke Akun</Link>
                    <Link to="/register" className="flex items-center justify-center w-full py-4 rounded-2xl font-black text-sm text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-400 shadow-2xl transition-all" onClick={() => setMenuOpen(false)}>Daftar Sekarang — Gratis!</Link>
                </div>
            </div>

            {/* ── HERO ── */}
            <section id="beranda" className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 pt-32 pb-28 overflow-hidden bg-emerald-950">
                <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: "linear-gradient(180deg, rgba(2, 44, 34, 0.92) 0%, rgba(2, 44, 34, 0.75) 50%, rgba(2, 44, 34, 0.95) 100%), url('/images/download.jpg')", transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * 0.4}px) scale(1.1)` }} />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
                </div>

                <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    <div className="lg:col-span-7 text-left space-y-6">
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/45 backdrop-blur-md"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span></span><span className="text-emerald-300 text-[10px] font-extrabold tracking-widest uppercase">✦ ECO-PARADISE INDONESIA</span></div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.2] text-white">Jelajahi Serpihan<span className="block italic font-medium bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 text-transparent bg-clip-text mt-4 mb-2">Surga Tersembunyi</span>di Pronojiwo Lumajang</h1>
                        <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-2xl font-light">Rasakan petualangan mistis di jantung Lumajang. Dari canyon air terjun Tumpak Sewu yang kolosal hingga udara pinus yang menenangkan jiwa.</p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <a href="#destinasi" className="group px-8 py-4 rounded-full font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2.5">Mulai Menjelajah<svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path></svg></a>
                            <a href="#tiket" className="px-8 py-4 rounded-full font-bold text-base text-white border-2 border-white/30 hover:border-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2.5">Pesan E-Tiket</a>
                        </div>
                        <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/10 max-w-lg">
                            <div><div className="text-3xl font-black text-white">10+</div><div className="text-xs text-white/50 font-bold uppercase tracking-wider mt-1">Destinasi</div></div>
                            <div><div className="text-3xl font-black text-white">1.2K+</div><div className="text-xs text-white/50 font-bold uppercase tracking-wider mt-1">Pecinta Alam</div></div>
                            <div><div className="text-3xl font-black text-white">4.9★</div><div className="text-xs text-white/50 font-bold uppercase tracking-wider mt-1">Rating Review</div></div>
                        </div>
                    </div>

                    {/* Booking Card Hero — sekarang redirect ke /pesan-tiket */}
                    <div className="lg:col-span-5 w-full">
                        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 shadow-3xl">
                            <form onSubmit={handleQuickBookingSubmit} className="space-y-5">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">Tiket Masuk Instan</h3>
                                    <p className="text-white/60 text-xs">Pesan digital tiket Anda secara langsung & aman.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-white/80 font-bold text-xs uppercase tracking-wider">Destinasi Wisata</label>
                                    <CustomSelect value={bookingDestId} onChange={setBookingDestId} options={activeDestinations} placeholder="-- Pilih Destinasi --" isDark={true} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-white/80 font-bold text-xs uppercase tracking-wider">Tanggal Kunjungan</label>
                                        <CustomDatePicker value={bookingDate} onChange={setBookingDate} isDark={true} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-white/80 font-bold text-xs uppercase tracking-wider">Jumlah Tiket</label>
                                        <div className="flex items-center bg-emerald-950/50 border border-white/20 rounded-xl px-2 py-1.5">
                                            <button type="button" onClick={() => setBookingQty(Math.max(1, bookingQty - 1))} className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20">-</button>
                                            <span className="flex-1 text-center text-white font-black text-sm">{bookingQty}</span>
                                            <button type="button" onClick={() => setBookingQty(bookingQty + 1)} className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold flex items-center justify-center hover:bg-white/20">+</button>
                                        </div>
                                    </div>
                                </div>
                                {selectedBookingDest && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                                        <div className="flex justify-between text-white/70"><span>Harga Tiket:</span><span>{formatPrice(selectedBookingDest.price)} x {bookingQty}</span></div>
                                        <div className="flex justify-between text-white/70"><span>Biaya Pelayanan (5%):</span><span>{formatPrice(bookingTax)}</span></div>
                                        <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm"><span className="text-amber-300">Total Biaya:</span><span className="text-lg text-white font-black">{formatPrice(bookingTotal)}</span></div>
                                    </div>
                                )}
                                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-emerald-950 font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300">
                                    {user ? "Lanjut Isi Data →" : "Login & Pesan Tiket →"}
                                </button>
                                {!user && <p className="text-center text-white/40 text-xs">Kamu akan diarahkan ke halaman login</p>}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-70"><span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Gulir ke bawah</span><div className="w-5 h-9 border-2 border-white/30 rounded-full flex justify-center p-1"><div className="w-1 h-2.5 bg-emerald-400 rounded-full animate-scroll"></div></div></div>
            </section>

            {/* ── STATS ── */}
            <section ref={statsRef} className="relative py-16 bg-gradient-to-b from-emerald-950 to-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                            <div className="py-6 md:py-0 md:px-6 space-y-2"><div className="text-5xl font-black text-amber-300">{counts.wisata}+</div><div className="text-lg font-bold text-white italic">Total Destinasi</div><p className="text-white/60 text-xs max-w-[200px] mx-auto">Kawasan wisata alam terintegrasi dan teregistrasi.</p></div>
                            <div className="py-6 md:py-0 md:px-6 space-y-2"><div className="text-5xl font-black text-white">{counts.pengunjung.toLocaleString()}+</div><div className="text-lg font-bold text-white italic">Review Wisatawan</div><p className="text-white/60 text-xs max-w-[200px] mx-auto">Ulasan nyata bintang 4 keatas oleh pelancong.</p></div>
                            <div className="py-6 md:py-0 md:px-6 space-y-2"><div className="text-5xl font-black text-emerald-400 flex items-center justify-center gap-1">{counts.rating} <span className="text-amber-400 text-3xl">★</span></div><div className="text-lg font-bold text-white italic">Rating Kepuasan</div><p className="text-white/60 text-xs max-w-[200px] mx-auto">Pengalaman petualangan bernilai luar biasa.</p></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── DESTINASI ── */}
            <section id="destinasi" className="relative bg-white py-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] tracking-widest uppercase">🏔️ PILIHAN EKSPEDISI TERBAIK</div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-950">Jelajahi Katalog <span className="italic font-medium text-emerald-700">Destinasi Favorit</span></h2>
                        <div className="w-16 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 mx-auto rounded-full"></div>
                        <p className="text-gray-500 text-base md:text-lg">Setiap lekuk Pronojiwo menyimpan keajaiban. Pilih kategori petualangan Anda dan mulailah merancang memori indah.</p>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
                        {categories.map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2.5 rounded-full font-bold text-xs tracking-wide shadow-sm transition-all duration-300 border ${selectedCategory === cat ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-stone-50 text-gray-600 border-gray-100 hover:bg-stone-100'}`}>{cat === "Semua" ? "Semua Destinasi ✨" : cat}</button>))}
                    </div>
                    {loadingData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{[...Array(6)].map((_, i) => (<div key={i} className="bg-stone-100 rounded-3xl h-96 animate-pulse"></div>))}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredDestinations.map((dest) => (
                                <div key={dest.id} className="group bg-stone-50 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-500 flex flex-col">
                                    <div className="relative h-64 overflow-hidden">
                                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-gray-950/10 to-transparent"></div>
                                        <span className="absolute top-4 left-4 bg-emerald-900/90 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">{dest.category}</span>
                                        <span className="absolute top-4 right-4 bg-gray-950/60 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><span className="text-amber-400">★</span> {dest.rating}</span>
                                        <span className="absolute bottom-4 left-4 text-white font-black text-lg bg-emerald-700/80 px-4 py-1.5 rounded-xl">{formatPrice(dest.price)}</span>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold"><svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path></svg><span>{dest.location}</span></div>
                                            <h3 className="text-xl font-bold text-gray-950 group-hover:text-emerald-700 transition-colors line-clamp-1">{dest.name}</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{dest.description}</p>
                                        </div>
                                        <div className="border-t border-gray-100 pt-5 mt-5 flex items-center justify-between">
                                            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Kuota: <span className="text-emerald-700 font-black">{dest.capacity}/hari</span></span>
                                            <button onClick={() => setSelectedDestDetails(dest)} className="px-5 py-2.5 rounded-full font-extrabold text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-800 hover:text-white transition-all duration-300 border border-emerald-100/50">Detail Destinasi →</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── KEUNGGULAN ── */}
            <section className="bg-stone-50 py-24 px-6 lg:px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] tracking-widest uppercase">⭐ STANDAR WISATA PREMIUM</div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-950">Kenapa Memilih <span className="italic font-medium text-emerald-700">Layanan Kami?</span></h2>
                        <div className="w-16 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((item) => (
                            <div key={item.title} className="group bg-white/80 border border-gray-100/60 rounded-[32px] p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                                <div className="mb-6 flex justify-center"><div className={`w-16 h-16 bg-white rounded-2xl shadow-sm group-hover:bg-gradient-to-br group-hover:${item.gradient} group-hover:scale-105 transition-all duration-500 flex items-center justify-center text-3xl`}>{item.icon}</div></div>
                                <h3 className="font-extrabold text-xl text-gray-900 mb-3.5 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${item.gradient} group-hover:w-full transition-all duration-500`} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 translate-y-[2px]"><svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C26.9,8.75,57.05,18.3,88.43,26.85,152.42,44.3,222.21,68.75,321.39,56.44Z" className="fill-emerald-950"></path></svg></div>
            </section>

            {/* ── TESTIMONI ── */}
            <section id="testimoni" className="relative bg-emerald-950 py-24 px-6 lg:px-8 overflow-hidden">
                <div className="relative max-w-4xl mx-auto z-10">
                    <div className="text-center space-y-4 mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-emerald-300 font-extrabold text-[10px] tracking-widest uppercase">💬 SUARA WISATAWAN</div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Kisah Seru <span className="italic font-medium bg-gradient-to-r from-emerald-300 to-amber-200 text-transparent bg-clip-text">Mereka di Pronojiwo</span></h2>
                    </div>
                    <div className="relative min-h-[320px]">
                        {activeTestimonials.map((test, index) => (
                            <div key={index} className={`absolute inset-0 transition-all duration-700 ${index === activeTestimonial ? "opacity-100 translate-x-0 pointer-events-auto scale-100" : index < activeTestimonial ? "opacity-0 -translate-x-12 pointer-events-none scale-95" : "opacity-0 translate-x-12 pointer-events-none scale-95"}`}>
                                <div className="bg-white/5 border border-white/15 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl">
                                    <div className="flex justify-end gap-1 mb-6">{[...Array(test.rating)].map((_, i) => (<span key={i} className="text-amber-400 text-lg">★</span>))}</div>
                                    <p className="text-white/90 text-base md:text-lg leading-relaxed italic mb-8">"{test.text}"</p>
                                    <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-emerald-950 font-black text-sm shadow-lg">{test.avatar}</div><div><div className="text-white font-bold text-base">{test.name}</div><div className="text-emerald-300 text-xs font-semibold">🗺️ {test.location}</div><span className="text-[10px] text-white/40 block mt-0.5">{test.date}</span></div></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-2.5 mt-10">{activeTestimonials.map((_, index) => (<button key={index} onClick={() => setActiveTestimonial(index)} className={`h-2.5 rounded-full transition-all duration-500 ${index === activeTestimonial ? "w-10 bg-gradient-to-r from-emerald-400 to-teal-300" : "w-2.5 bg-white/20 hover:bg-white/40"}`} />))}</div>
                </div>
            </section>

            {/* ── BOOKING SECTION — redirect ke /pesan-tiket ── */}
            <section id="tiket" className="relative py-24 bg-stone-50 px-6 lg:px-8 border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-4 mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] tracking-widest uppercase">🎫 DARING BOOKING PLATFORM</div>
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-950">Pesan E-Tiket <span className="italic font-medium text-emerald-700">Digital Anda</span></h2>
                        <div className="w-16 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 mx-auto rounded-full"></div>
                        <p className="text-gray-500 text-sm max-w-xl mx-auto">Kalkulasikan langsung biaya liburan Anda. Klik lanjut untuk mengisi data lengkap dan melakukan pembayaran.</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-2xl">
                        <form onSubmit={handleQuickBookingSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-gray-700 font-extrabold text-xs uppercase tracking-wider block">Destinasi Wisata</label><CustomSelect value={bookingDestId} onChange={setBookingDestId} options={activeDestinations} placeholder="-- Pilih Destinasi Favorit --" isDark={false} /></div>
                                <div className="space-y-2"><label className="text-gray-700 font-extrabold text-xs uppercase tracking-wider block">Tanggal Kunjungan</label><CustomDatePicker value={bookingDate} onChange={setBookingDate} isDark={false} /></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div className="space-y-2"><label className="text-gray-700 font-extrabold text-xs uppercase tracking-wider block">Jumlah Orang / Tiket</label><div className="flex items-center bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 max-w-[200px]"><button type="button" onClick={() => setBookingQty(Math.max(1, bookingQty - 1))} className="w-8 h-8 rounded-lg bg-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-300">-</button><span className="flex-1 text-center text-gray-900 font-black text-sm">{bookingQty}</span><button type="button" onClick={() => setBookingQty(bookingQty + 1)} className="w-8 h-8 rounded-lg bg-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-300">+</button></div></div>
                                {selectedBookingDest && <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-800">💡 5% dari setiap tiket berkontribusi ke program konservasi Pronojiwo.</div>}
                            </div>
                            {selectedBookingDest ? (
                                <div className="bg-stone-50 border border-gray-200 rounded-2xl p-6 space-y-3 text-sm">
                                    <h4 className="font-bold text-gray-950 border-b border-gray-200 pb-2">Rincian Pembelian Tiket</h4>
                                    <div className="flex justify-between text-gray-600"><span>Tiket ({selectedBookingDest.name}):</span><span className="font-semibold">{formatPrice(selectedBookingDest.price)} x {bookingQty}</span></div>
                                    <div className="flex justify-between text-gray-600"><span>Biaya Layanan (5%):</span><span className="font-semibold">{formatPrice(bookingTax)}</span></div>
                                    <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-base text-emerald-800"><span>Total:</span><span className="text-xl text-gray-950">{formatPrice(bookingTotal)}</span></div>
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">Isi form di atas untuk melihat kalkulasi biaya tiket.</div>
                            )}
                            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-bold text-sm uppercase tracking-widest shadow-xl transition-all duration-300">
                                {user ? "Lanjut Isi Data Pemesanan →" : "Login & Pesan Tiket →"}
                            </button>
                            {!user && <p className="text-center text-gray-400 text-xs">Kamu akan diarahkan ke halaman login terlebih dahulu</p>}
                        </form>
                    </div>
                </div>
            </section>

            {/* ── KONTAK ── */}
            <section id="kontak" className="relative py-24 bg-white px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5 space-y-6">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[10px] tracking-widest uppercase">📞 PUSAT BANTUAN TURIS</div>
                            <h2 className="text-4xl font-bold tracking-tight text-gray-950">Siap Berpetualang <span className="italic font-medium text-emerald-700">Bersama Kami?</span></h2>
                            <p className="text-gray-500 text-sm leading-relaxed">Punya kendala rute, butuh akomodasi homestay, atau ingin merancang trip rombongan? Tim kami siap melayani 24/7.</p>
                            <div className="space-y-4 pt-4">
                                {[{ icon: "📍", title: "Kantor Informasi Wisata", text: "Kecamatan Pronojiwo, Lumajang, Jawa Timur" }, { icon: "📞", title: "Hotline Layanan Turis", text: "+62 812-3456-7890 (WA / Telp)" }, { icon: "✉️", title: "Surel Korespondensi", text: "hello@pronojiwonature.id" }].map(c => (
                                    <div key={c.text} className="flex gap-4 p-4 rounded-2xl bg-stone-50 border border-gray-100 hover:border-emerald-100 transition-colors"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg flex-shrink-0">{c.icon}</div><div><span className="block font-bold text-[10px] uppercase text-gray-400">{c.title}</span><span className="font-semibold text-xs text-gray-800 mt-0.5 block">{c.text}</span></div></div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:col-span-7 bg-stone-50 border border-gray-200/50 rounded-3xl p-6 md:p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-950 mb-1">Kirim Pesan Instan</h3>
                            <p className="text-xs text-gray-400 mb-6">Ajukan pertanyaan Anda secara tertulis dan cepat.</p>
                            <form onSubmit={(e) => { e.preventDefault(); alert("Pesan Anda telah terkirim! Tim kami akan membalas dalam 1x24 jam."); e.target.reset(); }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs font-bold text-gray-500">Nama Lengkap</label><input type="text" placeholder="cth: Ahmad Dani" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-emerald-600 transition-all" /></div><div className="space-y-1"><label className="text-xs font-bold text-gray-500">Alamat Surel</label><input type="email" placeholder="cth: dani@email.com" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-emerald-600 transition-all" /></div></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Subjek Pertanyaan</label><input type="text" placeholder="cth: Sewa Guide lokal / Reservasi Homestay" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-emerald-600 transition-all" /></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500">Isi Pesan</label><textarea rows="4" placeholder="Tuliskan pertanyaan Anda..." required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-emerald-600 transition-all resize-none"></textarea></div>
                                <button type="submit" className="w-full py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all duration-300">Kirim Pesan Sekarang</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-gradient-to-br from-emerald-950 via-gray-950 to-emerald-950 text-white/70 pt-20 pb-8 px-6 lg:px-8 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
                        <div className="md:col-span-5 space-y-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-xl">WAP</div><div className="leading-tight"><span className="block font-black text-[9px] text-emerald-400 tracking-wider">WISATA ALAM</span><span className="block font-black text-lg text-white">PRONOJIWO</span></div></div><p className="text-sm text-white/60 leading-relaxed max-w-sm font-light">Pronojiwo Nature Escape adalah media resmi reservasi & pariwisata terpadu kawasan Kecamatan Pronojiwo, Lumajang.</p></div>
                        <div className="md:col-span-3 space-y-5"><h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Navigasi</h4><div className="flex flex-col gap-3.5 text-sm font-semibold">{navLinks.map((link) => (<a key={link.id} href={`#${link.id}`} className="hover:text-emerald-400 transition-colors w-fit">→ {link.name}</a>))}</div></div>
                        <div className="md:col-span-4 space-y-5"><h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-emerald-500 pl-3">Info Buletin</h4><p className="text-xs text-white/50 leading-relaxed">Dapatkan info promo musiman dan update wisata Pronojiwo gratis.</p><form onSubmit={(e) => { e.preventDefault(); alert("Terima kasih! Anda berlangganan info Pronojiwo."); e.target.reset(); }} className="flex flex-col sm:flex-row gap-2"><input type="email" placeholder="Alamat surel Anda" required className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-white/35 focus:outline-none focus:border-emerald-500 flex-1 transition-all" /><button type="submit" className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition-colors">Gabung</button></form></div>
                    </div>
                    <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-white/40"><p>© 2026 Wisata Alam Pronojiwo. Hak cipta dilindungi undang-undang.</p><p className="flex items-center gap-1.5">Terbuat dengan <span className="text-red-500 animate-pulse text-sm">♥</span> untuk pariwisata lestari Lumajang.</p></div>
                </div>
            </footer>

            {/* ── DESTINATION DETAIL MODAL ── */}
            {selectedDestDetails && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
                    <div className="bg-white border border-gray-100 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
                        <button onClick={() => setSelectedDestDetails(null)} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-950/40 hover:bg-gray-950/80 text-white flex items-center justify-center transition-colors">✕</button>
                        <div className="h-64 relative"><img src={selectedDestDetails.image} alt={selectedDestDetails.name} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent"></div><div className="absolute bottom-4 left-6 space-y-1"><span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{selectedDestDetails.category}</span><h3 className="text-2xl md:text-3xl font-bold text-white">{selectedDestDetails.name}</h3></div></div>
                        <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto">
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-4 text-center"><div><span className="text-[10px] text-gray-400 font-bold uppercase block">Harga Masuk</span><span className="font-black text-sm text-emerald-800">{formatPrice(selectedDestDetails.price)}</span></div><div><span className="text-[10px] text-gray-400 font-bold uppercase block">Koordinat</span><span className="font-bold text-gray-600 text-xs">{selectedDestDetails.coordinates}</span></div><div><span className="text-[10px] text-gray-400 font-bold uppercase block">Rating</span><span className="font-black text-sm text-amber-500">★ {selectedDestDetails.rating}</span></div></div>
                            <div className="space-y-2"><h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Deskripsi</h4><p className="text-gray-600 text-sm leading-relaxed">{selectedDestDetails.description}</p></div>
                            <div className="space-y-3"><h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Fasilitas</h4><div className="flex flex-wrap gap-2">{selectedDestDetails.facilities.map((fac, idx) => (<span key={idx} className="px-3 py-1.5 rounded-xl bg-stone-50 border border-gray-100 text-xs font-semibold text-gray-600">🏕️ {fac}</span>))}</div></div>
                        </div>
                        <div className="bg-stone-50 border-t border-gray-100 p-6 flex justify-end gap-3">
                            <button onClick={() => setSelectedDestDetails(null)} className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Kembali</button>
                            <button onClick={() => handleDirectBook(selectedDestDetails)} className="px-6 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all">
                                {user ? "Pesan E-Tiket Sekarang" : "Login & Pesan Tiket"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scroll { 0% { transform: translateY(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(14px); opacity: 0; } }
                .animate-scroll { animation: scroll 2.2s cubic-bezier(0.77, 0, 0.175, 1) infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.4); border-radius: 9999px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.7); }
                .h-13 { height: 52px; } .w-13 { width: 52px; } .h-22 { height: 88px; }
                .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
                .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
            ` }} />

        </div>
    );
}