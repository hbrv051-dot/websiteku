import React, { useState, useMemo } from 'react';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Key,
  Folder,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { WebsiteItem } from '../types';
import { isVaultUnlocked, loadVaultSettings, updateMasterPin, generateStrongPassword, lockVaultSession } from '../utils/vault';
import { showToast, showSuccess, showError } from '../utils/alerts';
import { MasterPinModal } from '../components/MasterPinModal';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { CATEGORIES_CONFIG } from '../data/initialData';

interface VaultViewProps {
  websites: WebsiteItem[];
  onOpenWebsite: (website: WebsiteItem) => void;
  onEditWebsite: (website: WebsiteItem) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  websites,
  onOpenWebsite,
  onEditWebsite,
}) => {
  const [unlocked, setUnlocked] = useState(() => isVaultUnlocked());
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Password Generator State
  const [genLength, setGenLength] = useState(16);
  const [genIncludeUpper, setGenIncludeUpper] = useState(true);
  const [genIncludeNumbers, setGenIncludeNumbers] = useState(true);
  const [genIncludeSymbols, setGenIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState(() => generateStrongPassword(16));
  const [copiedGen, setCopiedGen] = useState(false);

  // Change PIN Form State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [showPinChangeSection, setShowPinChangeSection] = useState(false);

  const vaultSettings = loadVaultSettings();
  const isDefaultPin = vaultSettings.masterPin === '123456';

  // Websites with credentials
  const credentialWebsites = useMemo(() => {
    return websites.filter((w) => {
      const matchSearch倍 = 
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.adminUsername && w.adminUsername.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'all' || w.category === selectedCategory;
      return matchSearch倍;
    });
  }, [websites, searchQuery, selectedCategory]);

  const totalWithCredentials = websites.filter((w) => w.adminUsername || w.adminPassword).length;

  const handleTogglePassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, fieldId: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast(`${label} disalin ke clipboard!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRegeneratePassword = () => {
    const pw = generateStrongPassword(genLength, {
      uppercase: genIncludeUpper,
      lowercase: true,
      numbers: genIncludeNumbers,
      symbols: genIncludeSymbols,
    });
    setGeneratedPassword(pw);
  };

  const handleCopyGenerated = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopiedGen(true);
    showToast('Kata sandi baru berhasil disalin!', 'success');
    setTimeout(() => setCopiedGen(false), 2000);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPin) {
      setPinChangeError('Masukkan PIN Master lama Anda.');
      return;
    }
    if (newPin.length < 4) {
      setPinChangeError('PIN Master baru minimal 4 karakter.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPinChangeError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    const result黑暗 = updateMasterPin(oldPin, newPin);
    if (result黑暗.success) {
      showSuccess('PIN Berhasil Diperbarui', 'PIN Master pengelola kata sandi telah diperbarui.');
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
      setPinChangeError('');
      setShowPinChangeSection(false);
      setUnlocked(true);
    } else {
      setPinChangeError(result黑暗.message);
    }
  };

  const handleLockVault = () => {
    lockVaultSession();
    setUnlocked(false);
    setVisiblePasswords({});
    showToast('Brankas kata sandi telah dikunci kembali.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Vault */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 border border-indigo-900/60 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <KeyRound className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Pengelola Kredensial & Kata Sandi Rahasia
                </h1>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  unlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {unlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{unlocked ? 'Brankas Terbuka' : 'Terkunci'}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Pusat penyimpanan aman username, password admin, dan catatan 2FA tiap database website
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {!unlocked ? (
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Buka Brankas (PIN Master)</span>
              </button>
            ) : (
              <button
                onClick={handleLockVault}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Kunci Brankas</span>
              </button>
            )}

            <button
              onClick={() => setShowPinChangeSection(!showPinChangeSection)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-slate-300" />
              <span>Ganti PIN Master</span>
            </button>
          </div>
        </div>

        {/* Default PIN Banner */}
        {isDefaultPin && (
          <div className="mt-4 p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>PIN Master default sistem saat ini adalah: <strong>123456</strong>. Anda dapat menggantinya untuk keamanan ekstra.</span>
            </div>
            <button
              onClick={() => setShowPinChangeSection(true)}
              className="text-amber-300 hover:underline font-bold text-xs"
            >
              Ubah Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Change PIN Master Section */}
      {showPinChangeSection && (
        <div className="p-6 bg-slate-900 border border-slate-700/80 rounded-3xl text-white shadow-xl animate-in fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold">Ubah PIN Master Pengelola Kata Sandi</h3>
            </div>
            <button
              onClick={() => setShowPinChangeSection(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Tutup
            </button>
          </div>

          <form onSubmit={handleChangePin} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                PIN Master Lama
              </label>
              <input
                type="password"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="•••••• (Default: 123456)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                PIN Master Baru (Min. 4 Digit)
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="PIN Baru..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Konfirmasi PIN Baru
              </label>
              <input
                type="password"
                value={confirmNewPin}
                onChange={(e) => setConfirmNewPin(e.target.value)}
                placeholder="Ketik ulang PIN Baru..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:border-amber-400 outline-none font-mono"
                required
              />
            </div>

            {pinChangeError && (
              <div className="sm:col-span-3 text-xs text-rose-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{pinChangeError}</span>
              </div>
            )}

            <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPinChangeSection(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                Simpan PIN Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid 2 Columns: Generator & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strong Password Generator Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">
                  Generator Kata Sandi Acak Kuat
                </h3>
                <p className="text-xs text-slate-500">
                  Buat kata sandi terenkripsi tangguh untuk akun admin website baru
                </p>
              </div>
            </div>

            <button
              onClick={handleRegeneratePassword}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Acak ulang kata sandi"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Generated Box */}
          <div className="p-3.5 bg-slate-900 rounded-2xl flex items-center justify-between gap-3 font-mono text-sm text-amber-300 border border-slate-800 overflow-hidden">
            <span className="truncate tracking-wider font-bold select-all">
              {generatedPassword}
            </span>
            <button
              onClick={handleCopyGenerated}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              {copiedGen ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedGen ? 'Tersalin' : 'Salin Sandi'}</span>
            </button>
          </div>

          {/* Generator Controls */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Panjang: {genLength} Karakter</span>
              <input
                type="range"
                min="8"
                max="32"
                value={genLength}
                onChange={(e) => {
                  setGenLength(Number(e.target.value));
                  setTimeout(handleRegeneratePassword, 50);
                }}
                className="w-24 accent-blue-600 cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={genIncludeSymbols}
                onChange={(e) => {
                  setGenIncludeSymbols(e.target.checked);
                  setTimeout(handleRegeneratePassword, 50);
                }}
                className="rounded text-blue-600"
              />
              <span>Simbol (!@#$)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={genIncludeNumbers}
                onChange={(e) => {
                  setGenIncludeNumbers(e.target.checked);
                  setTimeout(handleRegeneratePassword, 50);
                }}
                className="rounded text-blue-600"
              />
              <span>Angka (0-9)</span>
            </label>
          </div>
        </div>

        {/* Vault Stats Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Statistik Kredensial
              </span>
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">
                {totalWithCredentials}
              </span>
              <span className="text-xs text-indigo-200 block mt-1">
                Website memiliki catatan login admin tersimpan dari total {websites.length} website
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-indigo-800/80 flex items-center justify-between text-xs">
            <span className="text-indigo-200">Enkripsi Brankas</span>
            <span className="font-semibold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aktif & Terproteksi
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari database / username admin..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Kategori</option>
            {CATEGORIES_CONFIG.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CREDENTIAL LIST */}
      <div className="space-y-3">
        {credentialWebsites.map((website) => {
          const isPwVisible = visiblePasswords[website.id] || false;
          const hasData = Boolean(website.adminUsername || website.adminPassword || website.adminNotes);

          return (
            <div
              key={website.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Thumbnail & Name */}
              <div className="flex items-center gap-3.5 min-w-0 md:w-1/3">
                <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                  <ThumbnailPreview
                    src={website.thumbnail}
                    alt={website.name}
                    category={website.category}
                    className="w-full h-full"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800 truncate" title={website.name}>
                      {website.name}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                      {website.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium block truncate mt-0.5">
                    {website.email}
                  </span>
                </div>
              </div>

              {/* Middle: Credentials Box */}
              <div className="flex-1 min-w-0 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                {unlocked ? (
                  hasData ? (
                    <div className="space-y-2 text-xs">
                      {/* Username & Password row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Username */}
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <div className="overflow-hidden">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">User Admin</span>
                            <span className="font-mono font-semibold text-slate-800 truncate block">
                              {website.adminUsername || '(Belum ada)'}
                            </span>
                          </div>
                          {website.adminUsername && (
                            <button
                              onClick={() => handleCopy(website.adminUsername!, `user-${website.id}`, 'Username')}
                              className="p-1 text-slate-400 hover:text-blue-600 ml-1"
                              title="Salin username"
                            >
                              {copiedField === `user-${website.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>

                        {/* Password */}
                        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                          <div className="overflow-hidden">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Password</span>
                            <span className="font-mono font-semibold text-amber-600 truncate block">
                              {website.adminPassword
                                ? isPwVisible
                                  ? website.adminPassword
                                  : '••••••••••••'
                                : '(Belum ada)'}
                            </span>
                          </div>
                          {website.adminPassword && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleTogglePassword(website.id)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                                title={isPwVisible ? 'Sembunyikan' : 'Tampilkan password'}
                              >
                                {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleCopy(website.adminPassword!, `pw-${website.id}`, 'Password')}
                                className="p-1 text-slate-400 hover:text-blue-600"
                                title="Salin password"
                              >
                                {copiedField === `pw-${website.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes snippet */}
                      {website.adminNotes && (
                        <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-mono truncate">
                          <span className="text-slate-400 font-semibold mr-1">Catatan:</span>
                          {website.adminNotes}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                      <span>Belum ada kredensial admin disimpan.</span>
                      <button
                        onClick={() => onEditWebsite(website)}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        + Tambah Kredensial
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-500 py-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Kredensial Terkunci (Perlu PIN Master)</span>
                    </span>
                    <button
                      onClick={() => setIsPinModalOpen(true)}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      Buka Sekarang
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => onEditWebsite(website)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Edit Kredensial"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenWebsite(website)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Buka Website</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {credentialWebsites.length === 0 && (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            <KeyRound className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Tidak ada database yang cocok</h4>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau kategori Anda.
            </p>
          </div>
        )}
      </div>

      {/* Master PIN Modal */}
      <MasterPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => setUnlocked(true)}
        title="Buka Brankas Kata Sandi"
        subtitle="Masukkan PIN Master untuk melihat seluruh catatan kredensial admin website."
      />
    </div>
  );
};
