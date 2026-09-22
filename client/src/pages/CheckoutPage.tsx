import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, ArrowLeft, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiClient } from '../services/apiClient.js';
import { GlassCard } from '../components/glass/GlassCard.js';
import { GlassButton } from '../components/glass/GlassButton.js';
import { GlassInput } from '../components/glass/GlassInput.js';
import { GlassSelect } from '../components/glass/GlassSelect.js';
import { formatINR } from '../utils/formatters.js';
import { PaymentMethod } from '../types/index.js';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { items, subtotalPaise, itemCount, refreshCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('simulated_card');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Requirement 4: Realistic payment form fields for 3 different payment ways
  // 1. Credit / Debit Card Details
  const [cardholderName, setCardholderName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // 2. UPI Details
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState('gpay');

  // 3. Wallet Details
  const [walletProvider, setWalletProvider] = useState('mgs_wallet');
  const [walletPhone, setWalletPhone] = useState(user?.phone || '');

  if (!user) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-['Outfit']">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400">Please add games to your cart before proceeding to checkout.</p>
        <Link to="/games">
          <GlassButton variant="primary">Browse Games Storefront</GlassButton>
        </Link>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Perform validation for payment fields
    if (paymentMethod === 'simulated_card') {
      if (!cardholderName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        showToast('Please complete all credit/debit card fields.', 'warning');
        return;
      }
    } else if (paymentMethod === 'simulated_upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        showToast('Please enter a valid UPI ID (e.g. name@upi).', 'warning');
        return;
      }
    } else if (paymentMethod === 'demo_wallet') {
      if (!walletPhone.trim()) {
        showToast('Please enter your linked wallet mobile number.', 'warning');
        return;
      }
    }

    try {
      setLoading(true);
      const res = await apiClient.post<{ order: { id: string }; payment: { id: string } }>('/api/orders/checkout', {
        paymentMethod,
        promoCode: promoCode.trim() || undefined,
      });

      showToast('Payment successful! Your order has been placed.', 'success');
      await refreshCart();
      navigate(`/orders/${res.order.id}`);
    } catch (err: any) {
      showToast(err.message || 'Checkout failed. Please check your payment details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <Link to="/cart" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping Cart</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Options & Interactive Payment Forms */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleCheckout} className="space-y-6">
            {/* Step 1: Select Payment Way */}
            <GlassCard variant="strong" className="p-6 space-y-5">
              <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <span>1. Choose Payment Option</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option A: Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod('simulated_card')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    paymentMethod === 'simulated_card'
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-lg ring-1 ring-violet-500'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-violet-400" />
                  <span className="text-xs font-bold font-['Outfit']">Credit / Debit Card</span>
                  <span className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</span>
                </div>

                {/* Option B: Instant UPI */}
                <div
                  onClick={() => setPaymentMethod('simulated_upi')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    paymentMethod === 'simulated_upi'
                      ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-cyan-400" />
                  <span className="text-xs font-bold font-['Outfit']">Instant UPI</span>
                  <span className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</span>
                </div>

                {/* Option C: Digital Wallet */}
                <div
                  onClick={() => setPaymentMethod('demo_wallet')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    paymentMethod === 'demo_wallet'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wallet className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs font-bold font-['Outfit']">Digital Wallet</span>
                  <span className="text-[10px] text-slate-400">Paytm, MGS Credits</span>
                </div>
              </div>

              {/* Dynamic Interactive Payment Form Fields */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                {paymentMethod === 'simulated_card' && (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Card Details</h4>
                    <GlassInput
                      label="Cardholder Name"
                      placeholder="Name on Card"
                      value={cardholderName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardholderName(e.target.value)}
                      required
                    />
                    <GlassInput
                      label="Card Number"
                      placeholder="4532 1098 7654 8892"
                      value={cardNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardNumber(e.target.value)}
                      maxLength={19}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <GlassInput
                        label="Expiry Date (MM/YY)"
                        placeholder="08/28"
                        value={cardExpiry}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        required
                      />
                      <GlassInput
                        label="CVV / Security Code"
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardCvv(e.target.value)}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'simulated_upi' && (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">UPI Virtual Payment Details</h4>
                    <GlassSelect
                      label="Select Preferred App"
                      value={upiApp}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setUpiApp(e.target.value)}
                      options={[
                        { value: 'gpay', label: 'Google Pay (GPay)' },
                        { value: 'phonepe', label: 'PhonePe' },
                        { value: 'paytm', label: 'Paytm UPI' },
                        { value: 'bhim', label: 'BHIM UPI' },
                      ]}
                    />
                    <GlassInput
                      label="VPA / UPI ID"
                      placeholder="username@upi or 9876543210@paytm"
                      value={upiId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpiId(e.target.value)}
                      required
                    />
                  </div>
                )}

                {paymentMethod === 'demo_wallet' && (
                  <div className="space-y-4 animate-fade-in">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Wallet Account Details</h4>
                    <GlassSelect
                      label="Select Wallet Provider"
                      value={walletProvider}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setWalletProvider(e.target.value)}
                      options={[
                        { value: 'mgs_wallet', label: 'AMR Game Space Gaming Wallet' },
                        { value: 'paytm_wallet', label: 'Paytm Wallet' },
                        { value: 'mobikwik', label: 'MobiKwik Wallet' },
                      ]}
                    />
                    <GlassInput
                      label="Linked Mobile Number"
                      placeholder="+91 98765 43210"
                      value={walletPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalletPhone(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Step 2: Promotional Code */}
            <GlassCard variant="normal" className="p-6 space-y-3">
              <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>2. Apply Promotional Code (Optional)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Available codes: <code className="text-cyan-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">WELCOME10</code> or <code className="text-cyan-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">GAMER20</code>
              </p>
              <GlassInput
                placeholder="Enter Promo Code"
                value={promoCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPromoCode(e.target.value)}
              />
            </GlassCard>

            <GlassButton variant="cyan" size="lg" fullWidth loading={loading} type="submit">
              Pay & Complete Order
            </GlassButton>
          </form>
        </div>

        {/* Right Column: Order Items & Server Totals */}
        <div className="lg:col-span-5">
          <GlassCard variant="strong" glow="violet" className="p-6 space-y-6 sticky top-28">
            <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-slate-800 pb-3">
              Order Summary ({itemCount} Games)
            </h3>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(({ game, subtotalPaise: itemSubtotal }) => (
                <div key={game.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60">
                  <span className="font-semibold text-slate-200 truncate max-w-[200px]">{game.title}</span>
                  <span className="font-bold text-slate-300">{formatINR(itemSubtotal, false)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold">{formatINR(subtotalPaise, false)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Tax & Service</span>
                <span className="font-semibold text-emerald-400">Included</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Total Payable</span>
                <span className="text-cyan-400 text-xl font-['Outfit']">{formatINR(subtotalPaise, false)}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Your payment is secured with 256-bit encryption. Game licenses are added instantly upon checkout.</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
