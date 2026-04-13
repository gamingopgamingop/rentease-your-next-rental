import prisma from '../../database/prisma.js';

export class RecommendationService {
  // Get personalized recommendations for a user
  async getPersonalizedRecommendations(userId: string, limit: number = 10) {
    // Get user's booking history
    const userBookings = await prisma.booking.findMany({
      where: {
        renterId: userId,
        status: 'COMPLETED',
      },
      select: {
        item: {
          select: {
            id: true,
            category: true,
          },
        },
      },
      take: 20,
    });

    // Extract categories user has rented
    const rentedCategories = userBookings.map((b) => b.item.category);

    // Get unique categories
    const uniqueCategories = [...new Set(rentedCategories)];

    if (uniqueCategories.length === 0) {
      // If no history, return popular items
      return this.getPopularItems(limit);
    }

    // Find items in same categories, excluding already rented
    const recommendations = await prisma.item.findMany({
      where: {
        category: {
          in: uniqueCategories as any[],
        },
        isAvailable: true,
        id: {
          notIn: userBookings.map((b) => b.item.id),
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        {
          bookings: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: limit,
    });

    return {
      items: recommendations,
      reason: 'Based on your rental history',
    };
  }

  // Get popular items (most booked)
  async getPopularItems(limit: number = 10) {
    const popularItems = await prisma.item.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return {
      items: popularItems,
      reason: 'Most popular items',
    };
  }

  // Get similar items based on a specific item
  async getSimilarItems(itemId: string, limit: number = 5) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new Error('Item not found');
    }

    const similarItems = await prisma.item.findMany({
      where: {
        category: item.category,
        isAvailable: true,
        id: {
          not: itemId,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        {
          reviews: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: limit,
    });

    return {
      items: similarItems,
      reason: `Similar to ${item.name}`,
    };
  }

  // Get trending items (most booked in last 7 days)
  async getTrendingItems(limit: number = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingItems = await prisma.item.findMany({
      where: {
        isAvailable: true,
        bookings: {
          some: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return {
      items: trendingItems,
      reason: 'Trending this week',
    };
  }

  // Get recommendations by location
  async getLocalRecommendations(location: string, limit: number = 10) {
    const localItems = await prisma.item.findMany({
      where: {
        isAvailable: true,
        location: {
          contains: location,
          mode: 'insensitive',
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: [
        {
          bookings: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: limit,
    });

    return {
      items: localItems,
      reason: `Popular in ${location}`,
    };
  }
}
