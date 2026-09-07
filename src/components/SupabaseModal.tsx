import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Server,
  Key,
  ShieldCheck,
  Zap,
  HelpCircle,
  Smartphone,
  Laptop,
  ArrowRight,
} from 'lucide-react';
import {
  SUPABASE_SCHEMA_SQL,
  testSupabaseConnection,
  loadSupabaseConfig,
  saveSupabaseConfig,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '../utils/supabase';
import { WebsiteItem, AccessLog } from '../types';
import { showToast } from '../utils/alerts';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  websites: WebsiteItem[];
  accessLogs: AccessLog[];
  onWebsitesSynced: (websites: WebsiteItem[]) => void;
  onLogsSynced?: (logs: AccessLog[]) => void;
  supabaseStatus: {
    isConnected: boolean;
    tableExists: boolean;
    message: string;
    latencyMs?: number;
    count?: number;
  };
  onRefreshStatus: () => Promise<void>;
  onSyncAllToSupabase: () => Promise<void>;
  onFetchAllFromSupabase: () => Promise<void>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  websites,
  accessLogs,
  supabaseStatus,
  onRefreshStatus,
  onSyncAllToSupabase,
  onFetchAllFromSupabase,
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'status' | 'config' | 'help'>(
    !supabaseStatus.tableExists ? 'help' : 'status'
  );
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Editable config state
  const [config, setConfig] = useState(() => loadSupabaseConfig());

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopied(true);
      showToast('Kode SQL berhasil disalin ke clipboard!', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast('Gagal menyalin otomatis. Silakan salin teks secara manual.', 'error');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await onRefreshStatus();
    setIsTesting(false);
  };

  const handleUploadAll = async () => {
    setIsSyncing(true);
    await onSyncAllToSupabase();
    setIsSyncing(false);
  };

  const handleDownloadAll = async () => {
    setIsSyncing(true);
    await onFetchAllFromSupabase();
    setIsSyncing(false);
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig(config);
    showToast('Konfigurasi Supabase berhasil disimpan!', 'success');
    handleTestConnection();
  };

  const handleResetDefaultConfig = () => {
    const defaultConfig = {
      url: DEFAULT_SUPABASE_URL,
      anonKey: DEFAULT_SUPABASE_ANON_KEY,
      autoSync: true,
      enabled: true,
    };
    setConfig(defaultConfig);
    saveSupabaseConfig(defaultConfig);
    showToast('Konfigurasi dikembalikan ke default pengguna.', 'info');
    handleTestConnection();
  };

  return (
    <div
      id="supabase-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="supabase-modal-dialog"
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Koneksi & Integrasi Supabase
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Cloud DB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Database PostgreSQL Supabase terhubung ke project Anda
              </p>
            </div>
          </div>

          <button
            id="close-supabase-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Status Server:</span>
            {supabaseStatus.isConnected && supabaseStatus.tableExists ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Terhubung & Tabel Siap ({supabaseStatus.latencyMs ?? 0}ms)
              </span>
            ) : supabaseStatus.isConnected && !supabaseStatus.tableExists ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                Terhubung, Tabel Belum Dibuat
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Menunggu Konfigurasi / Offline
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isTesting ? 'Menguji...' : 'Uji Koneksi'}</span>
            </button>
            <a
              href="https://supabase.com/dashboard/project/zdamqwoikctuouldafld/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium transition-colors shadow-2xs"
            >
              <span>Buka SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            📋 Kode SQL Project (Salin ke Supabase)
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            ☁️ Sinkronisasi Data ({websites.length} Database)
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            ⚙️ Kredensial & URL
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'help'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>❓ Kenapa Belum Sinkron?</span>
            {!supabaseStatus.tableExists && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-700 dark:text-slate-300">
          {/* TAB 1: KODE SQL EDITOR */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              {/* Instructions Box */}
              <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Langkah Cepat Eksekusi SQL di Supabase:</span>
                </div>
                <ol className="list-decimal list-inside text-xs space-y-1 text-emerald-900/80 dark:text-emerald-200/90 leading-relaxed pl-1">
                  <li>
                    Klik tombol <strong>"Salin Semua Kode SQL"</strong> di bawah ini.
                  </li>
                  <li>
                    Buka{' '}
                    <a
                      href="https://supabase.com/dashboard/project/zdamqwoikctuouldafld/sql/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      Supabase SQL Editor (Klik Disini) <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </li>
                  <li>
                    Paste (tempel) kode ke dalam editor query dan klik tombol hijau{' '}
                    <strong>"RUN"</strong> di pojok kanan bawah editor Supabase.
                  </li>
                  <li>
                    Setelah muncul status <em>"Success. No rows returned"</em>, kembali ke aplikasi ini dan klik{' '}
                    <strong>"Uji Koneksi"</strong>!
                  </li>
                </ol>
              </div>

              {/* Code Box with Action Header */}
              <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-750 bg-slate-950 text-slate-100 shadow-inner">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 font-mono text-[11px] text-slate-400">
                      supabase_schema_mywebsite.sql
                    </span>
                  </div>

                  <button
                    id="copy-sql-button"
                    onClick={handleCopySql}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Semua Kode SQL'}</span>
                  </button>
                </div>

                {/* Preformatted SQL snippet */}
                <pre className="p-4 text-xs font-mono overflow-x-auto max-h-[340px] text-slate-200 leading-relaxed selection:bg-blue-600 selection:text-white">
                  <code>{SUPABASE_SCHEMA_SQL}</code>
                </pre>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>
                  ✓ Termasuk tabel <code>websites</code>, <code>access_logs</code>, <code>app_branding</code>,
                  kebijakan RLS publik, dan 8 website awal.
                </span>
                <span className="font-mono">{SUPABASE_SCHEMA_SQL.split('\n').length} baris SQL</span>
              </div>
            </div>
          )}

          {/* TAB 2: SINKRONISASI DATA */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Upload Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Kirim ke Supabase
                      </h4>
                      <p className="text-xs text-slate-500">
                        {websites.length} website & {accessLogs.length} riwayat log
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Upload seluruh database yang tersimpan di perangkat ini ke cloud Supabase agar aman dan bisa
                    diakses dari browser lain.
                  </p>
                  <button
                    onClick={handleUploadAll}
                    disabled={isSyncing || !supabaseStatus.tableExists}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Semua ke Cloud</span>
                  </button>
                </div>

                {/* Download Card */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Tarik dari Supabase
                      </h4>
                      <p className="text-xs text-slate-500">
                        {supabaseStatus.count !== undefined ? `${supabaseStatus.count} data di cloud` : 'Data cloud'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Perbarui dan sinkronkan data lokal aplikasi dengan versi terbaru yang ada di database cloud
                    Supabase.
                  </p>
                  <button
                    onClick={handleDownloadAll}
                    disabled={isSyncing || !supabaseStatus.tableExists}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Tarik Data Terbaru dari Cloud</span>
                  </button>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Sinkronisasi Otomatis (Auto-Sync) Aktif</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Setiap kali Anda menambah, mengedit, atau menghapus website di aplikasi, perubahan akan otomatis
                  dikirim ke tabel Supabase secara real-time.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: KREDENSIAL & URL */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Server className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={config.url}
                      onChange={(e) => setConfig({ ...config, url: e.target.value })}
                      placeholder="https://yourproject.supabase.co"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format: <code>https://zdamqwoikctuouldafld.supabase.co</code> (akhiran <code>/rest/v1/</code> otomatis dibersihkan).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Anon Public API Key (JWT)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <textarea
                      rows={3}
                      value={config.anonKey}
                      onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoSync}
                      onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Aktifkan Sinkronisasi Otomatis (Realtime CRUD)</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={handleResetDefaultConfig}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                  >
                    Reset ke Kredensial Awal
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveConfig}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Simpan Kredensial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PANDUAN & DIAGNOSTIK SINKRONISASI */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              {/* Diagnosis Alert Box */}
              {!supabaseStatus.tableExists ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/30 dark:border-amber-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Penyebab Utama: Tabel "websites" Belum Dibuat di Supabase</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Saat ini aplikasi Anda masih menyimpan data secara <strong>Lokal di browser perangkat ini saja (Offline/Local Storage)</strong>. Server Supabase belum memiliki tabel penyimpanan, sehingga perangkat lain (HP, laptop, atau browser lain) belum bisa membaca atau menerima data yang Anda buat di sini.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-950/30 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tabel Supabase Telah Terdeteksi & Siap Sinkron!</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Server Supabase sudah terhubung dan tabel penyimpanan aktif. Jika perangkat lain masih belum menampilkan data terbaru, lakukan sinkronisasi awal di bawah ini.
                  </p>
                </div>
              )}

              {/* Status Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs">
                    <Server className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Server Supabase</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    {supabaseStatus.isConnected ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Online (200 OK)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Tidak Terhubung</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    zdamqwoikctuouldafld
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Tabel Cloud Database</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    {supabaseStatus.tableExists ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Tersedia di Cloud</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Belum Ada (Jalankan SQL)</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {supabaseStatus.count !== undefined ? `${supabaseStatus.count} data di Supabase` : '0 data'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs">
                    <Laptop className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Data di Perangkat Ini</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{websites.length} Database Tersimpan</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Tersimpan di memori browser ini
                  </div>
                </div>
              </div>

              {/* Step-by-Step Resolution Guide */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  3 Langkah Agar Data Sinkron di Semua Perangkat:
                </h4>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs text-slate-800 dark:text-slate-200">
                          Jalankan Script SQL di Supabase
                        </strong>
                        <button
                          onClick={() => setActiveTab('sql')}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          Lihat Kode SQL <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Buka SQL Editor di dashboard Supabase project Anda, salin kode dari tab "Kode SQL Project", lalu klik <strong>RUN</strong>. Ini akan membuat tabel cloud dan menyalakan fitur realtime broadcast.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs text-slate-800 dark:text-slate-200">
                          Upload Data Perangkat Ini ke Cloud
                        </strong>
                        <button
                          onClick={handleUploadAll}
                          disabled={isSyncing || !supabaseStatus.isConnected}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <UploadCloud className="w-3 h-3" />
                          <span>Upload Semua ({websites.length})</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Kirim data database yang ada di perangkat utama ini ke cloud Supabase agar tersedia untuk diunduh oleh HP atau laptop lain.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-xs text-slate-800 dark:text-slate-200">
                          Buka di Perangkat Lain (HP/Tablet/Laptop Lain)
                        </strong>
                        <button
                          onClick={handleDownloadAll}
                          disabled={isSyncing || !supabaseStatus.isConnected}
                          className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 disabled:opacity-50 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <DownloadCloud className="w-3 h-3" />
                          <span>Tarik dari Cloud</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Buka link URL aplikasi ini di HP atau perangkat kedua Anda. Aplikasi akan otomatis mengunduh semua data dari Supabase secara langsung tanpa perlu login ulang!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Cek Ulang Status Koneksi</span>
                </button>

                <a
                  href="https://supabase.com/dashboard/project/zdamqwoikctuouldafld/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>Buka Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Project ID: <strong className="font-mono text-slate-700 dark:text-slate-200">zdamqwoikctuouldafld</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
