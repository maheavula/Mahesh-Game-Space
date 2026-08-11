import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Check, ShieldCheck, ArrowLeft, Calendar, Monitor, Building, Gamepad2, Info } from 'lucide-react';
import { Game } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { GlassPriceTag } from '../components/glass/GlassPriceTag.js';
import { GlassBadge } from '../components/glass/GlassBadge.js';
import { GlassGameCover } from '../components/glass/GlassGameCover.js';
import { formatDate } from '../utils/formatters.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart, items: cartItems } = useCart();
  const { showToast } = useToast();

  const [game, setGame] = useState<Game | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await apiClient.get<{ game: Game }>(`/api/catalog/games/${id}`);
        setGame(res.game);

        if (user) {
          // Check wishlist & library
          const [wishRes, libRes] = await Promise.all([
            apiClient.get<{ wishlist: Game[] }>('/api/catalog/wishlist'),
            apiClient.get<{ library: Array<{ gameId: string }> }>('/api/catalog/library'),
          ]);
          setIsWishlisted((wishRes.wishlist || []).some((g) => g.id === res.game.id));
          setIsOwned((libRes.library || []).some((l) => l.gameId === res.game.id));
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load game details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading game details...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Game Not Found</h2>
        <Link to="/games">
          <GlassButton variant="primary">Back to Storefront</GlassButton>
        </Link>
      </div>
    );
  }

  const isInCart = cartItems.some((i) => i.game.id === game.id);

  const toggleWishlist = async () => {
    if (!user) {
      showToast('Please log in to manage your wishlist.', 'warning');
      return;
    }
    try {
      setWishlistLoading(true);
      if (isWishlisted) {
        await apiClient.delete(`/api/catalog/wishlist/${game.id}`);
        setIsWishlisted(false);
        showToast(`Removed '${game.title}' from wishlist.`, 'info');
      } else {
        await apiClient.post(`/api/catalog/wishlist/${game.id}`);
        setIsWishlisted(true);
        showToast(`Added '${game.title}' to wishlist.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update wishlist.', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <Link to="/games" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Storefront</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cover Graphic Showcase */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard variant="strong" glow="violet" className="p-4">
            <GlassGameCover src={game.image} alt={game.title} aspectRatio="portrait" className="w-full shadow-2xl rounded-xl" />
          </GlassCard>

          <div className="glass-panel p-4 rounded-xl space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Mahesh Game Space Guarantee</span>
            </div>
            <p>100% simulated storefront purchase. Instant library ownership recording upon checkout.</p>
          </div>
        </div>

        {/* Game Information & Purchase Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <GlassBadge variant={game.availability === 'available' ? 'emerald' : 'rose'}>
                {game.availability}
              </GlassBadge>
              {game.featured && <GlassBadge variant="violet">Featured</GlassBadge>}
              {game.popular && <GlassBadge variant="cyan">Popular</GlassBadge>}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
              {game.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{game.rating.toFixed(1)}</span>
                <span className="text-slate-500 font-normal">({game.reviewCount.toLocaleString()} reviews)</span>
              </span>

              <span>•</span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{game.publisher}</span>
              </span>

              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Released: {formatDate(game.releaseDate)}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">About The Game</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">{game.description}</p>
          </div>

          {/* Platforms & Details */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Developer</span>
              <span className="text-sm font-semibold text-white">{game.developer}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block mb-1">Supported Platforms</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
                <Monitor className="w-4 h-4" />
                <span>{game.platforms.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <GlassCard variant="strong" glow="cyan" className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Digital Game License</span>
                <GlassPriceTag
                  pricePaise={game.pricePaise}
                  originalPricePaise={game.originalPricePaise}
                  discountPercent={game.discountPercent}
                  size="lg"
                />
              </div>

              {game.discountPercent > 0 && (
                <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-sm px-3 py-1.5 rounded-xl">
                  SAVE {game.discountPercent}%
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isOwned ? (
                <div className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  <span>In Your Library</span>
                </div>
              ) : (
                <GlassButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => addToCart(game.id)}
                  disabled={game.availability !== 'available'}
                  icon={<ShoppingBag className="w-5 h-5" />}
                >
                  {isInCart ? 'View In Cart' : 'Add to Cart'}
                </GlassButton>
              )}

              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isWishlisted
                    ? 'bg-rose-500/80 border-rose-400 text-white'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
