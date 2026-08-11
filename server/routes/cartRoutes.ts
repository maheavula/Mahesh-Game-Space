import { Router } from 'express';
import { CartService } from '../services/cartService.js';
import { requireAuth } from '../security/authorization.js';
import { validateBody, cartItemSchema } from '../security/inputValidation.js';

const router = Router();

// All cart endpoints require authentication
router.use(requireAuth);

// GET /api/cart
router.get('/', async (req, res, next) => {
  try {
    const cartData = await CartService.getCart(req.user!.id);
    res.json({
      success: true,
      data: cartData,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/cart/items
router.post('/items', validateBody(cartItemSchema), async (req, res, next) => {
  try {
    const { gameId } = req.body;
    const cartData = await CartService.addItem(req.user!.id, gameId);
    res.json({
      success: true,
      data: cartData,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/cart/items/:gameId
router.patch('/items/:gameId', async (req, res, next) => {
  try {
    // Digital games always have quantity = 1 per PRD
    const cartData = await CartService.addItem(req.user!.id, req.params.gameId);
    res.json({
      success: true,
      data: cartData,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart/items/:gameId
router.delete('/items/:gameId', async (req, res, next) => {
  try {
    const cartData = await CartService.removeItem(req.user!.id, req.params.gameId);
    res.json({
      success: true,
      data: cartData,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart
router.delete('/', async (req, res, next) => {
  try {
    const cartData = await CartService.clearCart(req.user!.id);
    res.json({
      success: true,
      data: cartData,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
