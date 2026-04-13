import prisma from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AdminService {
  // Get all users with pagination
  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          location: true,
          createdAt: true,
          _count: {
            select: {
              ownedItems: true,
              bookings: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get all items with filters
  async getAllItems(filters: {
    page?: number;
    limit?: number;
    category?: string;
    isAvailable?: boolean;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.item.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Remove abusive content (delete item)
  async removeItem(itemId: string, reason: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Delete item and related data
    await prisma.item.delete({
      where: { id: itemId },
    });

    return {
      success: true,
      message: `Item "${item.name}" removed`,
      reason,
    };
  }

  // Ban user
  async banUser(userId: string, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // In production, you'd add a isBanned field to user model
    // For now, we'll delete the user and all their data
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: `User "${user.name}" has been banned`,
      reason,
    };
  }

  // Get platform statistics
  async getPlatformStats() {
    const [
      totalUsers,
      totalItems,
      totalBookings,
      totalReviews,
      totalPayments,
      activeUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.booking.count(),
      prisma.review.count(),
      prisma.payment.count(),
      // Users active in last 30 days
      prisma.user.count({
        where: {
          bookings: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      }),
    ]);

    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });

    return {
      totalUsers,
      totalItems,
      totalBookings,
      totalReviews,
      activeUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
