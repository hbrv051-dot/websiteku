import React from 'react';
import {
  Globe,
  LogIn,
  LayoutDashboard,
  Database,
  Plus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FolderTree,
  Star,
  History,
  BellRing,
  ExternalLink,
  Smartphone,
  Eye,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  Server,
  Zap,
} from 'lucide-react';
import { WebsiteItem, CategoryType } from '../types';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { WebsiteCard } from '../components/WebsiteCard';

interface HomeViewProps {
  websites: WebsiteItem[];
  isAuthenticated: boolean;
  onOpenLoginModal: () => void;
  onGoToDashboard: () => void;
  onGoToAllDatabases: () => void;
  onGoToCategories: () => void;
  onGoToFavorites: () => void;
  onOpenAddModal: () => void;
  onOpenWebsite: (website: WebsiteItem) => void;
  onViewDetails: (website: WebsiteItem) => void;
  onToggleFavorite: (id: string) => void;
  onEditWebsite: (website: WebsiteItem) => void;
  onDuplicateWebsite: (website: WebsiteItem) => void;
  onDeleteWebsite: (id: string) => void;
  onOpenKiosk?: (website: WebsiteItem) => void;
  onPingWebsite?: (website: WebsiteItem) => void;
  onWakeWebsite?: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  websites,
  isAuthenticated,
  onOpenLoginModal,
  onGoToDashboard,
  onGoToAllDatabases,
  onGoToCategories,
  onGoToFavorites,
  onOpenAddModal,
  onOpenWebsite,
  onViewDetails,
  onToggleFavorite,
  onEditWebsite,
  onDuplicateWebsite,
  onDeleteWebsite,
  onOpenKiosk,
  onPingWebsite,
  onWakeWebsite,
}) => {
  const activeCount = websites.filter((w) => w.status === 'Aktif').length;
  const favoriteCount = websites.filter((w) => w.favorite).length;
  const featuredWebsites = websites.slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. HERO SECTION WITH LOGIN CALLOUT */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-white/10">
        {/* Ambient Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Platform Master Database Website Terpadu</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
            Semua Database Website <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
              Dalam Satu Aplikasi
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            Kelola, amankan, dan akses seluruh sistem website sekolah, masjid, kependudukan, toko online, portal rekam medis, dan sistem inventaris Anda secara terpusat dalam katalog visual modern.
          </p>

          {/* Action Buttons Row with Login */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Tombol Login Admin */}
            <button
              onClick={onOpenLoginModal}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all transform active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>{isAuthenticated ? 'Sesi Admin Terbuka' : 'Masuk / Login Admin'}</span>
            </button>

            {/* Tombol Buka Dashboard */}
            <button
              onClick={onGoToDashboard}
              className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5 text-blue-300" />
              <span>Buka Dashboard</span>
            </button>

            {/* Tombol Tambah Website */}
            <button
              onClick={onOpenAddModal}
              className="px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-blue-200 hover:text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>+ Tambah Website</span>
            </button>
          </div>

          {/* Security & Reliability micro-badges */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-blue-200/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tanpa Simpan Password Otomatis</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Thumbnail Visual Instan</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Penyimpanan Terenkripsi</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME STATS STRIP */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">
              {websites.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Total Database Terdaftar
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-700 block">
              {activeCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Status Website Aktif
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-800 block">
              {favoriteCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Akses Prioritas Favorit
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-indigo-700 block">
              {CATEGORIES_CONFIG.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Kategori Sektor Sistem
            </span>
          </div>
        </div>
      </section>

      {/* 3. SHOWCASE / FEATURED WEBSITES SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Pratinjau Database Terpopuler</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              Database Unggulan Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Situs-situs utama yang sering diakses dan dikelola oleh administrator
            </p>
          </div>

          <button
            onClick={onGoToAllDatabases}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer self-start sm:self-auto"
          >
            <span>Lihat Seluruh {websites.length} Database</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {featuredWebsites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              onOpen={onOpenWebsite}
              onViewDetails={onViewDetails}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEditWebsite}
              onDuplicate={onDuplicateWebsite}
              onDelete={onDeleteWebsite}
              onOpenKiosk={onOpenKiosk}
              onPing={onPingWebsite}
              onWake={onWakeWebsite}
            />
          ))}
        </div>
      </section>

      {/* 4. SECTOR CATEGORIES EXPLORER */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <FolderTree className="w-4 h-4" />
              <span>Klasifikasi Sektor</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
              Eksplorasi Berdasarkan Kategori
            </h2>
          </div>

          <button
            onClick={onGoToCategories}
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Halaman Kategori Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES_CONFIG.map((cat) => {
            const count = websites.filter((w) => w.category === cat.name).length;
            return (
              <div
                key={cat.name}
                onClick={onGoToCategories}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${cat.badgeBg}`}>
                    {cat.name}
                  </span>
                  <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-blue-600">
                  <span>Jelajahi</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CORE SYSTEM ADVANTAGES (FITUR UNGGULAN) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Kelebihan Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Mengapa Menggunakan My Website?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dirancang khusus untuk memudahkan organisasi, instansi, dan bisnis mengelola banyak database website.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Identifikasi Thumbnail Visual
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Setiap website dilengkapi pratinjau gambar visual sehingga Anda dapat mengenali database dalam sekejap tanpa harus mencari teks manual.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Privasi Kredensial Terjamin
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Sistem tidak menyimpan kata sandi website secara otomatis untuk mencegah risiko kebocoran data dan melindungi akun Anda.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BellRing className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Pengingat & Manajemen Backup
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Pantau jadwal sinkronisasi cadangan data berkala dan ekspor/impor snapshot JSON secara mandiri kapan pun dibutuhkan.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Riwayat Akses Terintegrasi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Mencatat waktu dan frekuensi pembukaan database website dengan format tanggal dan waktu Indonesia yang mudah dibaca.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Responsif di Semua Perangkat
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Layout adaptif untuk Desktop, Tablet, dan Smartphone dengan navigasi sentuh yang nyaman dan cepat.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Pencarian Real-Time Cepat
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Cari website melalui nama, email administrator, domain URL, kategori, dan deskripsi dalam hitungan milidetik.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BOTTOM BANNER */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Akses Penuh Sekarang
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Siap Mengelola Seluruh Database Website Anda?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Gunakan portal My Website untuk menyatukan seluruh website instansi, bisnis, dan sistem operasional Anda dalam satu tempat.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10 flex-wrap justify-center">
          <button
            onClick={onOpenLoginModal}
            className="px-6 py-3.5 rounded-xl bg-white text-blue-700 font-extrabold text-xs sm:text-sm hover:bg-blue-50 shadow-lg shadow-black/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk / Login Admin</span>
          </button>

          <button
            onClick={onGoToDashboard}
            className="px-5 py-3.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Buka Dashboard</span>
          </button>
        </div>
      </section>
    </div>
  );
};
