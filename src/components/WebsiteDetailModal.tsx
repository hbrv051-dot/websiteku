import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Star,
  Edit2,
  Trash2,
  Mail,
  Folder,
  Calendar,
  Clock,
  ShieldCheck,
  Globe,
  Copy,
  Check,
  AlertTriangle,
  HardDrive,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  FileText,
  AppWindow,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { WebsiteItem } from '../types';
import { ThumbnailPreview } from './ThumbnailPreview';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { formatIndonesianDateTime, formatSimpleDate, getInactivityCountdown, openMiniKioskPopup } from '../utils/helpers';
import { showToast } from '../utils/alerts';
import { isVaultUnlocked } from '../utils/vault';
import { MasterPinModal } from './MasterPinModal';

interface WebsiteDetailModalProps {
  website: WebsiteItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenWebsite: (website: WebsiteItem) => void;
  onEdit: (website: WebsiteItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenKiosk?: (website: WebsiteItem) => void;
  onPing?: (website: WebsiteItem) => void;
  onWake?: (id: string) => void;
}

export const WebsiteDetailModal: React.FC<WebsiteDetailModalProps> = ({
  website,
  isOpen,
  onClose,
  onOpenWebsite,
  onEdit,
  onDelete,
  onToggleFavorite,
  onOpenKiosk,
  onPing,
  onWake,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [unlockedState, setUnlockedState] = useState(() => isVaultUnlocked());

  if (!isOpen || !website) return null;

  const categoryConfig = CATEGORIES_CONFIG.find((c) => c.name === website.category) || {
    badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
    description: 'Kategori website database',
  };

  const hasCredentials = Boolean(website.adminUsername || website.adminPassword || website.adminNotes);
  const isUnlocked = unlockedState || isVaultUnlocked();

  const isSupabaseMonitored = website.isSupabase !== false;
  const countdown = getInactivityCountdown(
    website.lastAccessed,
    website.createdAt,
    website.inactivityDaysLimit || 7
  );

  const handleKioskPopup = () => {
    if (onOpenKiosk) {
      onOpenKiosk(website);
    } else {
      openMiniKioskPopup(website.url, website.name);
      showToast(`Membuka ${website.name} dalam Mode Jendela Kios Mini`, 'info');
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(website.email);
    setCopiedEmail(true);
    showToast('Email pengelola disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyUsername = () => {
    if (!website.adminUsername) return;
    navigator.clipboard.writeText(website.adminUsername);
    setCopiedUsername(true);
    showToast('Username admin disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleCopyPassword = () => {
    if (!website.adminPassword) return;
    navigator.clipboard.writeText(website.adminPassword);
    setCopiedPassword(true);
    showToast('Password admin disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div 
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* LARGE THUMBNAIL BANNER */}
          <div className="relative w-full h-52 sm:h-60 bg-slate-900 shrink-0">
            <ThumbnailPreview
              src={website.thumbnail}
              alt={website.name}
              category={website.category}
              className="w-full h-full"
            />

            {/* Close Button Top Right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
              title="Tutup detail"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Left Badges: Category & Status */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md shadow-md ${categoryConfig.badgeBg}`}>
                <Folder className="w-3.5 h-3.5" />
                {website.category}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md shadow-md ${
                website.status === 'Aktif'
                  ? 'bg-emerald-600/90 text-white'
                  : 'bg-rose-600/90 text-white'
              }`}>
                <span className={`w-2 h-2 rounded-full ${website.status === 'Aktif' ? 'bg-white animate-pulse' : 'bg-white'}`} />
                {website.status}
              </span>
            </div>

            {/* Bottom Banner Bar Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent flex items-end justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-md">
                  {website.name}
                </h2>
                <p className="text-xs text-emerald-300 font-medium mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Koneksi Database Terproteksi</span>
                </p>
              </div>

              <button
                onClick={() => onToggleFavorite(website.id)}
                className={`p-2.5 rounded-2xl backdrop-blur-md transition-transform active:scale-90 shadow-lg ${
                  website.favorite
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-white/30 text-white hover:bg-white/50'
                }`}
                title={website.favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              >
                <Star className={`w-5 h-5 ${website.favorite ? 'fill-slate-950' : ''}`} />
              </button>
            </div>
          </div>

          {/* MODAL BODY */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Quick Access Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onOpenWebsite(website);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Globe className="w-4 h-4" />
                <span>Buka Website Sekarang</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(website);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 border border-slate-200 hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-blue-500" />
                  <span>Edit Data & Sandi</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onDelete(website.id);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition-colors"
                  title="Hapus website"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              </div>
            </div>

            {/* KREDENSIAL RAHASIA ADMIN / BRANKAS KATA SANDI */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl border border-indigo-900/50 p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Kredensial Login Admin (Pengelola Kata Sandi)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {isUnlocked ? '🔓 Brankas Terbuka' : '🔒 Dilindungi PIN Master'}
                    </span>
                  </div>
                </div>

                {!isUnlocked ? (
                  <button
                    onClick={() => setIsPinModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Buka Kredensial</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setUnlockedState(false);
                      showToast('Kredensial dikunci kembali.', 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                  >
                    Kunci Lagi
                  </button>
                )}
              </div>

              {/* Credential Content (When unlocked) */}
              {isUnlocked ? (
                <div className="pt-3 space-y-3">
                  {hasCredentials ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Username */}
                        <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div className="overflow-hidden">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Username Admin
                            </span>
                            <span className="text-xs font-mono font-semibold text-white truncate block">
                              {website.adminUsername || '(Belum diset)'}
                            </span>
                          </div>
                          {website.adminUsername && (
                            <button
                              onClick={handleCopyUsername}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Salin username"
                            >
                              {copiedUsername ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        {/* Password */}
                        <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div className="overflow-hidden">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Password Admin
                            </span>
                            <span className="text-xs font-mono font-semibold text-amber-300 truncate block">
                              {website.adminPassword
                                ? showPassword
                                  ? website.adminPassword
                                  : '••••••••••••'
                                : '(Belum diset)'}
                            </span>
                          </div>
                          {website.adminPassword && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                title={showPassword ? 'Sembunyikan' : 'Lihat password'}
                              >
                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                              <button
                                onClick={handleCopyPassword}
                                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Salin password"
                              >
                                {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Secret Notes */}
                      {website.adminNotes && (
                        <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                            Catatan Rahasia / Kunci 2FA / Port
                          </span>
                          <p className="text-xs font-mono text-slate-200 leading-relaxed">
                            {website.adminNotes}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400">
                      Belum ada kredensial admin yang disimpan untuk website ini.{' '}
                      <button
                        onClick={() => {
                          onClose();
                          onEdit(website);
                        }}
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        Klik disini untuk menambahkan.
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Username & Kata sandi admin terenkripsi dan terlindungi.</span>
                  <span className="text-[11px] text-amber-400 font-mono">Status: Terproteksi</span>
                </div>
              )}
            </div>

            {/* Description Section */}
            {website.description && (
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Deskripsi & Catatan
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {website.description}
                </p>
              </div>
            )}

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email Address */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 rounded-lg bg-blue-100/60 text-blue-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Email Pengelola
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate block">
                      {website.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-colors"
                  title="Salin email"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Status Backup */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100/60 text-emerald-600">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Status Sinkronisasi
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {website.backupStatus || 'Aman (Tersinkronisasi)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Supabase Auto-Pause Monitor Card (7-Day Inactivity Tracker) */}
            {isSupabaseMonitored && (
              <div className={`p-4 rounded-2xl border transition-all ${
                countdown.isCritical
                  ? 'bg-amber-50/80 border-amber-300'
                  : countdown.isPaused
                  ? 'bg-rose-50/80 border-rose-300'
                  : 'bg-emerald-50/40 border-emerald-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      countdown.isCritical
                        ? 'bg-amber-100 text-amber-800'
                        : countdown.isPaused
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                          Pelacak Anti-Jeda Supabase (Batas 7 Hari)
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${countdown.badgeClass}`}>
                          {countdown.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Supabase otomatis menghentikan sementara (pause) database jika tidak aktif selama 7 hari (168 jam). 
                        Buka website atau tekan tombol bangunkan di bawah untuk mereset timer.
                      </p>
                    </div>
                  </div>

                  {onWake && (
                    <button
                      onClick={() => onWake(website.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Bangunkan Sekarang</span>
                    </button>
                  )}
                </div>

                {/* Remaining percentage visual bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1">
                    <span>Sisa Waktu Aktif: <strong>{countdown.daysRemaining} hari {countdown.hoursRemaining} jam</strong></span>
                    <span>{countdown.percentage}% tersisa</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        countdown.isPaused
                          ? 'bg-rose-500 w-full'
                          : countdown.isCritical
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${countdown.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Live Ping & HTTP Response Health Check Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Uji Status & Latensi HTTP
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {website.pingStatus === 'checking' ? (
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Menguji respon server...
                      </span>
                    ) : website.pingStatus === 'online' ? (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Website Online ({website.pingLatency}ms)
                      </span>
                    ) : website.pingStatus === 'slow' ? (
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Respon Lambat ({website.pingLatency}ms)
                      </span>
                    ) : website.pingStatus === 'offline' ? (
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Offline / Timeout
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Belum diuji latensi respon
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {onPing && (
                <button
                  onClick={() => onPing(website)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-blue-400 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Uji Ping Sekarang</span>
                </button>
              )}
            </div>

            {/* Audit Timestamps */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Terakhir dibuka:</strong> {formatIndonesianDateTime(website.lastAccessed)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Ditambahkan:</strong> {formatSimpleDate(website.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {/* Button: Mode Jendela Popup Mandiri (Mini Desktop Popup) */}
              <button
                onClick={handleKioskPopup}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                title="Buka dalam Jendela Popup Mandiri (Kios Desktop Mini tanpa address bar)"
              >
                <AppWindow className="w-4 h-4" />
                <span>Buka Popup Mandiri (Kios)</span>
              </button>

              <button
                onClick={() => onOpenWebsite(website)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Buka di Multi-Window</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Master PIN Modal */}
      <MasterPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => setUnlockedState(true)}
        title="Buka Kredensial Rahasia"
        subtitle={`Masukkan PIN Master untuk melihat password admin ${website.name}.`}
      />
    </>
  );
};
