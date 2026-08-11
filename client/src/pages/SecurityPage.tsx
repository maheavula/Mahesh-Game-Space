import React, { useState } from 'react';
import { Shield, KeyRound, LogOut, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiClient } from '../services/apiClient.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassInput } from '../components/glass/GlassInput.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { GlassBadge } from '../components/glass/GlassBadge.js';

export const SecurityPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      showToast('Password updated successfully! Please sign in again with your new password.', 'success');
      logout();
    } catch (err: any) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-1">
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          <span>Security Center</span>
        </h1>
        <p className="text-sm text-slate-400">Manage account credentials and login security preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Protection Summary */}
        <div className="md:col-span-5 space-y-6">
          <GlassCard variant="strong" glow="cyan" className="p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit']">Account Protected</h3>
                <span className="text-[11px] text-slate-400">Standard Password Security</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span>Account Status</span>
                <GlassBadge variant="emerald" size="sm">Active Account</GlassBadge>
              </div>

              <div className="flex justify-between items-center">
                <span>Cookie Security</span>
                <span className="text-emerald-400 font-semibold">Enabled</span>
              </div>
            </div>

            <div className="pt-2">
              <GlassButton variant="danger" size="sm" fullWidth onClick={logout} icon={<LogOut className="w-4 h-4" />}>
                Sign Out of Account
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="md:col-span-7">
          <GlassCard variant="normal" className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-5">
              <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-slate-800 pb-3 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-violet-400" />
                <span>Change Account Password</span>
              </h3>

              <GlassInput
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                required
              />

              <GlassInput
                label="New Password (Minimum 10 characters, 1 letter & 1 number)"
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                required
              />

              <GlassInput
                label="Confirm New Password"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                required
              />

              <GlassButton variant="primary" loading={loading} type="submit" icon={<Lock className="w-4 h-4" />}>
                Update Password
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
