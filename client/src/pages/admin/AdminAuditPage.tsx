import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search } from 'lucide-react';
import { AuditLog } from '../../types/index.js';
import { apiClient } from '../../services/apiClient.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { GlassBadge } from '../../components/glass/GlassBadge.js';
import { GlassInput } from '../../components/glass/GlassInput.js';
import { formatDateTime } from '../../utils/formatters.js';

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<{ auditLogs: AuditLog[] }>('/api/admin/audit');
        setLogs(res.auditLogs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.userId && l.userId.toLowerCase().includes(search.toLowerCase())) ||
      JSON.stringify(l.metadata).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Security Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400">Append-oriented record of security & administrative events</p>
        </div>

        <div className="w-full sm:w-64">
          <GlassInput
            placeholder="Search audit action/user..."
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
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Actor User ID</th>
              <th className="p-3.5">Action Event</th>
              <th className="p-3.5">Event Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 font-sans">Loading audit events...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 font-sans">No audit events match search.</td>
              </tr>
            ) : (
              filtered.map((l) => {
                let badgeVariant: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' = 'cyan';
                if (l.action.includes('SUSPENDED') || l.action.includes('FAILURE')) badgeVariant = 'rose';
                if (l.action.includes('ORDER') || l.action.includes('PAYMENT')) badgeVariant = 'emerald';
                if (l.action.includes('LOGIN') || l.action.includes('SIGNUP')) badgeVariant = 'violet';

                return (
                  <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 text-slate-400 text-[11px] font-sans">{formatDateTime(l.timestamp)}</td>
                    <td className="p-3.5 text-slate-200 font-bold">{l.userId || 'SYSTEM / PUBLIC'}</td>
                    <td className="p-3.5">
                      <GlassBadge variant={badgeVariant} size="sm">
                        {l.action}
                      </GlassBadge>
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-400 max-w-xs truncate">
                      {JSON.stringify(l.metadata)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};
