import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Tag, Compass, Sparkles, ShieldCheck, Flame, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { Game, Category } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { GlassHero } from '../components/glass/GlassHero.js';
import { GlassGameCard } from '../components/glass/GlassGameCard.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { SkeletonGameGrid } from '../components/glass/SkeletonLoader.js';

export const LandingPage: React.FC = () => {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [dealGames, setDealGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [gamesRes, catRes] = await Promise.all([
        apiClient.get<{ games: Game[] }>('/api/catalog/games'),
        apiClient.get<{ categories: Category[] }>('/api/catalog/categories'),
      ]);

      const allGames = gamesRes?.games || [];
      const featured = allGames.filter((g) => g.featured);
      setFeaturedGames(featured.length > 0 ? featured.slice(0, 4) : allGames.slice(0, 4));

      const popular = allGames.filter((g) => g.popular);
      setPopularGames(popular.length > 0 ? popular.slice(0, 8) : allGames.slice(0, 8));

      const deals = allGames.filter((g) => g.discountPercent > 0);
      setDealGames(deals.length > 0 ? deals.slice(0, 4) : allGames.slice(0, 4));

      setCategories(catRes?.categories || []);
    } catch (error: any) {
      console.error('Failed to load catalog:', error);
      setLoadError(error.message || 'Unable to connect to game catalog server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Banner */}
      <GlassHero />

      {loadError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard variant="strong" glow="violet" className="p-6 text-center space-y-3 border-rose-500/30">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-white font-['Outfit']">Catalog Connection Notice</h3>
            <p className="text-xs text-slate-300">{loadError}</p>
            <div className="pt-2">
              <GlassButton variant="primary" size="sm" onClick={fetchData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
                Retry Loading Catalog
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Featured Games Carousel / Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">Featured Titles</h2>
              <p className="text-xs text-slate-400">Handpicked spotlight titles this week</p>
            </div>
          </div>

          <Link to="/games?featured=true" className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1">
            <span>View All Featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGameGrid count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <GlassGameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Best Deals Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">Best Deals & Discounts</h2>
              <p className="text-xs text-slate-400">Huge savings on top-rated games</p>
            </div>
          </div>

          <Link to="/deals" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <span>Explore All Deals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGameGrid count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dealGames.map((game) => (
              <GlassGameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Games Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">Most Popular Games</h2>
              <p className="text-xs text-slate-400">Trending among thousands of active gamers</p>
            </div>
          </div>

          <Link to="/games" className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1">
            <span>Browse Full Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGameGrid count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popularGames.map((game) => (
              <GlassGameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Interactive Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">Explore Categories</h2>
            <p className="text-xs text-slate-400">Find your favorite genre or gaming adventure</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} to={`/games?category=${category.slug}`} className="group block">
              <GlassCard variant="interactive" className="p-4 text-center space-y-2 h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-400/30 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-6 h-6 text-cyan-300" />
                </div>
                <h3 className="font-bold text-sm text-white font-['Outfit'] group-hover:text-cyan-400 transition-colors">
                  {category.name}
                </h3>
                <span className="text-[11px] text-slate-400 block group-hover:text-slate-300">View Collection</span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust & Simulator Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard variant="strong" glow="violet" className="p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto md:mx-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Safe Simulator Architecture</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Zero external payment credentials required. 100% simulated transactions with integer paise precision and instant digital delivery.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto md:mx-0">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Instant Game Ownership</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Purchased titles are immediately recorded to your personal game library with atomic persistence and unique simulated license keys.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto md:mx-0">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Admin Control Center</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Comprehensive administrator portal for catalog editing, customer suspension, sales reporting, and promotional code creation.
              </p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
