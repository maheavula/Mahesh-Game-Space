import React, { useEffect, useState } from 'react';
import { Percent, Plus } from 'lucide-react';
import { Promotion } from '../../types/index.js';
import { apiClient } from '../../services/apiClient.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { GlassBadge } from '../../components/glass/GlassBadge.js';
import { GlassButton } from '../../components/glass/GlassButton.js';
import { GlassInput } from '../../components/glass/GlassInput.js';
import { GlassSelect } from '../../components/glass/GlassSelect.js';
import { GlassModal } from '../../components/glass/GlassModal.js';
import { useToast } from '../../context/ToastContext.js';
import { formatINR } from '../../utils/formatters.js';

export const AdminPromotionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minOrderRupees, setMinOrderRupees] = useState(1000);
  const [maxDiscountRupees, setMaxDiscountRupees] = useState(1000);
  const [usageLimit, setUsageLimit] = useState(100);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ promotions: Promotion[] }>('/api/admin/promotions');
      setPromotions(res.promotions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleToggleActive = async (promo: Promotion) => {
    try {
      await apiClient.patch(`/api/admin/promotions/${promo.id}/status`, { active: !promo.active });
      showToast(`Promotion '${promo.code}' updated.`, 'success');
      await fetchPromotions();
    } catch (err: any) {
      showToast(err.message || 'Failed to update promotion.', 'error');
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const startsAt = new Date().toISOString();
    const endsAt = new Date(Date.now() + 180 * 86400000).toISOString();

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: type === 'fixed' ? Math.round(value * 100) : value,
      minimumOrderPaise: Math.round(minOrderRupees * 100),
      maxDiscountPaise: Math.round(maxDiscountRupees * 100),
      usageLimit,
      active: true,
      startsAt,
      endsAt,
    };

    try {
      setFormLoading(true);
      await apiClient.post('/api/admin/promotions', payload);
      showToast(`Promotion code '${payload.code}' created.`, 'success');
      setModalOpen(false);
      setCode('');
      await fetchPromotions();
    } catch (err: any) {
      showToast(err.message || 'Failed to create promotion.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Percent className="w-5 h-5 text-violet-400" />
            <span>Promotions & Coupon Management</span>
          </h2>
          <p className="text-xs text-slate-400">Create promotional discount codes and enforce usage rules</p>
        </div>

        <GlassButton variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          New Promotion Code
        </GlassButton>
      </div>

      <GlassCard variant="normal" className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="p-3.5">Code</th>
              <th className="p-3.5">Type & Value</th>
              <th className="p-3.5 text-right">Min Order</th>
              <th className="p-3.5 text-right">Max Discount</th>
              <th className="p-3.5 text-center">Usage</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">Loading promotions...</td>
              </tr>
            ) : promotions.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-mono font-extrabold text-cyan-300">{p.code}</td>
                <td className="p-3.5 font-bold text-white">
                  {p.type === 'percentage' ? `${p.value}% OFF` : `${formatINR(p.value, false)} OFF`}
                </td>
                <td className="p-3.5 text-right text-slate-300">{formatINR(p.minimumOrderPaise, false)}</td>
                <td className="p-3.5 text-right text-emerald-400">{formatINR(p.maxDiscountPaise, false)}</td>
                <td className="p-3.5 text-center font-bold text-slate-300">
                  {p.usedCount} / {p.usageLimit}
                </td>
                <td className="p-3.5">
                  <GlassBadge variant={p.active ? 'emerald' : 'rose'} size="sm">
                    {p.active ? 'Active' : 'Inactive'}
                  </GlassBadge>
                </td>
                <td className="p-3.5 text-right">
                  <GlassButton variant="glass" size="sm" onClick={() => handleToggleActive(p)}>
                    {p.active ? 'Deactivate' : 'Activate'}
                  </GlassButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <GlassModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Promotion Code">
        <form onSubmit={handleCreatePromotion} className="space-y-4 text-xs">
          <GlassInput
            label="Promotion Code (e.g. GAMER20)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <GlassSelect
            label="Discount Type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            options={[
              { value: 'percentage', label: 'Percentage (%) Discount' },
              { value: 'fixed', label: 'Flat Fixed Amount (₹) Discount' },
            ]}
          />

          <GlassInput
            label={type === 'percentage' ? 'Percentage Value (%)' : 'Fixed Amount (₹)'}
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <GlassInput
              label="Minimum Order (₹)"
              type="number"
              value={minOrderRupees}
              onChange={(e) => setMinOrderRupees(Number(e.target.value))}
              required
            />
            <GlassInput
              label="Max Discount Cap (₹)"
              type="number"
              value={maxDiscountRupees}
              onChange={(e) => setMaxDiscountRupees(Number(e.target.value))}
              required
            />
          </div>

          <GlassInput
            label="Usage Limit (Total Redemptions)"
            type="number"
            value={usageLimit}
            onChange={(e) => setUsageLimit(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="ghost" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </GlassButton>
            <GlassButton variant="primary" loading={formLoading} type="submit">
              Create Code
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
