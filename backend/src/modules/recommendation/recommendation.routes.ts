import { Router } from 'express';
import { RecommendationController } from './recommendation.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const recommendationController = new RecommendationController();

// All routes require authentication
router.use(authenticate);

// GET /api/recommendations/personalized
router.get('/personalized', recommendationController.getPersonalized);

// GET /api/recommendations/popular
router.get('/popular', recommendationController.getPopular);

// GET /api/recommendations/similar/:itemId
router.get('/similar/:itemId', recommendationController.getSimilar);

// GET /api/recommendations/trending
router.get('/trending', recommendationController.getTrending);

// GET /api/recommendations/local/:location
router.get('/local/:location', recommendationController.getLocal);

export default router;
