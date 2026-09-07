import React from 'react';
import { Globe } from 'lucide-react';

interface BrandLogoProps {
  logoUrl?: string | null;
  appName?: string;
  subtitle?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  logoUrl,
  appName = 'MY WEBSITE',
  subtitle,
  showText = false,
  size = 'md',
  variant = 'dark',
  className = '',
}) => {
  const sizeMap = {
    sm: {
      box: 'w-8 h-8 rounded-lg',
      icon: 'w-4 h-4',
      text: 'text-xs',
      sub: 'text-[9px]',
    },
    md: {
      box: 'w-10 h-10 rounded-xl',
      icon: 'w-5 h-5',
      text: 'text-sm font-extrabold',
      sub: 'text-[10px]',
    },
    lg: {
      box: 'w-12 h-12 rounded-2xl',
      icon: 'w-6 h-6',
      text: 'text-base font-extrabold',
      sub: 'text-xs',
    },
    xl: {
      box: 'w-16 h-16 rounded-2xl',
      icon: 'w-8 h-8',
      text: 'text-xl font-black',
      sub: 'text-xs',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon / Image Container */}
      <div
        className={`${currentSize.box} flex items-center justify-center shrink-0 overflow-hidden shadow-md transition-all ${
          logoUrl
            ? 'bg-white border border-slate-200/40 p-1'
            : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white border border-white/20'
        }`}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={appName}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <Globe className={`${currentSize.icon} text-white`} />
        )}
      </div>

      {/* Text Info */}
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`${currentSize.text} tracking-tight leading-tight uppercase ${
              variant === 'dark' ? 'text-white' : 'text-slate-800'
            }`}
          >
            {appName}
          </span>
          {subtitle && (
            <span
              className={`${currentSize.sub} font-semibold ${
                variant === 'dark' ? 'text-cyan-400' : 'text-blue-600'
              } leading-none mt-0.5`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
