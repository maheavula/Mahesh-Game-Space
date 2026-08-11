import React, { useEffect, useState } from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { Game } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { GlassGameCard } from '../components/glass/GlassGameCard.js';
import { SkeletonGameGrid } from '../components/glass/SkeletonLoader.js';
import { EmptyState } from '../components/glass/EmptyState.js';

export const DealsPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<{ games: Game[] }>('/api/catalog/games?discountOnly=true&sortBy=discount');
        setGames(res.games || []);
      } catch (err) {
        console.error('Failed to fetch deals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <Tag className="w-4 h-4 text-emerald-400" />
          <span>Special Offers</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Best Gaming Deals</h1>
        <p className="text-sm text-slate-400">Save up to 75% on popular digital commercial games</p>
      </div>

      {loading ? (
        <SkeletonGameGrid count={8} />
      ) : games.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8" />}
          title="No Active Deals"
          description="Check back soon for upcoming promotional discounts and game sales!"
          actionText="Browse Full Catalog"
          actionLink="/games"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <GlassGameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};
