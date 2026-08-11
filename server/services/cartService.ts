import { PersistenceService } from './persistenceService.js';
import { AuditService } from './auditService.js';
import { Cart, Game } from '../types/index.js';
import { AppError } from '../security/errorHandler.js';

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
      // Create empty cart if missing
      cart = {
        id: `CART-${10000 + data.carts.length + 1}`,
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
      if (game && game.availability === 'available') {
        const itemSubtotal = game.pricePaise * item.quantity;
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

  public static async addItem(userId: string, gameId: string): Promise<CartResponse> {
    const data = await PersistenceService.readData();

    // 1. Verify game exists and is available
    const game = data.games.find((g) => g.id === gameId);
    if (!game) {
      throw new AppError('Game not found.', 404, 'GAME_NOT_FOUND');
    }
    if (game.availability !== 'available') {
      throw new AppError(`'${game.title}' is currently unavailable for purchase.`, 400, 'GAME_UNAVAILABLE');
    }

    // 2. Section 79 Rule: Check if user already owns the game
    const ownsGame = data.library.some(
      (l) => l.userId === userId && l.gameId === gameId && l.status === 'owned'
    );
    if (ownsGame) {
      throw new AppError(`You already own '${game.title}' in your library.`, 400, 'GAME_ALREADY_OWNED');
    }

    // 3. Add to cart
    await PersistenceService.updateData((draft) => {
      let cart = draft.carts.find((c) => c.userId === userId);
      if (!cart) {
        cart = {
          id: `CART-${10000 + draft.carts.length + 1}`,
          userId,
          items: [],
          updatedAt: new Date().toISOString(),
        };
        draft.carts.push(cart);
      }

      const existingIndex = cart.items.findIndex((i) => i.gameId === gameId);
      if (existingIndex >= 0) {
        // Digital game quantity is always 1
        cart.items[existingIndex].quantity = 1;
        cart.items[existingIndex].addedAt = new Date().toISOString();
      } else {
        cart.items.push({
          gameId,
          quantity: 1,
          addedAt: new Date().toISOString(),
        });
      }
      cart.updatedAt = new Date().toISOString();
    });

    await AuditService.logAction(userId, 'CART_ADD', { gameId, title: game.title });
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
