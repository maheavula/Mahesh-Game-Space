import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Calendar, CreditCard } from 'lucide-react';
import { Order, OrderItem, Payment } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassBadge } from '../components/glass/GlassBadge.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { EmptyState } from '../components/glass/EmptyState.js';
import { formatINR, formatDateTime } from '../utils/formatters.js';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Array<{ order: Order; items: OrderItem[]; payment: Payment }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await apiClient.get<{ orders: Array<{ order: Order; items: OrderItem[]; payment: Payment }> }>('/api/orders');
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Sign in to View Order History"
          description="Log in to view past order receipts and payment details."
          actionText="Sign In"
          actionLink="/login"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-emerald-400" />
          <span>Purchase History</span>
        </h1>
        <p className="text-sm text-slate-400">View and inspect your historical simulated orders and payments</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading order history...</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No Orders Found"
          description="You haven't purchased any games yet. Explore our storefront and complete your first checkout!"
          actionText="Discover Games"
          actionLink="/games"
        />
      ) : (
        <div className="space-y-4">
          {orders.map(({ order, items, payment }) => (
            <GlassCard key={order.id} variant="interactive" className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-white">{order.id}</span>
                  <GlassBadge variant={order.status === 'completed' ? 'emerald' : 'rose'}>
                    {order.status}
                  </GlassBadge>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(order.createdAt)}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-200">
                    {items.map((i) => i.titleSnapshot).join(', ')}
                  </div>
                  <div className="text-xs text-slate-400">
                    {items.length} {items.length === 1 ? 'game' : 'games'} • Method: <span className="uppercase">{payment?.method}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-lg font-bold text-cyan-400 font-['Outfit']">
                      {formatINR(order.totalPaise, false)}
                    </span>
                  </div>

                  <Link to={`/orders/${order.id}`}>
                    <GlassButton variant="glass" size="sm" icon={<Eye className="w-4 h-4" />}>
                      Receipt
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
