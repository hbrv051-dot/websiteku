import React from 'react';
import { Globe, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 px-4 sm:px-8 border-t border-slate-200/80 bg-white/60 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px]">
            <Globe className="w-3 h-3" />
          </div>
          <span className="font-semibold text-slate-700">
            © 2026 My Website. Semua hak cipta dilindungi.
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Sistem Database Aman
          </span>
          <span>•</span>
          <span>Pusat Manajemen Website</span>
        </div>
      </div>
    </footer>
  );
};
