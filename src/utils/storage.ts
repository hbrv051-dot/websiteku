import { WebsiteItem, AccessLog, AudioSettings, AppBrandingSettings, AdminLoginCredentials } from '../types';
import { INITIAL_WEBSITES, INITIAL_ACCESS_LOGS } from '../data/initialData';

const WEBSITES_KEY = 'my_website_catalog_v1';
const ACCESS_LOGS_KEY = 'my_website_access_logs_v1';
const AUDIO_SETTINGS_KEY = 'my_website_audio_settings_v1';
const BRANDING_SETTINGS_KEY = 'my_website_branding_settings_v1';
const ADMIN_CREDENTIALS_KEY = 'my_website_admin_credentials_v1';

export const DEFAULT_ADMIN_CREDENTIALS: AdminLoginCredentials = {
  username: 'admin',
  password: 'admin123',
  updatedAt: new Date().toISOString(),
};

export function loadAdminCredentials(): AdminLoginCredentials {
  try {
    const raw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
      return DEFAULT_ADMIN_CREDENTIALS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ADMIN_CREDENTIALS, ...parsed };
  } catch (err) {
    console.error('Failed to load admin credentials:', err);
    return DEFAULT_ADMIN_CREDENTIALS;
  }
}

export function saveAdminCredentials(creds: AdminLoginCredentials): void {
  try {
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(creds));
  } catch (err) {
    console.error('Failed to save admin credentials:', err);
  }
}

export function resetAdminCredentials(): AdminLoginCredentials {
  const resetCreds: AdminLoginCredentials = {
    ...DEFAULT_ADMIN_CREDENTIALS,
    updatedAt: new Date().toISOString(),
  };
  saveAdminCredentials(resetCreds);
  return resetCreds;
}

export function validateAdminLogin(
  userInput: string,
  passInput: string,
  adminEmail?: string
): { isValid: boolean; message?: string } {
  const creds = loadAdminCredentials();
  const trimmedUser = userInput.trim().toLowerCase();
  const validUsername = creds.username.trim().toLowerCase();
  const validEmail = (adminEmail || 'admin@mustofa.id').trim().toLowerCase();

  const isUserMatch = trimmedUser === validUsername || trimmedUser === validEmail;
  const isPassMatch = passInput.trim() === creds.password.trim();

  if (!isUserMatch) {
    return { isValid: false, message: 'Username atau email administrator tidak ditemukan.' };
  }
  if (!isPassMatch) {
    return { isValid: false, message: 'Kata sandi salah. Silakan periksa kembali kata sandi Anda.' };
  }
  return { isValid: true };
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  enabled: true,
  preset: 'jarvis',
  customAudioData: null,
  customAudioName: null,
  volume: 80,
  speechGreetingText: 'Welcome home, sir.',
  speechVoicePitch: 0.9,
  speechVoiceRate: 0.92,
  playSpeech: true,
};

export const DEFAULT_BRANDING_SETTINGS: AppBrandingSettings = {
  appName: 'MY WEBSITE',
  appSubtitle: 'Database MUSTOFA',
  appTagline: 'Semua Database Website Dalam Satu Aplikasi',
  logoUrl: null,
  adminName: 'Mustofa',
  adminEmail: 'admin@mustofa.id',
  adminAvatarUrl: null,
};

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(DEFAULT_AUDIO_SETTINGS));
      return DEFAULT_AUDIO_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_AUDIO_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Failed to load audio settings:', err);
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save audio settings:', err);
  }
}

export function loadBrandingSettings(): AppBrandingSettings {
  try {
    const raw = localStorage.getItem(BRANDING_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(BRANDING_SETTINGS_KEY, JSON.stringify(DEFAULT_BRANDING_SETTINGS));
      return DEFAULT_BRANDING_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BRANDING_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Failed to load branding settings:', err);
    return DEFAULT_BRANDING_SETTINGS;
  }
}

export function saveBrandingSettings(branding: AppBrandingSettings): void {
  try {
    localStorage.setItem(BRANDING_SETTINGS_KEY, JSON.stringify(branding));
  } catch (err) {
    console.error('Failed to save branding settings:', err);
  }
}

export function loadWebsitesFromStorage(): WebsiteItem[] {
  try {
    const raw = localStorage.getItem(WEBSITES_KEY);
    if (!raw) {
      localStorage.setItem(WEBSITES_KEY, JSON.stringify(INITIAL_WEBSITES));
      return INITIAL_WEBSITES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_WEBSITES;
  } catch (err) {
    console.error('Failed to load websites from storage:', err);
    return INITIAL_WEBSITES;
  }
}

export function saveWebsitesToStorage(websites: WebsiteItem[]): void {
  try {
    localStorage.setItem(WEBSITES_KEY, JSON.stringify(websites));
  } catch (err) {
    console.error('Failed to save websites to storage:', err);
  }
}

export function loadAccessLogsFromStorage(): AccessLog[] {
  try {
    const raw = localStorage.getItem(ACCESS_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(INITIAL_ACCESS_LOGS));
      return INITIAL_ACCESS_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ACCESS_LOGS;
  } catch (err) {
    console.error('Failed to load access logs from storage:', err);
    return INITIAL_ACCESS_LOGS;
  }
}

export function saveAccessLogsToStorage(logs: AccessLog[]): void {
  try {
    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save access logs to storage:', err);
  }
}

export function exportBackupJson(websites: WebsiteItem[], logs: AccessLog[]): void {
  const exportData = {
    appName: 'My Website',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalWebsites: websites.length,
    websites,
    accessLogs: logs,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `MyWebsite_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
