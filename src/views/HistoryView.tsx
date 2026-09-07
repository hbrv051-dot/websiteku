import React from 'react';
import { History, ExternalLink, Trash2, Clock, Mail, Globe, Sparkles } from 'lucide-react';
import { AccessLog, WebsiteItem } from '../types';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { formatIndonesianDateTime, normalizeUrl } from '../utils/helpers';
import { showConfirmDialog, showToast } from '../utils/alerts';

interface HistoryViewProps {
  accessLogs: AccessLog[];
  websites: WebsiteItem[];
  onOpenWebsite: (website: WebsiteItem) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  accessLogs,
  websites,
  onOpenWebsite,
  onClearHistory,
}) => {
  const handleReopen = (log: AccessLog) => {
    const existing = websites.find((w) => w.id === log.websiteId);
    if (existing) {
      onOpenWebsite(existing);
    } else {
      window.open(normalizeUrl(log.websiteUrl), '_blank', 'noopener,noreferrer');
    }
  };

  const handleClear = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Bersihkan Riwayat Akses?',
      text: 'Seluruh riwayat kunjungan database website akan dihapus dari sistem.',
      confirmButtonText: 'Ya, Bersihkan',
      isDangerous: true,
      icon: 'warning',
    });
    if (confirmed) {
      onClearHistory();
      showToast('Riwayat akses berhasil dibersihkan.', 'success');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Jejak Kunjungan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            Riwayat Akses Website
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mencatat seluruh aktivitas pembukaan database website berdasarkan waktu akses
          </p>
        </div>

        {accessLogs.length > 0 && (
          <button
            onClick={handleClear}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold rounded-xl border border-rose-200 transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan Riwayat</span>
          </button>
        )}
      </div>

      {/* Access History List */}
      {accessLogs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Belum ada riwayat akses
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Saat Anda membuka website dari Dashboard, riwayat akses akan tercatat otomatis di sini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {accessLogs.map((log) => {
            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                {/* Left: Thumbnail + Metadata */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                    <ThumbnailPreview
                      src={log.thumbnail}
                      alt={log.websiteName}
                      category={log.category}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                        {log.websiteName}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                        {log.category}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        {log.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Timestamp & Action */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{formatIndonesianDateTime(log.timestamp)}</span>
                  </div>

                  <button
                    onClick={() => handleReopen(log)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Buka Lagi</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
