import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'normal' | 'strong' | 'interactive';
  glow?: 'none' | 'violet' | 'cyan' | 'magenta';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'normal',
  glow = 'none',
  ...props
}) => {
  let baseClass = 'glass-panel';
  if (variant === 'strong') baseClass = 'glass-panel-strong';
  if (variant === 'interactive') baseClass = 'glass-panel-interactive';

  let glowClass = '';
  if (glow === 'violet') glowClass = 'glow-violet';
  if (glow === 'cyan') glowClass = 'glow-cyan';

  return (
    <div className={`${baseClass} ${glowClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
