import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Tag, ShieldCheck, Zap, LogIn } from 'lucide-react';
import { GlassButton } from './GlassButton.js';
import { GlassCard } from './GlassCard.js';
import { useAuth } from '../../context/AuthContext.js';

export const GlassHero: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background Glowing Portals */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-600/30 via-cyan-500/20 to-magenta-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-violet-500/40 text-violet-300 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span>Next-Gen Digital Gaming Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight font-['Outfit'] leading-[1.1]">
              AMR Game Space <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-magenta-400 bg-clip-text text-transparent glow-text-violet">
                Discover your next game.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Explore curated popular commercial games, instant wishlist tracking, seamless checkout simulation, and your personal digital game library.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/games">
                <GlassButton variant="primary" size="lg" icon={<Compass className="w-5 h-5" />}>
                  Explore Games
                </GlassButton>
              </Link>

              <Link to="/deals">
                <GlassButton variant="cyan" size="lg" icon={<Tag className="w-5 h-5" />}>
                  Browse Deals
                </GlassButton>
              </Link>

              {!user && (
                <Link to="/login">
                  <GlassButton variant="glass" size="lg" icon={<LogIn className="w-5 h-5" />}>
                    Sign In
                  </GlassButton>
                </Link>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-white font-['Outfit']">18+</span>
                <span className="text-xs text-slate-400">Popular Games</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-cyan-400 font-['Outfit']">100%</span>
                <span className="text-xs text-slate-400">Simulated Store</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <span className="text-2xl font-bold text-violet-400 font-['Outfit']">INR ₹</span>
                <span className="text-xs text-slate-400">Paise Accuracy</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Floating Glass Showcase */}
          <div className="lg:col-span-5 relative">
            <GlassCard variant="strong" glow="violet" className="p-6 relative overflow-hidden group">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 mb-4 border border-slate-700/60">
                <img
                  src="https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg"
                  alt="Cyberpunk 2077 Featured"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-black text-xs px-3 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                  Featured Spotlight
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white font-['Outfit']">Cyberpunk 2077</h3>
                  <p className="text-xs text-slate-400">CD PROJEKT RED — Action RPG</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 line-through">₹2,999</div>
                  <div className="text-xl font-bold text-emerald-400">₹1,499</div>
                </div>
              </div>
            </GlassCard>

            {/* Sub Floating Card */}
            <GlassCard
              variant="interactive"
              glow="cyan"
              className="absolute -bottom-8 -left-8 hidden sm:flex items-center gap-3 p-4 max-w-xs z-20 border-cyan-500/40"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Encrypted Transactions</h4>
                <p className="text-[11px] text-slate-400">Instant digital game license delivery</p>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};
