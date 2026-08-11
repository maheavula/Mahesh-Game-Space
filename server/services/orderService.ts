import { PersistenceService } from './persistenceService.js';
import { AuditService } from './auditService.js';
import { CartService } from './cartService.js';
import { Order, OrderItem, Payment, GameLibrary, PaymentMethod } from '../types/index.js';
import { AppError } from '../security/errorHandler.js';

export interface CheckoutInput {
  paymentMethod: PaymentMethod;
  promoCode?: string;
  simulateFailure?: boolean;
}

export interface DetailedOrder {
  order: Order;
  items: OrderItem[];
  payment: Payment;
}

export class OrderService {
  public static async processCheckout(
    userId: string,
    input: CheckoutInput
  ): Promise<DetailedOrder> {
    await AuditService.logAction(userId, 'CHECKOUT_STARTED', { method: input.paymentMethod });

    const runtime = await PersistenceService.readData();

    // 1. Get user cart
    const cart = runtime.carts.find((c) => c.userId === userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty.', 400, 'EMPTY_CART');
    }

    // 2. Load & revalidate all items from latest server catalog
    let subtotalPaise = 0;
    const validatedItems: Array<{ gameId: string; title: string; pricePaise: number }> = [];

    for (const item of cart.items) {
      const game = runtime.games.find((g) => g.id === item.gameId);
      if (!game) {
        throw new AppError(`Game with ID ${item.gameId} no longer exists.`, 400, 'GAME_NOT_FOUND');
      }

      if (game.availability !== 'available') {
        throw new AppError(`'${game.title}' is no longer available for purchase.`, 400, 'GAME_UNAVAILABLE');
      }

      // Check ownership
      const alreadyOwned = runtime.library.some(
        (l) => l.userId === userId && l.gameId === game.id && l.status === 'owned'
      );
      if (alreadyOwned) {
        throw new AppError(`You already own '${game.title}' in your game library.`, 400, 'GAME_ALREADY_OWNED');
      }

      subtotalPaise += game.pricePaise;
      validatedItems.push({
        gameId: game.id,
        title: game.title,
        pricePaise: game.pricePaise,
      });
    }

    // 3. Handle Promotional Code Server-Side
    let discountPaise = 0;
    let appliedPromoCode: string | undefined = undefined;

    if (input.promoCode && input.promoCode.trim()) {
      const codeClean = input.promoCode.trim().toUpperCase();
      const promo = runtime.promotions.find((p) => p.code.toUpperCase() === codeClean);

      if (!promo) {
        throw new AppError('Invalid promotion code.', 400, 'INVALID_PROMOTION');
      }

      if (!promo.active) {
        throw new AppError('This promotion code is inactive.', 400, 'INACTIVE_PROMOTION');
      }

      const nowTime = new Date().getTime();
      if (new Date(promo.startsAt).getTime() > nowTime || new Date(promo.endsAt).getTime() < nowTime) {
        throw new AppError('This promotion code has expired.', 400, 'EXPIRED_PROMOTION');
      }

      if (promo.usedCount >= promo.usageLimit) {
        throw new AppError('This promotion code usage limit has been reached.', 400, 'PROMOTION_LIMIT_EXCEEDED');
      }

      if (subtotalPaise < promo.minimumOrderPaise) {
        throw new AppError(
          `Minimum order of ₹${(promo.minimumOrderPaise / 100).toFixed(2)} required for code ${promo.code}.`,
          400,
          'PROMOTION_MIN_ORDER'
        );
      }

      // Calculate discount
      if (promo.type === 'percentage') {
        discountPaise = Math.round((subtotalPaise * promo.value) / 100);
      } else {
        discountPaise = promo.value;
      }

      if (promo.maxDiscountPaise > 0 && discountPaise > promo.maxDiscountPaise) {
        discountPaise = promo.maxDiscountPaise;
      }

      // Ensure discount doesn't exceed subtotal
      if (discountPaise > subtotalPaise) {
        discountPaise = subtotalPaise;
      }

      appliedPromoCode = promo.code;
    }

    const totalPaise = Math.max(0, subtotalPaise - discountPaise);
    const nowIso = new Date().toISOString();

    // 4. Handle Simulated Payment Failure option for testing
    if (input.simulateFailure) {
      const failedPaymentId = `PAY-FAIL-${Date.now()}`;
      await AuditService.logAction(userId, 'PAYMENT_COMPLETED', { status: 'failed' });
      throw new AppError('Simulated payment declined by bank simulator.', 402, 'PAYMENT_FAILED');
    }

    // 5. Atomic Order Creation
    const orderId = `ORD-${10000 + runtime.orders.length + 1}`;
    const paymentId = `PAY-${10000 + runtime.payments.length + 1}`;

    const newOrder: Order = {
      id: orderId,
      userId,
      subtotalPaise,
      discountPaise,
      taxPaise: 0,
      totalPaise,
      currency: 'INR',
      status: 'completed',
      paymentId,
      createdAt: nowIso,
      promoCode: appliedPromoCode,
    };

    const newPayment: Payment = {
      id: paymentId,
      orderId,
      userId,
      amountPaise: totalPaise,
      currency: 'INR',
      method: totalPaise === 0 ? 'free' : input.paymentMethod,
      status: 'completed',
      createdAt: nowIso,
    };

    const newOrderItems: OrderItem[] = validatedItems.map((item, idx) => ({
      id: `ITEM-${10000 + runtime.orderItems.length + idx + 1}`,
      orderId,
      gameId: item.gameId,
      titleSnapshot: item.title,
      pricePaise: item.pricePaise,
      quantity: 1,
    }));

    const newLibraryEntries: GameLibrary[] = validatedItems.map((item, idx) => ({
      id: `LIB-${10000 + runtime.library.length + idx + 1}`,
      userId,
      gameId: item.gameId,
      orderId,
      acquiredAt: nowIso,
      status: 'owned',
    }));

    // Update persistence state atomically
    await PersistenceService.updateData((draft) => {
      draft.orders.push(newOrder);
      draft.payments.push(newPayment);
      draft.orderItems.push(...newOrderItems);
      draft.library.push(...newLibraryEntries);

      // Increment promotion count if applied
      if (appliedPromoCode) {
        const promo = draft.promotions.find((p) => p.code === appliedPromoCode);
        if (promo) promo.usedCount += 1;
      }

      // Clear customer cart
      const userCart = draft.carts.find((c) => c.userId === userId);
      if (userCart) {
        userCart.items = [];
        userCart.updatedAt = nowIso;
      }
    });

    // Write audit entries
    await AuditService.logAction(userId, 'ORDER_CREATED', { orderId, totalPaise });
    await AuditService.logAction(userId, 'PAYMENT_COMPLETED', { paymentId, method: newPayment.method });
    for (const item of validatedItems) {
      await AuditService.logAction(userId, 'GAME_ACQUIRED', { gameId: item.gameId, title: item.title });
    }

    return {
      order: newOrder,
      items: newOrderItems,
      payment: newPayment,
    };
  }

