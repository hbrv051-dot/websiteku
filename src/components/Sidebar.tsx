import React from 'react';
import {
  Globe,
  Home,
  LayoutDashboard,
  Database,
  FolderTree,
  Star,
  KeyRound,
  History,
  BellRing,
  User,
  Info,
  LogOut,
  LogIn,
  X,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { NavigationTab, AppBrandingSettings } from '../types';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  totalWebsites: number;
  favoriteCount: number;
  backupWarningCount: number;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isAuthenticated?: boolean;
  onOpenLoginModal?: () => void;
  branding?: AppBrandingSettings;
  isMultiWindowActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  totalWebsites,
  favoriteCount,
  backupWarningCount,
  isOpen,
  onClose,
  onLogout,
  isAuthenticated = true,
  onOpenLoginModal,
  branding,
  isMultiWindowActive = false,
}) => {
  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'landing',
      label: 'Landing Page Depan',
      icon: <Globe className="w-5 h-5" />,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'all',
      label: 'Semua Database',
      icon: <Database className="w-5 h-5" />,
      badge: totalWebsites,
      badgeColor: 'bg-blue-500/30 text-blue-200 border-blue-400/30',
    },
    {
      id: 'categories',
      label: 'Kategori',
      icon: <FolderTree className="w-5 h-5" />,
    },
    {
      id: 'favorites',
      label: 'Favorit',
      icon: <Star className="w-5 h-5" />,
      badge: favoriteCount > 0 ? favoriteCount : undefined,
      badgeColor: 'bg-amber-500/30 text-amber-200 border-amber-400/30',
    },
    {
      id: 'vault',
      label: 'Brankas Sandi',
      icon: <KeyRound className="w-5 h-5" />,
      badge: 'PIN',
      badgeColor: 'bg-amber-500/30 text-amber-300 border-amber-400/30',
    },
    {
      id: 'history',
      label: 'Riwayat Akses',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'backup',
      label: 'Pengingat Backup',
      icon: <BellRing className="w-5 h-5" />,
      badge: backupWarningCount > 0 ? '!' : 'Aman',
      badgeColor: backupWarningCount > 0 
        ? 'bg-rose-500/40 text-rose-200 border-rose-400/40 animate-pulse'
        : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30',
    },
    {
      id: 'profile',
      label: 'Profil Admin',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'about',
      label: 'Tentang Aplikasi',
      icon: <Info className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile & Multi-Window Backdrop */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity ${
            isMultiWindowActive ? 'block' : 'lg:hidden'
          }`}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col justify-between bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isMultiWindowActive
            ? isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : isOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Section */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo
                logoUrl={branding?.logoUrl}
                appName={branding?.appName || 'MY WEBSITE'}
                size="md"
                variant="dark"
              />
              <div className="flex flex-col">
                <h1 className="font-extrabold text-base tracking-wider uppercase text-white drop-shadow-xs truncate max-w-[140px]">
                  {branding?.appName || 'MY WEBSITE'}
                </h1>
                <span className="text-[11px] font-medium text-blue-200/90 leading-tight truncate max-w-[140px]">
                  {branding?.appSubtitle || 'Semua Database Website'}
                </span>
                <span className="text-[10px] text-blue-300/70 truncate max-w-[140px]">
                  {branding?.appTagline || 'Dalam Satu Aplikasi'}
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              id="close-sidebar-button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-blue-300/50">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                      item.badgeColor || 'bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Info & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-blue-200/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Terenkripsi</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              v1.0.0
            </span>
          </div>

          <button
            id="logout-button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition-colors border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Kunci / Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
};
