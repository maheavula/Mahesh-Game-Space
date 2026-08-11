import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, RefreshCw, Gamepad2 } from 'lucide-react';
import { Game, Category } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { GlassGameCard } from '../components/glass/GlassGameCard.js';
import { GlassSelect } from '../components/glass/GlassSelect.js';
import { GlassInput } from '../components/glass/GlassInput.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { SkeletonGameGrid } from '../components/glass/SkeletonLoader.js';
import { EmptyState } from '../components/glass/EmptyState.js';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categorySlug, setCategorySlug] = useState(searchParams.get('categorySlug') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [discountOnly, setDiscountOnly] = useState(searchParams.get('discountOnly') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categorySlug) params.set('categorySlug', categorySlug);
      if (platform) params.set('platform', platform);
      if (discountOnly) params.set('discountOnly', 'true');
      if (sortBy) params.set('sortBy', sortBy);

      const [gamesRes, catRes] = await Promise.all([
        apiClient.get<{ games: Game[] }>(`/api/catalog/games?${params.toString()}`),
        apiClient.get<{ categories: Category[] }>('/api/catalog/categories'),
      ]);

      setGames(gamesRes.games || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [search, categorySlug, platform, discountOnly, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setCategorySlug('');
    setPlatform('');
    setDiscountOnly(false);
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-cyan-400" />
            <span>Games Storefront</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, search, and discover recognizable commercial games with simulated checkout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden p-2.5 rounded-xl glass-panel text-slate-300 flex items-center gap-2 text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4 text-violet-400" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="w-48">
            <GlassSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'popular', label: 'Sort: Popularity' },
                { value: 'newest', label: 'Sort: Release Date' },
                { value: 'price_asc', label: 'Price: Low → High' },
                { value: 'price_desc', label: 'Price: High → Low' },
                { value: 'rating', label: 'Sort: Highest Rated' },
                { value: 'discount', label: 'Sort: Deepest Discount' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filter Sidebar (Desktop + Mobile) */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            showMobileFilters ? 'block' : 'hidden lg:block'
          }`}
        >
          <GlassCard variant="strong" className="p-5 space-y-5 sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-white font-['Outfit']">
                <Filter className="w-4 h-4 text-violet-400" />
                <span>Filter Games</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Search Input */}
            <GlassInput
              label="Search Title / Publisher"
              placeholder="e.g. Cyberpunk, Valve..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />

            {/* Category Select */}
            <GlassSelect
              label="Genre Category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.slug, label: c.name })),
              ]}
            />

            {/* Platform Select */}
            <GlassSelect
              label="Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={[
                { value: '', label: 'All Platforms' },
                { value: 'PC', label: 'PC (Windows / SteamOS)' },
              ]}
            />

            {/* Discount Only Checkbox */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => setDiscountOnly(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-xs font-semibold text-slate-300">Discounted Deals Only</span>
              </label>
            </div>
          </GlassCard>
        </aside>

        {/* Main Games Grid */}
        <main className="lg:col-span-9">
          {loading ? (
            <SkeletonGameGrid count={8} />
          ) : games.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="No Games Found"
              description="No titles match your current search and filter criteria. Try adjusting your filters."
              actionText="Reset All Filters"
              onAction={resetFilters}
            />
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Showing {games.length} titles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {games.map((game) => (
                  <GlassGameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
