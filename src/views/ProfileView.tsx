import React, { useState, useRef } from 'react';
import {
  User,
  ShieldCheck,
  Mail,
  Volume2,
  VolumeX,
  Play,
  Square,
  Upload,
  Image as ImageIcon,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Sliders,
  Bot,
  Radio,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Key,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Check,
  Info,
} from 'lucide-react';
import { AudioSettings, AppBrandingSettings, LoginSoundPreset, UserProfile, AdminLoginCredentials } from '../types';
import { showToast, showSuccess, showError, showConfirmDialog } from '../utils/alerts';
import { playLoginSound, stopAllAudio, playCustomUploadedAudio, playSpeechGreeting } from '../utils/sound';
import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_BRANDING_SETTINGS,
  DEFAULT_ADMIN_CREDENTIALS,
  loadAdminCredentials,
  saveAdminCredentials,
  resetAdminCredentials,
} from '../utils/storage';
import { BrandLogo } from '../components/BrandLogo';

interface ProfileViewProps {
  branding: AppBrandingSettings;
  onUpdateBranding: (branding: AppBrandingSettings) => void;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (audioSettings: AudioSettings) => void;
  currentUser?: UserProfile;
  onUpdateCurrentUser?: (user: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  branding,
  onUpdateBranding,
  audioSettings,
  onUpdateAudioSettings,
  currentUser,
  onUpdateCurrentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'profile' | 'branding' | 'audio'>('login');

  // Login Credentials State
  const [credentials, setCredentials] = useState<AdminLoginCredentials>(() => loadAdminCredentials());
  const [usernameInput, setUsernameInput] = useState(credentials.username);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Form State
  const [adminName, setAdminName] = useState(branding.adminName || 'Mustofa');
  const [adminEmail, setAdminEmail] = useState(branding.adminEmail || 'admin@mustofa.id');
  const [adminAvatar, setAdminAvatar] = useState<string | null>(branding.adminAvatarUrl || null);

  // Branding Form State
  const [appName, setAppName] = useState(branding.appName || 'MY WEBSITE');
  const [appSubtitle, setAppSubtitle] = useState(branding.appSubtitle || 'Database MUSTOFA');
  const [appTagline, setAppTagline] = useState(branding.appTagline || 'Semua Database Website Dalam Satu Aplikasi');
  const [logoUrl, setLogoUrl] = useState<string | null>(branding.logoUrl || null);

  // Audio Form State
  const [audioEnabled, setAudioEnabled] = useState(audioSettings.enabled);
  const [audioPreset, setAudioPreset] = useState<LoginSoundPreset>(audioSettings.preset);
  const [customAudioData, setCustomAudioData] = useState<string | null>(audioSettings.customAudioData || null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(audioSettings.customAudioName || null);
  const [audioVolume, setAudioVolume] = useState<number>(audioSettings.volume ?? 80);
  const [speechText, setSpeechText] = useState<string>(audioSettings.speechGreetingText || 'Welcome home, sir.');
  const [speechPitch, setSpeechPitch] = useState<number>(audioSettings.speechVoicePitch ?? 0.9);
  const [speechRate, setSpeechRate] = useState<number>(audioSettings.speechVoiceRate ?? 0.92);
  const [playSpeechToggle, setPlaySpeechToggle] = useState<boolean>(audioSettings.playSpeech ?? true);

  // Audio Preview Playing State
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // File Input Refs
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Format Tidak Sesuai', 'Silakan pilih file gambar (PNG, JPG, SVG, WEBP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showError('File Terlalu Besar', 'Maksimal ukuran logo adalah 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoUrl(dataUrl);
      showToast('Logo berhasil diunggah! Klik Simpan untuk menerapkan.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // 2. Handle Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check audio mime type or extension
    const isAudio =
      file.type.startsWith('audio/') ||
      file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i);

    if (!isAudio) {
      showError('Format Audio Tidak Sesuai', 'Silakan unggah file audio seperti .mp3, .wav, .ogg, atau .m4a.');
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      showError('File Audio Terlalu Besar', 'Maksimal ukuran file audio adalah 6MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomAudioData(dataUrl);
      setCustomAudioName(file.name);
      setAudioPreset('custom_upload');
      showToast(`Audio "${file.name}" berhasil diunggah!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // 3. Handle Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Format Tidak Sesuai', 'Silakan pilih file gambar untuk foto profil.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAdminAvatar(dataUrl);
      showToast('Foto profil baru berhasil dimuat.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // 4. Test Play Current Audio Configuration
  const handleTestPlayAudio = () => {
    if (isPlayingPreview) {
      stopAllAudio();
      setIsPlayingPreview(false);
      return;
    }

    setIsPlayingPreview(true);
    const tempSettings: AudioSettings = {
      enabled: true,
      preset: audioPreset,
      customAudioData,
      customAudioName,
      volume: audioVolume,
      speechGreetingText: speechText,
      speechVoicePitch: speechPitch,
      speechVoiceRate: speechRate,
      playSpeech: playSpeechToggle,
    };

    playLoginSound(tempSettings);

    // Auto reset preview state after sound completes
    setTimeout(() => {
      setIsPlayingPreview(false);
    }, 3200);
  };

  // 5. Save Profile Form
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBranding: AppBrandingSettings = {
      ...branding,
      adminName: adminName.trim() || 'Mustofa',
      adminEmail: adminEmail.trim() || 'admin@mustofa.id',
      adminAvatarUrl: adminAvatar,
    };
    onUpdateBranding(updatedBranding);

    if (onUpdateCurrentUser && currentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        name: adminName.trim(),
        email: adminEmail.trim(),
      });
    }

    showSuccess('Profil Diperbarui', 'Data profil administrator berhasil disimpan.');
  };

  // 6. Save Branding Form
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedBranding: AppBrandingSettings = {
      ...branding,
      appName: appName.trim() || 'MY WEBSITE',
      appSubtitle: appSubtitle.trim() || 'Database MUSTOFA',
      appTagline: appTagline.trim() || 'Semua Database Website Dalam Satu Aplikasi',
      logoUrl: logoUrl,
    };
    onUpdateBranding(updatedBranding);
    showSuccess('Branding Disimpan', 'Logo dan identitas aplikasi berhasil diperbarui ke seluruh antarmuka.');
  };

  // 7. Save Audio Form
  const handleSaveAudio = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAudio: AudioSettings = {
      enabled: audioEnabled,
      preset: audioPreset,
      customAudioData: customAudioData,
      customAudioName: customAudioName,
      volume: audioVolume,
      speechGreetingText: speechText.trim() || 'Welcome home, sir.',
      speechVoicePitch: speechPitch,
      speechVoiceRate: speechRate,
      playSpeech: playSpeechToggle,
    };
    onUpdateAudioSettings(updatedAudio);
    showSuccess('Pengaturan Audio Disimpan', 'Efek suara login berhasil diperbarui dan siap digunakan.');
  };

  // 8. Reset Logo to Default
  const handleResetLogo = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Reset Logo ke Default?',
      text: 'Logo aplikasi akan kembali menggunakan ikon Globe standar.',
      confirmButtonText: 'Ya, Reset Logo',
      icon: 'question',
    });
    if (confirmed) {
      setLogoUrl(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
      showToast('Logo direset ke ikon standar.', 'info');
    }
  };

  // 9. Reset Audio to Default
  const handleResetAudio = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Reset Pengaturan Audio?',
      text: 'Pengaturan audio login akan dikembalikan ke konfigurasi default (Jarvis Voice).',
      confirmButtonText: 'Ya, Reset Audio',
      icon: 'question',
    });
    if (confirmed) {
      setAudioEnabled(DEFAULT_AUDIO_SETTINGS.enabled);
      setAudioPreset(DEFAULT_AUDIO_SETTINGS.preset);
      setCustomAudioData(DEFAULT_AUDIO_SETTINGS.customAudioData);
      setCustomAudioName(DEFAULT_AUDIO_SETTINGS.customAudioName);
      setAudioVolume(DEFAULT_AUDIO_SETTINGS.volume);
      setSpeechText(DEFAULT_AUDIO_SETTINGS.speechGreetingText);
      setSpeechPitch(DEFAULT_AUDIO_SETTINGS.speechVoicePitch);
      setSpeechRate(DEFAULT_AUDIO_SETTINGS.speechVoiceRate);
      setPlaySpeechToggle(DEFAULT_AUDIO_SETTINGS.playSpeech);
      showToast('Audio direset ke pengaturan standar.', 'info');
    }
  };

  // 10. Save Login Settings (Username and Password)
  const handleSaveLoginSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = usernameInput.trim();
    if (!trimmedUsername) {
      showError('Username Kosong', 'Silakan masukkan username administrator yang valid.');
      return;
    }

    if (trimmedUsername.length < 3) {
      showError('Username Terlalu Pendek', 'Username minimal harus 3 karakter.');
      return;
    }

    // Always verify current password before saving changes
    if (!currentPasswordInput) {
      showError(
        'Verifikasi Diperlukan',
        'Silakan masukkan kata sandi saat ini untuk memverifikasi perubahan kredensial.'
      );
      return;
    }

    if (currentPasswordInput !== credentials.password) {
      showError(
        'Kata Sandi Saat Ini Salah',
        'Kata sandi administrator saat ini yang Anda masukkan tidak sesuai.'
      );
      return;
    }

    // If new password is provided, validate it
    if (newPasswordInput) {
      if (newPasswordInput.length < 6) {
        showError('Kata Sandi Lemah', 'Kata sandi baru minimal harus 6 karakter.');
        return;
      }
      if (newPasswordInput !== confirmPasswordInput) {
        showError('Konfirmasi Tidak Cocok', 'Konfirmasi kata sandi baru tidak sama dengan kata sandi baru.');
        return;
      }
    }

    const finalPassword = newPasswordInput ? newPasswordInput : credentials.password;

    const updated: AdminLoginCredentials = {
      username: trimmedUsername,
      password: finalPassword,
      updatedAt: new Date().toISOString(),
    };

    saveAdminCredentials(updated);
    setCredentials(updated);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');

    showSuccess(
      'Kredensial Login Berhasil Disimpan',
      `Username aktif: ${updated.username}${newPasswordInput ? '\nKata sandi baru telah diperbarui dan siap digunakan.' : ''}`
    );
  };

  // 11. Reset Login Credentials to Default (admin / admin123)
  const handleResetLoginSettings = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Reset Kredensial Login?',
      text: 'Username akan dikembalikan ke "admin" dan kata sandi ke "admin123". Anda dapat menggunakannya untuk login sistem.',
      confirmButtonText: 'Ya, Reset Kredensial',
      icon: 'warning',
    });

    if (confirmed) {
      const reset = resetAdminCredentials();
      setCredentials(reset);
      setUsernameInput(reset.username);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      showSuccess(
        'Kredensial Login Direset',
        'Username: admin\nKata Sandi: admin123\nSilakan gunakan kredensial bawaan ini saat masuk.'
      );
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Pusat Kendali Sistem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
            Profil & Pengaturan Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola identitas akun pengelola, unggah logo kustom, dan atur audio login sistem
          </p>
        </div>

        {/* Quick Identity Mini Badge */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
          <BrandLogo
            logoUrl={branding.logoUrl}
            appName={branding.appName}
            size="sm"
            variant="light"
          />
          <div className="flex flex-col pr-2">
            <span className="text-xs font-bold text-slate-800">{branding.adminName}</span>
            <span className="text-[10px] text-blue-600 font-semibold">Super Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'login'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Pengaturan Login</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-mono">
            Admin
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil Pengelola</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Logo & Branding Aplikasi</span>
          {logoUrl && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-mono">
              Kustom
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'audio'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Pengaturan Audio Login</span>
          {audioEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB: PENGATURAN LOGIN (CHANGE USERNAME, PASSWORD, AND RESET LOGIN)       */}
      {/* ========================================================================= */}
      {activeTab === 'login' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Status & Overview Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Username Aktif
                </span>
                <span className="text-sm font-bold text-slate-800 font-mono truncate block">
                  {credentials.username}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status Proteksi
                </span>
                <span className="text-sm font-bold text-emerald-700">
                  Tersimpan Aman
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kredensial Default
                </span>
                <span className="text-xs font-mono text-slate-700 font-bold">
                  admin / admin123
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Ubah Username & Password */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-blue-600" />
                    <span>Ubah Username & Kata Sandi</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur username dan kata sandi baru untuk akses administrator sistem
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveLoginSettings} className="space-y-5">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username Administrator
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Masukkan username administrator"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Digunakan saat login di modal maupun di halaman utama login.
                  </span>
                </div>

                {/* Current Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kata Sandi Administrator Saat Ini <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Ketik kata sandi saat ini untuk verifikasi"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Diperlukan untuk memvalidasi bahwa Anda adalah pemilik akses yang sah. (Bawaan awal: <code className="text-blue-600 font-mono font-bold">admin123</code>).
                  </span>
                </div>

                {/* Divider */}
                <div className="pt-2 border-t border-slate-100" />

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Kata Sandi Baru (Opsional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Kosongkan jika tidak diubah"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Minimal 6 karakter kombinasi huruf & angka.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Key className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Kredensial</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Reset Login Card & Instructions */}
            <div className="space-y-6">
              {/* Reset Login Box */}
              <div className="bg-white p-6 rounded-3xl border border-red-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Reset Login Administrator
                    </h3>
                    <span className="text-[11px] text-red-600 font-semibold">
                      Kembalikan ke Setelan Awal
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika Anda lupa kata sandi administrator atau ingin mengembalikan kredensial ke konfigurasi awal bawaan, Anda dapat menekan tombol reset di bawah ini.
                </p>

                <div className="p-3.5 bg-red-50/70 rounded-2xl border border-red-100 space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Username Default:</span>
                    <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-red-200">admin</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Password Default:</span>
                    <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-red-200">admin123</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetLoginSettings}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Login ke Default</span>
                </button>
              </div>

              {/* Security Hint */}
              <div className="p-5 bg-blue-50/60 rounded-3xl border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                  <Info className="w-4 h-4" />
                  <span>Informasi Kredensial</span>
                </div>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  Kredensial login Anda disimpan secara aman di peramban ini. Anda juga dapat login menggunakan email administrator resmi (<strong>{branding.adminEmail}</strong>).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: AUDIO SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'audio' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Audio Configuration Card */}
          <form onSubmit={handleSaveAudio} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <span>Kustomisasi Audio Login</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih nada suara sistem, unggah lagu/audio sendiri, atau sesuaikan ucapan robot Jarvis
                </p>
              </div>

              {/* Master Audio Toggle Switch */}
              <label className="flex items-center gap-3 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 p-2.5 rounded-2xl border border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 relative"></div>
                <span className="text-xs font-bold text-slate-700">
                  {audioEnabled ? 'Audio Aktif' : 'Audio Nonaktif'}
                </span>
              </label>
            </div>

            {/* Sound Preset Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Jenis Efek Suara
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Jarvis Iron Man */}
                <div
                  onClick={() => setAudioPreset('jarvis')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    audioPreset === 'jarvis'
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      {audioPreset === 'jarvis' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Jarvis Iron Man</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Kombinasi nada hologram Arc Reactor + ucapan elegan <em>"Welcome home, sir."</em>
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 mt-3 block">
                    Mode AI & Hologram
                  </span>
                </div>

                {/* 2. Futuristic Hologram Chime */}
                <div
                  onClick={() => setAudioPreset('futuristic_chime')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    audioPreset === 'futuristic_chime'
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      {audioPreset === 'futuristic_chime' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Futuristic Hologram</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Sapuan nada harmonik sci-fi yang modern, berfrekuensi tinggi dan jernih.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-600 mt-3 block">
                    Synthesizer Modern
                  </span>
                </div>

                {/* 3. Modern Bell / Success Ding */}
                <div
                  onClick={() => setAudioPreset('modern_bell')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    audioPreset === 'modern_bell'
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      {audioPreset === 'modern_bell' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Modern Bell Chime</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Nada lonceng digital 4-oktaf lembut dan menyenangkan saat verifikasi berhasil.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 mt-3 block">
                    Elegan & Halus
                  </span>
                </div>

                {/* 4. Cyber Synth Pulse */}
                <div
                  onClick={() => setAudioPreset('cyber_synth')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    audioPreset === 'cyber_synth'
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Radio className="w-4 h-4" />
                      </div>
                      {audioPreset === 'cyber_synth' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Cyber Synthwave</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Akord synthesizer saw low-pass dengan dentuman bass retro-futuristik.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 mt-3 block">
                    Deep Bass Synth
                  </span>
                </div>

                {/* 5. Custom Upload Audio */}
                <div
                  onClick={() => setAudioPreset('custom_upload')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    audioPreset === 'custom_upload'
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <FileAudio className="w-4 h-4" />
                      </div>
                      {audioPreset === 'custom_upload' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Unggah Audio Sendiri</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Gunakan file lagu/efek suara favorit Anda (.mp3, .wav, .ogg, .m4a).
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-purple-600 mt-3 block">
                    {customAudioName ? `File: ${customAudioName}` : 'Belum Ada File'}
                  </span>
                </div>

                {/* 6. Speech Only */}
                <div
                  onClick={() => setAudioPreset('speech_only')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    audioPreset === 'speech_only'
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      {audioPreset === 'speech_only' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Hanya Suara Ucapan</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Murni ucapan suara robot AI tanpa musik latar belakang.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 mt-3 block">
                    Text-To-Speech Only
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Audio Upload Box (Expanded if Custom Upload is Selected) */}
            {audioPreset === 'custom_upload' && (
              <div className="p-5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-purple-600" />
                    <h4 className="text-sm font-bold text-purple-900">
                      File Audio Kustom Pengguna
                    </h4>
                  </div>
                  {customAudioData && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomAudioData(null);
                        setCustomAudioName(null);
                        if (audioInputRef.current) audioInputRef.current.value = '';
                        showToast('File audio kustom dihapus.', 'info');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus File</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleAudioUpload}
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  className="hidden"
                />

                {customAudioData ? (
                  <div className="p-4 bg-white rounded-xl border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <FileAudio className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-xs sm:max-w-md">
                          {customAudioName || 'Audio_Kustom.mp3'}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Audio siap diputar saat login
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Ganti File Audio
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl text-center cursor-pointer bg-white/70 hover:bg-white transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 group-hover:bg-purple-200 text-purple-700 flex items-center justify-center transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-purple-950">
                      Klik untuk Mengunggah File Audio Baru
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mendukung format .MP3, .WAV, .OGG, .M4A (Maks. 6MB)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Jarvis & Speech Customization Section */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Pengaturan Ucapan Suara (Jarvis / Robot AI)
                  </h4>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={playSpeechToggle}
                    onChange={(e) => setPlaySpeechToggle(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Sertakan Suara Ucapan</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Speech Text Input */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Teks Ucapan Suara
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={speechText}
                      onChange={(e) => setSpeechText(e.target.value)}
                      placeholder="Contoh: Welcome home, sir."
                      disabled={!playSpeechToggle}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-blue-500 outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={!playSpeechToggle}
                      onClick={() => setSpeechText('Welcome home, sir.')}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      Jarvis Standar
                    </button>
                    <button
                      type="button"
                      disabled={!playSpeechToggle}
                      onClick={() => setSpeechText(`Selamat datang kembali, ${adminName}.`)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      Bahasa Indo
                    </button>
                  </div>
                </div>

                {/* Speech Pitch Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-semibold text-slate-600">Nada Suara (Pitch)</span>
                    <span className="font-mono text-slate-500">{speechPitch}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    disabled={!playSpeechToggle}
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Berat / Dalam</span>
                    <span>Standar</span>
                    <span>Tinggi</span>
                  </div>
                </div>

                {/* Speech Rate Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-semibold text-slate-600">Kecepatan Bicara (Speed)</span>
                    <span className="font-mono text-slate-500">{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    disabled={!playSpeechToggle}
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Tenang / Lambat</span>
                    <span>Normal</span>
                    <span>Cepat</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Volume Control */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span>Kekuatan Volume Suara</span>
                </span>
                <span className="font-mono text-blue-700">{audioVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume}
                onChange={(e) => setAudioVolume(parseInt(e.target.value, 10))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Test Play & Save Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Uji Coba Audio Button */}
                <button
                  type="button"
                  onClick={handleTestPlayAudio}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isPlayingPreview
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {isPlayingPreview ? (
                    <>
                      <Square className="w-4 h-4" />
                      <span>Hentikan Suara</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Uji Coba Suara (Play)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetAudio}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  title="Kembalikan ke Default"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Audio</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BRANDING & LOGO UPLOAD */}
      {/* ========================================================================= */}
      {activeTab === 'branding' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <form onSubmit={handleSaveBranding} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <span>Unggah Logo & Identitas Aplikasi</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kustomisasi logo dan judul aplikasi yang tampil pada Landing Page, Login Page, Header, dan Sidebar
              </p>
            </div>

            {/* Logo Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left Upload Control */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  File Logo Aplikasi
                </label>

                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />

                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden p-2">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Uploaded Logo"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {logoUrl ? 'Klik untuk Ganti Logo' : 'Unggah Logo Baru'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      PNG, JPG, SVG, WEBP (Maks. 3MB)
                    </span>
                  </div>
                </div>

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Logo (Kembali ke Default)</span>
                  </button>
                )}
              </div>

              {/* Right Live Preview Cards */}
              <div className="md:col-span-2 space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pratinjau Tampilan Logo (Live Preview)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dark Mode Preview (Sidebar / Landing Header) */}
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950 via-indigo-950 to-slate-950 text-white border border-slate-800 shadow-md">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block mb-3">
                      Mode Gelap (Sidebar / Landing Page)
                    </span>
                    <BrandLogo
                      logoUrl={logoUrl}
                      appName={appName}
                      subtitle={appSubtitle}
                      showText={true}
                      size="md"
                      variant="dark"
                    />
                  </div>

                  {/* Light Mode Preview (App Header) */}
                  <div className="p-5 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-3">
                      Mode Terang (Header Aplikasi)
                    </span>
                    <BrandLogo
                      logoUrl={logoUrl}
                      appName={appName}
                      subtitle={appSubtitle}
                      showText={true}
                      size="md"
                      variant="light"
                    />
                  </div>
                </div>

                {/* Text Customization Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nama Aplikasi Utama
                    </label>
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Contoh: MY WEBSITE"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Subtitle / Label Aplikasi
                    </label>
                    <input
                      type="text"
                      value={appSubtitle}
                      onChange={(e) => setAppSubtitle(e.target.value)}
                      placeholder="Contoh: Database MUSTOFA"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tagline / Slogan Aplikasi
                    </label>
                    <input
                      type="text"
                      value={appTagline}
                      onChange={(e) => setAppTagline(e.target.value)}
                      placeholder="Contoh: Semua Database Website Dalam Satu Aplikasi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 flex justify-end border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Logo & Identitas</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROFILE DETAILS */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Avatar & Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-white mb-4 cursor-pointer group overflow-hidden"
              title="Klik untuk ganti foto profil"
            >
              {adminAvatar ? (
                <img
                  src={adminAvatar}
                  alt={adminName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{adminName.slice(0, 2).toUpperCase()}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                Ubah Foto
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800">{adminName}</h2>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full mt-1">
              Super Administrator
            </span>
            <span className="text-xs text-slate-400 mt-1">{adminEmail}</span>

            <div className="w-full mt-6 pt-5 border-t border-slate-100 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Status Akses:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Full Access
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Sesi Login:</span>
                <span className="font-mono text-slate-700">Aktif (Device Ini)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Keamanan Sandi:</span>
                <span className="text-slate-700 font-medium">Terproteksi Lokal</span>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Details Form */}
          <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-800">
              Informasi Pribadi & Kontak
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Administrator
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Administrator
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Keamanan & Privasi Data
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Aplikasi <strong>{branding.appName}</strong> dirancang offline-first dan tidak mengirimkan kredensial rahasia Anda ke server publik manapun.
                </p>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Data Profil</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
