import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { GlassGameCover } from '../components/glass/GlassGameCover.js';
import { GlassPriceTag } from '../components/glass/GlassPriceTag.js';
import { EmptyState } from '../components/glass/EmptyState.js';
import { formatINR } from '../utils/formatters.js';

export const CartPage: React.FC = () => {
  const { user } = useAuth();
  const { items, subtotalPaise, itemCount, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Sign in to View Your Cart"
          description="Log in to your AMR Game Space account to manage items in your shopping cart."
          actionText="Sign In"
          actionLink="/login"
        />
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your Cart is Empty"
          description="Looks like you haven't added any digital games to your cart yet."
          actionText="Explore Storefront"
          actionLink="/games"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-cyan-400" />
            <span>Shopping Cart ({itemCount})</span>
          </h1>
          <p className="text-sm text-slate-400">Review your selected digital game licenses</p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ game, quantity, subtotalPaise: itemSubtotal }) => (
            <GlassCard key={game.id} variant="normal" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <GlassGameCover src={game.image} alt={game.title} aspectRatio="landscape" className="w-28 h-16 shrink-0" />
                <div>
                  <Link to={`/games/${game.id}`} className="font-bold text-base text-white font-['Outfit'] hover:text-violet-300">
                    {game.title}
                  </Link>
                  <p className="text-xs text-slate-400">{game.publisher} • Digital Edition</p>
                  <div className="mt-1">
                    <GlassPriceTag
                      pricePaise={game.pricePaise}
                      originalPricePaise={game.originalPricePaise}
                      discountPercent={game.discountPercent}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Subtotal</span>
                  <span className="text-base font-bold text-white font-['Outfit']">
                    {formatINR(itemSubtotal, false)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(game.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <GlassCard variant="strong" glow="violet" className="p-6 space-y-6 sticky top-28">
            <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-slate-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-semibold">{formatINR(subtotalPaise, false)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Tax</span>
                <span className="font-semibold text-emerald-400">Included</span>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-extrabold text-white">
                <span>Estimated Total</span>
                <span className="text-cyan-400 text-xl">{formatINR(subtotalPaise, false)}</span>
              </div>
            </div>

            <GlassButton
              variant="cyan"
              size="lg"
              fullWidth
              onClick={() => navigate('/checkout')}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Proceed to Checkout
            </GlassButton>

            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              <span>Simulated Payment — No real money charged</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
