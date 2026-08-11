import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Tags,
  ShoppingBag,
  CreditCard,
  Percent,
  ShieldAlert,
  Server,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { GlassCard } from '../../components/glass/GlassCard.js';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="text-center py-16 text-slate-400">Loading admin privileges...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-violet-400" />, end: true },
    { to: '/admin/customers', label: 'Customers', icon: <Users className="w-4 h-4 text-cyan-400" /> },
    { to: '/admin/games', label: 'Games Catalog', icon: <Gamepad2 className="w-4 h-4 text-emerald-400" /> },
    { to: '/admin/categories', label: 'Categories', icon: <Tags className="w-4 h-4 text-amber-400" /> },
    { to: '/admin/orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4 text-rose-400" /> },
    { to: '/admin/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4 text-cyan-400" /> },
    { to: '/admin/promotions', label: 'Promotions', icon: <Percent className="w-4 h-4 text-violet-400" /> },
    { to: '/admin/audit', label: 'Audit Logs', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
    { to: '/admin/system', label: 'System Metadata', icon: <Server className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-600/20 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-violet-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Marketplace Overview</h1>
          <p className="text-sm text-slate-400">Monitor and manage your simulated gaming marketplace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <GlassCard variant="strong" className="p-3 space-y-1 sticky top-28">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-lg'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </GlassCard>
        </aside>

        {/* Content Outlet */}
        <main className="lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