  public static async getCustomerOrders(userId: string): Promise<DetailedOrder[]> {
    const data = await PersistenceService.readData();
    const userOrders = data.orders.filter((o) => o.userId === userId);

    return userOrders
      .map((order) => {
        const items = data.orderItems.filter((i) => i.orderId === order.id);
        const payment = data.payments.find((p) => p.id === order.paymentId);
        if (!payment) return null;
        return {
          order,
          items,
          payment,
        };
      })
      .filter((o): o is DetailedOrder => o !== null)
      .sort((a, b) => new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime());
  }

  public static async getOrderById(userId: string, orderId: string): Promise<DetailedOrder> {
    const data = await PersistenceService.readData();
    const order = data.orders.find((o) => o.id === orderId);

    if (!order) {
      throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    // OWASP A01 IDOR check: Verify ownership
    if (order.userId !== userId) {
      throw new AppError('Access denied.', 403, 'FORBIDDEN');
    }

    const items = data.orderItems.filter((i) => i.orderId === order.id);
    const payment = data.payments.find((p) => p.id === order.paymentId);

    if (!payment) {
      throw new AppError('Payment details not found.', 404, 'PAYMENT_NOT_FOUND');
    }

    return { order, items, payment };
  }

  public static async getCustomerPayments(userId: string): Promise<Payment[]> {
    const data = await PersistenceService.readData();
    return data.payments
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
