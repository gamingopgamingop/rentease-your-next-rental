import { Router } from 'express';
import { PricingController } from './pricing.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();
const pricingController = new PricingController();

// All routes require authentication
router.use(authenticate);

// GET /api/pricing/suggest?category=TOOLS&location=New York
router.get('/suggest', pricingController.getSuggestion);

// GET /api/pricing/analytics - Owner only
router.get('/analytics', authorize('OWNER'), pricingController.getOwnerAnalytics);

export default router;
