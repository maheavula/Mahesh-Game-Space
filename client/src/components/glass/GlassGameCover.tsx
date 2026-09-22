import React, { useState, useRef, useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';

interface GlassGameCoverProps {
  src: string;
  alt: string;
  aspectRatio?: 'portrait' | 'landscape' | 'square' | 'wide' | 'auto';
  className?: string;
}

export const GlassGameCover: React.FC<GlassGameCoverProps> = ({
  src,
  alt,
  aspectRatio = 'landscape',
  className = '',
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setError(false);
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  let ratioClass = 'aspect-[16/9]';
  if (aspectRatio === 'landscape') ratioClass = 'aspect-[16/9]';
  if (aspectRatio === 'portrait') ratioClass = 'aspect-[16/9]'; // Standardized to 16:9 for Steam banners
  if (aspectRatio === 'wide') ratioClass = 'aspect-[21/9]';
  if (aspectRatio === 'square') ratioClass = 'aspect-square';
  if (aspectRatio === 'auto') ratioClass = '';

  return (
    <div className={`relative overflow-hidden rounded-xl bg-slate-900/90 border border-slate-800/80 ${ratioClass} ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-slate-800/80 animate-pulse flex items-center justify-center z-0">
          <Gamepad2 className="w-8 h-8 text-slate-600 animate-bounce" />
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-cyan-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="p-3 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 mb-2">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-white line-clamp-2 font-['Outfit']">{alt}</span>
          <span className="text-[10px] text-cyan-400 mt-1 uppercase font-semibold tracking-wider">AMR Game Space</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105 relative z-10 ${
            loaded ? 'opacity-100' : 'opacity-90'
          }`}
        />
      )}
    </div>
  );
};
