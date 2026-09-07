export type WebsiteStatus = 'Aktif' | 'Tidak Aktif' | 'Maintenance';

export type CategoryType = 
  | 'Pendidikan'
  | 'Keagamaan'
  | 'Pemerintahan'
  | 'Bisnis'
  | 'Manajemen'
  | 'Kesehatan'
  | 'Manajemen SDM'
  | 'Lainnya';

export interface WebsiteItem {
  id: string;
  name: string;
  url: string;
  email: string;
  category: CategoryType;
  thumbnail: string;
  status: WebsiteStatus;
  description: string;
  favorite: boolean;
  createdAt: string; // ISO String
  lastAccessed: string | null; // ISO String
  backupStatus?: 'Aman' | 'Perlu Perhatian' | 'Belum Backup';
  lastBackupDate?: string;
  
  // Kredensial Rahasia Admin (Password Manager / Vault)
  adminUsername?: string;
  adminPassword?: string;
  adminNotes?: string;

  // Live Ping & HTTP Health Check
  pingStatus?: 'online' | 'slow' | 'offline' | 'checking';
  pingLatency?: number; // Latensi dalam milidetik (ms)
  lastPingChecked?: string; // ISO String
  httpStatusNote?: string;

  // Supabase & Inactivity Auto-Pause Tracker (Default: batas 7 hari)
  isSupabase?: boolean; // Aktifkan pelacak batas jeda inaktivitas
  inactivityDaysLimit?: number; // Batas hari sebelum terjeda (default 7 hari)
}

export interface AccessLog {
  id: string;
  websiteId: string;
  websiteName: string;
  websiteUrl: string;
  thumbnail: string;
  email: string;
  category: CategoryType;
  timestamp: string; // ISO String
}

export type SortOption = 
  | 'name-asc'
  | 'name-desc'
  | 'newest'
  | 'last-accessed'
  | 'favorite';

export type ViewMode = 'grid' | 'list';

export type NavigationTab = 
  | 'landing'
  | 'login'
  | 'home'
  | 'dashboard'
  | 'all'
  | 'categories'
  | 'favorites'
  | 'vault'
  | 'history'
  | 'backup'
  | 'profile'
  | 'about';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  lastLogin?: string;
}

export type LoginSoundPreset = 
  | 'jarvis' 
  | 'futuristic_chime' 
  | 'modern_bell' 
  | 'cyber_synth' 
  | 'custom_upload' 
  | 'speech_only'
  | 'none';

export interface AudioSettings {
  enabled: boolean;
  preset: LoginSoundPreset;
  customAudioData: string | null;
  customAudioName: string | null;
  volume: number; // 0 to 100
  speechGreetingText: string;
  speechVoicePitch: number;
  speechVoiceRate: number;
  playSpeech: boolean;
}

export interface AppBrandingSettings {
  appName: string;
  appSubtitle: string;
  appTagline: string;
  logoUrl: string | null;
  adminName: string;
  adminEmail: string;
  adminAvatarUrl: string | null;
}

export interface VaultSettings {
  masterPin: string; // Default: '123456'
  autoLockMinutes: number; // Default: 15
}

// Multi-Window System Types
export type MultiWindowLayout = 'floating' | 'split-2' | 'split-3' | 'grid-4';

export interface OpenWindowItem {
  id: string;
  websiteId: string;
  website: WebsiteItem;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  deviceView?: 'desktop' | 'tablet' | 'mobile';
}
