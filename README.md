# Mahesh Game Space — Next-Gen Gaming Marketplace Simulator

![Mahesh Game Space](/public/favicon.svg)

> **Tagline**: Discover. Collect. Play.  
> **Product Type**: Full-Stack Gaming Marketplace Simulator & Digital Storefront  
> **Application Mode**: Local/demo simulation  
> **Frontend**: React + TypeScript + Vite + Tailwind CSS + Ultra-Glassmorphism UI  
> **Backend**: Node.js + Express + TypeScript  
> **Persistence**: `/data/runtime.json` (Atomic Mutex File Queue)  
> **API Limitation**: Exactly 6 API groups  
> **Currency**: Indian Rupees (₹ INR), stored canonically as integer Paise  

---

## 📦 How to Share & Export Project (Lightweight Sharing)

To share **Mahesh Game Space** with others via Email, Google Drive, WhatsApp, or Zip file:

1. Simply **Zip the project folder** (`Mahesh Game Space`).
2. Thanks to `.gitignore`, `node_modules/` and `dist/` will be excluded, making the zip file **ultra-small (~2 MB)**!
3. Anyone receiving the zip file simply unzips it and runs:
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173` in any browser — the application will automatically seed initial data on first boot and run immediately!

---

## 1. Executive Summary

**Mahesh Game Space** is a full-stack digital gaming storefront simulator where customers can discover popular commercial games, search and filter catalog titles, save games to a wishlist, manage a shopping cart, complete simulated checkouts with promo codes, inspect purchase receipts, view owned games in a personal digital library, and manage account security.

Administrators have access to a dedicated Admin Console to monitor marketplace revenue analytics, manage customer accounts (with session invalidation on suspension), edit catalog titles and prices, configure promotional discount codes, inspect orders and payment logs, and review security audit trails.

> [!IMPORTANT]
> **Simulator Disclaimer**: Mahesh Game Space is a local simulation. It does not integrate with Steam, Epic Games, PlayStation, Xbox, or real payment gateways. All purchases, game ownership, licenses, and payments are 100% simulated locally in `/data/runtime.json`.

---

## 2. Tech Stack & Architecture

- **Frontend**: Vite, React 18, TypeScript, Tailwind CSS, Lucide Icons, Ultra-Glassmorphism UI
- **Backend**: Express 4, Node.js, TypeScript (`tsx`)
- **Persistence**: Single JSON database file `/data/runtime.json` managed by an async mutex queue (`persistenceService.ts`) with safe atomic `.tmp` file validation.
- **Security**: Bcrypt password hashing, HTTP-Only session cookies (`SameSite=Lax`), CSRF double-submit cookies, rate limiters, Helmet security headers.

---

## 3. Strict 6-API Architecture

The backend strictly exposes **exactly six logical API groups**:

| API Group | Base Route | Responsibilities & Endpoints |
| :--- | :--- | :--- |
| **1. Auth** | `/api/auth` | `POST /signup`, `POST /login`, `POST /logout`, `GET /me`, `PUT /profile`, `POST /change-password` |
| **2. Catalog** | `/api/catalog` | `GET /games`, `GET /games/:id`, `GET /categories`, `GET /search`, `GET /wishlist`, `POST /wishlist/:id`, `DELETE /wishlist/:id`, `GET /library` |
| **3. Cart** | `/api/cart` | `GET /`, `POST /items`, `PATCH /items/:gameId`, `DELETE /items/:gameId`, `DELETE /` |
| **4. Orders** | `/api/orders` | `POST /checkout`, `GET /`, `GET /:id`, `GET /payments`, `GET /payments/:id` |
| **5. Admin** | `/api/admin` | `GET /dashboard`, `GET/PATCH /customers`, `GET/POST/PUT/PATCH/DELETE /games`, `GET/POST/PUT /categories`, `GET /orders`, `GET /payments`, `GET/POST/PUT/PATCH /promotions`, `GET /audit` |
| **6. System** | `/api/system` | `GET /health`, `GET /session`, `POST /session/refresh`, `GET /info` |

---

## 4. Demo Credentials

### Administrator Account
- **Email**: `admin@maheshgamespace.local`
- **Password**: `Admin@12345`
- **Role**: `admin`

### Customer Demo Account
- **Email**: `gamer@maheshgamespace.local`
- **Password**: `Gamer@12345`
- **Role**: `customer`

---

## 5. Running & Testing Commands

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack dev server
npm run dev

# 3. Run typecheck & automated tests
npm run typecheck
npm run test

# 4. Build production bundle
npm run build
npm run start
```
