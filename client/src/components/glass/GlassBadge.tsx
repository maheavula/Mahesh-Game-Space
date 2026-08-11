import React from 'react';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'violet',
  size = 'md',
  className = '',
}) => {
  let style = 'bg-violet-500/20 text-violet-300 border-violet-500/40';
  if (variant === 'cyan') style = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
  if (variant === 'emerald') style = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  if (variant === 'amber') style = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  if (variant === 'rose') style = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  if (variant === 'slate') style = 'bg-slate-700/40 text-slate-300 border-slate-600/40';

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border backdrop-blur-md uppercase tracking-wider ${style} ${sizeStyle} ${className}`}
    >
      {children}
    </span>
  );
};
