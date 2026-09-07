import React from 'react';
import { Menu, Search, Plus, X, Globe, Database } from 'lucide-react';
import { NavigationTab, AppBrandingSettings } from '../types';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenSupabaseModal?: () => void;
  supabaseStatus?: {
    isConnected: boolean;
    tableExists: boolean;
    latencyMs?: number;
  };
  currentTab: NavigationTab;
  totalResults?: number;
  totalDatabases: number;
  favoriteCount: number;
  isAuthenticated?: boolean;
  branding?: AppBrandingSettings;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenSupabaseModal,
  supabaseStatus,
  currentTab,
  totalResults,
  totalDatabases,
  favoriteCount,
  isAuthenticated = true,
  branding,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 lg:px-8 py-3.5 shadow-xs w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between gap-2 sm:gap-3 w-full max-w-full">
        {/* Left Section: Mobile menu button & Title indicator on smaller devices */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="mobile-menu-toggle"
            onClick={onToggleSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 lg:hidden transition-colors border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* App title icon on mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <BrandLogo
              logoUrl={branding?.logoUrl}
              appName={branding?.appName || 'MY WEBSITE'}
              size="sm"
              variant="light"
            />
            <span className="font-extrabold text-sm text-slate-800 tracking-tight truncate max-w-[100px] xs:max-w-[120px]">
              {branding?.appName || 'MY WEBSITE'}
            </span>
          </div>
        </div>

        {/* Center Section: Big Real-time Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto min-w-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-blue-500" />
            </div>
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari database / website (nama, email, URL, kategori, deskripsi)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/15 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                id="clear-search-button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Supabase Status + Add Website Button + Admin Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Supabase Status Pill */}
          {onOpenSupabaseModal && (
            <button
              id="header-supabase-btn"
              onClick={onOpenSupabaseModal}
              title="Kelola Koneksi Supabase & Salin SQL Schema"
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:shadow-sm shrink-0"
              style={{
                backgroundColor:
                  supabaseStatus?.isConnected && supabaseStatus?.tableExists
                    ? '#ecfdf5'
                    : supabaseStatus?.isConnected
                    ? '#fefce8'
                    : '#f8fafc',
                borderColor:
                  supabaseStatus?.isConnected && supabaseStatus?.tableExists
                    ? '#6ee7b7'
                    : supabaseStatus?.isConnected
                    ? '#fde047'
                    : '#cbd5e1',
                color:
                  supabaseStatus?.isConnected && supabaseStatus?.tableExists
                    ? '#047857'
                    : supabaseStatus?.isConnected
                    ? '#a16207'
                    : '#475569',
              }}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Supabase</span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  supabaseStatus?.isConnected && supabaseStatus?.tableExists
                    ? 'bg-emerald-500 animate-pulse'
                    : supabaseStatus?.isConnected
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
            </button>
          )}

          <button
            id="add-website-button"
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/25 transition-all duration-150 transform active:scale-95 whitespace-nowrap cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">+ Tambah Website</span>
            <span className="xs:hidden sm:hidden">Tambah</span>
          </button>


          {/* Quick Admin Profile Badge */}
          <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-white overflow-hidden">
              {branding?.adminAvatarUrl ? (
                <img
                  src={branding.adminAvatarUrl}
                  alt={branding.adminName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                (branding?.adminName || 'AD').slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {branding?.adminName || 'Admin Utama'}
              </span>
              <span className="text-[10px] text-slate-500">Super Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
