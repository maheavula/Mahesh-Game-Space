import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Check } from 'lucide-react';
import { Game } from '../../types/index.js';
import { GlassCard } from './GlassCard.js';
import { GlassPriceTag } from './GlassPriceTag.js';
import { GlassGameCover } from './GlassGameCover.js';
import { GlassButton } from './GlassButton.js';
import { useCart } from '../../context/CartContext.js';
import { apiClient } from '../../services/apiClient.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

interface GlassGameCardProps {
  game: Game;
  isWishlistedInitial?: boolean;
  isOwnedInitial?: boolean;
}

export const GlassGameCard: React.FC<GlassGameCardProps> = ({
  game,
  isWishlistedInitial = false,
  isOwnedInitial = false,
}) => {
  const { user } = useAuth();
  const { addToCart, items: cartItems } = useCart();
  const { showToast } = useToast();

  const [wishlisted, setWishlisted] = useState(isWishlistedInitial);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isInCart = cartItems.some((i) => i.game.id === game.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please log in to add games to your wishlist.', 'warning');
      return;
    }

    try {
      setWishlistLoading(true);
      if (wishlisted) {
        await apiClient.delete(`/api/catalog/wishlist/${game.id}`);
        setWishlisted(false);
        showToast(`Removed '${game.title}' from wishlist.`, 'info');
      } else {
        await apiClient.post(`/api/catalog/wishlist/${game.id}`);
        setWishlisted(true);
        showToast(`Added '${game.title}' to wishlist.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update wishlist.', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(game.id);
  };

  return (
    <Link to={`/games/${game.id}`} className="group block">
      <GlassCard variant="interactive" className="p-3.5 h-full flex flex-col justify-between">
        <div className="relative mb-3">
          <GlassGameCover src={game.image} alt={game.title} aspectRatio="portrait" />

          {/* Discount Badge top left */}
          {game.discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-lg">
              -{game.discountPercent}%
            </div>
          )}

          {/* Wishlist Button top right */}
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md border transition-all ${
              wishlisted
                ? 'bg-rose-500/80 border-rose-400 text-white'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center justify-between gap-1 text-xs text-slate-400 mb-1">
            <span className="truncate">{game.publisher}</span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{game.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-white font-['Outfit'] line-clamp-1 group-hover:text-violet-300 transition-colors mb-2">
            {game.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {game.description}
          </p>

          <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <GlassPriceTag
              pricePaise={game.pricePaise}
              originalPricePaise={game.originalPricePaise}
              discountPercent={game.discountPercent}
              size="md"
            />

            {isOwnedInitial ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                Owned
              </span>
            ) : isInCart ? (
              <GlassButton variant="cyan" size="sm" onClick={handleAddToCart} icon={<Check className="w-3.5 h-3.5" />}>
                In Cart
              </GlassButton>
            ) : (
              <GlassButton variant="primary" size="sm" onClick={handleAddToCart} icon={<ShoppingBag className="w-3.5 h-3.5" />}>
                Add
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};
