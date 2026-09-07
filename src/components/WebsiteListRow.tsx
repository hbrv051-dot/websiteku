import React, { useState } from 'react';
import {
  Star,
  ExternalLink,
  Mail,
  Copy,
  Check,
  Edit2,
  Trash2,
  Eye,
  CopyPlus,
  KeyRound,
  ShieldCheck,
  AppWindow,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { WebsiteItem } from '../types';
import { ThumbnailPreview } from './ThumbnailPreview';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { formatIndonesianDateTime, getInactivityCountdown, openMiniKioskPopup, normalizeUrl } from '../utils/helpers';
import { showToast } from '../utils/alerts';

interface WebsiteListRowProps {
  website: WebsiteItem;
  onOpen: (website: WebsiteItem) => void;
  onViewDetails: (website: WebsiteItem) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (website: WebsiteItem) => void;
  onDuplicate: (website: WebsiteItem) => void;
  onDelete: (id: string) => void;
  onOpenKiosk?: (website: WebsiteItem) => void;
  onPing?: (website: WebsiteItem) => void;
  onWake?: (id: string) => void;
}

export const WebsiteListRow: React.FC<WebsiteListRowProps> = ({
  website,
  onOpen,
  onViewDetails,
  onToggleFavorite,
  onEdit,
  onDuplicate,
  onDelete,
  onOpenKiosk,
  onPing,
  onWake,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const categoryConfig = CATEGORIES_CONFIG.find((c) => c.name === website.category) || {
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
  };

  const hasCredentials = Boolean(website.adminUsername || website.adminPassword);

  const isSupabaseMonitored = website.isSupabase !== false;
  const countdown = getInactivityCountdown(
    website.lastAccessed,
    website.createdAt,
    website.inactivityDaysLimit || 7
  );

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(website.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleKioskPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenKiosk) {
      onOpenKiosk(website);
    } else {
      openMiniKioskPopup(website.url, website.name);
      showToast(`Membuka ${website.name} dalam Mode Jendela Kios Mini`, 'info');
    }
  };

  return (
    <div
      id={`row-${website.id}`}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border transition-all duration-150 gap-4 shadow-2xs hover:shadow-md ${
        countdown.isCritical
          ? 'border-amber-300 ring-1 ring-amber-300 bg-amber-50/20'
          : countdown.isPaused
          ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20'
          : 'border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
      }`}
    >
      {/* Left: Thumbnail & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Favorite toggle */}
        <button
          onClick={() => onToggleFavorite(website.id)}
          className={`p-2 rounded-xl transition-colors shrink-0 ${
            website.favorite
              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
              : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
          }`}
          title={website.favorite ? 'Hapus favorit' : 'Tandai favorit'}
        >
          <Star className={`w-4 h-4 ${website.favorite ? 'fill-amber-500' : ''}`} />
        </button>

        {/* Thumbnail Preview Image */}
        <div
          onClick={() => onViewDetails(website)}
          className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 cursor-pointer shadow-xs relative"
        >
          <ThumbnailPreview
            src={website.thumbnail}
            alt={website.name}
            category={website.category}
            className="w-full h-full"
          />
        </div>

        {/* Name and Meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              onClick={() => onViewDetails(website)}
              className="text-sm sm:text-base font-bold text-slate-800 hover:text-blue-600 cursor-pointer transition-colors truncate"
              title={website.name}
            >
              {website.name}
            </h3>

            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${categoryConfig.badgeBg}`}>
              {website.category}
            </span>

            {hasCredentials && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>Sandi</span>
              </span>
            )}

            {/* Ping latency badge */}
            {website.pingStatus === 'online' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPing) onPing(website);
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title={`Ping: ${website.pingLatency}ms. Klik untuk uji ulang.`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{website.pingLatency}ms</span>
              </button>
            ) : website.pingStatus === 'slow' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPing) onPing(website);
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                title={`Ping lambat: ${website.pingLatency}ms. Klik untuk uji ulang.`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{website.pingLatency}ms</span>
              </button>
            ) : website.pingStatus === 'offline' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPing) onPing(website);
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                title="Website Offline / Timeout. Klik untuk coba lagi."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Offline</span>
              </button>
            ) : null}

            {/* Supabase 7-Day Countdown Badge */}
            {isSupabaseMonitored && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold inline-flex items-center gap-1 ${countdown.badgeClass}`}
                title={`Pelacak Anti-Jeda Supabase: Terakhir akses ${countdown.lastActivityLabel}`}
              >
                <Clock className="w-2.5 h-2.5" />
                <span>{countdown.badgeText}</span>
              </span>
            )}

            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              website.status === 'Aktif'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {website.status}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-blue-500" />
              <span>{website.email}</span>
              <button
                onClick={handleCopyEmail}
                className="text-slate-400 hover:text-blue-600 ml-0.5"
                title="Salin email"
              >
                {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <span className="text-slate-300 hidden sm:inline">•</span>

            <span className="text-[11px] text-slate-400">
              Akses: {formatIndonesianDateTime(website.lastAccessed)}
            </span>

            {isSupabaseMonitored && onWake && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWake(website.id);
                }}
                className="text-[11px] text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-1 hover:underline"
                title="Reset timer 7 hari Supabase sekarang"
              >
                <Zap className="w-3 h-3" />
                <span>Bangunkan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end border-slate-100">
        <button
          onClick={() => onViewDetails(website)}
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Lihat Detail & Sandi"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Mini Kiosk Popup Shortcut */}
        <button
          onClick={handleKioskPopup}
          className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          title="Buka Mode Jendela Popup Mandiri (Kios Mini Desktop)"
        >
          <AppWindow className="w-4 h-4 text-amber-600" />
        </button>

        <button
          onClick={() => onEdit(website)}
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit Website"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDuplicate(website)}
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Duplikat"
        >
          <CopyPlus className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(website.id)}
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Hapus"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <a
          href={normalizeUrl(website.url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onOpen(website)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors ml-1 cursor-pointer no-underline"
          title={`Buka website tertaut: ${website.url}`}
        >
          <span>Buka</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
