import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { GlassNavbar } from './components/glass/GlassNavbar.js';

// Customer Pages
import { LandingPage } from './pages/LandingPage.js';
import { DiscoverPage } from './pages/DiscoverPage.js';
import { GameDetailPage } from './pages/GameDetailPage.js';
import { DealsPage } from './pages/DealsPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { LibraryPage } from './pages/LibraryPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SecurityPage } from './pages/SecurityPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignupPage } from './pages/SignupPage.js';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage.js';
import { AdminGamesPage } from './pages/admin/AdminGamesPage.js';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage.js';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage.js';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage.js';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage.js';
import { AdminAuditPage } from './pages/admin/AdminAuditPage.js';
import { AdminSystemPage } from './pages/admin/AdminSystemPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#070B17] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
              <GlassNavbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public & Customer Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/games" element={<DiscoverPage />} />
                  <Route path="/games/:id" element={<GameDetailPage />} />
                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderSuccessPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/security" element={<SecurityPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* Admin Console Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="games" element={<AdminGamesPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="payments" element={<AdminPaymentsPage />} />
                    <Route path="promotions" element={<AdminPromotionsPage />} />
                    <Route path="audit" element={<AdminAuditPage />} />
                    <Route path="system" element={<AdminSystemPage />} />
                  </Route>

                  {/* Catch-all fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
