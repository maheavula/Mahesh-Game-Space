import React, { useEffect, useState } from 'react';
import { Gamepad2, Plus, Edit, Trash2, Search, Check, AlertCircle } from 'lucide-react';
import { Game, Category } from '../../types/index.js';
import { apiClient } from '../../services/apiClient.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { GlassBadge } from '../../components/glass/GlassBadge.js';
import { GlassButton } from '../../components/glass/GlassButton.js';
import { GlassInput } from '../../components/glass/GlassInput.js';
import { GlassSelect } from '../../components/glass/GlassSelect.js';
import { GlassModal } from '../../components/glass/GlassModal.js';
import { useToast } from '../../context/ToastContext.js';
import { formatINR } from '../../utils/formatters.js';

export const AdminGamesPage: React.FC = () => {
  const { showToast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [developer, setDeveloper] = useState('');
  const [description, setDescription] = useState('');
  const [priceRupees, setPriceRupees] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'available' | 'unavailable' | 'delisted'>('available');
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [image, setImage] = useState('/assets/games/default.svg');
  const [formLoading, setFormLoading] = useState(false);

  const fetchGamesAndCategories = async () => {
    try {
      setLoading(true);
      const [gamesRes, catRes] = await Promise.all([
        apiClient.get<{ games: Game[] }>('/api/admin/games'),
        apiClient.get<{ categories: Category[] }>('/api/admin/categories'),
      ]);
      setGames(gamesRes.games || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamesAndCategories();
  }, []);

  const openAddModal = () => {
    setEditingGame(null);
    setTitle('');
    setPublisher('Valve');
    setDeveloper('Valve');
    setDescription('High intensity gaming experience.');
    setPriceRupees(1499);
    setDiscountPercent(0);
    setSelectedCategories(categories.slice(0, 1).map((c) => c.id));
    setAvailability('available');
    setFeatured(false);
    setPopular(false);
    setImage('/assets/games/default.svg');
    setModalOpen(true);
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setTitle(game.title);
    setPublisher(game.publisher);
    setDeveloper(game.developer);
    setDescription(game.description);
    setPriceRupees(game.pricePaise / 100);
    setDiscountPercent(game.discountPercent);
    setSelectedCategories(game.categoryIds);
    setAvailability(game.availability);
    setFeatured(game.featured);
    setPopular(game.popular);
    setImage(game.image);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (priceRupees < 0) {
      showToast('Price cannot be negative.', 'error');
      return;
    }
    if (discountPercent < 0 || discountPercent > 100) {
      showToast('Discount must be between 0% and 100%.', 'error');
      return;
    }
    if (selectedCategories.length === 0) {
      showToast('Select at least one category.', 'error');
      return;
    }

    const pricePaise = Math.round(priceRupees * 100);
    const originalPricePaise = discountPercent > 0
      ? Math.round(pricePaise / (1 - discountPercent / 100))
      : pricePaise;

    const payload = {
      title,
      publisher,
      developer,
      description,
      categoryIds: selectedCategories,
      platforms: ['PC'],
      pricePaise,
      originalPricePaise,
      discountPercent,
      releaseDate: editingGame ? editingGame.releaseDate : new Date().toISOString().split('T')[0],
      featured,
      popular,
      availability,
      image,
    };

    try {
      setFormLoading(true);
      if (editingGame) {
        await apiClient.put(`/api/admin/games/${editingGame.id}`, payload);
        showToast(`Game '${title}' updated successfully.`, 'success');
      } else {
        await apiClient.post('/api/admin/games', payload);
        showToast(`New game '${title}' created successfully.`, 'success');
      }
      setModalOpen(false);
      await fetchGamesAndCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to save game.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.publisher.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <span>Games Catalog Management</span>
          </h2>
          <p className="text-xs text-slate-400">Add, edit, or change pricing for catalog games</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-48">
            <GlassInput
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <GlassButton variant="primary" size="sm" onClick={openAddModal} icon={<Plus className="w-4 h-4" />}>
            Add Game
          </GlassButton>
        </div>
      </div>

      <GlassCard variant="normal" className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="p-3.5">Title</th>
              <th className="p-3.5">Publisher</th>
              <th className="p-3.5 text-right">Price (₹)</th>
              <th className="p-3.5 text-center">Discount</th>
              <th className="p-3.5">Availability</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Loading catalog games...</td>
              </tr>
            ) : filteredGames.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">No games found.</td>
              </tr>
            ) : (
              filteredGames.map((game) => (
                <tr key={game.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white font-['Outfit']">{game.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{game.id}</div>
                  </td>

                  <td className="p-3.5 text-slate-300">{game.publisher}</td>

                  <td className="p-3.5 text-right font-bold text-slate-200">
                    {formatINR(game.pricePaise, false)}
                  </td>

                  <td className="p-3.5 text-center font-bold">
                    {game.discountPercent > 0 ? (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        -{game.discountPercent}%
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <GlassBadge variant={game.availability === 'available' ? 'emerald' : 'rose'} size="sm">
                      {game.availability}
                    </GlassBadge>
                  </td>

                  <td className="p-3.5 text-right">
                    <GlassButton variant="glass" size="sm" onClick={() => openEditModal(game)} icon={<Edit className="w-3.5 h-3.5" />}>
                      Edit / Price
                    </GlassButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>

      {/* Add / Edit Game Modal */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGame ? `Edit ${editingGame.title}` : 'Add New Game to Catalog'}
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <GlassInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <GlassInput label="Publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} required />
            <GlassInput label="Developer" value={developer} onChange={(e) => setDeveloper(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-xs text-slate-100 h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <GlassInput
              label="Price in Rupees (₹)"
              type="number"
              value={priceRupees}
              onChange={(e) => setPriceRupees(Number(e.target.value))}
              required
            />
            <GlassInput
              label="Discount Percentage (%)"
              type="number"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              required
            />
          </div>

          <GlassSelect
            label="Availability Status"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as any)}
            options={[
              { value: 'available', label: 'Available for Purchase' },
              { value: 'unavailable', label: 'Unavailable (Hidden from Purchase)' },
              { value: 'delisted', label: 'Delisted' },
            ]}
          />

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
              <span className="text-slate-300">Mark Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} className="rounded" />
              <span className="text-slate-300">Mark Popular</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <GlassButton variant="ghost" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </GlassButton>
            <GlassButton variant="primary" loading={formLoading} type="submit">
              {editingGame ? 'Save Changes' : 'Create Game'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
