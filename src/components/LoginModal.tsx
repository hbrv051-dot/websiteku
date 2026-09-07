import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { playLoginSound } from '../utils/sound';
import { AppBrandingSettings, AudioSettings } from '../types';
import { BrandLogo } from './BrandLogo';
import { validateAdminLogin } from '../utils/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: { name: string; username: string; email: string; role: string }) => void;
  branding?: AppBrandingSettings;
  audioSettings?: AudioSettings;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Silakan masukkan username atau email administrator.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      // Validate credentials against stored admin credentials
      const validation = validateAdminLogin(username, password, branding?.adminEmail);
      if (!validation.isValid) {
        setIsLoading(false);
        setErrorMsg(validation.message || 'Username atau kata sandi salah.');
        return;
      }

      setIsLoading(false);

      // Play configured login sound
      playLoginSound(audioSettings);

      const isEmail = username.includes('@');
      const emailValue = isEmail ? username.trim() : `${username.trim().toLowerCase()}@mustofa.id`;

      onLoginSuccess({
        name: branding?.adminName || 'Mustofa',
        username: username.trim(),
        email: emailValue,
        role: 'Super Administrator',
      });
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 max-w-[420px] w-full rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative text-white animate-in zoom-in-95 duration-150">
        {/* Decorative Top Accent */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-6 text-white text-left relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Tutup modal login"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <BrandLogo
              logoUrl={branding?.logoUrl}
              appName={branding?.appName || 'MY WEBSITE'}
              size="md"
              variant="dark"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200 block">
                {branding?.appSubtitle || 'Database MUSTOFA'}
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                Hallo Tuan
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-blue-100 mt-2 font-medium">
            Saya selalu menantikan Anda
          </p>
          <p className="text-[11px] font-bold text-cyan-200 mt-0.5 uppercase tracking-wider">
            Silahkan Masuk
          </p>
        </div>


        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in">
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:bg-slate-950 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-600 outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Password input */}
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
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-blue-500 focus:bg-slate-950 rounded-xl text-xs sm:text-sm font-medium text-white placeholder:text-slate-600 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & security badge */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer select-none">
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

