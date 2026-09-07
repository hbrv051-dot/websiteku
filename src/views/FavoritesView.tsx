import React from 'react';
import { Star, Plus, Globe } from 'lucide-react';
import { WebsiteItem } from '../types';
import { WebsiteCard } from '../components/WebsiteCard';

interface FavoritesViewProps {
  websites: WebsiteItem[];
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

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  websites,
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
  const favoriteWebsites = websites.filter((w) => w.favorite);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>Akses Cepat Prioritas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            Website Favorit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar database website yang Anda beri tanda bintang ({favoriteWebsites.length} website tersimpan)
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

      {favoriteWebsites.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Belum ada website favorit
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Klik ikon bintang (⭐) pada card website di Dashboard untuk menyimpannya di halaman favorit ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {favoriteWebsites.map((website) => (
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
      )}
    </div>
  );
};
