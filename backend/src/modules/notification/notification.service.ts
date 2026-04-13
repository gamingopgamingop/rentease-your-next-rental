import prisma from '../../database/prisma.js';
import logger from '../../utils/logger.js';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
}

export class NotificationService {
  // Create in-app notification
  async createNotification(data: NotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type as any,
        data: data.data || {},
      },
    });

    // Mock email notification (in production, integrate with SendGrid/AWS SES)
    await this.sendMockEmail(data);

    logger.info(`Notification sent to user ${data.userId}: ${data.title}`);

    return notification;
  }

  // Get user notifications
  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });

    return notification.count > 0;
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return result.count;
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    return true;
  }

  // Booking confirmed notification
  async sendBookingConfirmed(userId: string, bookingId: string, itemName: string) {
    return this.createNotification({
      userId,
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for "${itemName}" has been confirmed.`,
      type: 'BOOKING_CONFIRMED',
      data: { bookingId, itemName },
    });
  }

  // Booking cancelled notification
  async sendBookingCancelled(userId: string, bookingId: string, itemName: string, reason?: string) {
    return this.createNotification({
      userId,
      title: 'Booking Cancelled',
      message: `Your booking for "${itemName}" has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'BOOKING_CANCELLED',
      data: { bookingId, itemName, reason },
    });
  }

  // Booking pending notification
  async sendBookingPending(userId: string, bookingId: string, itemName: string) {
    return this.createNotification({
      userId,
      title: 'Booking Request Received',
      message: `Your booking request for "${itemName}" is pending approval.`,
      type: 'BOOKING_PENDING',
      data: { bookingId, itemName },
    });
  }

  // Payment success notification
  async sendPaymentSuccess(userId: string, amount: number, transactionId: string) {
    return this.createNotification({
      userId,
      title: 'Payment Successful 💰',
      message: `Your payment of $${amount} has been processed successfully.`,
      type: 'PAYMENT_SUCCESS',
      data: { amount, transactionId },
    });
  }

  // Payment failed notification
  async sendPaymentFailed(userId: string, amount: number, reason: string) {
    return this.createNotification({
      userId,
      title: 'Payment Failed ❌',
      message: `Your payment of $${amount} failed. ${reason}`,
      type: 'PAYMENT_FAILED',
      data: { amount, reason },
    });
  }

  // Review received notification
  async sendReviewReceived(userId: string, itemName: string, rating: number) {
    return this.createNotification({
      userId,
      title: 'New Review Received ⭐',
      message: `You received a ${rating}-star review for "${itemName}".`,
      type: 'REVIEW_RECEIVED',
      data: { itemName, rating },
    });
  }

  // Mock email sender (replace with actual email service in production)
  private async sendMockEmail(data: NotificationData) {
    // In production, integrate with:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Nodemailer
    
    logger.info(`[MOCK EMAIL] To: user@example.com | Subject: ${data.title} | Body: ${data.message}`);
    
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    return true;
  }
}
