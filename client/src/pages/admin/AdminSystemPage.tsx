import React, { useEffect, useState } from 'react';
import { Server, CheckCircle2, Database, ShieldCheck, Layers } from 'lucide-react';
import { apiClient } from '../../services/apiClient.js';
import { GlassCard } from '../../components/glass/GlassCard.js';
import { GlassBadge } from '../../components/glass/GlassBadge.js';
import { formatDate } from '../../utils/formatters.js';

export const AdminSystemPage: React.FC = () => {
  const [sysInfo, setSysInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<any>('/api/system/info');
        setSysInfo(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Server className="w-5 h-5 text-slate-400" />
          <span>System Information & Metadata</span>
        </h2>
        <p className="text-xs text-slate-400">System architecture specifications and operational mode</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading system metadata...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard variant="strong" glow="cyan" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white font-['Outfit']">System Metadata</span>
              <GlassBadge variant="emerald">SIMULATOR</GlassBadge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Product Name:</span>
                <span className="font-bold text-white">Mahesh Game Space</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Product Type:</span>
                <span className="font-semibold text-slate-200">Gaming Marketplace Simulator</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Persistence Target:</span>
                <span className="font-mono text-cyan-400 font-bold">/data/runtime.json</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Currency Standard:</span>
                <span className="font-semibold text-emerald-400">INR (Paise canonical integer)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Initial Seed Timestamp:</span>
                <span className="text-slate-300">{formatDate(sysInfo?.seededAt)}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="normal" className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white font-['Outfit']">Strict 6-API Group Architecture</span>
              <GlassBadge variant="violet">6 GROUPS</GlassBadge>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {sysInfo?.apiGroups?.map((group: string) => (
                <div key={group} className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{group}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
