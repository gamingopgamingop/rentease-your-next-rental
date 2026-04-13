import prisma from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class DashboardService {
  async getOwnerDashboard(ownerId: string) {
    const [totalItems, bookings, earnings] = await Promise.all([
      // Total items
      prisma.item.count({
        where: { ownerId },
      }),

      // All bookings for owner's items
      prisma.booking.findMany({
        where: { ownerId },
        include: {
          item: {
            select: {
              name: true,
            },
          },
          renter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Total earnings (from completed bookings)
      prisma.booking.aggregate({
        where: {
          ownerId,
          status: 'COMPLETED',
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    // Get bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: { ownerId },
      _count: {
        status: true,
      },
    });

    return {
      totalItems,
      recentBookings: bookings,
      totalEarnings: earnings._sum.totalPrice || 0,
      bookingsByStatus: bookingsByStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async getRenterDashboard(renterId: string) {
    const [activeBookings, completedBookings, totalSpent] = await Promise.all([
      // Active bookings (pending + confirmed)
      prisma.booking.findMany({
        where: {
          renterId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          item: {
            select: {
              name: true,
              imageUrl: true,
              pricePerDay: true,
            },
          },
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { startDate: 'asc' },
      }),

      // Completed bookings history
      prisma.booking.findMany({
        where: {
          renterId,
          status: 'COMPLETED',
        },
        include: {
          item: {
            select: {
              name: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { endDate: 'desc' },
        take: 10,
      }),

      // Total spent
      prisma.payment.aggregate({
        where: {
          payerId: renterId,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      activeBookings,
      completedBookings,
      totalSpent: totalSpent._sum.amount || 0,
    };
  }
}
