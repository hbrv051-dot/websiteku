/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  WebsiteItem,
  AccessLog,
  NavigationTab,
  SortOption,
  ViewMode,
  AudioSettings,
  AppBrandingSettings,
  UserProfile,
  OpenWindowItem,
  MultiWindowLayout,
} from './types';
import {
  loadWebsitesFromStorage,
  saveWebsitesToStorage,
  loadAccessLogsFromStorage,
  saveAccessLogsToStorage,
  loadAudioSettings,
  saveAudioSettings,
  loadBrandingSettings,
  saveBrandingSettings,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WebsiteModal } from './components/WebsiteModal';
import { WebsiteDetailModal } from './components/WebsiteDetailModal';
import { MultiWindowManager } from './components/MultiWindowManager';
import { LoginModal } from './components/LoginModal';
import { LandingPageView } from './views/LandingPageView';
import { LoginPageView } from './views/LoginPageView';
import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { AllDatabasesView } from './views/AllDatabasesView';
import { CategoriesView } from './views/CategoriesView';
import { FavoritesView } from './views/FavoritesView';
import { VaultView } from './views/VaultView';
import { HistoryView } from './views/HistoryView';
import { BackupView } from './views/BackupView';
import { ProfileView } from './views/ProfileView';
import { AboutView } from './views/AboutView';
import { showToast, showConfirmDialog } from './utils/alerts';
import { checkWebsitePing, checkAllWebsitesPing } from './utils/ping';
import { openMiniKioskPopup } from './utils/helpers';

