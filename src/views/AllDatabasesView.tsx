import React, { useState, useMemo } from 'react';
import { Database, Filter, Search, Plus, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { WebsiteItem, CategoryType, SortOption, ViewMode } from '../types';
import { WebsiteCard } from '../components/WebsiteCard';
import { WebsiteListRow } from '../components/WebsiteListRow';
import { CATEGORIES_CONFIG } from '../data/initialData';

interface AllDatabasesViewProps {
  websites: WebsiteItem[];
  searchQuery: string;
  onOpenWebsite: (website: WebsiteItem) => void;
  onViewDetails: (website: WebsiteItem) => void;
  onToggleFavorite: (id: string) => void;
  onEditWebsite: (website: WebsiteItem) => void;
  onDuplicateWebsite: (website: WebsiteItem) => void;
  onDeleteWebsite: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenKiosk?: (website: WebsiteItem) => void;
  onPingWebsite?: (website: WebsiteItem) => void;
  onWakeWebsite?: (id: string) => void;
}

export const AllDatabasesView: React.FC<AllDatabasesViewProps> = ({
  websites,
  searchQuery,
  onOpenWebsite,
  onViewDetails,
  onToggleFavorite,
  onEditWebsite,
  onDuplicateWebsite,
  onDeleteWebsite,
  onOpenAddModal,
  onOpenKiosk,
  onPingWebsite,
  onWakeWebsite,
}) => {
  const [localCategory, setLocalCategory] = useState<string>('Semua');
  const [localStatus, setLocalStatus] = useState<string>('Semua');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filtered = useMemo(() => {
    return websites
      .filter((w) => {
        if (localCategory !== 'Semua' && w.category !== localCategory) return false;
        if (localStatus !== 'Semua' && w.status !== localStatus) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            w.name.toLowerCase().includes(q) ||
            w.email.toLowerCase().includes(q) ||
            w.url.toLowerCase().includes(q) ||
            w.category.toLowerCase().includes(q) ||
            (w.description || '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'name-asc') return a.name.localeCompare(b.name, 'id');
        if (sortOption === 'name-desc') return b.name.localeCompare(a.name, 'id');
        if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortOption === 'last-accessed') {
          const timeA = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
          const timeB = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
          return timeB - timeA;
        }
        return 0;
      });
  }, [websites, localCategory, localStatus, searchQuery, sortOption]);

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Katalog Master</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            Semua Database Website
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar lengkap seluruh database dan sistem website yang terdaftar ({websites.length} total)
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Website</span>
        </button>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category filter */}
          <select
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="Semua">Semua Kategori</option>
            {CATEGORIES_CONFIG.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={localStatus}
            onChange={(e) => setLocalStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5 justify-end">
          {/* Sort */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="name-asc">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="newest">Terbaru</option>
              <option value="last-accessed">Terakhir Dibuka</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada website ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter kategori atau status.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filtered.map((website) => (
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
        <div className="space-y-3">
          {filtered.map((website) => (
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
