import React, { useEffect, useState } from 'react';
import { Users, Gamepad2, ShoppingBag, IndianRupee, TrendingUp, Sparkles } from 'lucide-react';
import { AdminDashboardStats } from '../../types/index.js';
import { apiClient } from '../../services/apiClient.js';
import { GlassStatCard } from '../../components/glass/GlassStatCard.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { formatINR, formatDateTime } from '../../utils/formatters.js';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<AdminDashboardStats>('/api/admin/dashboard');
        setStats(res);
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading marketplace statistics...</div>;
  if (!stats) return <div className="text-center py-12 text-slate-400">Failed to load statistics.</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top 4 Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatCard
          title="Gross Simulated Revenue"
          value={formatINR(stats.simulatedRevenuePaise, false)}
          subtitle="Derived from runtime.json"
          icon={<IndianRupee className="w-6 h-6 text-emerald-400" />}
          glow="cyan"
        />

        <GlassStatCard
          title="Total Customers"
          value={stats.totalCustomers}
          subtitle={`${stats.activeCustomers} Active, ${stats.suspendedCustomers} Suspended`}
          icon={<Users className="w-6 h-6 text-violet-400" />}
          glow="violet"
        />

        <GlassStatCard
          title="Active Games Catalog"
          value={stats.totalGames}
          subtitle={`${stats.activeGames} Available for purchase`}
          icon={<Gamepad2 className="w-6 h-6 text-cyan-400" />}
        />

        <GlassStatCard
          title="Orders Today"
          value={stats.ordersToday}
          subtitle={`${stats.totalOrders} Lifetime Orders`}
          icon={<ShoppingBag className="w-6 h-6 text-rose-400" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Top Selling Games Table */}
        <div className="md:col-span-7">
          <GlassCard variant="normal" className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2 border-b border-slate-800 pb-3">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Top Selling Titles</span>
            </h3>

            {stats.topGames.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No sales recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.topGames.map((game, idx) => (
                  <div key={game.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-violet-600/30 font-bold text-violet-300 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white font-['Outfit']">{game.title}</span>
                    </div>

                    <div className="text-right space-x-3">
                      <span className="text-slate-400">{game.count} copies</span>
                      <span className="font-bold text-emerald-400">{formatINR(game.revenuePaise, false)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Recent Orders List */}
        <div className="md:col-span-5">
          <GlassCard variant="normal" className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>Recent Orders</span>
            </h3>

            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between font-mono font-bold text-slate-200">
                    <span>{order.id}</span>
                    <span className="text-cyan-400">{formatINR(order.totalPaise, false)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>User: {order.userId}</span>
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
