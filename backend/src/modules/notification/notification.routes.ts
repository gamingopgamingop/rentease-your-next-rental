import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const notificationController = new NotificationController();

// All routes require authentication
router.use(authenticate);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// PUT /api/notifications/:id/read
router.put('/:id/read', notificationController.markAsRead);

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', notificationController.markAllAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

export default router;
