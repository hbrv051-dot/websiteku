import { VaultSettings } from '../types';

const VAULT_SETTINGS_KEY = 'my_website_vault_settings_v1';
const VAULT_SESSION_KEY = 'my_website_vault_unlocked_session';

export const DEFAULT_VAULT_SETTINGS: VaultSettings = {
  masterPin: '123456',
  autoLockMinutes: 15,
};

// In-memory unlock session timestamp
let sessionUnlockedUntil: number | null = null;

export function loadVaultSettings(): VaultSettings {
  try {
    const raw = localStorage.getItem(VAULT_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(VAULT_SETTINGS_KEY, JSON.stringify(DEFAULT_VAULT_SETTINGS));
      return DEFAULT_VAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_VAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Failed to load vault settings:', err);
    return DEFAULT_VAULT_SETTINGS;
  }
}

export function saveVaultSettings(settings: VaultSettings): void {
  try {
    localStorage.setItem(VAULT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save vault settings:', err);
  }
}

export function isVaultUnlocked(): boolean {
  try {
    const sessionRaw = sessionStorage.getItem(VAULT_SESSION_KEY);
    if (sessionRaw) {
      const expiry = parseInt(sessionRaw, 10);
      if (Date.now() < expiry) {
        return true;
      }
      sessionStorage.removeItem(VAULT_SESSION_KEY);
    }
    if (sessionUnlockedUntil && Date.now() < sessionUnlockedUntil) {
      return true;
    }
  } catch {
    // fallback
  }
  return false;
}

export function unlockVaultSession(durationMinutes = 15): void {
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;
  sessionUnlockedUntil = expiresAt;
  try {
    sessionStorage.setItem(VAULT_SESSION_KEY, expiresAt.toString());
  } catch {
    // fallback
  }
}

export function lockVaultSession(): void {
  sessionUnlockedUntil = null;
  try {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
  } catch {
    // fallback
  }
}

export function verifyMasterPin(inputPin: string): boolean {
  const settings = loadVaultSettings();
  const valid = inputPin.trim() === settings.masterPin.trim();
  if (valid) {
    unlockVaultSession(settings.autoLockMinutes || 15);
  }
  return valid;
}

export function updateMasterPin(oldPin: string, newPin: string): { success: boolean; message: string } {
  const settings = loadVaultSettings();
  if (oldPin.trim() !== settings.masterPin.trim()) {
    return { success: false, message: 'PIN Master lama tidak sesuai!' };
  }
  if (!newPin || newPin.trim().length < 4) {
    return { success: false, message: 'PIN Master baru minimal 4 digit angka/karakter!' };
  }
  settings.masterPin = newPin.trim();
  saveVaultSettings(settings);
  unlockVaultSession(settings.autoLockMinutes || 15);
  return { success: true, message: 'PIN Master berhasil diperbarui!' };
}

// Password Generator Utility
export function generateStrongPassword(
  length = 16,
  options = { uppercase: true, lowercase: true, numbers: true, symbols: true }
): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  let charPool = '';
  let guaranteed = '';

  if (options.uppercase) {
    charPool += upper;
    guaranteed += upper[Math.floor(Math.random() * upper.length)];
  }
  if (options.lowercase) {
    charPool += lower;
    guaranteed += lower[Math.floor(Math.random() * lower.length)];
  }
  if (options.numbers) {
    charPool += numbers;
    guaranteed += numbers[Math.floor(Math.random() * numbers.length)];
  }
  if (options.symbols) {
    charPool += symbols;
    guaranteed += symbols[Math.floor(Math.random() * symbols.length)];
  }

  if (!charPool) charPool = lower + numbers;

  let password = guaranteed;
  for (let i = password.length; i < length; i++) {
    password += charPool[Math.floor(Math.random() * charPool.length)];
  }

  // Shuffle password characters
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}
