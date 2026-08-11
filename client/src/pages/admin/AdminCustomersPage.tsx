import React, { useEffect, useState } from 'react';
import { Users, UserX, UserCheck, Search, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../services/apiClient.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { GlassBadge } from '../../components/glass/GlassBadge.js';
import { GlassButton } from '../../components/glass/GlassButton.js';
import { GlassInput } from '../../components/glass/GlassInput.js';
import { useToast } from '../../context/ToastContext.js';
import { formatINR, formatDate } from '../../utils/formatters.js';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended';
  ordersCount: number;
  gamesOwnedCount: number;
  totalSpentPaise: number;
  createdAt: string;
}

export const AdminCustomersPage: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ customers: CustomerItem[] }>('/api/admin/customers');
      setCustomers(res.customers || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customer: CustomerItem) => {
    const nextStatus = customer.status === 'active' ? 'suspended' : 'active';
    const confirmMsg = customer.status === 'active'
      ? `Are you sure you want to suspend customer '${customer.name}'? This will invalidate their active session and block checkout.`
      : `Re-activate customer '${customer.name}'?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await apiClient.patch(`/api/admin/customers/${customer.id}/status`, { status: nextStatus });
      showToast(`Customer '${customer.name}' status updated to ${nextStatus}.`, 'success');
      await fetchCustomers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update customer status.', 'error');
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Customer Accounts Management</span>
          </h2>
          <p className="text-xs text-slate-400">View customer activity and manage account status</p>
        </div>

        <div className="w-full sm:w-64">
          <GlassInput
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      <GlassCard variant="normal" className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Orders</th>
              <th className="p-3.5 text-center">Library</th>
              <th className="p-3.5 text-right">Total Spent</th>
              <th className="p-3.5">Joined</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">Loading customer data...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">No customers found matching search.</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white font-['Outfit']">{c.name}</div>
                    <div className="text-slate-400 text-[11px]">{c.email}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.id}</div>
                  </td>

                  <td className="p-3.5">
                    <GlassBadge variant={c.status === 'active' ? 'emerald' : 'rose'} size="sm">
                      {c.status}
                    </GlassBadge>
                  </td>

                  <td className="p-3.5 text-center font-bold text-slate-200">{c.ordersCount}</td>
                  <td className="p-3.5 text-center font-bold text-cyan-400">{c.gamesOwnedCount}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-400">{formatINR(c.totalSpentPaise, false)}</td>
                  <td className="p-3.5 text-slate-400">{formatDate(c.createdAt)}</td>

                  <td className="p-3.5 text-right">
                    {c.status === 'active' ? (
                      <GlassButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleToggleStatus(c)}
                        icon={<UserX className="w-3.5 h-3.5" />}
                      >
                        Suspend
                      </GlassButton>
                    ) : (
                      <GlassButton
                        variant="cyan"
                        size="sm"
                        onClick={() => handleToggleStatus(c)}
                        icon={<UserCheck className="w-3.5 h-3.5" />}
                      >
                        Activate
                      </GlassButton>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
