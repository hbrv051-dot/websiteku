import React, { useState } from 'react';
import {
  BellRing,
  ShieldCheck,
  Download,
  Upload,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Server,
  Database,
} from 'lucide-react';
import { WebsiteItem, AccessLog } from '../types';
import { exportBackupJson } from '../utils/storage';
import { formatIndonesianDateTime, formatSimpleDate } from '../utils/helpers';
import { showToast, showSuccess, showError, showConfirmDialog } from '../utils/alerts';

interface BackupViewProps {
  websites: WebsiteItem[];
  accessLogs: AccessLog[];
  onRestoreBackup: (importedWebsites: WebsiteItem[], importedLogs: AccessLog[]) => void;
  onUpdateWebsiteBackup: (websiteId: string) => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  websites,
  accessLogs,
  onRestoreBackup,
  onUpdateWebsiteBackup,
}) => {
  const [lastSystemBackup, setLastSystemBackup] = useState(
    new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  );

  const needsAttention = websites.filter((w) => w.backupStatus === 'Perlu Perhatian' || w.status === 'Maintenance');
  const safeCount = websites.length - needsAttention.length;

  const handleExport = () => {
    exportBackupJson(websites, accessLogs);
    setLastSystemBackup(new Date().toISOString());
    showToast('File backup JSON berhasil diunduh ke perangkat Anda!', 'success');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed.websites)) {
            const confirmed = await showConfirmDialog({
              title: 'Pulihkan Data Backup?',
              text: `File ini memuat ${parsed.websites.length} database website. Apakah Anda yakin ingin memulihkan data?`,
              confirmButtonText: 'Ya, Pulihkan Sekarang',
              icon: 'question',
            });
            if (confirmed) {
              onRestoreBackup(parsed.websites, parsed.accessLogs || []);
              showSuccess(
                'Pemulihan Berhasil!',
                `Sebanyak ${parsed.websites.length} database website berhasil dipulihkan.`
              );
            }
          } else {
            showError('Format Tidak Valid', 'Format file backup JSON tidak sesuai struktur yang didukung.');
          }
        } catch {
          showError('Gagal Membaca File', 'Pastikan file JSON yang Anda unggah berformat valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Pusat Keamanan & Cadangan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
            Pengingat & Manajemen Backup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantau integritas salinan data, jadwal sinkronisasi berkala, dan cadangan file
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/25 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Backup Data Sekarang</span>
          </button>

          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Restore JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4 Status Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Backup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Status Backup
          </span>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-lg font-extrabold text-emerald-700">
              Aman Terlindungi
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {safeCount} dari {websites.length} database siap & tersinkronisasi
          </p>
        </div>

        {/* Backup Terakhir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Backup Terakhir
          </span>
          <div className="mt-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">
              {formatIndonesianDateTime(lastSystemBackup)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Format: Snapshot Lengkap JSON & Database Dump
          </p>
        </div>

        {/* Jadwal Backup Berikutnya */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Jadwal Berikutnya
          </span>
          <div className="mt-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold text-slate-800">
              Besok, 02:00 WIB
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Otomatis setiap 24 jam ke Cloud Storage
          </p>
        </div>

        {/* Database Perlu Periksa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Perlu Perhatian
          </span>
          <div className="mt-3 flex items-center gap-2">
            {needsAttention.length > 0 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-lg font-extrabold text-amber-600">
                  {needsAttention.length} Database
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-lg font-extrabold text-emerald-700">
                  Semua Beres (0)
                </span>
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {needsAttention.length > 0 ? 'Perlu sinkronisasi ulang segera' : 'Kondisi server optimal'}
          </p>
        </div>
      </div>

      {/* List of Websites & their Backup Status */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              Daftar Status Backup Seluruh Database
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Total {websites.length} database website terpantau
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {websites.map((w) => {
            const isAttention = w.backupStatus === 'Perlu Perhatian' || w.status === 'Maintenance';
            return (
              <div
                key={w.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl ${isAttention ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{w.name}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {w.category}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-0.5 block">
                      Email: {w.email} • Status: {w.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isAttention 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isAttention ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {w.backupStatus || (isAttention ? 'Perlu Perhatian' : 'Aman')}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Terakhir: {formatSimpleDate(w.lastBackupDate || w.createdAt)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onUpdateWebsiteBackup(w.id);
                      showToast(`Backup untuk "${w.name}" berhasil disinkronisasi!`, 'success');
                    }}
                    className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition-colors border border-slate-200"
                    title="Sinkronisasi Backup Sekarang"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
