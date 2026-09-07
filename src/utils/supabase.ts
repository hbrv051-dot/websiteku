/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WebsiteItem, AccessLog } from '../types';

// Default Supabase credentials provided by user
export const DEFAULT_SUPABASE_URL = 'https://zdamqwoikctuouldafld.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYW1xd29pa2N0dW91bGRhZmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NTI5NDIsImV4cCI6MjEwNDMyODk0Mn0.IqPzy52e47BB9dgw1j5yiis39Hfu8pnntO7yQWcs9Vw';

const SUPABASE_CONFIG_STORAGE_KEY = 'my_website_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
  enabled: boolean;
}

/**
 * Sanitizes the Supabase URL, removing trailing '/rest/v1/' or trailing slashes
 */
export function sanitizeSupabaseUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

/**
 * Loads Supabase configuration from localStorage or defaults
 */
export function loadSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        url: sanitizeSupabaseUrl(parsed.url || DEFAULT_SUPABASE_URL),
        anonKey: parsed.anonKey || DEFAULT_SUPABASE_ANON_KEY,
        autoSync: parsed.autoSync !== false,
        enabled: parsed.enabled !== false,
      };
    }
  } catch (e) {
    console.error('Error loading Supabase config:', e);
  }

  return {
    url: sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL),
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    autoSync: true,
    enabled: true,
  };
}

/**
 * Saves Supabase configuration to localStorage
 */
export function saveSupabaseConfig(config: SupabaseConfig): void {
  try {
    const sanitized = {
      ...config,
      url: sanitizeSupabaseUrl(config.url),
    };
    localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(sanitized));
    // Reset cached client
    cachedClient = null;
  } catch (e) {
    console.error('Error saving Supabase config:', e);
  }
}

// Singleton cached Supabase client
let cachedClient: SupabaseClient | null = null;

/**
 * Returns the active Supabase client
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = loadSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  }

  return cachedClient;
}

/**
 * Maps database row (supporting both snake_case and camelCase columns) to WebsiteItem
 */
export function fromSupabaseRow(row: any): WebsiteItem {
  return {
    id: String(row.id),
    name: row.name || 'Untitled',
    url: row.url || '',
    email: row.email || '',
    category: row.category || 'Lainnya',
    thumbnail: row.thumbnail || '',
    status: row.status || 'Aktif',
    description: row.description || '',
    favorite: Boolean(row.favorite),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    lastAccessed: row.last_accessed || row.lastAccessed || null,
    backupStatus: row.backup_status || row.backupStatus || 'Aman',
    lastBackupDate: row.last_backup_date || row.lastBackupDate || undefined,
    adminUsername: row.admin_username || row.adminUsername || '',
    adminPassword: row.admin_password || row.adminPassword || row.password || '',
    adminNotes: row.admin_notes || row.adminNotes || '',
    pingStatus: row.ping_status || row.pingStatus || 'online',
    pingLatency:
      typeof row.ping_latency === 'number'
        ? row.ping_latency
        : typeof row.pingLatency === 'number'
        ? row.pingLatency
        : 0,
    lastPingChecked: row.last_ping_checked || row.lastPingChecked || undefined,
    httpStatusNote: row.http_status_note || row.httpStatusNote || '',
    isSupabase:
      row.is_supabase !== undefined
        ? Boolean(row.is_supabase)
        : row.isSupabase !== undefined
        ? Boolean(row.isSupabase)
        : true,
    inactivityDaysLimit: row.inactivity_days_limit || row.inactivityDaysLimit || 7,
  };
}

/**
 * Maps WebsiteItem to database row (snake_case)
 */
export function toSupabaseRow(item: WebsiteItem): any {
  return {
    id: item.id,
    name: item.name,
    url: item.url,
    email: item.email || '',
    category: item.category || 'Lainnya',
    thumbnail: item.thumbnail || '',
    status: item.status || 'Aktif',
    description: item.description || '',
    favorite: Boolean(item.favorite),
    created_at: item.createdAt || new Date().toISOString(),
    last_accessed: item.lastAccessed || null,
    backup_status: item.backupStatus || 'Aman',
    last_backup_date: item.lastBackupDate || null,
    admin_username: item.adminUsername || '',
    admin_password: item.adminPassword || '',
    admin_notes: item.adminNotes || '',
    ping_status: item.pingStatus || 'online',
    ping_latency: item.pingLatency || 0,
    last_ping_checked: item.lastPingChecked || null,
    http_status_note: item.httpStatusNote || '',
    is_supabase: item.isSupabase !== false,
    inactivity_days_limit: item.inactivityDaysLimit || 7,
  };
}

