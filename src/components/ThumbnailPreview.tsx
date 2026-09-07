import React, { useState } from 'react';
import { Globe, GraduationCap, Landmark, Building2, Store, Boxes, HeartPulse, Users, Folder } from 'lucide-react';
import { CategoryType } from '../types';

interface ThumbnailPreviewProps {
  src?: string;
  alt: string;
  category: CategoryType;
  className?: string;
  badge?: React.ReactNode;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  src,
  alt,
  category,
  className = 'w-full h-44',
  badge,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const getCategoryIcon = () => {
    switch (category) {
      case 'Pendidikan':
        return <GraduationCap className="w-10 h-10 text-amber-600 opacity-90" />;
      case 'Keagamaan':
        return <Landmark className="w-10 h-10 text-emerald-600 opacity-90" />;
      case 'Pemerintahan':
        return <Building2 className="w-10 h-10 text-blue-600 opacity-90" />;
      case 'Bisnis':
        return <Store className="w-10 h-10 text-purple-600 opacity-90" />;
      case 'Manajemen':
        return <Boxes className="w-10 h-10 text-indigo-600 opacity-90" />;
      case 'Kesehatan':
        return <HeartPulse className="w-10 h-10 text-rose-600 opacity-90" />;
      case 'Manajemen SDM':
        return <Users className="w-10 h-10 text-sky-600 opacity-90" />;
      default:
        return <Folder className="w-10 h-10 text-slate-600 opacity-90" />;
    }
  };

  const getCategoryBgGradient = () => {
    switch (category) {
      case 'Pendidikan':
        return 'from-amber-500/10 via-amber-500/20 to-orange-500/20';
      case 'Keagamaan':
        return 'from-emerald-500/10 via-emerald-500/20 to-teal-500/20';
      case 'Pemerintahan':
        return 'from-blue-500/10 via-blue-500/20 to-cyan-500/20';
      case 'Bisnis':
        return 'from-purple-500/10 via-purple-500/20 to-indigo-500/20';
      case 'Manajemen':
        return 'from-indigo-500/10 via-indigo-500/20 to-blue-500/20';
      case 'Kesehatan':
        return 'from-rose-500/10 via-rose-500/20 to-red-500/20';
      case 'Manajemen SDM':
        return 'from-sky-500/10 via-sky-500/20 to-blue-500/20';
      default:
        return 'from-slate-500/10 via-slate-500/20 to-gray-500/20';
    }
  };

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className} group`}>
      {src && !imgError ? (
        <>
          {/* Skeleton placeholder while loading */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
              <Globe className="w-8 h-8 text-slate-300 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        /* Dynamic aesthetic vector illustration fallback */
        <div className={`w-full h-full bg-gradient-to-br ${getCategoryBgGradient()} flex flex-col items-center justify-center p-4 text-center transition-transform duration-500 group-hover:scale-105`}>
          <div className="p-3 bg-white/80 backdrop-blur-xs rounded-2xl shadow-xs border border-white/60 mb-2">
            {getCategoryIcon()}
          </div>
          <span className="text-xs font-semibold text-slate-700 max-w-[85%] truncate">
            {category}
          </span>
          <span className="text-[10px] text-slate-500 truncate max-w-[90%] mt-0.5">
            {alt}
          </span>
        </div>
      )}

      {/* Subtle overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />

      {badge && <div className="absolute top-2.5 right-2.5 z-10">{badge}</div>}
    </div>
  );
};
