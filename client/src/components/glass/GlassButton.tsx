import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'cyan' | 'glass' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  let variantStyle = 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 border border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]';
  if (variant === 'cyan') {
    variantStyle = 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 border border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]';
  } else if (variant === 'glass') {
    variantStyle = 'bg-white/10 hover:bg-white/15 text-slate-100 border border-white/20 hover:border-white/30 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]';
  } else if (variant === 'danger') {
    variantStyle = 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border border-white/20 shadow-lg shadow-rose-600/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]';
  } else if (variant === 'ghost') {
    variantStyle = 'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border border-transparent';
  }

  let sizeStyle = 'px-4 py-2 text-sm rounded-xl gap-2';
  if (size === 'sm') sizeStyle = 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5';
  if (size === 'lg') sizeStyle = 'px-6 py-3 text-base rounded-2xl gap-2.5 font-bold';

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`relative inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variantStyle} ${sizeStyle} ${widthStyle} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
