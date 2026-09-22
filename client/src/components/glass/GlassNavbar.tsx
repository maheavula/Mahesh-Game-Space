import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Gamepad2,
  Search,
  ShoppingBag,
  Heart,
  Library,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  X,
  Compass,
  Tag,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { GlassButton } from './GlassButton.js';
import { GlassBadge } from './GlassBadge.js';

export const GlassNavbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut '/' to focus header search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        if (input) input.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/games?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-glass bg-[#070B17]/65 border-b border-white/15 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <RouterLink to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-cyan-400 to-magenta-500 p-0.5 shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#070B17]/90 rounded-[10px] flex items-center justify-center backdrop-blur-md">
              <Gamepad2 className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-['Outfit'] font-extrabold text-base sm:text-lg text-white tracking-wider group-hover:text-cyan-400 transition-colors">
              AMR GAME SPACE
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-widest uppercase -mt-1">
              DIGITAL STOREFRONT
            </span>
          </div>
        </RouterLink>

        {/* Task 1: Navigation Links (Cleanly Aligned, Admin Console button removed from top nav) */}
        <nav className="hidden lg:flex items-center gap-1 font-medium text-xs sm:text-sm text-slate-300">
          <RouterLink
            to="/"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/') ? 'text-white bg-white/10 font-semibold border border-white/20 shadow-glass-sm' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4 text-violet-400" />
            <span>Discover</span>
          </RouterLink>

          <RouterLink
            to="/games"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/games') ? 'text-white bg-white/10 font-semibold border border-white/20 shadow-glass-sm' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-cyan-400" />
            <span>Games</span>
          </RouterLink>

          <RouterLink
            to="/deals"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/deals') ? 'text-white bg-white/10 font-semibold border border-white/20 shadow-glass-sm' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Deals</span>
          </RouterLink>

          <RouterLink
            to="/wishlist"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/wishlist') ? 'text-white bg-white/10 font-semibold border border-white/20 shadow-glass-sm' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Wishlist</span>
          </RouterLink>

          {user && (
            <RouterLink
              to="/library"
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive('/library') ? 'text-white bg-white/10 font-semibold border border-white/20 shadow-glass-sm' : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <Library className="w-4 h-4 text-cyan-400" />
              <span>Library</span>
            </RouterLink>
          )}
        </nav>

        {/* Search Bar Positioned Beside Header Links */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-48 lg:w-56 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search games... [/]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-slate-100 placeholder:text-slate-500 focus:w-60 transition-all"
          />
        </form>

        {/* Cart & Profile / Sign In Action Buttons (Cleanly Aligned) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart Icon Button */}
          <RouterLink
            to="/cart"
            className="relative p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-white/15 text-slate-200 hover:text-white transition-all shadow-glass-sm"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-slate-900 animate-pulse">
                {itemCount}
              </span>
            )}
          </RouterLink>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white/5 border border-white/15 hover:border-violet-400/40 text-slate-200 hover:text-white transition-all shadow-glass-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shadow">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-semibold text-xs text-slate-200 truncate max-w-[100px]">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel-strong border border-white/20 rounded-xl shadow-2xl p-2 z-50 animate-scale-up">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="font-bold text-sm text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1.5">
                      <GlassBadge variant={user.role === 'admin' ? 'violet' : 'cyan'} size="sm">
                        {user.role}
                      </GlassBadge>
                    </div>
                  </div>

                  <RouterLink
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-violet-400" />
                    <span>My Profile</span>
                  </RouterLink>

                  <RouterLink
                    to="/security"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Security Center</span>
                  </RouterLink>

                  <RouterLink
                    to="/orders"
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>Order History</span>
                  </RouterLink>

                  {isAdmin && (
                    <RouterLink
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-xs text-violet-300 hover:text-white hover:bg-violet-600/30 rounded-lg transition-colors font-semibold border-t border-white/10 mt-1 pt-2"
                    >
                      <Shield className="w-4 h-4 text-violet-400" />
                      <span>Admin Management</span>
                    </RouterLink>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors mt-1 border-t border-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <RouterLink to="/login" className="inline-flex items-center">
                <GlassButton variant="ghost" size="sm" className="px-3.5 py-2 text-xs font-semibold">
                  Sign In
                </GlassButton>
              </RouterLink>
              <RouterLink to="/signup" className="inline-flex items-center">
                <GlassButton variant="primary" size="sm" className="px-4 py-2 text-xs font-semibold">
                  Register
                </GlassButton>
              </RouterLink>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel-strong border-t border-white/10 p-4 space-y-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none top-3" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-100"
            />
          </form>

          <RouterLink
            to="/"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-200 font-medium"
          >
            <Compass className="w-5 h-5 text-violet-400" />
            <span>Discover</span>
          </RouterLink>

          <RouterLink
            to="/games"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-200 font-medium"
          >
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span>Games Catalog</span>
          </RouterLink>

          <RouterLink
            to="/deals"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-200 font-medium"
          >
            <Tag className="w-5 h-5 text-emerald-400" />
            <span>Deals & Offers</span>
          </RouterLink>

          <RouterLink
            to="/wishlist"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-200 font-medium"
          >
            <Heart className="w-5 h-5 text-rose-400" />
            <span>Wishlist</span>
          </RouterLink>

          {user && (
            <RouterLink
              to="/library"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-200 font-medium"
            >
              <Library className="w-5 h-5 text-cyan-400" />
              <span>Personal Library</span>
            </RouterLink>
          )}

          {isAdmin && (
            <RouterLink
              to="/admin"
              className="flex items-center gap-3 p-3 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-200 font-semibold"
            >
              <Shield className="w-5 h-5 text-violet-400" />
              <span>Admin Management</span>
            </RouterLink>
          )}
        </div>
      )}
    </header>
  );
};
