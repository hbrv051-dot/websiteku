import React, { useMemo } from 'react';
import {
  Database,
  CheckCircle2,
  Star,
  FolderTree,
  ShieldCheck,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  Plus,
  Search,
  Sparkles,
  Globe,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  AppWindow,
} from 'lucide-react';
import { WebsiteItem, CategoryType, SortOption, ViewMode } from '../types';
import { WebsiteCard } from '../components/WebsiteCard';
import { WebsiteListRow } from '../components/WebsiteListRow';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { getInactivityCountdown } from '../utils/helpers';

interface DashboardViewProps {
  websites: WebsiteItem[];
  searchQuery: string;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenWebsite: (website: WebsiteItem) => void;
  onViewDetails: (website: WebsiteItem) => void;
  onToggleFavorite: (id: string) => void;
  onEditWebsite: (website: WebsiteItem) => void;
  onDuplicateWebsite: (website: WebsiteItem) => void;
  onDeleteWebsite: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenKiosk?: (website: WebsiteItem) => void;
  onPingWebsite?: (website: WebsiteItem) => void;
  onCheckAllPing?: () => void;
  isCheckingAllPing?: boolean;
  onWakeWebsite?: (id: string) => void;
  onWakeAllSupabase?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  websites,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenWebsite,
  onViewDetails,
  onToggleFavorite,
  onEditWebsite,
  onDuplicateWebsite,
  onDeleteWebsite,
  onOpenAddModal,
  onOpenKiosk,
  onPingWebsite,
  onCheckAllPing,
  isCheckingAllPing,
  onWakeWebsite,
  onWakeAllSupabase,
}) => {
  // Statistics Calculations
  const totalDatabases = websites.length;
  const activeWebsites = websites.filter((w) => w.status === 'Aktif').length;
  const favoriteCount = websites.filter((w) => w.favorite).length;
  const categoriesCount = new Set(websites.map((w) => w.category)).size;

  // Ping statistics
  const onlinePings = websites.filter((w) => w.pingStatus === 'online').length;
  const slowPings = websites.filter((w) => w.pingStatus === 'slow').length;
  const offlinePings = websites.filter((w) => w.pingStatus === 'offline').length;

  // Supabase Inactivity calculations
  const supabaseWebsites = websites.filter((w) => w.isSupabase !== false);
  const criticalSupabaseWebsites = supabaseWebsites.filter((w) => {
    const countdown = getInactivityCountdown(w.lastAccessed, w.createdAt, w.inactivityDaysLimit || 7);
    return countdown.isCritical || countdown.isPaused;
  });

  // Filter and Sort websites
  const filteredWebsites = useMemo(() => {
    return websites
      .filter((item) => {
        // Category Filter
        if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
          return false;
        }

        // Search Query (name, email, url, category, description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchEmail = item.email.toLowerCase().includes(q);
          const matchUrl = item.url.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          return matchName || matchEmail || matchUrl || matchCategory || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'name-asc':
            return a.name.localeCompare(b.name, 'id');
          case 'name-desc':
            return b.name.localeCompare(a.name, 'id');
          case 'newest':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'last-accessed':
            const timeA = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
            const timeB = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
            return timeB - timeA;
          case 'favorite':
            if (a.favorite === b.favorite) {
              return a.name.localeCompare(b.name, 'id');
            }
            return a.favorite ? -1 : 1;
          default:
            return 0;
        }
      });
  }, [websites, searchQuery, selectedCategory, sortOption]);

  return (
    <div className="space-y-7 pb-10">
      {/* 1. WELCOME HERO SECTION */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/15 relative overflow-hidden">
        {/* Background decorative geometry */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 -top-10 w-48 h-48 bg-cyan-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Pusat Kendali Website & Database</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Selamat Datang Kembali Tuan
          </h1>

          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
            Kelola dan akses semua database website Anda dengan mudah, semua tersimpan rapi dalam satu aplikasi.
          </p>

          {/* Quick Action Pill on Hero */}
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-800 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-700" />
              <span>+ Tambah Website Baru</span>
            </button>

            {onCheckAllPing && (
              <button
                onClick={onCheckAllPing}
                disabled={isCheckingAllPing}
                className="px-4 py-2.5 bg-cyan-400/20 hover:bg-cyan-400/30 text-white border border-cyan-300/30 rounded-xl text-xs sm:text-sm font-bold shadow-md backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Activity className={`w-4 h-4 text-cyan-300 ${isCheckingAllPing ? 'animate-spin' : ''}`} />
                <span>{isCheckingAllPing ? 'Memeriksa Semua...' : 'Cek Status Seluruh Website'}</span>
              </button>
            )}

            <span className="text-xs text-blue-200/80">
              {totalDatabases} website aktif tersimpan dalam sistem
            </span>
          </div>
        </div>
      </div>

      {/* 1.5 SUPABASE WARNING ALERT BANNER (If any database is near 7-day limit or paused) */}
      {criticalSupabaseWebsites.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-400 text-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                <span>Peringatan Supabase: {criticalSupabaseWebsites.length} Website Perlu Diperbarui!</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold">
                  Batas 7 Hari
                </span>
              </h3>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                Supabase akan menjeda database otomatis jika tidak ada interaksi selama 7 hari. 
                Website terdampak: <strong>{criticalSupabaseWebsites.map((w) => w.name).join(', ')}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onWakeAllSupabase && (
              <button
                onClick={onWakeAllSupabase}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>⚡ Bangunkan Semua Supabase</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. STATISTIK 5 CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Database */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Database
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {totalDatabases}
            </span>
            <span className="text-xs text-slate-400 font-medium">Situs</span>
          </div>
        </div>

        {/* Website Aktif */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Website Aktif
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              {activeWebsites}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Online</span>
          </div>
        </div>

        {/* Favorit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Favorit
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {favoriteCount}
            </span>
            <span className="text-xs text-amber-600 font-medium">Prioritas</span>
          </div>
        </div>

        {/* Anti-Jeda Supabase Monitor */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Anti-Jeda Supabase
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              {supabaseWebsites.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">Terpantau</span>
          </div>
        </div>

        {/* Status Keamanan */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status Keamanan
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm sm:text-base font-extrabold text-emerald-700">
              100% Aman
            </span>
          </div>
        </div>
      </div>

      {/* 2.5 LIVE HEALTH & MONITORING TOOLBAR */}
      <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-700">Uji Respon & Status:</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {onlinePings} Responsif
            </span>

            {slowPings > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {slowPings} Lambat
              </span>
            )}

            {offlinePings > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {offlinePings} Tidak Merespons
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {onWakeAllSupabase && (
            <button
              onClick={onWakeAllSupabase}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset timer 7 hari Supabase untuk semua website yang sedang dipantau"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Bangunkan Semua (Reset 7 Hari)</span>
            </button>
          )}

          {onCheckAllPing && (
            <button
              onClick={onCheckAllPing}
              disabled={isCheckingAllPing}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Uji HTTP respon dan kecepatan milidetik semua website sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAllPing ? 'animate-spin' : ''}`} />
              <span>{isCheckingAllPing ? 'Memeriksa...' : 'Cek Status Seluruh Website'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. FILTER, SORT & VIEW CONTROLS */}
      <div className="space-y-3">
        {/* Category horizontal scroll chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            onClick={() => onSelectCategory('Semua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'Semua'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua Kategori ({websites.length})
          </button>

          {CATEGORIES_CONFIG.map((cat) => {
            const count = websites.filter((w) => w.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter bar: Sorting & View Toggle */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Menampilkan</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">
              {filteredWebsites.length}
            </span>
            <span>dari {websites.length} database website</span>
            {searchQuery && (
              <span className="text-slate-400 italic">
                (hasil pencarian "{searchQuery}")
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="name-asc">Nama A-Z</option>
                <option value="name-desc">Nama Z-A</option>
                <option value="newest">Terbaru Ditambahkan</option>
                <option value="last-accessed">Terakhir Dibuka</option>
                <option value="favorite">Prioritas Favorit</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid / List) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Grid"
                aria-label="Tampilan Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan List"
                aria-label="Tampilan List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WEBSITE CATALOG SECTION (GRID OR LIST) */}
      {filteredWebsites.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Tidak ada website ditemukan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? `Tidak ada hasil yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain atau bersihkan pencarian.`
              : 'Belum ada website dalam kategori ini. Silakan tambahkan website baru.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Website Baru</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View: Responsive 1 col mobile, 2 col tablet, 3-4 col desktop */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredWebsites.map((website) => (
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
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredWebsites.map((website) => (
            <WebsiteListRow
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
      )}
    </div>
  );
};
