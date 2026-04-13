import { Response } from 'express';
import { NotificationService } from './notification.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const notificationService = new NotificationService();

export class NotificationController {
  getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getUserNotifications(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved',
      data: result,
    });
  });

  markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const success = await notificationService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      message: success ? 'Notification marked as read' : 'Notification not found',
    });
  });

  markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const count = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: `${count} notifications marked as read`,
    });
  });

  deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await notificationService.deleteNotification(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  });
}
