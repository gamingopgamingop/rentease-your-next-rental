import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();
const dashboardController = new DashboardController();

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/owner
router.get('/owner', authorize('OWNER'), dashboardController.getOwnerDashboard);

// GET /api/dashboard/renter
router.get('/renter', authorize('RENTER'), dashboardController.getRenterDashboard);

export default router;
