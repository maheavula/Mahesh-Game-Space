export type Role = 'customer' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type GameAvailability = 'available' | 'unavailable' | 'delisted';
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentStatus = 'completed' | 'failed';
export type PaymentMethod = 'simulated_card' | 'simulated_upi' | 'demo_wallet' | 'free';
export type LibraryStatus = 'owned' | 'revoked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  phone?: string;
  avatarUrl?: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  publisher: string;
  developer: string;
  description: string;
  categoryIds: string[];
  platforms: string[];
  pricePaise: number;
  originalPricePaise: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  releaseDate: string;
  featured: boolean;
  popular: boolean;
  availability: GameAvailability;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
}

export interface CartItemDetailed {
  game: Game;
  quantity: number;
  addedAt: string;
  subtotalPaise: number;
}

export interface CartResponse {
  cart: { id: string; userId: string; updatedAt: string };
  items: CartItemDetailed[];
  subtotalPaise: number;
  itemCount: number;
}

export interface Order {
  id: string;
  userId: string;
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  currency: 'INR';
  status: OrderStatus;
  paymentId: string;
  createdAt: string;
  promoCode?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  gameId: string;
  titleSnapshot: string;
  pricePaise: number;
  quantity: number;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amountPaise: number;
  currency: 'INR';
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface GameLibraryItem {
  id: string;
  userId: string;
  gameId: string;
  orderId: string;
  acquiredAt: string;
  status: LibraryStatus;
  game: Game;
}

export interface Promotion {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscountPaise: number;
  minimumOrderPaise: number;
  active: boolean;
  startsAt: string;
  endsAt: string;
  usageLimit: number;
  usedCount: number;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface AdminDashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  suspendedCustomers: number;
  totalGames: number;
  activeGames: number;
  ordersToday: number;
  totalOrders: number;
  simulatedRevenuePaise: number;
  totalGamesSold: number;
  topGames: Array<{ id: string; title: string; count: number; revenuePaise: number }>;
  recentOrders: Order[];
}
