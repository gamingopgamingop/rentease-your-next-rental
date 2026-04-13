import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();
const adminController = new AdminController();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// GET /api/admin/items
router.get('/items', adminController.getItems);

// DELETE /api/admin/items/:id
router.delete('/items/:id', adminController.removeItem);

// POST /api/admin/users/:id/ban
router.post('/users/:id/ban', adminController.banUser);

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

export default router;
