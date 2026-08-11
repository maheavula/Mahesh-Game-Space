import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Game } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassPriceTag } from '../components/glass/GlassPriceTag.js';
import { GlassGameCover } from '../components/glass/GlassGameCover.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { EmptyState } from '../components/glass/EmptyState.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Link } from 'react-router-dom';

export const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get<{ wishlist: Game[] }>('/api/catalog/wishlist');
      setWishlist(res.wishlist || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemove = async (gameId: string, title: string) => {
    try {
      const res = await apiClient.delete<{ wishlist: Game[] }>(`/api/catalog/wishlist/${gameId}`);
      setWishlist(res.wishlist || []);
      showToast(`Removed '${title}' from wishlist.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove from wishlist.', 'error');
    }
  };

  const handleMoveToCart = async (game: Game) => {
    await addToCart(game.id);
    await handleRemove(game.id, game.title);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Heart className="w-8 h-8" />}
          title="Sign in to View Your Wishlist"
          description="Log in to your Mahesh Game Space account to save games and track discount offers."
          actionText="Sign In Now"
          actionLink="/login"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-400 fill-rose-400/20" />
          <span>Your Wishlist</span>
        </h1>
        <p className="text-sm text-slate-400">Keep track of titles you intend to acquire later</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading wishlist...</div>
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8" />}
          title="Your Wishlist is Empty"
          description="Save games here while exploring the storefront so you can easily purchase them later."
          actionText="Explore Games"
          actionLink="/games"
        />
      ) : (
        <div className="space-y-4">
          {wishlist.map((game) => (
            <GlassCard key={game.id} variant="interactive" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <GlassGameCover src={game.image} alt={game.title} aspectRatio="square" className="w-20 h-20 shrink-0" />
                <div>
                  <Link to={`/games/${game.id}`} className="font-bold text-lg text-white font-['Outfit'] hover:text-violet-300">
                    {game.title}
                  </Link>
                  <p className="text-xs text-slate-400">{game.publisher} • {game.developer}</p>
                  <div className="mt-2">
                    <GlassPriceTag
                      pricePaise={game.pricePaise}
                      originalPricePaise={game.originalPricePaise}
                      discountPercent={game.discountPercent}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleMoveToCart(game)}
                  icon={<ShoppingBag className="w-4 h-4" />}
                >
                  Move to Cart
                </GlassButton>

                <button
                  onClick={() => handleRemove(game.id, game.title)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
