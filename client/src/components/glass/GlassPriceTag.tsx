import React from 'react';
import { formatINR } from '../../utils/formatters.js';

interface GlassPriceTagProps {
  pricePaise: number;
  originalPricePaise?: number;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const GlassPriceTag: React.FC<GlassPriceTagProps> = ({
  pricePaise,
  originalPricePaise,
  discountPercent = 0,
  size = 'md',
}) => {
  const isFree = pricePaise === 0;
  const hasDiscount = discountPercent > 0 && originalPricePaise && originalPricePaise > pricePaise;

  let textClass = 'text-sm font-semibold';
  if (size === 'sm') textClass = 'text-xs font-medium';
  if (size === 'lg') textClass = 'text-2xl font-bold';

  if (isFree) {
    return (
      <span className={`text-cyan-400 font-bold tracking-wide uppercase ${textClass}`}>
        Free
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {hasDiscount && (
        <span className="text-xs text-slate-400 line-through">
          {formatINR(originalPricePaise, false)}
        </span>
      )}
      <span className={`text-slate-100 ${textClass}`}>
        {formatINR(pricePaise, false)}
      </span>
      {hasDiscount && (
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
};
