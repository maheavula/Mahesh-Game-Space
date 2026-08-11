import React, { useEffect, useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import { Order } from '../../types/index.js';
import { apiClient } from '../../services/apiClient.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { GlassBadge } from '../../components/glass/GlassBadge.js';
import { GlassButton } from '../../components/glass/GlassButton.js';
import { GlassModal } from '../../components/glass/GlassModal.js';
import { formatINR, formatDateTime } from '../../utils/formatters.js';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<{ orders: Order[] }>('/api/admin/orders');
        setOrders(res.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const inspectOrder = async (orderId: string) => {
    try {
      const res = await apiClient.get<any>(`/api/admin/orders/${orderId}`);
      setSelectedOrderDetails(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-rose-400" />
          <span>Orders Management</span>
        </h2>
        <p className="text-xs text-slate-400">Inspect system orders and order item snapshots</p>
      </div>

      <GlassCard variant="normal" className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">Customer User ID</th>
              <th className="p-3.5 text-right">Total (₹)</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">Loading orders...</td>
              </tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-mono font-bold text-white">{o.id}</td>
                <td className="p-3.5 font-mono text-slate-300">{o.userId}</td>
                <td className="p-3.5 text-right font-bold text-cyan-400">{formatINR(o.totalPaise, false)}</td>
                <td className="p-3.5">
                  <GlassBadge variant={o.status === 'completed' ? 'emerald' : 'rose'} size="sm">
                    {o.status}
                  </GlassBadge>
                </td>
                <td className="p-3.5 text-slate-400">{formatDateTime(o.createdAt)}</td>
                <td className="p-3.5 text-right">
                  <GlassButton variant="glass" size="sm" onClick={() => inspectOrder(o.id)} icon={<Eye className="w-3.5 h-3.5" />}>
                    Inspect
                  </GlassButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Inspect Order Drawer Modal */}
      <GlassModal
        isOpen={Boolean(selectedOrderDetails)}
        onClose={() => setSelectedOrderDetails(null)}
        title={`Order Inspection: ${selectedOrderDetails?.order?.id}`}
      >
        {selectedOrderDetails && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Customer:</span>
                <span className="font-bold text-white">{selectedOrderDetails.customer?.name} ({selectedOrderDetails.customer?.email})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Payment Reference:</span>
                <span className="font-mono text-cyan-400">{selectedOrderDetails.payment?.id} ({selectedOrderDetails.payment?.method})</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider block">Order Item Snapshots</span>
              {selectedOrderDetails.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700">
                  <span className="font-bold text-white">{item.titleSnapshot}</span>
                  <span className="font-semibold text-emerald-400">{formatINR(item.pricePaise, false)}</span>
                </div>
              ))}
            </div>

            <GlassButton variant="primary" fullWidth onClick={() => setSelectedOrderDetails(null)}>
              Close Inspection
            </GlassButton>
          </div>
        )}
      </GlassModal>
    </div>
  );
};
