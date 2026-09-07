import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Globe,
  Link,
  Sparkles,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Folder,
  Mail,
  Star,
  Layers,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Shield,
  FileText,
  Clock,
  Zap,
} from 'lucide-react';
import { WebsiteItem, CategoryType, WebsiteStatus } from '../types';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { getFaviconUrl, PRESET_THUMBNAILS, getCategoryIllustrationPreset } from '../utils/helpers';
import { ThumbnailPreview } from './ThumbnailPreview';
import { generateStrongPassword } from '../utils/vault';
import { showToast } from '../utils/alerts';

interface WebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (websiteData: Omit<WebsiteItem, 'id' | 'createdAt' | 'lastAccessed'> & { id?: string }) => void;
  initialData?: WebsiteItem | null;
}

export const WebsiteModal: React.FC<WebsiteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<CategoryType>('Pendidikan');
  const [thumbnail, setThumbnail] = useState('');
  const [status, setStatus] = useState<WebsiteStatus>('Aktif');
  const [description, setDescription] = useState('');
  const [favorite, setFavorite] = useState(false);

  // Supabase Inactivity Tracking (7-day pause rule)
  const [isSupabase, setIsSupabase] = useState(true);
  const [inactivityDaysLimit, setInactivityDaysLimit] = useState(7);

  // Kredensial Rahasia Admin
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showCredentialsSection, setShowCredentialsSection] = useState(false);

  const [thumbnailTab, setThumbnailTab] = useState<'url' | 'upload' | 'preset' | 'favicon'>('preset');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUrl(initialData.url);
      setEmail(initialData.email);
      setCategory(initialData.category);
      setThumbnail(initialData.thumbnail);
      setStatus(initialData.status);
      setDescription(initialData.description || '');
      setFavorite(initialData.favorite || false);
      setIsSupabase(initialData.isSupabase !== false);
      setInactivityDaysLimit(initialData.inactivityDaysLimit || 7);
      setAdminUsername(initialData.adminUsername || '');
      setAdminPassword(initialData.adminPassword || '');
      setAdminNotes(initialData.adminNotes || '');
      setShowCredentialsSection(Boolean(initialData.adminUsername || initialData.adminPassword || initialData.adminNotes));
    } else {
      // Reset form
      setName('');
      setUrl('');
      setEmail('');
      setCategory('Pendidikan');
      setThumbnail(getCategoryIllustrationPreset('Pendidikan'));
      setStatus('Aktif');
      setDescription('');
      setFavorite(false);
      setIsSupabase(true);
      setInactivityDaysLimit(7);
      setAdminUsername('');
      setAdminPassword('');
      setAdminNotes('');
      setShowCredentialsSection(false);
    }
    setFormError('');
    setShowAdminPassword(false);
  }, [initialData, isOpen]);

  // When category changes and user hasn't explicitly set a custom image, update default preset
  const handleCategoryChange = (newCat: CategoryType) => {
    setCategory(newCat);
    if (thumbnailTab === 'preset' || !thumbnail) {
      setThumbnail(getCategoryIllustrationPreset(newCat));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Ukuran gambar maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
        setFormError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetchFavicon = () => {
    if (!url.trim()) {
      setFormError('Masukkan URL website terlebih dahulu untuk mengambil favicon');
      return;
    }
    const favUrl = getFaviconUrl(url);
    if (favUrl) {
      setThumbnail(favUrl);
      setThumbnailTab('favicon');
      setFormError('');
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(16);
    setAdminPassword(generated);
    setShowAdminPassword(true);
    showToast('Kata sandi acak yang kuat berhasil dibuat!', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nama website wajib diisi');
      return;
    }
    if (!url.trim()) {
      setFormError('URL website wajib diisi');
      return;
    }
    if (!email.trim()) {
      setFormError('Email pengelola website wajib diisi');
      return;
    }

    // Default thumbnail fallback if empty
    const finalThumbnail = thumbnail.trim() || getCategoryIllustrationPreset(category);

    onSave({
      id: initialData?.id,
      name: name.trim(),
      url: url.trim(),
      email: email.trim(),
      category,
      thumbnail: finalThumbnail,
      status,
      description: description.trim(),
      favorite,
      backupStatus: 'Aman',
      lastBackupDate: new Date().toISOString(),
      adminUsername: adminUsername.trim(),
      adminPassword: adminPassword.trim(),
      adminNotes: adminNotes.trim(),
      isSupabase,
      inactivityDaysLimit: Number(inactivityDaysLimit) || 7,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                {initialData ? 'Edit Database Website' : 'Tambah Database Website Baru'}
              </h2>
              <p className="text-xs text-blue-100/90 font-normal">
                Kelola informasi website, kategori, dan kredensial rahasia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Website Name & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Website / Database <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Database Sekolah / Toko Online"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat URL Website <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://contoh-website.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Pengelola <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@domainanda.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kategori Website <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
              >
                {CATEGORIES_CONFIG.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Operasional
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WebsiteStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none font-medium"
              >
                <option value="Aktif">🟢 Aktif</option>
                <option value="Tidak Aktif">🔴 Tidak Aktif</option>
                <option value="Maintenance">🟡 Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tandai Favorit
              </label>
              <label className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-amber-50/50 transition-colors">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-amber-300 focus:ring-amber-400"
                />
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${favorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold text-slate-700">
                    Sematkan di Tab Favorit
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Thumbnail Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Foto / Thumbnail Website
              </label>
              <span className="text-[11px] text-blue-600 font-medium">
                Pilih Preset / Unggah / URL
              </span>
            </div>

            {/* Thumbnail Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setThumbnailTab('preset')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  thumbnailTab === 'preset' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Kategori Preset
              </button>
              <button
                type="button"
                onClick={() => setThumbnailTab('upload')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  thumbnailTab === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Unggah File
              </button>
              <button
                type="button"
                onClick={() => setThumbnailTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  thumbnailTab === 'url' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Input URL
              </button>
              <button
                type="button"
                onClick={handleFetchFavicon}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                  thumbnailTab === 'favicon' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                Auto Favicon
              </button>
            </div>

            {/* Tab: URL Input */}
            {thumbnailTab === 'url' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {/* Tab: Upload */}
            {thumbnailTab === 'upload' && (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl cursor-pointer bg-white transition-colors">
                <Upload className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-slate-700">
                  Klik untuk unggah gambar thumbnail
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG, WEBP (Maks 2MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Tab: Presets */}
            {thumbnailTab === 'preset' && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1">
                {PRESET_THUMBNAILS.map((preset, index) => (
                  <button
                    key={`${preset.name}-${index}`}
                    type="button"
                    onClick={() => setThumbnail(preset.url)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-video group ${
                      thumbnail === preset.url
                        ? 'border-blue-600 ring-2 ring-blue-200 scale-95'
                        : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] text-white font-bold px-1 text-center truncate">
                        {preset.name}
                      </span>
                    </div>
                    {thumbnail === preset.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Live Thumbnail Preview */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 shrink-0">Live Preview:</span>
              <div className="w-24 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-xs">
                <ThumbnailPreview
                  src={thumbnail}
                  alt={name || 'Preview'}
                  category={category}
                  className="w-full h-full"
                />
              </div>
              <span className="text-[11px] text-slate-400 italic truncate">
                Thumbnail ini yang akan ditampilkan di katalog card
              </span>
            </div>
          </div>

          {/* KREDENSIAL RAHASIA ADMIN (PASSWORD MANAGER / VAULT) */}
          <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl border border-indigo-900/50 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Kredensial Rahasia Admin (Pengelola Kata Sandi)
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Dilindungi PIN Master tambahan. Hanya dapat dilihat oleh Administrator terotentikasi.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCredentialsSection(!showCredentialsSection)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-slate-200 font-medium transition-colors"
              >
                {showCredentialsSection ? 'Sembunyikan' : 'Isi Kredensial'}
              </button>
            </div>

            {showCredentialsSection && (
              <div className="pt-3 border-t border-slate-800 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Username / Email Admin Website
                    </label>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin / superuser@domain.com"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Password Admin
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[10px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Acak Sandi Kuat</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 pr-9 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        title={showAdminPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Catatan Kredensial / Kunci 2FA / Port Panel
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Contoh: Port admin: 8443, Kunci cadangan 2FA: XXXX-YYYY, Hak akses Superuser..."
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none resize-none font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pelacak Anti-Jeda Supabase (Batas 7 Hari) */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSupabase}
                      onChange={(e) => setIsSupabase(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                    />
                    <span>Pantau Anti-Jeda Supabase (Batas 7 Hari)</span>
                  </label>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Database Supabase gratis akan terjeda otomatis bila tidak dibuka selama 7 hari. Aktifkan agar sistem memantau countdown, menandai peringatan dini, dan mengingatkan Anda untuk membukanya.
                  </p>
                </div>
              </div>
            </div>

            {isSupabase && (
              <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center justify-between gap-3 text-xs text-slate-700">
                <span className="font-medium">Batas Maksimal Hari Tidak Aktif:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={inactivityDaysLimit}
                    onChange={(e) => setInactivityDaysLimit(Math.max(1, parseInt(e.target.value) || 7))}
                    className="w-16 px-2.5 py-1 text-center bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-slate-600">Hari (Default: 7)</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi / Catatan Umum
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan mengenai kegunaan website, struktur modul, atau info kontak..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/25 transition-all transform active:scale-95 cursor-pointer"
            >
              {initialData ? 'Simpan Perubahan' : '+ Tambahkan Website'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
