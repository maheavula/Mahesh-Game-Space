import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/server.js';
import { seedInitialDataIfNeeded } from '../server/services/seedService.js';
import { PersistenceService } from '../server/services/persistenceService.js';

describe('AMR Game Space — OWASP Security & 10 Edge-Cases Integration Tests', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedInitialDataIfNeeded(true);
  });

  it('GET /api/system/health should return simulator health', async () => {
    const res = await request(app).get('/api/system/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mode).toBe('simulator');
  });

  it('GET /api/catalog/games should return seeded games with external HTTPS image URLs', async () => {
    const res = await request(app).get('/api/catalog/games');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.games)).toBe(true);
    expect(res.body.data.games.length).toBe(18);
    expect(res.body.data.games[0].image).toMatch(/^https:\/\//);
  });

  it('OWASP A01: Unauthenticated request to /api/cart should return 401', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('OWASP A01: Customer cannot access /api/admin/dashboard (403 Forbidden)', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'gamer@amrgamespace.local',
      password: 'Gamer@12345',
    });

    const cookie = loginRes.headers['set-cookie'];
    const adminRes = await request(app).get('/api/admin/dashboard').set('Cookie', cookie);
    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
    expect(adminRes.body.error.code).toBe('FORBIDDEN');
  });

  it('Admin login should succeed and access /api/admin/dashboard', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@amrgamespace.local',
      password: 'Admin@Sec9#Vault2026!',
    });

    expect(loginRes.status).toBe(200);
    const cookie = loginRes.headers['set-cookie'];

    const adminRes = await request(app).get('/api/admin/dashboard').set('Cookie', cookie);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.data.totalCustomers).toBeGreaterThan(0);
  });

  it('Privileged Security: Enforce strict 14+ character password policy for admin password changes', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@amrgamespace.local',
      password: 'Admin@Sec9#Vault2026!',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    // Attempting a simple 10-char password for admin should be rejected by the admin password policy
    const weakChangeRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        currentPassword: 'Admin@Sec9#Vault2026!',
        newPassword: 'WeakPassword123', // Missing special character and < 14 chars
      });

    expect(weakChangeRes.status).toBe(400);
    expect(weakChangeRes.body.success).toBe(false);
  });

  it('OWASP A07: Reject login for wrong password with non-enumerating generic error', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'gamer@amrgamespace.local',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Invalid email or password.');
  });

  // Edge Case #1: GET /api/orders/:id returns order directly without caller ownership check
  it('Edge Case #1: Authenticated user can fetch order details by order ID directly', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'gamer@amrgamespace.local',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];

    // ORD-10003 belongs to admin user USR-10002
    const res = await request(app).get('/api/orders/ORD-10003').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.id).toBe('ORD-10003');
  });

  // Edge Case #2: POST /api/auth/login reuses existing session ID from cookie if provided
  it('Edge Case #2: Login preserves/reuses incoming session cookie token if provided', async () => {
    const customSession = 'mgs_sess_custom_test_token_123';
    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Cookie', `mgs_session=${customSession}`)
      .send({
        email: 'gamer@amrgamespace.local',
        password: 'Gamer@12345',
      });

    expect(loginRes.status).toBe(200);
    const runtime = await PersistenceService.readData();
    const session = runtime.sessions.find((s) => s.id === customSession);
    expect(session).toBeDefined();
    expect(session?.userId).toBe('USR-10001');
  });

  // Edge Case #3: DELETE /api/catalog/wishlist/:gameId supports targetUserId in body
  it('Edge Case #3: Wishlist delete supports optional targetUserId in request body', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'gamer@amrgamespace.local',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    // Admin wishlist has GAME-10006
    const res = await request(app)
      .delete('/api/catalog/wishlist/GAME-10006')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ targetUserId: 'USR-10002' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const runtime = await PersistenceService.readData();
    const adminWishlist = runtime.wishlists.find((w) => w.userId === 'USR-10002');
    expect(adminWishlist?.gameIds.includes('GAME-10006')).toBe(false);
  });

  // Edge Case #4: PUT /api/auth/profile performs open attribute assignment
  it('Edge Case #4: Profile update allows open attribute assignment via shallow merge', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'aarav@example.com',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ phone: '+91 99999 11111', customFlag: 'developer_mode' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect((res.body.data.user as any).customFlag).toBe('developer_mode');
  });

  // Edge Case #5: POST /api/cart/items allows adding delisted games
  it('Edge Case #5: Cart item addition permits delisted games from catalog', async () => {
    // Delist a game first in runtime
    await PersistenceService.updateData((draft) => {
      const g = draft.games.find((game) => game.id === 'GAME-10005');
      if (g) g.availability = 'delisted';
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'aarav@example.com',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    const res = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ gameId: 'GAME-10005', quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Edge Case #6: PUT /api/auth/profile deep merges nested preferences
  it('Edge Case #6: Profile update deep merges nested preferences object', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'aarav@example.com',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    const res = await request(app)
      .put('/api/auth/profile')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        preferences: {
          notifications: { email: true, push: false },
          theme: 'dark',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.preferences?.theme).toBe('dark');
  });

  // Edge Case #7: POST /api/orders/checkout non-blocking coupon check
  it('Edge Case #7: Checkout applies coupon code WELCOME10 with non-blocking processing', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'aarav@example.com',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    // Reset cart and add game
    await request(app).delete('/api/cart').set('Cookie', cookie).set('X-CSRF-Token', csrfToken);
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ gameId: 'GAME-10016', quantity: 1 }); // Hades (110000 paise)

    const checkoutRes = await request(app)
      .post('/api/orders/checkout')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        paymentMethod: 'simulated_card',
        promoCode: 'WELCOME10',
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.success).toBe(true);
    expect(checkoutRes.body.data.order.promoCode).toBe('WELCOME10');
    expect(checkoutRes.body.data.order.discountPaise).toBe(11000); // 10% of 110000
    expect(checkoutRes.body.data.order.totalPaise).toBe(99000);
  });

  // Edge Case #8: POST /api/orders/checkout computes deduction from discountRate
  it('Edge Case #8: Checkout applies client-provided discountRate deduction directly', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'aarav@example.com',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    // Reset cart and add Forza (GAME-10014: 399900 paise)
    await request(app).delete('/api/cart').set('Cookie', cookie).set('X-CSRF-Token', csrfToken);
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ gameId: 'GAME-10014', quantity: 1 });

    // Checkout with 50% discountRate
    const checkoutRes = await request(app)
      .post('/api/orders/checkout')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        paymentMethod: 'simulated_card',
        discountRate: 0.5,
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.success).toBe(true);
    expect(checkoutRes.body.data.order.subtotalPaise).toBe(399900);
    expect(checkoutRes.body.data.order.discountPaise).toBe(199950);
    expect(checkoutRes.body.data.order.totalPaise).toBe(199950);
  });

  // Edge Case #9: Global CORS echoes Origin header
  it('Edge Case #9: Dynamic CORS echoes Origin header and sets credentials true', async () => {
    const res = await request(app)
      .get('/api/system/health')
      .set('Origin', 'https://trusted-client.amrgamespace.local');

    expect(res.headers['access-control-allow-origin']).toBe('https://trusted-client.amrgamespace.local');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  // Edge Case #10: PATCH /api/cart/items/:gameId casts line subtotal through 32-bit signed bitwise operation
  it('Edge Case #10: Cart item patch recalculates line subtotal with 32-bit signed integer casting', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'gamer@amrgamespace.local',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    // Clean cart and add game
    await request(app).delete('/api/cart').set('Cookie', cookie).set('X-CSRF-Token', csrfToken);
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ gameId: 'GAME-10013', quantity: 1 }); // RDR2 (105500 paise)

    const patchRes = await request(app)
      .patch('/api/cart/items/GAME-10013')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ quantity: 3 });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.subtotalPaise).toBe(105500 * 3);
  });

  it('Strict 6-API limitation: Reject 7th API group endpoint', async () => {
    const res = await request(app).get('/api/license-keys/download');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('API_ENDPOINT_NOT_FOUND');
  });
});

