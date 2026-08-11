import { PersistenceService } from './persistenceService.js';
import { AuditService } from './auditService.js';
import { SessionService } from './sessionService.js';
import { sanitizeUser } from './authService.js';
import { Game, Category, UserSanitized, Order, Payment, Promotion, AuditLog, GameAvailability } from '../types/index.js';
import { AppError } from '../security/errorHandler.js';

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

export class AdminService {
  public static async getDashboardStats(): Promise<AdminDashboardStats> {
    const data = await PersistenceService.readData();

    const customers = data.users.filter((u) => u.role === 'customer');
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((u) => u.status === 'active').length;
    const suspendedCustomers = customers.filter((u) => u.status === 'suspended').length;

    const totalGames = data.games.length;
    const activeGames = data.games.filter((g) => g.availability === 'available').length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const ordersToday = data.orders.filter(
      (o) => new Date(o.createdAt).getTime() >= todayStart.getTime()
    ).length;

    const totalOrders = data.orders.length;
    const simulatedRevenuePaise = data.orders.reduce((sum, o) => sum + (o.status === 'completed' ? o.totalPaise : 0), 0);
    const totalGamesSold = data.orderItems.length;

    // Aggregate top selling games
    const gameSalesMap = new Map<string, { title: string; count: number; revenuePaise: number }>();
    for (const item of data.orderItems) {
      const existing = gameSalesMap.get(item.gameId) || { title: item.titleSnapshot, count: 0, revenuePaise: 0 };
      existing.count += item.quantity;
      existing.revenuePaise += item.pricePaise * item.quantity;
      gameSalesMap.set(item.gameId, existing);
    }

    const topGames = Array.from(gameSalesMap.entries())
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentOrders = [...data.orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalCustomers,
      activeCustomers,
      suspendedCustomers,
      totalGames,
      activeGames,
      ordersToday,
      totalOrders,
      simulatedRevenuePaise,
      totalGamesSold,
      topGames,
      recentOrders,
    };
  }

  public static async getCustomers(): Promise<Array<UserSanitized & { ordersCount: number; gamesOwnedCount: number; totalSpentPaise: number }>> {
    const data = await PersistenceService.readData();
    const customers = data.users.filter((u) => u.role === 'customer');

    return customers.map((user) => {
      const userOrders = data.orders.filter((o) => o.userId === user.id);
      const ordersCount = userOrders.length;
      const totalSpentPaise = userOrders.reduce((sum, o) => sum + o.totalPaise, 0);
      const gamesOwnedCount = data.library.filter((l) => l.userId === user.id && l.status === 'owned').length;

      return {
        ...sanitizeUser(user),
        ordersCount,
        gamesOwnedCount,
        totalSpentPaise,
      };
    });
  }

  public static async updateCustomerStatus(
    adminUserId: string,
    targetCustomerId: string,
    status: 'active' | 'suspended'
  ): Promise<UserSanitized> {
    const updated = await PersistenceService.updateData((draft) => {
      const user = draft.users.find((u) => u.id === targetCustomerId);
      if (!user) throw new AppError('Customer not found.', 404, 'USER_NOT_FOUND');
      if (user.role === 'admin') throw new AppError('Admin account status cannot be modified.', 400, 'ADMIN_PROTECTED');

      user.status = status;
      user.updatedAt = new Date().toISOString();
      return user;
    });

    if (status === 'suspended') {
      // Invalidate active sessions
      await SessionService.invalidateAllUserSessions(targetCustomerId);
      await AuditService.logAction(adminUserId, 'CUSTOMER_SUSPENDED', { targetCustomerId });
    } else {
      await AuditService.logAction(adminUserId, 'CUSTOMER_ACTIVATED', { targetCustomerId });
    }

    return sanitizeUser(updated);
  }

  public static async createGame(adminUserId: string, gameInput: Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount'>): Promise<Game> {
    const slug = gameInput.slug || gameInput.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const now = new Date().toISOString();
    const gameId = `GAME-${10000 + Date.now() % 90000}`;

    const newGame: Game = {
      ...gameInput,
      id: gameId,
      slug,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await PersistenceService.updateData((draft) => {
      draft.games.push(newGame);
    });

    await AuditService.logAction(adminUserId, 'GAME_CREATED', { gameId, title: newGame.title });
    return newGame;
  }

  public static async updateGame(adminUserId: string, gameId: string, updates: Partial<Game>): Promise<Game> {
    const updated = await PersistenceService.updateData((draft) => {
      const game = draft.games.find((g) => g.id === gameId);
      if (!game) throw new AppError('Game not found.', 404, 'GAME_NOT_FOUND');

      Object.assign(game, updates, { updatedAt: new Date().toISOString() });
      return game;
    });

    await AuditService.logAction(adminUserId, 'GAME_UPDATED', { gameId, updates: Object.keys(updates) });
    return updated;
  }

  public static async updateGameStatus(
    adminUserId: string,
    gameId: string,
    availability: GameAvailability
  ): Promise<Game> {
    const updated = await PersistenceService.updateData((draft) => {
      const game = draft.games.find((g) => g.id === gameId);
      if (!game) throw new AppError('Game not found.', 404, 'GAME_NOT_FOUND');

      game.availability = availability;
      game.updatedAt = new Date().toISOString();
      return game;
    });

    await AuditService.logAction(adminUserId, 'GAME_DEACTIVATED', { gameId, availability });
    return updated;
  }

  public static async createCategory(adminUserId: string, name: string, slugInput?: string): Promise<Category> {
    const slug = slugInput || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const data = await PersistenceService.readData();

    if (data.categories.some((c) => c.slug === slug)) {
      throw new AppError('Category slug already exists.', 400, 'CATEGORY_EXISTS');
    }

    const catId = `CAT-${10000 + data.categories.length + 1}`;
    const newCat: Category = {
      id: catId,
      name,
      slug,
      status: 'active',
    };

    await PersistenceService.updateData((draft) => {
      draft.categories.push(newCat);
    });

    await AuditService.logAction(adminUserId, 'CATEGORY_CREATED', { name, slug });
    return newCat;
  }

  public static async createPromotion(adminUserId: string, promo: Omit<Promotion, 'id' | 'usedCount'>): Promise<Promotion> {
    const data = await PersistenceService.readData();
    const codeUpper = promo.code.toUpperCase().trim();

    if (data.promotions.some((p) => p.code.toUpperCase() === codeUpper)) {
      throw new AppError('Promotion code already exists.', 400, 'PROMO_EXISTS');
    }

    const newPromo: Promotion = {
      ...promo,
      id: `PROMO-${10000 + data.promotions.length + 1}`,
      code: codeUpper,
      usedCount: 0,
    };

    await PersistenceService.updateData((draft) => {
      draft.promotions.push(newPromo);
    });

    await AuditService.logAction(adminUserId, 'PROMOTION_CREATED', { code: codeUpper });
    return newPromo;
  }

  public static async getAuditLogs(): Promise<AuditLog[]> {
    const data = await PersistenceService.readData();
    return data.auditLogs;
  }
}
