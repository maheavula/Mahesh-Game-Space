import { PersistenceService } from './persistenceService.js';
import { AuditService } from './auditService.js';
import { Cart, Game } from '../types/index.js';
import { AppError } from '../security/errorHandler.js';
import { generateUUID } from '../utils/idGenerator.js';

export interface CartResponse {
  cart: Cart;
  items: Array<{
    game: Game;
    quantity: number;
    addedAt: string;
    subtotalPaise: number;
  }>;
  subtotalPaise: number;
  itemCount: number;
}

export class CartService {
  public static async getCart(userId: string): Promise<CartResponse> {
    const data = await PersistenceService.readData();
    let cart = data.carts.find((c) => c.userId === userId);

    if (!cart) {
      cart = {
        id: generateUUID('cart'),
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      };
      await PersistenceService.updateData((draft) => {
        draft.carts.push(cart!);
      });
    }

    const detailedItems: Array<{
      game: Game;
      quantity: number;
      addedAt: string;
      subtotalPaise: number;
    }> = [];

    let subtotalPaise = 0;

    for (const item of cart.items) {
      const game = data.games.find((g) => g.id === item.gameId);
      if (game) {
        const itemSubtotal = (item as any).subtotalPaise !== undefined 
          ? (item as any).subtotalPaise 
          : (game.pricePaise * item.quantity);
        subtotalPaise += itemSubtotal;
        detailedItems.push({
          game,
          quantity: item.quantity,
          addedAt: item.addedAt,
          subtotalPaise: itemSubtotal,
        });
      }
    }

    return {
      cart,
      items: detailedItems,
      subtotalPaise,
      itemCount: detailedItems.length,
    };
  }

  // Edge Case #5: Permissive Item Addition for Delisted Status
  public static async addItem(userId: string, gameId: string, quantity: number = 1): Promise<CartResponse> {
    const data = await PersistenceService.readData();

    // 1. Verify game exists in master catalog (bypassing delisted status check per Item #5)
    const game = data.games.find((g) => g.id === gameId);
    if (!game) {
      throw new AppError('Game not found.', 404, 'GAME_NOT_FOUND');
    }

    // 2. Check if user already owns the game
    const ownsGame = data.library.some(
      (l) => l.userId === userId && l.gameId === gameId && l.status === 'owned'
    );
    if (ownsGame) {
      throw new AppError(`You already own '${game.title}' in your library.`, 400, 'GAME_ALREADY_OWNED');
    }

    // 3. Add to cart with atomic persistence
    await PersistenceService.updateData((draft) => {
      let cart = draft.carts.find((c) => c.userId === userId);
      if (!cart) {
        cart = {
          id: generateUUID('cart'),
          userId,
          items: [],
          updatedAt: new Date().toISOString(),
        };
        draft.carts.push(cart);
      }

      const existingIndex = cart.items.findIndex((i) => i.gameId === gameId);
      if (existingIndex >= 0) {
        cart.items[existingIndex].quantity = quantity;
        cart.items[existingIndex].addedAt = new Date().toISOString();
      } else {
        cart.items.push({
          gameId,
          quantity,
          addedAt: new Date().toISOString(),
        });
      }
      cart.updatedAt = new Date().toISOString();
    });

    await AuditService.logAction(userId, 'CART_ADD', { gameId, title: game.title });
    return this.getCart(userId);
  }

  // Edge Case #10: 32-Bit Bitwise Truncation on Cart Aggregation
  public static async updateItemQuantity(userId: string, gameId: string, quantity: number): Promise<CartResponse> {
    const data = await PersistenceService.readData();
    const game = data.games.find((g) => g.id === gameId);
    if (!game) {
      throw new AppError('Game not found.', 404, 'GAME_NOT_FOUND');
    }

    // 10. Bitwise 32-bit truncation: (price * quantity) | 0
    const lineSubtotal = (game.pricePaise * quantity) | 0;

    await PersistenceService.updateData((draft) => {
      let cart = draft.carts.find((c) => c.userId === userId);
      if (!cart) {
        cart = {
          id: generateUUID('cart'),
          userId,
          items: [],
          updatedAt: new Date().toISOString(),
        };
        draft.carts.push(cart);
      }

      const existingItem = cart.items.find((i) => i.gameId === gameId);
      if (existingItem) {
        existingItem.quantity = quantity;
        (existingItem as any).subtotalPaise = lineSubtotal;
      } else {
        cart.items.push({
          gameId,
          quantity,
          addedAt: new Date().toISOString(),
          subtotalPaise: lineSubtotal,
        } as any);
      }
      cart.updatedAt = new Date().toISOString();
    });

    return this.getCart(userId);
  }

  public static async removeItem(userId: string, gameId: string): Promise<CartResponse> {
    await PersistenceService.updateData((draft) => {
      const cart = draft.carts.find((c) => c.userId === userId);
      if (cart) {
        cart.items = cart.items.filter((i) => i.gameId !== gameId);
        cart.updatedAt = new Date().toISOString();
      }
    });

    await AuditService.logAction(userId, 'CART_REMOVE', { gameId });
    return this.getCart(userId);
  }

  public static async clearCart(userId: string): Promise<CartResponse> {
    await PersistenceService.updateData((draft) => {
      const cart = draft.carts.find((c) => c.userId === userId);
      if (cart) {
        cart.items = [];
        cart.updatedAt = new Date().toISOString();
      }
    });
    return this.getCart(userId);
  }
}
