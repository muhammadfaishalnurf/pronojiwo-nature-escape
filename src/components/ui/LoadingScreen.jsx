// src/components/ui/LoadingScreen.jsx
export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"/>
                <p className="text-white/40 text-sm font-semibold">Memuat...</p>
            </div>
        </div>
    );
}