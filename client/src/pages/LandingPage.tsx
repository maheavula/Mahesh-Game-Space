import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Tag, Compass, Sparkles, ShieldCheck, Flame, ArrowRight, Zap } from 'lucide-react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gamesRes, catRes] = await Promise.all([
          apiClient.get<{ games: Game[] }>('/api/catalog/games'),
          apiClient.get<{ categories: Category[] }>('/api/catalog/categories'),
        ]);

        const allGames = gamesRes.games || [];
        setFeaturedGames(allGames.filter((g) => g.featured).slice(0, 4));
        setPopularGames(allGames.filter((g) => g.popular).slice(0, 8));
        setDealGames(allGames.filter((g) => g.discountPercent > 0).slice(0, 4));
        setCategories(catRes.categories || []);
      } catch (error) {
        console.error('Failed to load catalog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Banner */}
      <GlassHero />

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
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">Explore by Category</h2>
            <p className="text-xs text-slate-400">Find your favorite gaming genre</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/games?categorySlug=${cat.slug}`}>
              <GlassCard variant="interactive" className="p-4 text-center group">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:text-white group-hover:bg-gradient-to-tr group-hover:from-violet-600 group-hover:to-cyan-500 mx-auto mb-2 transition-all">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white font-['Outfit']">
                  {cat.name}
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Mahesh Game Space */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GlassCard variant="strong" glow="violet" className="p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Simulated Gaming Storefront</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Why Mahesh Game Space?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience a sleek, futuristic marketplace equipped with atomic local persistence, strict OWASP security controls, server-side cart & checkout verification, instant wishlist management, and a personalized digital library.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" /> Instant Discovery
                </h4>
                <p className="text-xs text-slate-400">Search and filter top recognizable games seamlessly.</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-[Outfit] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" /> Account Security
                </h4>
                <p className="text-xs text-slate-400">Encrypted sessions and protected digital checkout.</p>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" /> Server Authoritative
                </h4>
                <p className="text-xs text-slate-400">Prices and discounts recalculated server-side.</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">Mahesh Game Space</span>
          <span>— Full-Stack Gaming Marketplace Simulator</span>
        </div>
        <div>
          <span>Demo Disclaimer: All games, payments, licenses, and ownership are 100% simulated locally in <code>runtime.json</code>.</span>
        </div>
      </footer>
    </div>
  );
};
