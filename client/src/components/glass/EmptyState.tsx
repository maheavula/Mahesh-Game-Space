import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from './GlassCard.js';
import { GlassButton } from './GlassButton.js';
import { Compass } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText = 'Explore Games',
  actionLink = '/games',
  onAction,
}) => {
  return (
    <GlassCard variant="normal" className="p-12 text-center max-w-md mx-auto my-12 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-white font-['Outfit']">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>

      <div className="pt-2">
        {actionLink ? (
          <Link to={actionLink}>
            <GlassButton variant="primary" icon={<Compass className="w-4 h-4" />}>
              {actionText}
            </GlassButton>
          </Link>
        ) : onAction ? (
          <GlassButton variant="primary" onClick={onAction}>
            {actionText}
          </GlassButton>
        ) : null}
      </div>
    </GlassCard>
  );
};
