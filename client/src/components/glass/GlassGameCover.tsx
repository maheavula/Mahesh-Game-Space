import React, { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

interface GlassGameCoverProps {
  src: string;
  alt: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  className?: string;
}

export const GlassGameCover: React.FC<GlassGameCoverProps> = ({
  src,
  alt,
  aspectRatio = 'portrait',
  className = '',
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  let ratioClass = 'aspect-[3/4]';
  if (aspectRatio === 'landscape') ratioClass = 'aspect-[16/9]';
  if (aspectRatio === 'square') ratioClass = 'aspect-square';

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 ${ratioClass} ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-slate-700 animate-bounce" />
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
          <Gamepad2 className="w-10 h-10 text-violet-400 mb-2" />
          <span className="text-xs font-bold text-slate-200 line-clamp-2 font-['Outfit']">{alt}</span>
          <span className="text-[10px] text-slate-500 mt-1">Mahesh Game Space</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
