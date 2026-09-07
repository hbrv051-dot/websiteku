import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Minus,
  Square,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Tablet,
  Monitor,
  KeyRound,
  Copy,
  Check,
  Columns,
  Grid,
  Layers,
  ChevronDown,
  Plus,
  Lock,
  Globe,
  AlertTriangle,
  Folder,
  Menu,
  LayoutDashboard,
  Database,
  Star,
  History,
  BellRing,
  User,
  FolderTree,
  Eye,
  EyeOff,
  PanelLeft,
  AppWindow,
} from 'lucide-react';
import { WebsiteItem, OpenWindowItem, MultiWindowLayout, NavigationTab, AppBrandingSettings } from '../types';
import { isVaultUnlocked } from '../utils/vault';
import { showToast } from '../utils/alerts';
import { openMiniKioskPopup } from '../utils/helpers';
import { MasterPinModal } from './MasterPinModal';

interface MultiWindowManagerProps {
  windows: OpenWindowItem[];
  allWebsites: WebsiteItem[];
  layout: MultiWindowLayout;
  onLayoutChange: (layout: MultiWindowLayout) => void;
  onCloseWindow: (id: string) => void;
  onCloseAllWindows: () => void;
  onMinimizeWindow: (id: string) => void;
  onMaximizeWindow: (id: string) => void;
  onFocusWindow: (id: string) => void;
  onOpenNewWindow: (website: WebsiteItem) => void;
  onUpdateDeviceView: (id: string, view: 'desktop' | 'tablet' | 'mobile') => void;
  onSelectTab?: (tab: NavigationTab) => void;
  onToggleSidebar?: () => void;
  onMinimizeAllWindows?: () => void;
  onRestoreAllWindows?: () => void;
  branding?: AppBrandingSettings;
}