/**
 * Tests connection to Supabase and verifies if the 'websites' table exists
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  tableExists: boolean;
  message: string;
  latencyMs?: number;
  count?: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      tableExists: false,
      message: 'Supabase client belum dikonfigurasi atau URL/Key kosong.',
    };
  }

  const startTime = performance.now();

  try {
    // Attempt to query websites table
    const { data, error, count } = await client
      .from('websites')
      .select('id', { count: 'exact', head: true });

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      // Error code 42P01 in PostgreSQL is "relation does not exist"
      if (error.code === '42P01' || error.message?.toLowerCase().includes('relation') || error.message?.toLowerCase().includes('not exist')) {
        return {
          success: true,
          tableExists: false,
          latencyMs,
          message:
            'Terhubung ke server Supabase! Namun tabel "websites" belum dibuat. Silakan salin & jalankan SQL Schema di SQL Editor Supabase.',
        };
      }

      return {
        success: false,
        tableExists: false,
        latencyMs,
        message: `Koneksi Supabase error: ${error.message} (${error.code || 'UNKNOWN'})`,
      };
    }

    return {
      success: true,
      tableExists: true,
      latencyMs,
      count: count ?? data?.length ?? 0,
      message: `Terhubung sempurna! Tabel 'websites' siap digunakan (${latencyMs}ms).`,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      tableExists: false,
      latencyMs,
      message: `Gagal menghubungi server Supabase: ${err?.message || err}`,
    };
  }
}

/**
 * Fetches all websites from Supabase
 */
export async function fetchWebsitesFromSupabase(): Promise<{
  data: WebsiteItem[] | null;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: 'Supabase client tidak aktif.' };
  }

  try {
    const { data, error } = await client
      .from('websites')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: error.message };
    }

    const parsed = (data || []).map(fromSupabaseRow);
    return { data: parsed, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Error mengambil data website dari Supabase' };
  }
}

/**
 * Upserts a single website in Supabase
 */
export async function upsertWebsiteToSupabase(website: WebsiteItem): Promise<{
  success: boolean;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client tidak aktif.' };
  }

  try {
    const row = toSupabaseRow(website);
    const { error } = await client.from('websites').upsert(row, { onConflict: 'id' });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menyimpan ke Supabase' };
  }
}

/**
 * Deletes a website from Supabase by ID
 */
export async function deleteWebsiteFromSupabase(id: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client tidak aktif.' };
  }

  try {
    const { error } = await client.from('websites').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menghapus dari Supabase' };
  }
}

/**
 * Batch syncs all websites to Supabase
 */
export async function syncAllWebsitesToSupabase(websites: WebsiteItem[]): Promise<{
  success: boolean;
  count: number;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase client tidak aktif.' };
  }

  try {
    const rows = websites.map(toSupabaseRow);
    const { error } = await client.from('websites').upsert(rows, { onConflict: 'id' });

    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: rows.length, error: null };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Gagal sinkronisasi data ke Supabase' };
  }
}

/**
 * Fetches recent access logs from Supabase
 */
export async function fetchAccessLogsFromSupabase(): Promise<{
  data: AccessLog[] | null;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) return { data: null, error: 'Supabase client tidak aktif.' };

  try {
    const { data, error } = await client
      .from('access_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) return { data: null, error: error.message };

    const logs: AccessLog[] = (data || []).map((row) => ({
      id: row.id,
      websiteId: row.website_id,
      websiteName: row.website_name,
      websiteUrl: row.website_url,
      thumbnail: row.thumbnail || '',
      email: row.email || '',
      category: row.category || 'Lainnya',
      timestamp: row.timestamp,
    }));

    return { data: logs, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || 'Gagal mengambil riwayat dari Supabase' };
  }
}

/**
 * Adds an access log entry to Supabase
 */
export async function addAccessLogToSupabase(log: AccessLog): Promise<{
  success: boolean;
  error: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase client tidak aktif.' };

  try {
    const row = {
      id: log.id,
      website_id: log.websiteId,
      website_name: log.websiteName,
      website_url: log.websiteUrl,
      thumbnail: log.thumbnail,
      email: log.email,
      category: log.category,
      timestamp: log.timestamp,
    };

    const { error } = await client.from('access_logs').insert(row);
    if (error) return { success: false, error: error.message };

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menyimpan log akses' };
  }
}

/**
 * Subscribes to real-time changes on the 'websites' table
 */
