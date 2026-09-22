import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassInput } from '../components/glass/GlassInput.js';
import { GlassButton } from '../components/glass/GlassButton.js';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signup(name, email, password, phone);
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <GlassCard variant="strong" glow="cyan" className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-0.5 mx-auto shadow-lg">
            <div className="w-full h-full bg-[#070B17] rounded-[14px] flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Create Account</h1>
          <p className="text-xs text-slate-400">Join AMR Game Space storefront</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput
            label="Full Name"
            placeholder="AMR Gamer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4 text-slate-400" />}
            required
          />

          <GlassInput
            label="Email Address"
            type="email"
            placeholder="gamer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-slate-400" />}
            required
          />

          <GlassInput
            label="Password (Min 10 chars, letter + number)"
            type="password"
            placeholder="Gamer@12345"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4 text-slate-400" />}
            required
          />

          <GlassInput
            label="Phone Number (Optional)"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          <GlassButton variant="cyan" size="lg" fullWidth loading={loading} type="submit" icon={<UserPlus className="w-4 h-4" />}>
            Create Customer Account
          </GlassButton>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Already have an account? </span>
          <Link to="/login" className="text-violet-400 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};
