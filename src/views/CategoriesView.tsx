import React, { useState } from 'react';
import { FolderTree, ArrowRight, Globe, Plus, Layers, Database } from 'lucide-react';
import { WebsiteItem, CategoryType } from '../types';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { WebsiteCard } from '../components/WebsiteCard';

interface CategoriesViewProps {
  websites: WebsiteItem[];
  onOpenWebsite: (website: WebsiteItem) => void;
  onViewDetails: (website: WebsiteItem) => void;
  onToggleFavorite: (id: string) => void;
  onEditWebsite: (website: WebsiteItem) => void;
  onDuplicateWebsite: (website: WebsiteItem) => void;
  onDeleteWebsite: (id: string) => void;
  onOpenAddModal: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  websites,
  onOpenWebsite,
  onViewDetails,
  onToggleFavorite,
  onEditWebsite,
  onDuplicateWebsite,
  onDeleteWebsite,
  onOpenAddModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'Semua'>('Semua');

  const categoryCounts = CATEGORIES_CONFIG.map((cat) => ({
    ...cat,
    count: websites.filter((w) => w.category === cat.name).length,
    items: websites.filter((w) => w.category === cat.name),
  }));

  const activeCategoryConfig = CATEGORIES_CONFIG.find((c) => c.name === selectedCategory);
  const activeWebsites = selectedCategory === 'Semua' 
    ? websites 
    : websites.filter((w) => w.category === selectedCategory);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <FolderTree className="w-4 h-4" />
            <span>Pengelompokan Sistem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            Kategori Database
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Jelajahi dan filter website berdasarkan klasifikasi sektor dan fungsinya
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

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryCounts.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(isSelected ? 'Semua' : (cat.name as CategoryType))}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left group ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 scale-[1.02]'
                  : 'bg-white hover:bg-blue-50/40 border-slate-200/90 hover:border-blue-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : cat.badgeBg
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cat.count} Situs
                  </span>
                </div>

                <p
                  className={`text-xs mt-3 line-clamp-2 leading-relaxed ${
                    isSelected ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className={isSelected ? 'text-white' : 'text-blue-600 group-hover:underline'}>
                  {isSelected ? 'Sedang Ditampilkan' : 'Lihat Database'}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Category Websites List */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">
              {selectedCategory === 'Semua' ? 'Seluruh Database' : `Kategori: ${selectedCategory}`}
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-extrabold rounded-full">
              {activeWebsites.length} Database
            </span>
          </div>

          {selectedCategory !== 'Semua' && (
            <button
              onClick={() => setSelectedCategory('Semua')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Reset ke Semua Kategori
            </button>
          )}
        </div>

        {activeWebsites.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Belum ada website di kategori ini</h3>
            <p className="text-xs text-slate-400 mt-1">Tambahkan website baru dan tentukan kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {activeWebsites.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                onOpen={onOpenWebsite}
                onViewDetails={onViewDetails}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEditWebsite}
                onDuplicate={onDuplicateWebsite}
                onDelete={onDeleteWebsite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
