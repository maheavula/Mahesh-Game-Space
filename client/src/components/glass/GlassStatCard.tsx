import React from 'react';
import { GlassCard } from './GlassCard.js';

interface GlassStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  glow?: 'violet' | 'cyan' | 'none';
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  glow = 'none',
}) => {
  return (
    <GlassCard variant="normal" glow={glow} className="p-5 flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">{value}</div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        {trend && (
          <span className="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-violet-400 shrink-0">
        {icon}
      </div>
    </GlassCard>
  );
};
