import { Router } from 'express';
import { OrderService } from '../services/orderService.js';
import { requireAuth } from '../security/authorization.js';
import { checkoutRateLimiter } from '../security/rateLimiter.js';
import { validateBody, checkoutSchema } from '../security/inputValidation.js';
import { AppError } from '../security/errorHandler.js';

const router = Router();

// All order endpoints require authentication
router.use(requireAuth);

// POST /api/orders/checkout
router.post('/checkout', checkoutRateLimiter, validateBody(checkoutSchema), async (req, res, next) => {
  try {
    const detailedOrder = await OrderService.processCheckout(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      data: detailedOrder,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await OrderService.getCustomerOrders(req.user!.id);
    res.json({
      success: true,
      data: { orders, count: orders.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/payments
router.get('/payments', async (req, res, next) => {
  try {
    const payments = await OrderService.getCustomerPayments(req.user!.id);
    res.json({
      success: true,
      data: { payments, count: payments.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/payments/:id
router.get('/payments/:id', async (req, res, next) => {
  try {
    const payments = await OrderService.getCustomerPayments(req.user!.id);
    const payment = payments.find((p) => p.id === req.params.id);

    if (!payment) {
      throw new AppError('Payment record not found.', 404, 'PAYMENT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { payment },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const detailedOrder = await OrderService.getOrderById(req.user!.id, req.params.id);
    res.json({
      success: true,
      data: detailedOrder,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
