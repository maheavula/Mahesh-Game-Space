import { Router } from 'express';
import { AdminService } from '../services/adminService.js';
import { CatalogService } from '../services/catalogService.js';
import { PersistenceService } from '../services/persistenceService.js';
import { requireAuth, requireAdmin } from '../security/authorization.js';
import { validateBody, gameAdminSchema, categoryAdminSchema, promotionAdminSchema } from '../security/inputValidation.js';
import { AppError } from '../security/errorHandler.js';

const router = Router();

// All admin endpoints require auth + admin role
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const stats = await AdminService.getDashboardStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/customers
router.get('/customers', async (req, res, next) => {
  try {
    const customers = await AdminService.getCustomers();
    res.json({
      success: true,
      data: { customers, count: customers.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/customers/:id
router.get('/customers/:id', async (req, res, next) => {
  try {
    const customers = await AdminService.getCustomers();
    const customer = customers.find((c) => c.id === req.params.id);
    if (!customer) throw new AppError('Customer not found.', 404, 'USER_NOT_FOUND');
    res.json({
      success: true,
      data: { customer },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/customers/:id/status
router.patch('/customers/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (status !== 'active' && status !== 'suspended') {
      throw new AppError('Invalid status value. Must be active or suspended.', 400, 'INVALID_STATUS');
    }
    const updated = await AdminService.updateCustomerStatus(req.user!.id, req.params.id, status);
    res.json({
      success: true,
      data: { customer: updated },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/games
router.get('/games', async (req, res, next) => {
  try {
    const data = await PersistenceService.readData();
    res.json({
      success: true,
      data: { games: data.games, count: data.games.length },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/games
router.post('/games', validateBody(gameAdminSchema), async (req, res, next) => {
  try {
    const game = await AdminService.createGame(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      data: { game },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/games/:id
router.put('/games/:id', validateBody(gameAdminSchema), async (req, res, next) => {
  try {
    const game = await AdminService.updateGame(req.user!.id, req.params.id, req.body);
    res.json({
      success: true,
      data: { game },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/games/:id/status
router.patch('/games/:id/status', async (req, res, next) => {
  try {
    const { availability } = req.body;
    if (!['available', 'unavailable', 'delisted'].includes(availability)) {
      throw new AppError('Invalid availability option.', 400, 'INVALID_AVAILABILITY');
    }
    const game = await AdminService.updateGameStatus(req.user!.id, req.params.id, availability);
    res.json({
      success: true,
      data: { game },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/games/:id
router.delete('/games/:id', async (req, res, next) => {
  try {
    const game = await AdminService.updateGameStatus(req.user!.id, req.params.id, 'delisted');
    res.json({
      success: true,
      data: { message: 'Game has been marked as delisted.', game },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/categories
router.get('/categories', async (req, res, next) => {
  try {
    const data = await PersistenceService.readData();
    res.json({
      success: true,
      data: { categories: data.categories },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/categories
router.post('/categories', validateBody(categoryAdminSchema), async (req, res, next) => {
  try {
    const category = await AdminService.createCategory(req.user!.id, req.body.name, req.body.slug);
    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', validateBody(categoryAdminSchema), async (req, res, next) => {
  try {
    const updated = await PersistenceService.updateData((draft) => {
      const cat = draft.categories.find((c) => c.id === req.params.id);
      if (!cat) throw new AppError('Category not found.', 404, 'NOT_FOUND');
      cat.name = req.body.name;
      if (req.body.slug) cat.slug = req.body.slug;
      if (req.body.status) cat.status = req.body.status;
      return cat;
    });

    res.json({
      success: true,
      data: { category: updated },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res, next) => {
  try {
    const data = await PersistenceService.readData();
    res.json({
      success: true,
      data: { orders: data.orders, count: data.orders.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/orders/:id
router.get('/orders/:id', async (req, res, next) => {
  try {
    const data = await PersistenceService.readData();
    const order = data.orders.find((o) => o.id === req.params.id);
    if (!order) throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');

    const items = data.orderItems.filter((i) => i.orderId === order.id);
    const payment = data.payments.find((p) => p.id === order.paymentId);
    const customer = data.users.find((u) => u.id === order.userId);

    res.json({
      success: true,
      data: { order, items, payment, customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/payments
router.get('/payments', async (req, res, next) => {
  try {
    const data = await PersistenceService.readData();
    res.json({
      success: true,
      data: { payments: data.payments, count: data.payments.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/promotions
router.get('/promotions', async (req, res, next) => {
  try {
    const data = await PersistenceService.readData();
    res.json({
      success: true,
      data: { promotions: data.promotions },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/promotions
router.post('/promotions', validateBody(promotionAdminSchema), async (req, res, next) => {
  try {
    const promotion = await AdminService.createPromotion(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      data: { promotion },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/promotions/:id
router.put('/promotions/:id', validateBody(promotionAdminSchema), async (req, res, next) => {
  try {
    const updated = await PersistenceService.updateData((draft) => {
      const promo = draft.promotions.find((p) => p.id === req.params.id);
      if (!promo) throw new AppError('Promotion not found.', 404, 'NOT_FOUND');
      Object.assign(promo, req.body);
      return promo;
    });
    res.json({
      success: true,
      data: { promotion: updated },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/promotions/:id/status
router.patch('/promotions/:id/status', async (req, res, next) => {
  try {
    const { active } = req.body;
    const updated = await PersistenceService.updateData((draft) => {
      const promo = draft.promotions.find((p) => p.id === req.params.id);
      if (!promo) throw new AppError('Promotion not found.', 404, 'NOT_FOUND');
      promo.active = Boolean(active);
      return promo;
    });
    res.json({
      success: true,
      data: { promotion: updated },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit
router.get('/audit', async (req, res, next) => {
  try {
    const logs = await AdminService.getAuditLogs();
    res.json({
      success: true,
      data: { auditLogs: logs, count: logs.length },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
