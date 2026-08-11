import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartResponse, CartItemDetailed } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';

interface CartContextType {
  items: CartItemDetailed[];
  subtotalPaise: number;
  itemCount: number;
  loading: boolean;
  addToCart: (gameId: string) => Promise<void>;
  removeFromCart: (gameId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<CartItemDetailed[]>([]);
  const [subtotalPaise, setSubtotalPaise] = useState<number>(0);
  const [itemCount, setItemCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSubtotalPaise(0);
      setItemCount(0);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.get<CartResponse>('/api/cart');
      setItems(res.items || []);
      setSubtotalPaise(res.subtotalPaise || 0);
      setItemCount(res.itemCount || 0);
    } catch {
      // Ignore initial cart load failure if unauthenticated
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (gameId: string) => {
    if (!user) {
      showToast('Please log in to add games to your cart.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post<CartResponse>('/api/cart/items', { gameId });
      setItems(res.items || []);
      setSubtotalPaise(res.subtotalPaise || 0);
      setItemCount(res.itemCount || 0);
      showToast('Game added to cart!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add game to cart.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (gameId: string) => {
    try {
      setLoading(true);
      const res = await apiClient.delete<CartResponse>(`/api/cart/items/${gameId}`);
      setItems(res.items || []);
      setSubtotalPaise(res.subtotalPaise || 0);
      setItemCount(res.itemCount || 0);
      showToast('Game removed from cart.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove game.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const res = await apiClient.delete<CartResponse>('/api/cart');
      setItems(res.items || []);
      setSubtotalPaise(0);
      setItemCount(0);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotalPaise,
        itemCount,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