export const MultiWindowManager: React.FC<MultiWindowManagerProps> = ({
  windows,
  allWebsites,
  layout,
  onLayoutChange,
  onCloseWindow,
  onCloseAllWindows,
  onMinimizeWindow,
  onMaximizeWindow,
  onFocusWindow,
  onOpenNewWindow,
  onUpdateDeviceView,
  onSelectTab,
  onToggleSidebar,
  onMinimizeAllWindows,
  onRestoreAllWindows,
  branding,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openCredentialDrawer, setOpenCredentialDrawer] = useState<string | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState<Record<string, number>>({});

  const isUnlocked = isVaultUnlocked();

  if (windows.length === 0) return null;

  const handleCopyText = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast(`${label} disalin!`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReloadIframe = (winId: string) => {
    setIframeKey((prev) => ({ ...prev, [winId]: (prev[winId] || 0) + 1 }));
    showToast('Memuat ulang tampilan website...', 'info');
  };

  // Visible (non-minimized) windows
  const visibleWindows = windows.filter((w) => !w.isMinimized);
  const anyMaximized = visibleWindows.some((w) => w.isMaximized);
  const allMinimized = visibleWindows.length === 0;

  const quickNavItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: <LayoutDashboard className="w-4 h-4 text-blue-400" /> },
    { id: 'all', label: 'Semua Database', icon: <Database className="w-4 h-4 text-indigo-400" /> },
    { id: 'categories', label: 'Kategori Website', icon: <FolderTree className="w-4 h-4 text-emerald-400" /> },
    { id: 'favorites', label: 'Website Favorit ⭐', icon: <Star className="w-4 h-4 text-amber-400" /> },
    { id: 'vault', label: 'Brankas Sandi (PIN)', icon: <KeyRound className="w-4 h-4 text-amber-300" /> },
    { id: 'history', label: 'Riwayat Akses', icon: <History className="w-4 h-4 text-cyan-400" /> },
    { id: 'backup', label: 'Pengingat Backup', icon: <BellRing className="w-4 h-4 text-rose-400" /> },
    { id: 'profile', label: 'Profil Admin', icon: <User className="w-4 h-4 text-purple-400" /> },
  ];

  return (
    <>
      {/* 1. MULTI-WINDOW CONTAINER AREA */}
      <div
        className={`fixed inset-0 z-40 transition-colors duration-200 pointer-events-none flex flex-col justify-between overflow-hidden w-full max-w-full ${
          allMinimized ? 'bg-transparent' : 'bg-slate-950/60 backdrop-blur-xs'
        }`}
      >
        {/* Workspace Canvas (where windows live) */}
        <div
          className={`relative flex-1 w-full max-w-full h-full p-2 sm:p-4 pb-20 overflow-hidden ${
            allMinimized ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          {/* Subtle floating banner when all windows are minimized */}
          {allMinimized && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-200 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-[90vw]">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className="font-medium text-slate-300 truncate">
                {windows.length} jendela website aktif di dock bawah
              </span>
              <button
                onClick={() => {
                  if (onRestoreAllWindows) onRestoreAllWindows();
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px] transition-colors shadow-sm cursor-pointer shrink-0"
              >
                Tampilkan Semua
              </button>
            </div>
          )}
          {/* LAYOUT: SPLIT / GRID TILED MODE */}
          {layout !== 'floating' && !anyMaximized && (
            <div
              className={`w-full max-w-full h-full gap-3 grid ${
                layout === 'split-2'
                  ? visibleWindows.length >= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                  : layout === 'split-3'
                  ? visibleWindows.length >= 3 ? 'grid-cols-1 md:grid-cols-3' : visibleWindows.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2' // grid-4
              }`}
            >
              {visibleWindows.map((win) => (
                <SingleWindowCard
                  key={win.id}
                  win={win}
                  isTiled
                  iframeKey={iframeKey[win.id] || 0}
                  onFocus={() => onFocusWindow(win.id)}
                  onClose={() => onCloseWindow(win.id)}
                  onMinimize={() => onMinimizeWindow(win.id)}
                  onMaximize={() => onMaximizeWindow(win.id)}
                  onReload={() => handleReloadIframe(win.id)}
                  onUpdateDevice={(v) => onUpdateDeviceView(win.id, v)}
                  onOpenCredentials={() => {
                    if (isUnlocked) {
                      setOpenCredentialDrawer(openCredentialDrawer === win.id ? null : win.id);
                    } else {
                      setIsPinModalOpen(true);
                    }
                  }}
                  isCredentialDrawerOpen={openCredentialDrawer === win.id}
                  onCopyText={handleCopyText}
                  copiedKey={copiedKey}
                />
              ))}
            </div>
          )}

          {/* LAYOUT: FLOATING OR SINGLE MAXIMIZED MODE */}
          {(layout === 'floating' || anyMaximized) && (
            <div className="w-full max-w-full h-full relative overflow-hidden">
              {visibleWindows.map((win, idx) => {
                const isMax = win.isMaximized;
                // Cascading default offset if floating
                const offsetX = isMax ? 0 : Math.min(10 + (idx % 4) * 15, 45);
                const offsetY = isMax ? 0 : Math.min(10 + (idx % 4) * 15, 45);

                return (
                  <div
                    key={win.id}
                    onClick={() => onFocusWindow(win.id)}
                    style={{
                      zIndex: win.zIndex,
                      top: isMax ? '0' : `${offsetY}px`,
                      left: isMax ? '0' : `${offsetX}px`,
                      width: isMax ? '100%' : `calc(100% - ${offsetX * 2}px)`,
                      height: isMax ? '100%' : `calc(100% - ${offsetY * 2}px)`,
                      maxWidth: isMax ? '100%' : '1200px',
                      maxHeight: isMax ? '100%' : '900px',
                    }}
                    className={`absolute transition-all duration-150 max-w-full ${
                      isMax ? 'inset-0' : 'rounded-2xl shadow-2xl'
                    }`}
                  >
                    <SingleWindowCard
                      win={win}
                      isTiled={false}
                      iframeKey={iframeKey[win.id] || 0}
                      onFocus={() => onFocusWindow(win.id)}
                      onClose={() => onCloseWindow(win.id)}
                      onMinimize={() => onMinimizeWindow(win.id)}
                      onMaximize={() => onMaximizeWindow(win.id)}
                      onReload={() => handleReloadIframe(win.id)}
                      onUpdateDevice={(v) => onUpdateDeviceView(win.id, v)}
                      onOpenCredentials={() => {
                        if (isUnlocked) {
                          setOpenCredentialDrawer(openCredentialDrawer === win.id ? null : win.id);
                        } else {
                          setIsPinModalOpen(true);
                        }
                      }}
                      isCredentialDrawerOpen={openCredentialDrawer === win.id}
                      onCopyText={handleCopyText}
                      copiedKey={copiedKey}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. BOTTOM MULTI-WINDOW DOCK / TASKBAR */}
        <div className="pointer-events-auto fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 sm:px-3 py-2 flex items-center justify-between gap-1.5 sm:gap-3 text-white shadow-2xl w-full max-w-full overflow-hidden">
          {/* Left: App Menu Launcher, Minimize/Restore All & Window Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 max-w-[55vw] sm:max-w-[70vw] min-w-0">
            {/* Quick App Navigation Drawer / Popover */}
            <div className="relative shrink-0">
              <button
                id="multiwindow-app-menu-btn"
                onClick={() => setIsAppMenuOpen(!isAppMenuOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isAppMenuOpen
                    ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                }`}
                title="Buka Menu Navigasi Aplikasi"
              >
                <Menu className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Menu App</span>
                <ChevronDown className="w-3 h-3 ml-0.5 text-slate-400" />
              </button>

              {/* Navigation Popover Menu */}
              {isAppMenuOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs text-white divide-y divide-slate-800 animate-in slide-in-from-bottom-2 duration-150">
                  <div className="px-2.5 py-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Navigasi Aplikasi
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded font-semibold">
                      Multi-Window
                    </span>
                  </div>

                  <div className="py-1.5 space-y-0.5">
                    {quickNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (onSelectTab) onSelectTab(item.id);
                          setIsAppMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-800 text-slate-200 hover:text-white transition-colors text-left font-medium"
                      >
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Toggle Full Sidebar Drawer Option */}
                  {onToggleSidebar && (
                    <div className="pt-1.5">
                      <button
                        onClick={() => {
                          onToggleSidebar();
                          setIsAppMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-blue-300 hover:text-white transition-colors text-left font-semibold text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <PanelLeft className="w-3.5 h-3.5 text-blue-400" />
                          <span>Buka Bilah Menu Penuh</span>
                        </div>
                        <span className="text-[9px] bg-blue-950 px-1.5 py-0.5 rounded text-blue-300 border border-blue-800">
                          Drawer
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Minimize / Restore All Windows Toggle */}
            <button
              onClick={() => {
                if (allMinimized) {
                  if (onRestoreAllWindows) onRestoreAllWindows();
                  else windows.forEach((w) => onMinimizeWindow(w.id));
                } else {
                  if (onMinimizeAllWindows) onMinimizeAllWindows();
                  else visibleWindows.forEach((w) => onMinimizeWindow(w.id));
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all cursor-pointer ${
                allMinimized
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={allMinimized ? 'Tampilkan Semua Jendela' : 'Sembunyikan Semua Jendela ke Dock Bawah'}
            >
              {allMinimized ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{allMinimized ? 'Buka Semua' : 'Sembunyikan'}</span>
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-800 shrink-0 hidden sm:block" />

            {/* Window Tabs Pill List */}
            {windows.map((win) => {
              const isActive = !win.isMinimized;
              return (
                <button
                  key={win.id}
                  onClick={() => {
                    if (win.isMinimized) {
                      onMinimizeWindow(win.id); // restore
                    }
                    onFocusWindow(win.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="max-w-[120px] truncate">{win.website.name}</span>
                  {win.isMinimized && (
                    <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
                      Mini
                    </span>
                  )}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseWindow(win.id);
                    }}
                    className="p-0.5 rounded-md hover:bg-white/20 text-white/70 hover:text-white ml-0.5"
                    title="Tutup tab window ini"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Multi-Window Workspace Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick "+ Buka Website Lain" dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Buka Website Lain</span>
                <span className="sm:hidden">+</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {isAddMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-64 max-h-72 overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs text-white divide-y divide-slate-800">
                  <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pilih Website untuk Dibuka:
                  </div>
                  <div className="py-1 space-y-1">
                    {allWebsites.map((w) => {
                      const alreadyOpen = windows.some((win) => win.websiteId === w.id);
                      return (
                        <button
                          key={w.id}
                          onClick={() => {
                            onOpenNewWindow(w);
                            setIsAddMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
                        >
                          <span className="truncate font-medium text-slate-200">{w.name}</span>
                          {alreadyOpen && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded font-semibold shrink-0">
                              Sudah Buka
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Layout selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Pilih Layout Tampilan Multi-Window"
              >
                <Columns className="w-4 h-4" />
              </button>

              {isLayoutMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 text-xs text-white space-y-1">
                  <button
                    onClick={() => {
                      onLayoutChange('floating');
                      setIsLayoutMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                      layout === 'floating' ? 'bg-blue-600 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Jendela Bebas (Floating)</span>
                  </button>

                  <button
                    onClick={() => {
                      onLayoutChange('split-2');
                      setIsLayoutMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                      layout === 'split-2' ? 'bg-blue-600 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Columns className="w-4 h-4" />
                    <span>Bagi 2 (Split Layar)</span>
                  </button>

                  <button
                    onClick={() => {
                      onLayoutChange('grid-4');
                      setIsLayoutMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                      layout === 'grid-4' ? 'bg-blue-600 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span>Grid 4 Kotak (2x2)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close All button */}
            <button
              onClick={onCloseAllWindows}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors"
              title="Tutup Seluruh Jendela Website"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Master PIN Modal for Quick Credential Access */}
      <MasterPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          showToast('Kredensial terbuka untuk multi-window!', 'success');
        }}
        title="Buka Kredensial Multi-Window"
        subtitle="Masukkan PIN Master untuk melihat username & password admin langsung di atas jendela website."
      />
    </>
  );
};

// -------------------------------------------------------------
// Subcomponent: Individual Window Frame
// -------------------------------------------------------------
interface SingleWindowCardProps {
  win: OpenWindowItem;
  isTiled: boolean;
  iframeKey: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onReload: () => void;
  onUpdateDevice: (view: 'desktop' | 'tablet' | 'mobile') => void;
  onOpenCredentials: () => void;
  isCredentialDrawerOpen: boolean;
  onCopyText: (text: string, id: string, label: string) => void;
  copiedKey: string | null;
}

const SingleWindowCard: React.FC<SingleWindowCardProps> = ({
  win,
  isTiled,
  iframeKey,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onReload,
  onUpdateDevice,
  onOpenCredentials,
  isCredentialDrawerOpen,
  onCopyText,
  copiedKey,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const website = win.website;
  const deviceView = win.deviceView || 'desktop';
  const hasCredentials = Boolean(website.adminUsername || website.adminPassword);

  const getContainerWidth = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-[380px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div
      onClick={onFocus}
      className={`w-full h-full flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl text-white ${
        isTiled ? '' : 'h-full'
      }`}
    >
      {/* WINDOW TITLEBAR */}
      <div className="h-11 bg-slate-950/90 border-b border-slate-800 px-3 flex items-center justify-between select-none gap-2">
        {/* Left: Window Identity */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <Globe className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-bold text-xs text-slate-100 truncate" title={website.name}>
            {website.name}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hidden sm:inline truncate">
            {website.category}
          </span>
        </div>

        {/* Center: Device Switcher & Quick Password Tool */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Credential Peek */}
          {hasCredentials && (
            <button
              onClick={onOpenCredentials}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                isCredentialDrawerOpen
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
              title="Kredensial Admin Website ini"
            >
              <KeyRound className="w-3 h-3" />
              <span className="hidden md:inline">Sandi Admin</span>
            </button>
          )}

          {/* Viewport Width Mode */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 text-slate-400">
            <button
              onClick={() => onUpdateDevice('desktop')}
              className={`p-1 rounded ${deviceView === 'desktop' ? 'bg-slate-700 text-white' : 'hover:text-white'}`}
              title="Desktop (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateDevice('tablet')}
              className={`p-1 rounded ${deviceView === 'tablet' ? 'bg-slate-700 text-white' : 'hover:text-white'}`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateDevice('mobile')}
              className={`p-1 rounded ${deviceView === 'mobile' ? 'bg-slate-700 text-white' : 'hover:text-white'}`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onReload}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Muat ulang website"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Mode Jendela Popup Mandiri (Desktop Mini Kiosk) */}
          <button
            onClick={() => {
              openMiniKioskPopup(website.url, website.name);
              showToast(`Membuka ${website.name} dalam Jendela Popup Mandiri`, 'info');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-amber-400/90 hover:text-amber-300 transition-colors"
            title="Mode Jendela Popup Mandiri (Mini Desktop Popup tanpa address bar)"
          >
            <AppWindow className="w-3.5 h-3.5" />
          </button>

          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Buka di tab browser baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center gap-1 shrink-0 border-l border-slate-800 pl-2">
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Minimize ke taskbar"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onMaximize}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={win.isMaximized ? 'Restore ukuran' : 'Maximize layar penuh'}
          >
            {win.isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-600 hover:text-white text-slate-400 transition-colors"
            title="Tutup jendela ini"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUICK CREDENTIALS DRAWER OVERLAY */}
      {isCredentialDrawerOpen && (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-4 py-2.5 border-b border-indigo-900/60 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 shrink-0 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sandi Admin:</span>
            </span>

            {/* Username */}
            {website.adminUsername && (
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
                <span className="text-slate-400 text-[10px]">User:</span>
                <span className="font-mono font-bold text-white">{website.adminUsername}</span>
                <button
                  onClick={() => onCopyText(website.adminUsername!, `u-${win.id}`, 'Username Admin')}
                  className="p-0.5 text-slate-400 hover:text-amber-400"
                  title="Salin username"
                >
                  {copiedKey === `u-${win.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}

            {/* Password */}
            {website.adminPassword && (
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
                <span className="text-slate-400 text-[10px]">Pass:</span>
                <span className="font-mono font-bold text-amber-300">••••••••</span>
                <button
                  onClick={() => onCopyText(website.adminPassword!, `p-${win.id}`, 'Password Admin')}
                  className="p-0.5 text-slate-400 hover:text-amber-400"
                  title="Salin password admin"
                >
                  {copiedKey === `p-${win.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}

            {/* Notes */}
            {website.adminNotes && (
              <span className="text-[11px] text-slate-300 truncate max-w-xs" title={website.adminNotes}>
                Catatan: {website.adminNotes}
              </span>
            )}
          </div>

          <button
            onClick={onOpenCredentials}
            className="text-slate-400 hover:text-white text-[11px] font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* WINDOW VIEWPORT / IFRAME */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center">
        {/* Loading Spinner */}
        {isLoading && !iframeError && (
          <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-xs text-slate-400 font-medium">
              Memuat portal {website.name}...
            </span>
          </div>
        )}

        <div className={`h-full mx-auto transition-all duration-200 bg-white ${getContainerWidth()} w-full`}>
          {!iframeError ? (
            <iframe
              key={`${win.id}-${iframeKey}`}
              src={website.url}
              title={website.name}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-800 bg-slate-50">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
              <h3 className="text-base font-bold">Iframe Ditutup oleh Kebijakan Keamanan</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                Website ini memberlakukan proteksi X-Frame-Options. Anda dapat membukanya sebagai Jendela Popup Mandiri (kios mini desktop) atau di tab baru.
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={() => {
                    openMiniKioskPopup(website.url, website.name);
                    showToast(`Membuka ${website.name} dalam Jendela Popup Mandiri`, 'info');
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <AppWindow className="w-3.5 h-3.5" />
                  <span>Buka Jendela Popup Kios Mini</span>
                </button>
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2 transition-colors"
                >
                  <span>Buka di Tab Baru</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
