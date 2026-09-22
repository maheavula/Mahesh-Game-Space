import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Library, Gamepad2, Play, Check, ShieldCheck, Info } from 'lucide-react';
import { GameLibraryItem } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassGameCover } from '../components/glass/GlassGameCover.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { GlassModal } from '../components/glass/GlassModal.js';
import { EmptyState } from '../components/glass/EmptyState.js';
import { formatDate } from '../utils/formatters.js';

export const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [library, setLibrary] = useState<GameLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameLibraryItem | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await apiClient.get<{ library: GameLibraryItem[] }>('/api/catalog/library');
        setLibrary(res.library || []);
      } catch (err) {
        console.error('Failed to fetch library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Library className="w-8 h-8" />}
          title="Sign in to Access Your Game Library"
          description="Log in to view your owned digital games collection."
          actionText="Sign In"
          actionLink="/login"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <Library className="w-8 h-8 text-cyan-400" />
          <span>Personal Game Library</span>
        </h1>
        <p className="text-sm text-slate-400">Your digital collection, all recorded in one place</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading your collection...</div>
      ) : library.length === 0 ? (
        <EmptyState
          icon={<Library className="w-8 h-8" />}
          title="Your Library is Empty"
          description="You haven't acquired any games yet. Explore our storefront and checkout to build your personal library!"
          actionText="Discover Games"
          actionLink="/games"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {library.map((item) => (
            <GlassCard key={item.id} variant="interactive" className="p-3.5 flex flex-col justify-between h-full group">
              <div className="relative mb-3">
                <GlassGameCover src={item.game.image} alt={item.game.title} aspectRatio="landscape" />
                <div className="absolute top-2 right-2 bg-emerald-500/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg backdrop-blur-sm">
                  <Check className="w-3 h-3" />
                  <span>Owned</span>
                </div>
              </div>

              <div className="space-y-2 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">{item.game.publisher}</span>
                  <h3 className="text-base font-bold text-white font-['Outfit'] line-clamp-1 group-hover:text-cyan-300 transition-colors">
                    {item.game.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Acquired: {formatDate(item.acquiredAt)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <GlassButton
                    variant="cyan"
                    size="sm"
                    fullWidth
                    onClick={() => setSelectedGame(item)}
                    icon={<Play className="w-3.5 h-3.5 fill-slate-950" />}
                  >
                    Simulate Launch
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Simulated Launch Modal (Strict Section 46 & 131 Rule) */}
      <GlassModal
        isOpen={Boolean(selectedGame)}
        onClose={() => setSelectedGame(null)}
        title={selectedGame?.game.title || 'Simulated Game Launch'}
      >
        {selectedGame && (
          <div className="space-y-6 text-center py-2">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mx-auto">
              <Gamepad2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white font-['Outfit']">
                Game Ownership Confirmed
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Game ownership recorded in AMR Game Space simulator.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-xs space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>License Status:</span>
                <span className="font-bold text-emerald-400 uppercase">Active / Owned</span>
              </div>
              <div className="flex justify-between">
                <span>Order Reference:</span>
                <span className="font-mono text-slate-300">{selectedGame.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>Acquired On:</span>
                <span className="text-slate-300">{formatDate(selectedGame.acquiredAt)}</span>
              </div>
            </div>

            <GlassButton variant="primary" fullWidth onClick={() => setSelectedGame(null)}>
              Close Simulator Modal
            </GlassButton>
          </div>
        )}
      </GlassModal>
    </div>
  );
};
