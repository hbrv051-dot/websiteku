import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { verifyMasterPin, loadVaultSettings } from '../utils/vault';
import { showToast } from '../utils/alerts';

interface MasterPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export const MasterPinModal: React.FC<MasterPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Autentikasi PIN Master',
  subtitle = 'Masukkan PIN Master untuk membuka catatan kredensial rahasia website ini.',
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setShowPin(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSettings = loadVaultSettings();
  const isDefaultPin = currentSettings.masterPin === '123456';

  const handleVerify = (pinToTest = pin) => {
    if (!pinToTest.trim()) {
      setError('Silakan masukkan PIN Master Anda');
      return;
    }

    const isValid = verifyMasterPin(pinToTest);
    if (isValid) {
      setError('');
      showToast('Kredensial rahasia berhasil dibuka!', 'success');
      onSuccess();
      onClose();
    } else {
      setError('PIN Master salah! Silakan coba lagi.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      setError('');
    } else if (val === 'clear') {
      setPin('');
      setError('');
    } else if (pin.length < 12) {
      const nextPin = pin + val;
      setPin(nextPin);
      setError('');
      // If reached length of stored pin and user is typing on numeric pad
      if (nextPin.length === currentSettings.masterPin.length) {
        handleVerify(nextPin);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-700/80 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white transition-transform duration-150 ${
          isShaking ? 'translate-x-2' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 text-center bg-gradient-to-b from-blue-600/30 via-indigo-900/20 to-transparent border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 mb-3 font-black">
            <KeyRound className="w-7 h-7" />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed px-2">
            {subtitle}
          </p>

          {isDefaultPin && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>PIN Bawaan Sistem: <strong>123456</strong></span>
            </div>
          )}
        </div>

        {/* PIN Input Form */}
        <div className="p-6 space-y-4">
          <div>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerify();
                }}
                autoFocus
                placeholder="Masukkan PIN Master..."
                className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-white outline-none placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-xs text-rose-400 flex items-center justify-center gap-1.5 font-medium animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((item) => {
              if (item === 'C') {
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleKeypadPress('clear')}
                    className="py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700 active:bg-slate-600 text-xs font-bold text-slate-400 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                );
              }
              if (item === '⌫') {
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleKeypadPress('backspace')}
                    className="py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700 active:bg-slate-600 text-sm font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    ⌫
                  </button>
                );
              }
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleKeypadPress(item)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-base font-bold text-white transition-all transform active:scale-95 cursor-pointer shadow-xs"
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => handleVerify()}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-98 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Buka Brankas Sandi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
