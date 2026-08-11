import React, { useEffect, useState } from 'react';
import { Tags, Plus } from 'lucide-react';
import { Category } from '../../types/index.js';
import { apiClient } from '../../services/apiClient.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { GlassBadge } from '../../components/glass/GlassBadge.js';
import { GlassButton } from '../../components/glass/GlassButton.js';
import { GlassInput } from '../../components/glass/GlassInput.js';
import { GlassModal } from '../../components/glass/GlassModal.js';
import { useToast } from '../../context/ToastContext.js';

export const AdminCategoriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ categories: Category[] }>('/api/admin/categories');
      setCategories(res.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await apiClient.post('/api/admin/categories', { name: categoryName });
      showToast(`Category '${categoryName}' created.`, 'success');
      setCategoryName('');
      setModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Tags className="w-5 h-5 text-amber-400" />
            <span>Category Management</span>
          </h2>
          <p className="text-xs text-slate-400">Manage game genre categories</p>
        </div>

        <GlassButton variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          New Category
        </GlassButton>
      </div>

      <GlassCard variant="normal" className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="p-3.5">Category ID</th>
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Slug</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">Loading categories...</td>
              </tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-mono text-slate-400">{c.id}</td>
                <td className="p-3.5 font-bold text-white font-['Outfit']">{c.name}</td>
                <td className="p-3.5 font-mono text-slate-300">{c.slug}</td>
                <td className="p-3.5">
                  <GlassBadge variant={c.status === 'active' ? 'emerald' : 'slate'} size="sm">
                    {c.status}
                  </GlassBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <GlassModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Category">
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <GlassInput
            label="Category Name"
            placeholder="e.g. Tactical Shooter"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="ghost" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </GlassButton>
            <GlassButton variant="primary" loading={formLoading} type="submit">
              Create Category
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
