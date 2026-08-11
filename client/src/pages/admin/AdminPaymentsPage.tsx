import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Payment } from '../../types/index.js';
import { apiClient } from '../../services/apiClient.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { GlassBadge } from '../../components/glass/GlassBadge.js';
import { formatINR, formatDateTime } from '../../utils/formatters.js';

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<{ payments: Payment[] }>('/api/admin/payments');
        setPayments(res.payments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          <span>Simulated Payments Log</span>
        </h2>
        <p className="text-xs text-slate-400">All payment transactions are simulated for demo purposes</p>
      </div>

      <GlassCard variant="normal" className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="p-3.5">Payment ID</th>
              <th className="p-3.5">Order ID</th>
              <th className="p-3.5">User ID</th>
              <th className="p-3.5 text-right">Amount (₹)</th>
              <th className="p-3.5">Method</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">Loading payments...</td>
              </tr>
            ) : payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-mono font-bold text-white">{p.id}</td>
                <td className="p-3.5 font-mono text-slate-300">{p.orderId}</td>
                <td className="p-3.5 font-mono text-slate-400">{p.userId}</td>
                <td className="p-3.5 text-right font-bold text-emerald-400">{formatINR(p.amountPaise, false)}</td>
                <td className="p-3.5 uppercase font-semibold text-cyan-300">{p.method.replace('_', ' ')}</td>
                <td className="p-3.5">
                  <GlassBadge variant={p.status === 'completed' ? 'emerald' : 'rose'} size="sm">
                    {p.status}
                  </GlassBadge>
                </td>
                <td className="p-3.5 text-slate-400">{formatDateTime(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
