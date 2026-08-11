import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, Save, Gamepad2, Library, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassInput } from '../components/glass/GlassInput.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { GlassBadge } from '../components/glass/GlassBadge.js';
import { GlassGameCover } from '../components/glass/GlassGameCover.js';
import { formatDate } from '../utils/formatters.js';
import { apiClient } from '../services/apiClient.js';
import { GameLibraryItem } from '../types/index.js';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [ownedGames, setOwnedGames] = useState<GameLibraryItem[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setPhone(user.phone || '');

    const fetchOwnedGames = async () => {
      try {
        setGamesLoading(true);
        const res = await apiClient.get<{ library: GameLibraryItem[] }>('/api/catalog/library');
        setOwnedGames(res.library || []);
      } catch (err) {
        console.error('Failed to fetch library for profile:', err);
      } finally {
        setGamesLoading(false);
      }
    };
    fetchOwnedGames();
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({ name, phone });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-violet-400" />
          <span>Customer Profile</span>
        </h1>
        <p className="text-sm text-slate-400">Manage your personal account details and view your owned game collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Account Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard variant="strong" glow="violet" className="p-6 text-center space-y-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-extrabold text-white text-3xl mx-auto shadow-2xl">
              {user.name.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>

            <div className="pt-1 flex justify-center">
              <GlassBadge variant={user.role === 'admin' ? 'violet' : 'cyan'}>
                {user.role} Account
              </GlassBadge>
            </div>

            <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-2 text-left">
              <div className="flex justify-between">
                <span>Account ID:</span>
                <span className="font-mono text-slate-200 font-bold">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span className="text-slate-200">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Games Owned:</span>
                <span className="text-cyan-400 font-bold">{ownedGames.length} Games</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-8">
          <GlassCard variant="normal" className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-slate-800 pb-3">
                Edit Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassInput
                  label="Full Name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  icon={<UserIcon className="w-4 h-4 text-slate-400" />}
                  required
                />

                <GlassInput
                  label="Phone Number"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  icon={<Phone className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="space-y-1">
                <GlassInput
                  label="Email Address (Verified)"
                  value={user.email}
                  disabled
                  icon={<Mail className="w-4 h-4 text-slate-500" />}
                />
                <span className="text-[11px] text-slate-500">Email address is verified and locked for your account security.</span>
              </div>

              <GlassButton variant="primary" loading={loading} type="submit" icon={<Save className="w-4 h-4" />}>
                Save Profile Changes
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      </div>

      {/* Requirement 1: Purchased Games Collection with Images in Profile */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">Your Games Collection</h2>
              <p className="text-xs text-slate-400">Games registered to your Mahesh Game Space profile</p>
            </div>
          </div>

          <Link to="/library" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            <span>View Full Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {gamesLoading ? (
          <div className="text-slate-400 text-xs py-6 text-center">Loading game covers...</div>
        ) : ownedGames.length === 0 ? (
          <GlassCard variant="normal" className="p-8 text-center space-y-3">
            <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No games in your profile yet</p>
            <p className="text-xs text-slate-400">Explore the catalog and complete a purchase to see game artwork here!</p>
            <Link to="/games" className="inline-block pt-2">
              <GlassButton variant="cyan" size="sm">Explore Games</GlassButton>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ownedGames.map(({ game, acquiredAt, id: libId }) => (
              <Link key={libId} to={`/games/${game.id}`} className="group block">
                <GlassCard variant="interactive" className="p-2.5 space-y-2 text-center h-full flex flex-col justify-between">
                  <div className="relative">
                    <GlassGameCover src={game.image} alt={game.title} aspectRatio="portrait" />
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
                      Owned
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-['Outfit'] line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {game.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {formatDate(acquiredAt)}
                    </span>
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