export default function App() {
  // State: Data
  const [websites, setWebsites] = useState<WebsiteItem[]>(() => loadWebsitesFromStorage());
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => loadAccessLogsFromStorage());
  const [isCheckingAllPing, setIsCheckingAllPing] = useState(false);

  // State: Custom Branding & Audio Settings
  const [branding, setBranding] = useState<AppBrandingSettings>(() => loadBrandingSettings());
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => loadAudioSettings());

  // State: Navigation & UI Controls
  const [currentTab, setCurrentTab] = useState<NavigationTab>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State: Authentication & User
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: branding.adminName || 'Mustofa',
    email: branding.adminEmail || 'admin@mustofa.id',
    role: 'Super Administrator',
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // State: Modals & Detail
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<WebsiteItem | null>(null);
  const [detailWebsite, setDetailWebsite] = useState<WebsiteItem | null>(null);

  // State: Multi-Windows Workspace System
  const [openWindows, setOpenWindows] = useState<OpenWindowItem[]>([]);
  const [multiWindowLayout, setMultiWindowLayout] = useState<MultiWindowLayout>('floating');

  // Sync to local storage
  useEffect(() => {
    saveWebsitesToStorage(websites);
  }, [websites]);

  useEffect(() => {
    saveAccessLogsToStorage(accessLogs);
  }, [accessLogs]);

  useEffect(() => {
    saveBrandingSettings(branding);
  }, [branding]);

  useEffect(() => {
    saveAudioSettings(audioSettings);
  }, [audioSettings]);

  // Handler: Open Website (Supports Multi-Window: doesn't close previously opened websites!)
  const handleOpenWebsite = (website: WebsiteItem) => {
    const nowIso = new Date().toISOString();

    // 1. Update lastAccessed in website list
    setWebsites((prev) =>
      prev.map((item) =>
        item.id === website.id ? { ...item, lastAccessed: nowIso } : item
      )
    );

    // 2. Add to access history log
    const newLog: AccessLog = {
      id: `log-${Date.now()}`,
      websiteId: website.id,
      websiteName: website.name,
      websiteUrl: website.url,
      thumbnail: website.thumbnail,
      email: website.email,
      category: website.category,
      timestamp: nowIso,
    };
    setAccessLogs((prev) => [newLog, ...prev.filter((l) => l.websiteId !== website.id).slice(0, 49)]);

    // 3. Multi-Window Management
    setOpenWindows((prev) => {
      const existingWin = prev.find((w) => w.websiteId === website.id);
      if (existingWin) {
        // Bring to front & un-minimize
        return prev.map((w) =>
          w.id === existingWin.id
            ? { ...w, isMinimized: false, zIndex: Date.now() }
            : w
        );
      }

      // Add new floating window
      const newWin: OpenWindowItem = {
        id: `win-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        websiteId: website.id,
        website: website,
        isMinimized: false,
        isMaximized: false,
        zIndex: Date.now(),
        position: { x: 30, y: 20 },
        size: { width: 960, height: 620 },
        deviceView: 'desktop',
      };
      return [...prev, newWin];
    });

    showToast(`Membuka "${website.name}" di jendela multi-window`, 'info');
  };

  // Multi-Window Handlers
  const handleCloseWindow = (id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const handleCloseAllWindows = async () => {
    if (openWindows.length === 0) return;
    const confirmed = await showConfirmDialog({
      title: 'Tutup Semua Jendela?',
      text: 'Semua tab website yang sedang terbuka akan ditutup.',
      confirmButtonText: 'Ya, Tutup Semua',
      icon: 'question',
    });
    if (confirmed) {
      setOpenWindows([]);
      showToast('Semua jendela website telah ditutup.', 'info');
    }
  };

  const handleMinimizeWindow = (id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: !w.isMinimized } : w))
    );
  };

  const handleMinimizeAllWindows = () => {
    setOpenWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
    showToast('Semua jendela diminimalkan ke dock bawah.', 'info');
  };

  const handleRestoreAllWindows = () => {
    setOpenWindows((prev) => prev.map((w) => ({ ...w, isMinimized: false })));
    showToast('Semua jendela ditampilkan kembali.', 'info');
  };

  const handleMaximizeWindow = (id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const handleFocusWindow = (id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: Date.now() } : w))
    );
  };

  const handleUpdateDeviceView = (id: string, view: 'desktop' | 'tablet' | 'mobile') => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, deviceView: view } : w))
    );
  };

  // Handler: Open in Mini Kiosk Popup Window
  const handleOpenKiosk = (website: WebsiteItem) => {
    openMiniKioskPopup(website.url, website.name);
    const nowIso = new Date().toISOString();

    // Reset 7-day inactivity timer on access
    setWebsites((prev) =>
      prev.map((item) => (item.id === website.id ? { ...item, lastAccessed: nowIso } : item))
    );

    // Record access history log
    const newLog: AccessLog = {
      id: `log-${Date.now()}`,
      websiteId: website.id,
      websiteName: website.name,
      websiteUrl: website.url,
      thumbnail: website.thumbnail,
      email: website.email,
      category: website.category,
      timestamp: nowIso,
    };
    setAccessLogs((prev) => [newLog, ...prev.filter((l) => l.websiteId !== website.id).slice(0, 49)]);

    showToast(`Membuka "${website.name}" dalam Jendela Kios Mini Popup`, 'info');
  };

  // Handler: Ping Single Website HTTP Latency Check
  const handlePingWebsite = async (website: WebsiteItem) => {
    setWebsites((prev) =>
      prev.map((item) =>
        item.id === website.id ? { ...item, pingStatus: 'checking' } : item
      )
    );

    const result = await checkWebsitePing(website.url);

    setWebsites((prev) =>
      prev.map((item) =>
        item.id === website.id
          ? {
              ...item,
              pingStatus: result.status,
              pingLatency: result.latencyMs,
              lastPingChecked: new Date().toISOString(),
              httpStatusNote: result.statusText,
            }
          : item
      )
    );

    if (result.status === 'online') {
      showToast(`Website "${website.name}" Online (${result.latencyMs}ms)`, 'success');
    } else if (result.status === 'slow') {
      showToast(`Website "${website.name}" Lambat (${result.latencyMs}ms)`, 'warning');
    } else {
      showToast(`Website "${website.name}" Tidak merespons / Timeout`, 'error');
    }
  };

  // Handler: Ping All Websites Concurrently
  const handleCheckAllPing = async () => {
    if (isCheckingAllPing) return;
    setIsCheckingAllPing(true);
    showToast('Memeriksa status respon HTTP seluruh website...', 'info');

    const updated = await checkAllWebsitesPing(websites);
    setWebsites(updated);
    setIsCheckingAllPing(false);

    const onlineCount = updated.filter((w) => w.pingStatus === 'online').length;
    const slowCount = updated.filter((w) => w.pingStatus === 'slow').length;
    const offlineCount = updated.filter((w) => w.pingStatus === 'offline').length;

    showToast(
      `Pengecekan selesai! ${onlineCount} Online, ${slowCount} Lambat, ${offlineCount} Offline`,
      offlineCount > 0 ? 'warning' : 'success'
    );
  };

  // Handler: Wake up Supabase (Reset 7-day inactivity timer)
  const handleWakeWebsite = (id: string) => {
    const nowIso = new Date().toISOString();
    setWebsites((prev) =>
      prev.map((item) => (item.id === id ? { ...item, lastAccessed: nowIso } : item))
    );
    showToast('Website berhasil dibangunkan! Timer 7 hari Supabase diperbarui.', 'success');
  };

  // Handler: Wake All Supabase Websites
  const handleWakeAllSupabase = () => {
    const nowIso = new Date().toISOString();
    setWebsites((prev) =>
      prev.map((item) =>
        item.isSupabase !== false ? { ...item, lastAccessed: nowIso } : item
      )
    );
    showToast('Semua database Supabase telah dibangunkan & timer 7 hari di-reset!', 'success');
  };

  // Handler: Toggle Favorite ⭐
  const handleToggleFavorite = (id: string) => {
    setWebsites((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextFav = !item.favorite;
          showToast(
            nextFav
              ? `"${item.name}" ditambahkan ke Favorit ⭐`
              : `"${item.name}" dihapus dari Favorit`,
            'success'
          );
          return { ...item, favorite: nextFav };
        }
        return item;
      })
    );
  };

  // Handler: Save (Add or Edit) Website
  const handleSaveWebsite = (
    websiteData: Omit<WebsiteItem, 'id' | 'createdAt' | 'lastAccessed'> & { id?: string }
  ) => {
    if (websiteData.id) {
      // Editing existing website
      setWebsites((prev) =>
        prev.map((item) =>
          item.id === websiteData.id
            ? {
                ...item,
                ...websiteData,
              }
            : item
        )
      );
      // Also update open window instance if any
      setOpenWindows((prev) =>
        prev.map((w) =>
          w.websiteId === websiteData.id
            ? { ...w, website: { ...w.website, ...websiteData } }
            : w
        )
      );
      showToast(`Website "${websiteData.name}" berhasil diperbarui!`, 'success');
    } else {
      // Adding new website
      const newWebsite: WebsiteItem = {
        id: `db-${Date.now()}`,
        ...websiteData,
        createdAt: new Date().toISOString(),
        lastAccessed: null,
      };
      setWebsites((prev) => [newWebsite, ...prev]);
      showToast(`Website "${newWebsite.name}" berhasil ditambahkan ke katalog!`, 'success');
    }
    setEditingWebsite(null);
  };

  // Handler: Duplicate Website
  const handleDuplicateWebsite = (website: WebsiteItem) => {
    const duplicated: WebsiteItem = {
      ...website,
      id: `db-${Date.now()}`,
      name: `${website.name} (Salinan)`,
      createdAt: new Date().toISOString(),
      lastAccessed: null,
    };
    setWebsites((prev) => [duplicated, ...prev]);
    showToast(`Website "${website.name}" berhasil diduplikasi!`, 'success');
  };

  // Handler: Delete Website
  const handleDeleteWebsite = async (id: string) => {
    const target = websites.find((w) => w.id === id);
    const targetName = target ? target.name : 'Website ini';
    const confirmed = await showConfirmDialog({
      title: 'Hapus Database Website?',
      text: `Website "${targetName}" akan dihapus permanen dari katalog. Tindakan ini tidak dapat dibatalkan.`,
      confirmButtonText: 'Ya, Hapus Sekarang',
      isDangerous: true,
      icon: 'warning',
    });

    if (confirmed) {
      setWebsites((prev) => prev.filter((w) => w.id !== id));
      setOpenWindows((prev) => prev.filter((w) => w.websiteId !== id));
      if (detailWebsite && detailWebsite.id === id) {
        setDetailWebsite(null);
      }
      showToast(`Website "${targetName}" berhasil dihapus.`, 'success');
    }
  };

  // Handler: Restore backup data
  const handleRestoreBackup = (importedWebsites: WebsiteItem[], importedLogs: AccessLog[]) => {
    setWebsites(importedWebsites);
    setAccessLogs(importedLogs);
    showToast('Seluruh data berhasil dipulihkan dari file backup!', 'success');
  };

  // Handler: Update backup status
  const handleUpdateWebsiteBackup = (websiteId: string) => {
    setWebsites((prev) =>
      prev.map((w) =>
        w.id === websiteId
          ? { ...w, backupStatus: 'Aman', lastBackupDate: new Date().toISOString() }
          : w
      )
    );
  };

  // Handler: Lock or Exit Session immediately
  const handleLockOrExitSession = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Kunci / Keluar Sesi?',
      text: 'Seluruh jendela & tab aplikasi akan ditutup dan Anda akan kembali ke Landing Page.',
      confirmButtonText: 'Ya, Keluar Sesi',
      cancelButtonText: 'Batal',
      icon: 'question',
      confirmButtonColor: '#e11d48',
    });

    if (confirmed) {
      setOpenWindows([]);
      setIsAuthenticated(false);
      setCurrentTab('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Sesi telah diakhiri dengan aman.', 'info');
    }
  };

  const favoriteCount = websites.filter((w) => w.favorite).length;
  const backupWarningCount = websites.filter((w) => w.backupStatus === 'Perlu Perhatian' || w.status === 'Maintenance').length;
  const isMultiWindowActive = openWindows.length > 0;

  // 0. LANDING PAGE VIEW
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900">
        <LandingPageView
          websites={websites}
          branding={branding}
          onOpenLogin={() => {
            setCurrentTab('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    );
  }

  // 0.1 DEDICATED LOGIN PAGE (Username & Password)
  if (currentTab === 'login') {
    return (
      <div className="min-h-screen bg-slate-950">
        <LoginPageView
          branding={branding}
          audioSettings={audioSettings}
          onBackToLanding={() => {
            setCurrentTab('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setCurrentTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast(`Selamat datang kembali, ${user.name}!`, 'success');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* 1. SIDEBAR (Auto-hides during Multi-Window mode so it doesn't block website view) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        totalWebsites={websites.length}
        favoriteCount={favoriteCount}
        backupWarningCount={backupWarningCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLockOrExitSession}
        isAuthenticated={isAuthenticated}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        branding={branding}
        isMultiWindowActive={isMultiWindowActive}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isMultiWindowActive ? 'lg:pl-0' : 'lg:pl-72'
        }`}
      >
        {/* TOP HEADER */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={() => {
            setEditingWebsite(null);
            setIsAddModalOpen(true);
          }}
          currentTab={currentTab}
          totalDatabases={websites.length}
          favoriteCount={favoriteCount}
          isAuthenticated={isAuthenticated}
          branding={branding}
        />

        {/* VIEW CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'home' && (
            <HomeView
              websites={websites}
              isAuthenticated={isAuthenticated}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onGoToDashboard={() => {
                setCurrentTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToAllDatabases={() => {
                setCurrentTab('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToCategories={() => {
                setCurrentTab('categories');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onGoToFavorites={() => {
                setCurrentTab('favorites');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAddModal={() => {
                setEditingWebsite(null);
                setIsAddModalOpen(true);
              }}
              onOpenWebsite={handleOpenWebsite}
              onViewDetails={setDetailWebsite}
              onToggleFavorite={handleToggleFavorite}
              onEditWebsite={(w) => {
                setEditingWebsite(w);
                setIsAddModalOpen(true);
              }}
              onDuplicateWebsite={handleDuplicateWebsite}
              onDeleteWebsite={handleDeleteWebsite}
              onOpenKiosk={handleOpenKiosk}
              onPingWebsite={handlePingWebsite}
              onWakeWebsite={handleWakeWebsite}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              websites={websites}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortOption={sortOption}
              onSortChange={setSortOption}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenWebsite={handleOpenWebsite}
              onViewDetails={setDetailWebsite}
              onToggleFavorite={handleToggleFavorite}
              onEditWebsite={(w) => {
                setEditingWebsite(w);
                setIsAddModalOpen(true);
              }}
              onDuplicateWebsite={handleDuplicateWebsite}
              onDeleteWebsite={handleDeleteWebsite}
              onOpenAddModal={() => {
                setEditingWebsite(null);
                setIsAddModalOpen(true);
              }}
              onOpenKiosk={handleOpenKiosk}
              onPingWebsite={handlePingWebsite}
              onCheckAllPing={handleCheckAllPing}
              isCheckingAllPing={isCheckingAllPing}
              onWakeWebsite={handleWakeWebsite}
              onWakeAllSupabase={handleWakeAllSupabase}
            />
          )}

          {currentTab === 'all' && (
            <AllDatabasesView
              websites={websites}
              searchQuery={searchQuery}
              onOpenWebsite={handleOpenWebsite}
              onViewDetails={setDetailWebsite}
              onToggleFavorite={handleToggleFavorite}
              onEditWebsite={(w) => {
                setEditingWebsite(w);
                setIsAddModalOpen(true);
              }}
              onDuplicateWebsite={handleDuplicateWebsite}
              onDeleteWebsite={handleDeleteWebsite}
              onOpenAddModal={() => {
                setEditingWebsite(null);
                setIsAddModalOpen(true);
              }}
              onOpenKiosk={handleOpenKiosk}
              onPingWebsite={handlePingWebsite}
              onWakeWebsite={handleWakeWebsite}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesView
              websites={websites}
              onOpenWebsite={handleOpenWebsite}
              onViewDetails={setDetailWebsite}
              onToggleFavorite={handleToggleFavorite}
              onEditWebsite={(w) => {
                setEditingWebsite(w);
                setIsAddModalOpen(true);
              }}
              onDuplicateWebsite={handleDuplicateWebsite}
              onDeleteWebsite={handleDeleteWebsite}
              onOpenAddModal={() => {
                setEditingWebsite(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {currentTab === 'favorites' && (
            <FavoritesView
              websites={websites}
              onOpenWebsite={handleOpenWebsite}
              onViewDetails={setDetailWebsite}
              onToggleFavorite={handleToggleFavorite}
              onEditWebsite={(w) => {
                setEditingWebsite(w);
                setIsAddModalOpen(true);
              }}
              onDuplicateWebsite={handleDuplicateWebsite}
              onDeleteWebsite={handleDeleteWebsite}
              onOpenAddModal={() => {
                setEditingWebsite(null);
                setIsAddModalOpen(true);
              }}
              onOpenKiosk={handleOpenKiosk}
              onPingWebsite={handlePingWebsite}
              onWakeWebsite={handleWakeWebsite}
            />
          )}

          {currentTab === 'vault' && (
            <VaultView
              websites={websites}
              onOpenWebsite={handleOpenWebsite}
              onEditWebsite={(w) => {
                setEditingWebsite(w);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              accessLogs={accessLogs}
              websites={websites}
              onOpenWebsite={handleOpenWebsite}
              onClearHistory={() => {
                setAccessLogs([]);
              }}
            />
          )}

          {currentTab === 'backup' && (
            <BackupView
              websites={websites}
              accessLogs={accessLogs}
              onRestoreBackup={handleRestoreBackup}
              onUpdateWebsiteBackup={handleUpdateWebsiteBackup}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              branding={branding}
              onUpdateBranding={setBranding}
              audioSettings={audioSettings}
              onUpdateAudioSettings={setAudioSettings}
              currentUser={currentUser}
              onUpdateCurrentUser={setCurrentUser}
            />
          )}

          {currentTab === 'about' && <AboutView />}
        </main>

        {/* 3. FOOTER */}
        <Footer />
      </div>

      {/* 4. MODALS & MULTI-WINDOW WORKSPACE */}

      {/* Add / Edit Website Modal */}
      <WebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingWebsite(null);
        }}
        onSave={handleSaveWebsite}
        initialData={editingWebsite}
      />

      {/* Website Detail Modal */}
      <WebsiteDetailModal
        website={detailWebsite}
        isOpen={!!detailWebsite}
        onClose={() => setDetailWebsite(null)}
        onOpenWebsite={handleOpenWebsite}
        onEdit={(w) => {
          setDetailWebsite(null);
          setEditingWebsite(w);
          setIsAddModalOpen(true);
        }}
        onDelete={(id) => {
          setDetailWebsite(null);
          handleDeleteWebsite(id);
        }}
        onToggleFavorite={handleToggleFavorite}
        onOpenKiosk={handleOpenKiosk}
        onPingWebsite={handlePingWebsite}
        onWakeWebsite={handleWakeWebsite}
      />

      {/* Multi-Window / Multi-Tabs System Workspace */}
      <MultiWindowManager
        windows={openWindows}
        allWebsites={websites}
        layout={multiWindowLayout}
        onLayoutChange={setMultiWindowLayout}
        onCloseWindow={handleCloseWindow}
        onCloseAllWindows={handleCloseAllWindows}
        onMinimizeWindow={handleMinimizeWindow}
        onMaximizeWindow={handleMaximizeWindow}
        onFocusWindow={handleFocusWindow}
        onOpenNewWindow={handleOpenWebsite}
        onUpdateDeviceView={handleUpdateDeviceView}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onMinimizeAllWindows={handleMinimizeAllWindows}
        onRestoreAllWindows={handleRestoreAllWindows}
        branding={branding}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        branding={branding}
        audioSettings={audioSettings}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          showToast(`Berhasil masuk sebagai ${user.name} (${user.role})!`, 'success');
        }}
      />
    </div>
  );
}
