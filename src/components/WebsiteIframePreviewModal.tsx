import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  Globe,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { WebsiteItem } from '../types';
import { normalizeUrl } from '../utils/helpers';

interface WebsiteIframePreviewModalProps {
  website: WebsiteItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WebsiteIframePreviewModal: React.FC<WebsiteIframePreviewModalProps> = ({
  website,
  isOpen,
  onClose,
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen || !website) return null;

  const directUrl = normalizeUrl(website.url);

  const getContainerWidth = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-[420px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Top Browser Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
        {/* Left: App Logo & Website Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">
              {website.name}
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium truncate hidden sm:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Koneksi Terenkripsi
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switchers */}
        <div className="hidden md:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              deviceView === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Tampilan Desktop"
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setDeviceView('tablet')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              deviceView === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Tampilan Tablet"
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              deviceView === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Tampilan Mobile"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right Actions: Refresh, Open New Tab & Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Muat ulang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <a
            href={directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <span>Buka Tab Baru</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors ml-1"
            title="Tutup preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Viewport Area */}
      <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
        <div
          className={`${getContainerWidth()} h-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-700 transition-all duration-300`}
        >
          {/* Simulated Browser URL bar */}
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-slate-700">Koneksi Database Terproteksi (HTTPS)</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Mode Pratinjau Sistem</span>
          </div>

          {/* Iframe with fallback alert */}
          <div className="flex-1 relative bg-slate-50 flex flex-col">
            <iframe
              key={iframeKey}
              src={directUrl}
              title={website.name}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />

            {/* Note banner at bottom for external websites that restrict X-Frame-Options */}
            <div className="bg-amber-50/90 border-t border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-800">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">
                  Jika website memblokir pratinjau dalam frame, klik <strong>Buka Tab Baru</strong>.
                </span>
              </div>
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline text-amber-900 shrink-0 ml-2"
              >
                Buka Langsung
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
