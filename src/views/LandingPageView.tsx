import React, { useState } from 'react';
import {
  Globe,
  LogIn,
  Database,
  ShieldCheck,
  Sparkles,
  FolderTree,
  Star,
  History,
  BellRing,
  Smartphone,
  Eye,
  CheckCircle2,
  Lock,
  Zap,
  Search,
  Server,
  Shield,
  Clock,
  KeyRound,
} from 'lucide-react';
import { WebsiteItem, AppBrandingSettings } from '../types';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { ThumbnailPreview } from '../components/ThumbnailPreview';
import { BrandLogo } from '../components/BrandLogo';

interface LandingPageViewProps {
  websites: WebsiteItem[];
  onOpenLogin: () => void;
  branding?: AppBrandingSettings;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  websites,
  onOpenLogin,
  branding,
}) => {
  const activeCount = websites.filter((w) => w.status === 'Aktif').length;
  const sampleWebsites = websites.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* 1. TOP NAVBAR - WITH ONLY ONE "LOGIN" BUTTON IN TOP CORNER */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <BrandLogo
              logoUrl={branding?.logoUrl}
              appName={branding?.appName || 'MY WEBSITE'}
              size="md"
              variant="dark"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  {branding?.appName || 'MY WEBSITE'}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {branding?.appSubtitle || 'Database MUSTOFA'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#fitur" className="hover:text-cyan-400 transition-colors">
              Fitur Utama
            </a>
            <a href="#katalog" className="hover:text-cyan-400 transition-colors">
              Katalog Database
            </a>
            <a href="#keamanan" className="hover:text-cyan-400 transition-colors">
              Keamanan Data
            </a>
            <a href="#sektor" className="hover:text-cyan-400 transition-colors">
              Kategori Sektor
            </a>
          </nav>

          {/* SINGLE LOGIN BUTTON IN TOP CORNER */}
          <div className="flex items-center">
            <button
              id="top-login-button"
              onClick={onOpenLogin}
              className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer transform active:scale-95"
            >
              <LogIn className="w-4 h-4 text-cyan-200" />
              <span>Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (Without redundant CTA buttons) */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-7">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg shadow-blue-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Pusat Manajemen Database & Portal Website Modern</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
            Semua Database Website <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Dalam Satu Aplikasi
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Satu pintu masuk terpadu untuk mengelola, mengakses, dan memantau seluruh sistem website sekolah, masjid, kependudukan, toko online, rekam medis, dan sistem inventaris Anda secara instan dan aman.
          </p>

          {/* Quick trust metrics summary */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 block">
                {websites.length}+
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Database Terdaftar
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">
                {activeCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Sistem Aktif & Terpantau
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 block">
                {CATEGORIES_CONFIG.length} Sektor
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Kategori Terorganisir
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 block">
                100%
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Privasi Kredensial Aman
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE VISUAL SHOWCASE OF DATABASE WEBSITES */}
      <section id="katalog" className="py-16 bg-slate-950 border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Katalog Terintegrasi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Pratinjau Database Terpasang
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Setiap database dilengkapi thumbnail visual, status koneksi, dan penanggung jawab yang tertata rapi.
            </p>
          </div>

          {/* Grid of sample website cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleWebsites.map((site) => (
              <div
                key={site.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1 shadow-xl"
              >
                {/* Visual Thumbnail */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                  <ThumbnailPreview
                    src={site.thumbnail}
                    alt={site.name}
                    category={site.category}
                    className="w-full h-full"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-slate-700 shadow-md">
                      {site.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      🟢 {site.status}
                    </span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {site.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {site.description || 'Database operasional dengan enkripsi terintegrasi.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Database Terproteksi
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. KEY SYSTEM FEATURES SECTION */}
      <section id="fitur" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fitur Unggulan Sistem</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Dirancang Untuk Kecepatan & Keamanan Maksimal
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Kombinasi antarmuka visual cerdas dengan standar keamanan tingkat tinggi untuk memudahkan pengelola website harian.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4 group hover:border-blue-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Eye className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Identifikasi Visual Cepat
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Thumbnail responsif beresolusi tinggi memudahkan Anda membedakan website sekolah, masjid, puskesmas, dan toko dalam sekejap tanpa kebingungan.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4 group hover:border-emerald-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Privasi Kredensial Tanpa Simpan Sandi
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kami mematuhi standar keamanan ketat dengan tidak menyimpan password secara otomatis, menjaga kredensial admin tetap terlindungi sepenuhnya.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4 group hover:border-indigo-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <BellRing className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Sinkronisasi & Backup Mandiri
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pantau jadwal backup berkala, ekspor snapshot data dalam format JSON, serta pulihkan seluruh database hanya dengan 1 kali klik.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4 group hover:border-amber-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <History className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Pencatatan Riwayat Akses
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Jejak waktu kunjungan otomatis tercatat rapi dengan penanggalan Bahasa Indonesia untuk memantau intensitas pemakaian setiap sistem.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4 group hover:border-cyan-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Responsif di Komputer & HP
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Akses lancar dari layar monitor ultra-wide, laptop kerja, tablet presentasi, hingga smartphone saat Anda sedang berada di luar kantor.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 relative overflow-hidden space-y-4 group hover:border-purple-500/50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Pencarian Cepat & Filter Sektor
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Temukan database apapun berdasarkan nama, URL domain, email administrator, maupun kategori dalam hitungan milidetik.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECTOR CATEGORIES OVERVIEW */}
      <section id="sektor" className="py-16 bg-slate-950 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <FolderTree className="w-4 h-4" />
              <span>Multi-Sektor</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Kategori Database Yang Didukung
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Pengelompokan sistem yang disesuaikan dengan kebutuhan instansi dan korporasi.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES_CONFIG.map((cat) => {
              const count = websites.filter((w) => w.category === cat.name).length;
              return (
                <div
                  key={cat.name}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {cat.name}
                    </span>
                    <span className="text-xs font-extrabold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                      {count} Situs
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SECURITY BANNER (Without redundant CTA buttons) */}
      <section id="keamanan" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950 p-8 sm:p-12 rounded-3xl border border-blue-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              <ShieldCheck className="w-4 h-4" />
              <span>Standar Keamanan Tinggi</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Data Anda Aman & Terkendali Sepenuhnya
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              My Website dirancang khusus sebagai katalog manajemen tanpa menyimpan password Anda ke server pihak ketiga. Semua data tersimpan secara lokal dan dapat Anda backup serta pulihkan kapan saja.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <BrandLogo
              logoUrl={branding?.logoUrl}
              appName={branding?.appName || 'MY WEBSITE'}
              size="sm"
              variant="dark"
            />
            <div>
              <span className="font-bold text-white text-sm">
                {branding?.appName || 'MY WEBSITE'}
              </span>
              <p className="text-[11px] text-slate-500">
                {branding?.appTagline || 'Semua Database Website Dalam Satu Aplikasi'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenLogin}
              className="text-cyan-400 hover:underline font-semibold cursor-pointer"
            >
              Login
            </button>
            <span>Versi 1.0.0 (2026)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
