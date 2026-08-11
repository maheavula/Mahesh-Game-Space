import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Library, ShoppingBag, Calendar, ShieldCheck, ArrowRight, Gamepad2 } from 'lucide-react';
import { Order, OrderItem, Payment } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { formatINR, formatDateTime } from '../utils/formatters.js';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await apiClient.get<{ order: Order; items: OrderItem[]; payment: Payment }>(`/api/orders/${id}`);
        setOrder(res.order);
        setItems(res.items || []);
        setPayment(res.payment);
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Loading receipt details...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Order Receipt Not Found</h2>
        <Link to="/orders">
          <GlassButton variant="primary">View Order History</GlassButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <GlassCard variant="strong" glow="cyan" className="p-8 text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Purchase Complete!</h1>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          Thank you for your order. Your digital game licenses have been recorded in your personal library.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link to="/library">
            <GlassButton variant="primary" size="md" icon={<Library className="w-4 h-4" />}>
              View Your Library
            </GlassButton>
          </Link>
          <Link to="/games">
            <GlassButton variant="glass" size="md" icon={<Gamepad2 className="w-4 h-4" />}>
              Continue Shopping
            </GlassButton>
          </Link>
        </div>
      </GlassCard>

      {/* Order Details Receipt */}
      <GlassCard variant="normal" className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
          <div>
            <span className="text-xs text-slate-400 block">Order Reference</span>
            <span className="text-base font-extrabold text-white font-mono">{order.id}</span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Transaction Date</span>
            <span className="text-xs font-semibold text-slate-300">{formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Purchased Games List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchased Games</h4>
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="font-bold text-sm text-white font-['Outfit'] block">{item.titleSnapshot}</span>
                <span className="text-[11px] text-slate-400">Digital Game License</span>
              </div>
              <span className="font-bold text-sm text-slate-200">{formatINR(item.pricePaise, false)}</span>
            </div>
          ))}
        </div>

        {/* Financial Breakdown */}
        <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotalPaise, false)}</span>
          </div>
          {order.discountPaise > 0 && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Promotion Discount ({order.promoCode})</span>
              <span>-{formatINR(order.discountPaise, false)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
            <span>Total Paid</span>
            <span className="text-cyan-400 text-base">{formatINR(order.totalPaise, false)}</span>
          </div>
        </div>

        {/* Payment Metadata */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Payment ID</span>
            <span className="font-mono text-slate-200 font-bold">{payment?.id}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block">Method</span>
            <span className="font-bold text-cyan-400 uppercase">{payment?.method.replace('_', ' ')}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
