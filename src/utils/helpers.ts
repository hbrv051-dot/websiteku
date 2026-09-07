import { CategoryType } from '../types';

export function formatIndonesianDateTime(isoDateString?: string | null): string {
  if (!isoDateString) return 'Belum pernah';
  
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return 'Waktu tidak valid';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);

    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Check if same calendar day
    const isToday = now.toDateString() === date.toDateString();
    if (isToday) {
      return `Hari ini, ${timeStr}`;
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === date.toDateString()) {
      return `Kemarin, ${timeStr}`;
    }

    if (diffDays < 7) {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return `${days[date.getDay()]}, ${timeStr}`;
    }

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Waktu tidak valid';
  }
}

export function formatSimpleDate(isoDateString?: string | null): string {
  if (!isoDateString) return '-';
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

export function getFaviconUrl(rawUrl: string): string {
  try {
    let hostname = rawUrl.trim();
    if (!hostname.startsWith('http://') && !hostname.startsWith('https://')) {
      hostname = 'https://' + hostname;
    }
    const parsed = new URL(hostname);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
  } catch {
    return '';
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '#';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Mode Jendela Popup Mandiri (Mini Desktop Popup / Kiosk Mode)
 * Membuka jendela browser popup tanpa address bar atau toolbars standar
 * Menghadirkan pengalaman seperti aplikasi desktop mandiri berukuran pas.
 */
export function openMiniKioskPopup(
  rawUrl: string,
  title: string = 'Portal Web',
  width: number = 1140,
  height: number = 740
): Window | null {
  const url = normalizeUrl(rawUrl);
  const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2));
  const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2));

  const windowFeatures = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'menubar=no',
    'toolbar=no',
    'location=no',
    'status=no',
    'resizable=yes',
    'scrollbars=yes',
    'popup=yes',
  ].join(',');

  const popupName = `kiosk_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  return window.open(url, popupName, windowFeatures);
}

/**
 * Interface hasil kalkulasi inaktivitas Supabase (Batas 7 Hari Auto-Pause)
 */
export interface InactivityStatus {
  daysRemaining: number;
  hoursRemaining: number;
  totalHoursLeft: number;
  isPaused: boolean; // Melampaui 7 hari / 168 jam
  isCritical: boolean; // < 48 jam (< 2 hari)
  isWarning: boolean; // 2 - 4 hari
  isSafe: boolean; // > 4 hari
  badgeText: string;
  badgeClass: string;
  percentage: number; // Persentase sisa hari (0 - 100%)
  lastActivityLabel: string;
}

/**
 * Menghitung hitung mundur sisa waktu sebelum proyek Supabase terjeda secara otomatis
 * Default limit = 7 hari (168 jam)
 */
export function getInactivityCountdown(
  lastAccessedIso?: string | null,
  createdIso?: string | null,
  daysLimit: number = 7
): InactivityStatus {
  const refDateStr = lastAccessedIso || createdIso;
  const limitHours = daysLimit * 24;

  if (!refDateStr) {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      totalHoursLeft: 0,
      isPaused: true,
      isCritical: true,
      isWarning: false,
      isSafe: false,
      badgeText: '⚠️ Terjeda (>7 hari)',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 font-bold',
      percentage: 0,
      lastActivityLabel: 'Belum pernah diakses',
    };
  }

  try {
    const refDate = new Date(refDateStr);
    const now = new Date();
    const elapsedMs = now.getTime() - refDate.getTime();
    const elapsedHours = Math.max(0, elapsedMs / (1000 * 60 * 60));
    const totalHoursLeft = limitHours - elapsedHours;

    const daysRemaining = Math.max(0, Math.floor(totalHoursLeft / 24));
    const hoursRemaining = Math.max(0, Math.floor(totalHoursLeft % 24));
    const percentage = Math.max(0, Math.min(100, Math.round((totalHoursLeft / limitHours) * 100)));

    const isPaused = totalHoursLeft <= 0;
    const isCritical = !isPaused && totalHoursLeft <= 48; // < 2 hari
    const isWarning = !isPaused && totalHoursLeft > 48 && totalHoursLeft <= 96; // 2 - 4 hari
    const isSafe = !isPaused && totalHoursLeft > 96; // > 4 hari

    let badgeText = '';
    let badgeClass = '';

    if (isPaused) {
      badgeText = '⚠️ Terjeda (>7 hari)';
      badgeClass = 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
    } else if (isCritical) {
      badgeText = `⚠️ Jeda dlm ${daysRemaining > 0 ? `${daysRemaining}h ` : ''}${hoursRemaining}j`;
      badgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse';
    } else if (isWarning) {
      badgeText = `⚡ Jeda dlm ${daysRemaining} hari`;
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
    } else {
      badgeText = `🟢 Aman (${daysRemaining} hari lagi)`;
      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
    }

    return {
      daysRemaining,
      hoursRemaining,
      totalHoursLeft: Math.round(totalHoursLeft),
      isPaused,
      isCritical,
      isWarning,
      isSafe,
      badgeText,
      badgeClass,
      percentage,
      lastActivityLabel: formatIndonesianDateTime(refDateStr),
    };
  } catch {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      totalHoursLeft: 0,
      isPaused: true,
      isCritical: true,
      isWarning: false,
      isSafe: false,
      badgeText: 'Waktu Tidak Valid',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      percentage: 0,
      lastActivityLabel: '-',
    };
  }
}

// Preset modern SVG illustration backgrounds for fallback or manual selection
export function getCategoryIllustrationPreset(category: CategoryType | string): string {
  switch (category) {
    case 'Pendidikan':
      return 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';
    case 'Keagamaan':
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
    case 'Pemerintahan':
      return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
    case 'Bisnis':
      return 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80';
    case 'Manajemen':
      return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';
    case 'Kesehatan':
      return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80';
    case 'Manajemen SDM':
      return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80';
    default:
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
  }
}

export const PRESET_THUMBNAILS = [
  {
    name: 'Pendidikan / Sekolah',
    category: 'Pendidikan',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Keagamaan / Masjid',
    category: 'Keagamaan',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pemerintahan / Sipil',
    category: 'Pemerintahan',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bisnis / Toko Retail',
    category: 'Bisnis',
    url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Inventaris / Pergudangan',
    category: 'Manajemen',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Kesehatan / Medis',
    category: 'Kesehatan',
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Perpustakaan / Buku',
    category: 'Pendidikan',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Manajemen SDM / HRD',
    category: 'Manajemen SDM',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Server & Cloud Database',
    category: 'Lainnya',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Keuangan & Finansial',
    category: 'Bisnis',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
  },
];
