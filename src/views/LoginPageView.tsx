import React, { useState } from 'react';
import {
  Globe,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { playLoginSound } from '../utils/sound';
import { AppBrandingSettings, AudioSettings } from '../types';
import { BrandLogo } from '../components/BrandLogo';
import { validateAdminLogin } from '../utils/storage';

interface LoginPageViewProps {
  onBackToLanding: () => void;
  onLoginSuccess: (userData: { name: string; username: string; email: string; role: string }) => void;
  branding?: AppBrandingSettings;
  audioSettings?: AudioSettings;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  onBackToLanding,
  onLoginSuccess,
  branding,
  audioSettings,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Silakan masukkan username atau email administrator Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan kata sandi untuk melanjutkan.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Verification & Configured sound effect
    setTimeout(() => {
      // Validate credentials against stored admin credentials
      const validation = validateAdminLogin(username, password, branding?.adminEmail);
      if (!validation.isValid) {
        setIsLoading(false);
        setErrorMsg(validation.message || 'Username atau kata sandi salah.');
        return;
      }

      setIsLoading(false);
      
      // Play configured login sound (preset / custom audio / jarvis / muted)
      playLoginSound(audioSettings);

      const isEmail = username.includes('@');
      const emailValue = isEmail ? username.trim() : `${username.trim().toLowerCase()}@mustofa.id`;

      onLoginSuccess({
        name: branding?.adminName || 'Mustofa',
        username: username.trim(),
        email: emailValue,
        role: 'Super Administrator',
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Decorative ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm group backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-cyan-400" />
          <span>Kembali ke Halaman Utama</span>
        </button>

        <div className="flex items-center gap-2.5">
          <BrandLogo
            logoUrl={branding?.logoUrl}
            appName={branding?.appName || 'MY WEBSITE'}
            size="sm"
            variant="dark"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm text-white tracking-tight leading-none">
              {branding?.appName || 'MY WEBSITE'}
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
              {branding?.appSubtitle || 'Database MUSTOFA'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-[420px] w-full bg-slate-900/80 border border-slate-800/90 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header */}
          <div className="p-7 pb-4 text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-600/25 mb-4 border border-white/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Hallo Tuan
            </h1>
            <p className="text-sm text-slate-300 mt-1 font-medium">
              Saya selalu menantikan Anda
            </p>
            <p className="text-xs font-bold text-cyan-400 mt-2 uppercase tracking-wider">
              Silahkan Masuk
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLoginSubmit} className="p-7 pt-2 space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan akun administrator..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:bg-slate-950 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:bg-slate-950 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                  aria-label="Tampilkan sandi"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Security Status */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Ingat akun saya</span>
              </label>

              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SSL Terenkripsi</span>
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center text-[11px] text-slate-500">
        <p>Aplikasi Database Terpusat &bull; Akses Terproteksi Administrator &bull; 2026</p>
      </footer>
    </div>
  );
};

