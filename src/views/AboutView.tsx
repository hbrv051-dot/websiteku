import React from 'react';
import { Info, Globe, Shield, Sparkles, Smartphone, CheckCircle, Layers, Database } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-wide">
              MY WEBSITE
            </h1>
            <p className="text-xs sm:text-sm text-blue-200">
              Semua Database Website Dalam Satu Aplikasi
            </p>
          </div>
        </div>
      </div>

      {/* Main Narrative Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Tentang Aplikasi
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            <strong>My Website</strong> adalah platform katalog visual dan manajemen database website modern yang dirancang khusus untuk memusatkan akses seluruh website, portal akademik, sistem pelayanan masyarakat, toko online, rekam medis, dan sistem inventaris Anda dalam satu tempat yang aman dan terorganisir.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Identifikasi Visual Cepat</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Setiap website dilengkapi dengan thumbnail preview yang proporsional sehingga Anda dapat mengenali website secara visual dalam hitungan detik tanpa harus membaca nama satu per satu.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span>Responsif Penuh di Semua Layar</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Layout yang adaptif untuk Desktop (multi-kolom), Tablet (2 kolom), dan Smartphone (1 kolom dengan drawer navigasi yang nyaman disentuh).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Keamanan & Privasi Data</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tidak menyimpan password website secara otomatis untuk mencegah risiko pencurian kredensial. Data tersimpan secara lokal dan dapat di-export/import kapan saja.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-1.5">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Backup & Riwayat Akses</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pantau jadwal cadangan data dan lacak jejak akses website terakhir dengan timestamp akurat dalam Bahasa Indonesia.
            </p>
          </div>
        </div>

        {/* Metadata Specs */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>Versi Aplikasi: <strong>1.0.0 (Release 2026)</strong></span>
          <span>Platform: <strong>Web Standalone & Progressive Ready</strong></span>
          <span>Lisensi: <strong>© 2026 My Website</strong></span>
        </div>
      </div>
    </div>
  );
};
