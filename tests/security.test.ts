import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/server.js';
import { seedInitialDataIfNeeded } from '../server/services/seedService.js';

describe('Mahesh Game Space — OWASP Security & 6-API Integration Tests', () => {
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

  it('GET /api/catalog/games should return seeded games', async () => {
    const res = await request(app).get('/api/catalog/games');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.games)).toBe(true);
    expect(res.body.data.games.length).toBeGreaterThanOrEqual(12);
  });

  it('OWASP A01: Unauthenticated request to /api/cart should return 401', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('OWASP A01: Customer cannot access /api/admin/dashboard (403 Forbidden)', async () => {
    // 1. Login as customer
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'gamer@maheshgamespace.local',
      password: 'Gamer@12345',
    });

    const cookie = loginRes.headers['set-cookie'];

    // 2. Try accessing admin endpoint with customer cookie
    const adminRes = await request(app).get('/api/admin/dashboard').set('Cookie', cookie);
    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
    expect(adminRes.body.error.code).toBe('FORBIDDEN');
  });

  it('Admin login should succeed and access /api/admin/dashboard', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin@maheshgamespace.local',
      password: 'Admin@12345',
    });

    expect(loginRes.status).toBe(200);
    const cookie = loginRes.headers['set-cookie'];

    const adminRes = await request(app).get('/api/admin/dashboard').set('Cookie', cookie);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.data.totalCustomers).toBeGreaterThan(0);
  });

  it('OWASP A07: Reject login for wrong password with non-enumerating generic error', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'gamer@maheshgamespace.local',
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Invalid email or password.');
  });

  it('Server-Authoritative Checkout: Ignore client-submitted totals and revalidate server side', async () => {
    // Login as gamer
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'gamer@maheshgamespace.local',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    // Clear pre-seeded cart items
    await request(app)
      .delete('/api/cart')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken);

    // Add game to cart
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ gameId: 'GAME-10006' }); // Rust

    // Perform checkout attempt with tampered fake client total
    const checkoutRes = await request(app)
      .post('/api/orders/checkout')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        paymentMethod: 'simulated_card',
        clientTotal: 1, // Fake 1 paise total submitted by malicious client
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.success).toBe(true);
    // Backend must have ignored clientTotal and charged full server price (149900 paise = ₹1,499.00)
    expect(checkoutRes.body.data.order.totalPaise).toBe(149900);
  });

  it('Prevent duplicate checkout of already-owned game (GAME_ALREADY_OWNED)', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'gamer@maheshgamespace.local',
      password: 'Gamer@12345',
    });
    const cookie = loginRes.headers['set-cookie'];
    const csrfToken = loginRes.body.data.csrfToken;

    // Attempt to add already owned game (Cyberpunk 2077 - GAME-10010) to cart
    const addRes = await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ gameId: 'GAME-10010' });

    expect(addRes.status).toBe(400);
    expect(addRes.body.success).toBe(false);
    expect(addRes.body.error.code).toBe('GAME_ALREADY_OWNED');
  });

  it('Strict 6-API limitation: Reject 7th API group endpoint', async () => {
    const res = await request(app).get('/api/license-keys/download');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('API_ENDPOINT_NOT_FOUND');
  });
});
