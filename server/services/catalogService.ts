import { PersistenceService } from './persistenceService.js';
import { AuditService } from './auditService.js';
import { Game, Category, Wishlist, GameLibrary } from '../types/index.js';
import { AppError } from '../security/errorHandler.js';

export interface CatalogQueryFilters {
  search?: string;
  categorySlug?: string;
  categoryId?: string;
  platform?: string;
  minPricePaise?: number;
  maxPricePaise?: number;
  discountOnly?: boolean;
  featured?: boolean;
  popular?: boolean;
  availability?: string;
  sortBy?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'discount';
}

export class CatalogService {
  public static async getGames(filters: CatalogQueryFilters = {}): Promise<Game[]> {
    const data = await PersistenceService.readData();
    let games = data.games.filter((g) => g.availability !== 'delisted');

    // Filter by Search Query (Title, Publisher, Developer, Description)
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      games = games.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.publisher.toLowerCase().includes(q) ||
          g.developer.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q)
      );
    }

    // Filter by Category Slug
    if (filters.categorySlug) {
      const cat = data.categories.find((c) => c.slug === filters.categorySlug);
      if (cat) {
        games = games.filter((g) => g.categoryIds.includes(cat.id));
      }
    }

    // Filter by Category ID
    if (filters.categoryId) {
      games = games.filter((g) => g.categoryIds.includes(filters.categoryId!));
    }

    // Filter by Platform
    if (filters.platform) {
      const plat = filters.platform.toLowerCase();
      games = games.filter((g) => g.platforms.some((p) => p.toLowerCase() === plat));
    }

    // Filter by Price Range
    if (filters.minPricePaise !== undefined) {
      games = games.filter((g) => g.pricePaise >= filters.minPricePaise!);
    }
    if (filters.maxPricePaise !== undefined) {
      games = games.filter((g) => g.pricePaise <= filters.maxPricePaise!);
    }

    // Filter Deals / Discounted only
    if (filters.discountOnly) {
      games = games.filter((g) => g.discountPercent > 0);
    }

    // Filter Featured / Popular / Availability
    if (filters.featured) games = games.filter((g) => g.featured);
    if (filters.popular) games = games.filter((g) => g.popular);
    if (filters.availability) games = games.filter((g) => g.availability === filters.availability);

    // Sort
    const sortBy = filters.sortBy || 'popular';
    games.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      if (sortBy === 'price_asc') return a.pricePaise - b.pricePaise;
      if (sortBy === 'price_desc') return b.pricePaise - a.pricePaise;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      // Default: Popularity & rating
      return (b.popular ? 1 : 0) * 10 + b.rating - ((a.popular ? 1 : 0) * 10 + a.rating);
    });

    return games;
  }

  public static async getGameById(id: string): Promise<Game> {
    const data = await PersistenceService.readData();
    const game = data.games.find((g) => g.id === id || g.slug === id);
    if (!game) {
      throw new AppError('The requested game could not be found.', 404, 'GAME_NOT_FOUND');
    }
    return game;
  }

  public static async getCategories(): Promise<Category[]> {
    const data = await PersistenceService.readData();
    return data.categories.filter((c) => c.status === 'active');
  }

  public static async getWishlist(userId: string): Promise<Game[]> {
    const data = await PersistenceService.readData();
    const wishlist = data.wishlists.find((w) => w.userId === userId);
    if (!wishlist) return [];
    return data.games.filter((g) => wishlist.gameIds.includes(g.id));
  }

  public static async addToWishlist(userId: string, gameId: string): Promise<Game[]> {
    const data = await PersistenceService.readData();
    const game = data.games.find((g) => g.id === gameId);
    if (!game) {
      throw new AppError('Game not found.', 404, 'GAME_NOT_FOUND');
    }

    await PersistenceService.updateData((draft) => {
      let wish = draft.wishlists.find((w) => w.userId === userId);
      if (!wish) {
        wish = {
          id: `WISH-${10000 + draft.wishlists.length + 1}`,
          userId,
          gameIds: [],
          updatedAt: new Date().toISOString(),
        };
        draft.wishlists.push(wish);
      }
      if (!wish.gameIds.includes(gameId)) {
        wish.gameIds.push(gameId);
        wish.updatedAt = new Date().toISOString();
      }
    });

    await AuditService.logAction(userId, 'WISHLIST_ADD', { gameId, title: game.title });
    return this.getWishlist(userId);
  }

  public static async removeFromWishlist(userId: string, gameId: string): Promise<Game[]> {
    await PersistenceService.updateData((draft) => {
      const wish = draft.wishlists.find((w) => w.userId === userId);
      if (wish) {
        wish.gameIds = wish.gameIds.filter((id) => id !== gameId);
        wish.updatedAt = new Date().toISOString();
      }
    });

    await AuditService.logAction(userId, 'WISHLIST_REMOVE', { gameId });
    return this.getWishlist(userId);
  }

  public static async getCustomerLibrary(userId: string): Promise<Array<GameLibrary & { game: Game }>> {
    const data = await PersistenceService.readData();
    const userLibrary = data.library.filter((l) => l.userId === userId && l.status === 'owned');

    return userLibrary
      .map((entry) => {
        const game = data.games.find((g) => g.id === entry.gameId);
        if (!game) return null;
        return {
          ...entry,
          game,
        };
      })
      .filter((item): item is GameLibrary & { game: Game } => item !== null);
  }
}
