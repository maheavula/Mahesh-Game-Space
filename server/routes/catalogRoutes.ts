import { Router } from 'express';
import { CatalogService } from '../services/catalogService.js';
import { requireAuth } from '../security/authorization.js';

const router = Router();

// GET /api/catalog/games
router.get('/games', async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search as string,
      categorySlug: req.query.categorySlug as string,
      categoryId: req.query.categoryId as string,
      platform: req.query.platform as string,
      minPricePaise: req.query.minPricePaise ? parseInt(req.query.minPricePaise as string, 10) : undefined,
      maxPricePaise: req.query.maxPricePaise ? parseInt(req.query.maxPricePaise as string, 10) : undefined,
      discountOnly: req.query.discountOnly === 'true',
      featured: req.query.featured === 'true',
      popular: req.query.popular === 'true',
      availability: req.query.availability as string,
      sortBy: req.query.sortBy as any,
    };

    const games = await CatalogService.getGames(filters);
    res.json({
      success: true,
      data: { games, count: games.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/catalog/search
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || req.query.search || '') as string;
    const games = await CatalogService.getGames({ search: q });
    res.json({
      success: true,
      data: { query: q, games, count: games.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/catalog/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await CatalogService.getCategories();
    res.json({
      success: true,
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/catalog/games/:id
router.get('/games/:id', async (req, res, next) => {
  try {
    const game = await CatalogService.getGameById(req.params.id);
    res.json({
      success: true,
      data: { game },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/catalog/wishlist
router.get('/wishlist', requireAuth, async (req, res, next) => {
  try {
    const games = await CatalogService.getWishlist(req.user!.id);
    res.json({
      success: true,
      data: { wishlist: games, count: games.length },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/catalog/wishlist/:gameId
router.post('/wishlist/:gameId', requireAuth, async (req, res, next) => {
  try {
    const games = await CatalogService.addToWishlist(req.user!.id, req.params.gameId);
    res.json({
      success: true,
      data: { wishlist: games, count: games.length },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/catalog/wishlist/:gameId
router.delete('/wishlist/:gameId', requireAuth, async (req, res, next) => {
  try {
    const games = await CatalogService.removeFromWishlist(req.user!.id, req.params.gameId);
    res.json({
      success: true,
      data: { wishlist: games, count: games.length },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/catalog/library
router.get('/library', requireAuth, async (req, res, next) => {
  try {
    const libraryItems = await CatalogService.getCustomerLibrary(req.user!.id);
    res.json({
      success: true,
      data: { library: libraryItems, count: libraryItems.length },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
