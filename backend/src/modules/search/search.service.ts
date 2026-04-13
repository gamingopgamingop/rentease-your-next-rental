import prisma from '../../database/prisma.js';
import { Prisma } from '@prisma/client';

export class SearchService {
  async searchItems(params: {
    keyword?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    location?: string;
    availableFrom?: string;
    availableTo?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ItemWhereInput = {
      isAvailable: true,
    };

    // Keyword search (name, description)
    if (params.keyword) {
      where.OR = [
        { name: { contains: params.keyword, mode: 'insensitive' } },
        { description: { contains: params.keyword, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (params.category) {
      where.category = params.category as any;
    }

    // Price range filter
    if (params.minPrice || params.maxPrice) {
      where.pricePerDay = {};
      if (params.minPrice) {
        where.pricePerDay.gte = new Prisma.Decimal(params.minPrice);
      }
      if (params.maxPrice) {
        where.pricePerDay.lte = new Prisma.Decimal(params.maxPrice);
      }
    }

    // Location filter
    if (params.location) {
      where.location = { contains: params.location, mode: 'insensitive' };
    }

    // Availability date filter
    if (params.availableFrom || params.availableTo) {
      where.AND = [];
      
      if (params.availableFrom) {
        where.AND.push({
          OR: [
            { availableTo: null },
            { availableTo: { gte: new Date(params.availableFrom) } },
          ],
        });
      }

      if (params.availableTo) {
        where.AND.push({
          OR: [
            { availableFrom: null },
            { availableFrom: { lte: new Date(params.availableTo) } },
          ],
        });
      }
    }

    // Execute query
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
              location: true,
            },
          },
          _count: {
            select: { reviews: true },
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
}