export function subscribeToWebsitesRealtime(
  onInsert?: (item: WebsiteItem) => void,
  onUpdate?: (item: WebsiteItem) => void,
  onDelete?: (id: string) => void
) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel('websites-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'websites' },
      (payload) => {
        if (onInsert && payload.new) {
          onInsert(fromSupabaseRow(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'websites' },
      (payload) => {
        if (onUpdate && payload.new) {
          onUpdate(fromSupabaseRow(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'websites' },
      (payload) => {
        if (onDelete && payload.old && payload.old.id) {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}

/**
 * THE COMPLETE SQL SCHEMA READY TO BE RUN IN SUPABASE SQL EDITOR
 */
export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- DATABASE MUSTOFA (MY WEBSITE) - SUPABASE POSTGRESQL SCHEMA
-- Project URL: https://zdamqwoikctuouldafld.supabase.co
-- Cara Pakai:
-- 1. Buka dashboard Supabase: https://supabase.com/dashboard/project/zdamqwoikctuouldafld/sql/new
-- 2. Salin seluruh kode SQL di bawah ini dan paste ke SQL Editor Supabase
-- 3. Klik tombol "RUN" (Jalankan)
-- ==============================================================================

-- 1. Ekstensi UUID
create extension if not exists "uuid-ossp";

-- 2. Bersihkan tabel lama jika ada konflik struktur kolom (Reset Bersih & Aman)
drop table if exists public.websites cascade;
drop table if exists public.access_logs cascade;
drop table if exists public.app_branding cascade;

-- 3. Tabel Utama: WEBSITES (Dibuat Lengkap & Bersih)
create table public.websites (
  id text primary key,
  name text not null default 'Untitled',
  url text not null default '',
  email text default '',
  category text not null default 'Lainnya',
  thumbnail text default '',
  status text not null default 'Aktif',
  description text default '',
  favorite boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  last_accessed timestamptz,
  backup_status text default 'Aman',
  last_backup_date timestamptz,
  
  -- Kredensial Brankas Admin
  admin_username text default '',
  admin_password text default '',
  admin_notes text default '',

  -- Live Ping & Monitoring
  ping_status text default 'online',
  ping_latency integer default 0,
  last_ping_checked timestamptz,
  http_status_note text default '',

  -- Aturan Anti-Jeda Supabase 7 Hari
  is_supabase boolean default true,
  inactivity_days_limit integer default 7
);

-- Indexing untuk pencarian cepat & query
create index if not exists idx_websites_category on public.websites (category);
create index if not exists idx_websites_status on public.websites (status);
create index if not exists idx_websites_favorite on public.websites (favorite);
create index if not exists idx_websites_last_accessed on public.websites (last_accessed);

-- 4. Tabel Riwayat Akses: ACCESS_LOGS
create table public.access_logs (
  id text primary key,
  website_id text,
  website_name text not null,
  website_url text not null,
  thumbnail text default '',
  email text default '',
  category text default 'Lainnya',
  timestamp timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_access_logs_timestamp on public.access_logs (timestamp desc);

-- 5. Tabel Pengaturan & Branding Aplikasi: APP_BRANDING
create table public.app_branding (
  id text primary key default 'default_settings',
  app_name text default 'MY WEBSITE',
  app_subtitle text default 'Database MUSTOFA',
  app_tagline text default 'Semua Database Website Dalam Satu Aplikasi',
  logo_url text,
  admin_name text default 'Mustofa',
  admin_email text default 'admin@mustofa.id',
  admin_avatar_url text,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. Konfigurasi Realtime & Full Replica Identity (Penting untuk Sinkronisasi Lintas Perangkat)
alter table public.websites replica identity full;
alter table public.access_logs replica identity full;

do $$
begin
  -- Daftarkan tabel websites ke realtime publication Supabase
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'websites'
  ) then
    alter publication supabase_realtime add table public.websites;
  end if;
  
  -- Daftarkan tabel access_logs ke realtime publication Supabase
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'access_logs'
  ) then
    alter publication supabase_realtime add table public.access_logs;
  end if;
exception
  when others then
    raise notice 'Info: Supabase realtime publication dilewati atau telah aktif.';
end $$;

-- 7. Aktifkan Row Level Security (RLS)
alter table public.websites enable row level security;
alter table public.access_logs enable row level security;
alter table public.app_branding enable row level security;

-- 8. Kebijakan RLS (Policy) untuk Akses Anon / Publik (Semua Perangkat Bisa Baca & Tulis)
drop policy if exists "Allow public select on websites" on public.websites;
create policy "Allow public select on websites" on public.websites for select using (true);

drop policy if exists "Allow public insert on websites" on public.websites;
create policy "Allow public insert on websites" on public.websites for insert with check (true);

drop policy if exists "Allow public update on websites" on public.websites;
create policy "Allow public update on websites" on public.websites for update using (true);

drop policy if exists "Allow public delete on websites" on public.websites;
create policy "Allow public delete on websites" on public.websites for delete using (true);

drop policy if exists "Allow public select on access_logs" on public.access_logs;
create policy "Allow public select on access_logs" on public.access_logs for select using (true);

drop policy if exists "Allow public insert on access_logs" on public.access_logs;
create policy "Allow public insert on access_logs" on public.access_logs for insert with check (true);

drop policy if exists "Allow public delete on access_logs" on public.access_logs;
create policy "Allow public delete on access_logs" on public.access_logs for delete using (true);

drop policy if exists "Allow public all on app_branding" on public.app_branding;
create policy "Allow public all on app_branding" on public.app_branding for all using (true);

-- 9. Data Master Awal (Seed Data)
insert into public.websites (
  id, name, url, email, category, thumbnail, status, description, favorite, created_at, is_supabase, inactivity_days_limit, admin_username, admin_password, admin_notes
)
values
  (
    'db-sekolah',
    'Database Sekolah',
    'https://sekolah.mydomain.com',
    'sekolah@mydomain.com',
    'Pendidikan',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    'Aktif',
    'Sistem Informasi Akademik, data induk siswa, raport elektronik, jadwal pelajaran, dan master data guru.',
    true,
    now(),
    true,
    7,
    'admin_akademik',
    'P@ssw0rdSekolah2026!',
    'Akses Super Admin SIAKAD'
  ),
  (
    'db-masjid',
    'Database Masjid',
    'https://masjid.mydomain.com',
    'masjid@mydomain.com',
    'Keagamaan',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    'Aktif',
    'Manajemen kas dan infaq masjid, jadwal sholat & pengajian, data mustahiq zakat, dan keanggotaan DKM.',
    true,
    now(),
    true,
    7,
    'dkm_mustofa',
    'Bismillah#Masjid2026',
    'Akses bendahara & DKM utama'
  ),
  (
    'db-desa',
    'Database Desa & RT',
    'https://desa.mydomain.com',
    'desa@mydomain.com',
    'Pemerintahan',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    'Aktif',
    'Sistem administrasi kependudukan desa, surat pengantar digital, sensus warga, dan data bansos.',
    false,
    now(),
    true,
    7,
    'admin_desa',
    'DesaDigital#2026',
    'Panel administrasi kelurahan'
  ),
  (
    'db-pos',
    'Database Toko & POS Kasir',
    'https://toko.mydomain.com',
    'toko@mydomain.com',
    'Bisnis',
    'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
    'Aktif',
    'Point of Sale (POS) kasir online, katalog barcode barang, struk digital, dan laporan laba rugi.',
    true,
    now(),
    true,
    7,
    'kasir_master',
    'TokoSukses2026!',
    'Akses kasir utama POS'
  ),
  (
    'db-gudang',
    'Database Gudang & Aset',
    'https://gudang.mydomain.com',
    'gudang@mydomain.com',
    'Manajemen',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    'Aktif',
    'Pencatatan stok masuk keluar, audit opname bulanan, supplier vendor, dan tracking lokasi rak barang.',
    false,
    now(),
    true,
    7,
    'kepala_gudang',
    'LogistikAset#2026',
    'Panel inventory multi-warehouse'
  ),
  (
    'db-klinik',
    'Database Rekam Medis Klinik',
    'https://klinik.mydomain.com',
    'klinik@mydomain.com',
    'Kesehatan',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    'Aktif',
    'Rekam medis pasien elektronik (RME), antrean poli online, stok resep apotek, dan tagihan medis.',
    false,
    now(),
    true,
    7,
    'dokter_jaga',
    'KlinikSehat2026@',
    'Sistem Rekam Medis Elektronik'
  ),
  (
    'db-payroll',
    'Database HRD & Payroll',
    'https://hrd.mydomain.com',
    'hrd@mydomain.com',
    'Manajemen SDM',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    'Aktif',
    'Presensi GPS karyawan, pengajuan cuti, perhitungan slip gaji otomatis (PPH21 & BPJS), dan KPI staff.',
    false,
    now(),
    true,
    7,
    'hrd_manager',
    'GajiKaryawan#2026',
    'Perhitungan PPh21 & BPJS'
  ),
  (
    'db-arsip',
    'Database Cloud Storage & Arsip',
    'https://arsip.mydomain.com',
    'arsip@mydomain.com',
    'Lainnya',
    'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?auto=format&fit=crop&w=800&q=80',
    'Aktif',
    'Dokumen penting, arsip scan sertifikat, master backup database SQL, dan file ISO server.',
    false,
    now(),
    true,
    7,
    'sysadmin',
    'ArsipRahasia2026!',
    'Server penyimpanan terenkripsi'
  )
on conflict (id) do update set
  name = excluded.name,
  url = excluded.url,
  category = excluded.category,
  thumbnail = excluded.thumbnail,
  status = excluded.status,
  description = excluded.description;

-- 8. Data Default Branding
insert into public.app_branding (id, app_name, app_subtitle, app_tagline, admin_name, admin_email)
values (
  'default_settings',
  'MY WEBSITE',
  'Database MUSTOFA',
  'Semua Database Website Dalam Satu Aplikasi',
  'Mustofa',
  'admin@mustofa.id'
)
on conflict (id) do nothing;
`;
