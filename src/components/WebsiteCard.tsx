import React, { useState, useRef, useEffect } from 'react';
import {
  Star,
  ExternalLink,
  MoreVertical,
  Mail,
  Folder,
  Copy,
  Check,
  Edit2,
  CopyPlus,
  Trash2,
  Eye,
  ShieldCheck,
  KeyRound,
  AppWindow,
  Activity,
  Zap,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { WebsiteItem } from '../types';
import { ThumbnailPreview } from './ThumbnailPreview';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { getInactivityCountdown, openMiniKioskPopup } from '../utils/helpers';
import { showToast } from '../utils/alerts';

interface WebsiteCardProps {
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

export const WebsiteCard: React.FC<WebsiteCardProps> = ({
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
  const [showMenu, setShowMenu] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Find category style config
  const categoryConfig = CATEGORIES_CONFIG.find((c) => c.name === website.category) || {
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeText: 'text-slate-700',
  };

  const hasCredentials = Boolean(website.adminUsername || website.adminPassword);

  // Inactivity countdown calculation (Supabase 7-day pause rule)
  const isSupabaseMonitored = website.isSupabase !== false;
  const countdown = getInactivityCountdown(
    website.lastAccessed,
    website.createdAt,
    website.inactivityDaysLimit || 7
  );

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

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

  const getStatusBadge = () => {
    switch (website.status) {
      case 'Aktif':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Aktif
          </span>
        );
      case 'Tidak Aktif':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Tidak Aktif
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  // Ping badge styling
  const renderPingBadge = () => {
    if (website.pingStatus === 'checking') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
          <Activity className="w-3 h-3 animate-spin text-blue-500" />
          <span>Ping...</span>
        </span>
      );
    }

    if (website.pingStatus === 'online') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPing) onPing(website);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
          title={`Status: Online (${website.pingLatency || 0}ms). Klik untuk uji ping ulang.`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{website.pingLatency ? `${website.pingLatency}ms` : 'Online'}</span>
        </button>
      );
    }

    if (website.pingStatus === 'slow') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPing) onPing(website);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
          title={`Status: Lambat (${website.pingLatency || 0}ms). Klik untuk uji ping ulang.`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{website.pingLatency}ms</span>
        </button>
      );
    }

    if (website.pingStatus === 'offline') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPing) onPing(website);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
          title="Status: Tidak merespons / Timeout. Klik untuk coba lagi."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>Offline</span>
        </button>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onPing) onPing(website);
        }}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
        title="Uji latensi ping website ini"
      >
        <Activity className="w-3 h-3" />
        <span>Cek Ping</span>
      </button>
    );
  };

  return (
    <div
      id={`card-${website.id}`}
      className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 ${
        countdown.isCritical
          ? 'border-amber-300 ring-1 ring-amber-300'
          : countdown.isPaused
          ? 'border-rose-300 ring-1 ring-rose-200'
          : 'border-slate-200/90 hover:border-blue-300'
      }`}
    >
      {/* 1. THUMBNAIL PREVIEW WEBSITE */}
      <div 
        className="cursor-pointer relative overflow-hidden"
        onClick={() => onViewDetails(website)}
        title="Klik untuk melihat detail website"
      >
        <ThumbnailPreview
          src={website.thumbnail}
          alt={website.name}
          category={website.category}
          className="w-full h-44 sm:h-48"
          badge={
            <div className="flex items-center gap-1.5">
              {/* Quick Mini Kiosk Popup Shortcut Button */}
              <button
                onClick={handleKioskPopup}
                className="p-2 rounded-xl backdrop-blur-md bg-white/85 text-slate-700 hover:bg-amber-400 hover:text-slate-900 transition-all shadow-md"
                title="Buka Mode Jendela Kios Mini Popup"
                aria-label="Mode Popup Mandiri"
              >
                <AppWindow className="w-4 h-4" />
              </button>

              <button
                id={`fav-btn-${website.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(website.id);
                }}
                className={`p-2 rounded-xl backdrop-blur-md transition-all duration-150 shadow-md ${
                  website.favorite
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 ring-2 ring-amber-300'
                    : 'bg-white/80 text-slate-600 hover:bg-white hover:text-amber-500'
                }`}
                title={website.favorite ? 'Hapus dari favorit' : 'Tandai sebagai favorit'}
                aria-label="Toggle Favorit"
              >
                <Star
                  className={`w-4 h-4 ${
                    website.favorite ? 'fill-slate-900 text-slate-900' : 'text-slate-600'
                  }`}
                />
              </button>
            </div>
          }
        />

        {/* Floating Category Pill on top-left of thumbnail */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap max-w-[80%]">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-xs ${categoryConfig.badgeBg}`}>
            <Folder className="w-3 h-3" />
            {website.category}
          </span>

          {hasCredentials && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/90 text-slate-950 backdrop-blur-md shadow-xs"
              title="Kredensial login admin tersimpan & terproteksi"
            >
              <KeyRound className="w-3 h-3" />
              <span>Sandi</span>
            </span>
          )}
        </div>

        {/* Countdown warning banner if paused or critical */}
        {isSupabaseMonitored && (countdown.isCritical || countdown.isPaused) && (
          <div className={`absolute bottom-0 inset-x-0 px-3 py-1 text-[11px] font-bold flex items-center justify-between text-white backdrop-blur-md ${
            countdown.isPaused ? 'bg-rose-600/90' : 'bg-amber-600/90'
          }`}>
            <span className="flex items-center gap-1.5 truncate">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{countdown.badgeText}</span>
            </span>
            {onWake && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWake(website.id);
                }}
                className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-[10px] underline font-bold"
              >
                Bangunkan
              </button>
            )}
          </div>
        )}
      </div>

      {/* CARD BODY CONTENT */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
        <div>
          {/* Header Row: Database Name & Live Ping Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              onClick={() => onViewDetails(website)}
              className="text-base sm:text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
              title={website.name}
            >
              {website.name}
            </h3>

            {/* Ping latency badge */}
            <div className="shrink-0">
              {renderPingBadge()}
            </div>
          </div>

          {/* Email Row with Copy Shortcut */}
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50/80 p-2 rounded-xl border border-slate-100 group/email">
            <div className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate font-medium text-slate-700" title={website.email}>
                {website.email}
              </span>
            </div>
            <button
              onClick={handleCopyEmail}
              className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white shrink-0 transition-colors"
              title="Salin email"
              aria-label="Salin email"
            >
              {copiedEmail ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Supabase 7-Day Inactivity Auto-Pause Indicator */}
          {isSupabaseMonitored && (
            <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Clock className={`w-3.5 h-3.5 shrink-0 ${countdown.isCritical ? 'text-amber-500 animate-spin' : countdown.isPaused ? 'text-rose-500' : 'text-emerald-600'}`} />
                <span className="text-[11px] text-slate-600 truncate">
                  Anti-Jeda Supabase:
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${countdown.badgeClass}`} title={`Terakhir akses: ${countdown.lastActivityLabel}`}>
                  {countdown.badgeText}
                </span>

                {onWake && (
                  <button
                    onClick={() => onWake(website.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    title="Bangunkan sekarang & perbarui aktivitas (reset timer 7 hari)"
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Status Row */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Koneksi Terproteksi</span>
            </span>

            <div>{getStatusBadge()}</div>
          </div>

          {/* Description snippet */}
          {website.description && (
            <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {website.description}
            </p>
          )}
        </div>

        {/* CARD FOOTER: ACTION BUTTONS */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          {/* Primary "Buka Website" Button (Multi-Window) */}
          <button
            id={`open-btn-${website.id}`}
            onClick={() => onOpen(website)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer"
          >
            <span>Buka Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Mini Kiosk Popup Shortcut Button */}
          <button
            onClick={handleKioskPopup}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-amber-600 hover:bg-amber-50/60 hover:border-amber-300 transition-colors cursor-pointer"
            title="Mode Jendela Popup Mandiri (Desktop Mini Kiosk)"
            aria-label="Mode Popup Mandiri"
          >
            <AppWindow className="w-4 h-4" />
          </button>

          {/* Menu Button ⋮ */}
          <div className="relative" ref={menuRef}>
            <button
              id={`menu-btn-${website.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
              title="Menu opsi lainnya"
              aria-label="Menu Opsi"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu Popup */}
            {showMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onViewDetails(website);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors text-left"
                >
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Lihat Detail & Sandi</span>
                </button>

                <button
                  onClick={(e) => {
                    setShowMenu(false);
                    handleKioskPopup(e);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-colors text-left"
                >
                  <AppWindow className="w-4 h-4 text-amber-500" />
                  <span>Buka Popup Mandiri (Kios)</span>
                </button>

                {onWake && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onWake(website.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors text-left"
                  >
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>⚡ Reset Timer Anti-Jeda</span>
                  </button>
                )}

                {onPing && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onPing(website);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors text-left"
                  >
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>Uji Latensi Ping</span>
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(website);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors text-left"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                  <span>Edit Data</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate(website);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 transition-colors text-left"
                >
                  <CopyPlus className="w-4 h-4 text-slate-400" />
                  <span>Duplikat Website</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(website.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-rose-50 text-rose-600 transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Hapus Website</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
