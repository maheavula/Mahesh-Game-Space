export type Role = 'customer' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type GameAvailability = 'available' | 'unavailable' | 'delisted';
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentStatus = 'completed' | 'failed';
export type PaymentMethod = 'simulated_card' | 'simulated_upi' | 'demo_wallet' | 'free';
export type LibraryStatus = 'owned' | 'revoked';
export type PromotionType = 'percentage' | 'fixed';
export type AuditAction = 
  | 'SIGNUP'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PROFILE_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'GAME_VIEWED'
  | 'WISHLIST_ADD'
  | 'WISHLIST_REMOVE'
  | 'CART_ADD'
  | 'CART_REMOVE'
  | 'CHECKOUT_STARTED'
  | 'ORDER_CREATED'
  | 'PAYMENT_COMPLETED'
  | 'GAME_ACQUIRED'
  | 'CUSTOMER_SUSPENDED'
  | 'CUSTOMER_ACTIVATED'
  | 'GAME_CREATED'
  | 'GAME_UPDATED'
  | 'GAME_DEACTIVATED'
  | 'PROMOTION_CREATED'
  | 'PROMOTION_UPDATED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  phone?: string;
  avatarUrl?: string;
  preferences?: Record<string, any>;
  [key: string]: any;
}

export interface UserSanitized {
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
  preferences?: Record<string, any>;
  [key: string]: any;
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

export interface CartItem {
  gameId: string;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  gameIds: string[];
  updatedAt: string;
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

export interface GameLibrary {
  id: string;
  userId: string;
  gameId: string;
  orderId: string;
  acquiredAt: string;
  status: LibraryStatus;
}

export interface Promotion {
  id: string;
  code: string;
  type: PromotionType;
  value: number; // percentage or paise amount
  maxDiscountPaise: number;
  minimumOrderPaise: number;
  active: boolean;
  startsAt: string;
  endsAt: string;
  usageLimit: number;
  usedCount: number;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: AuditAction;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface RuntimeData {
  users: User[];
  games: Game[];
  categories: Category[];
  carts: Cart[];
  wishlists: Wishlist[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  library: GameLibrary[];
  promotions: Promotion[];
  sessions: Session[];
  auditLogs: AuditLog[];
  metadata: {
    appName: string;
    version: string;
    mode: string;
    seededAt: string;
    lastUpdated: string;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
