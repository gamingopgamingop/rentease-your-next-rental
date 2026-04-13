import prisma from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Prisma } from '@prisma/client';

export class ItemService {
  async createItem(ownerId: string, data: {
    name: string;
    category: string;
    description?: string;
    condition?: string;
    pricePerDay: number;
    location?: string;
    imageUrl?: string;
    availableFrom?: string;
    availableTo?: string;
  }) {
    const item = await prisma.item.create({
      data: {
        ownerId,
        name: data.name,
        category: data.category as any,
        description: data.description,
        condition: (data.condition || 'GOOD') as any,
        pricePerDay: new Prisma.Decimal(data.pricePerDay),
        location: data.location,
        imageUrl: data.imageUrl,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
        availableTo: data.availableTo ? new Date(data.availableTo) : null,
      },
    });

    return item;
  }

  async getItemById(itemId: string) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    return item;
  }

  async getOwnerItems(ownerId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: { ownerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { bookings: true, reviews: true },
          },
        },
      }),
      prisma.item.count({ where: { ownerId } }),
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

  async updateItem(
    itemId: string,
    ownerId: string,
    data: {
      name?: string;
      category?: string;
      description?: string;
      condition?: string;
      pricePerDay?: number;
      location?: string;
      imageUrl?: string;
      availableFrom?: string;
      availableTo?: string;
      isAvailable?: boolean;
    }
  ) {
    // Verify ownership
    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, ownerId },
    });

    if (!existingItem) {
      throw new AppError('Item not found or you do not have permission', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.pricePerDay !== undefined) updateData.pricePerDay = new Prisma.Decimal(data.pricePerDay);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.availableFrom !== undefined) updateData.availableFrom = new Date(data.availableFrom);
    if (data.availableTo !== undefined) updateData.availableTo = new Date(data.availableTo);
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

    const item = await prisma.item.update({
      where: { id: itemId },
      data: updateData,
    });

    return item;
  }

  async deleteItem(itemId: string, ownerId: string) {
    // Verify ownership
    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, ownerId },
    });

    if (!existingItem) {
      throw new AppError('Item not found or you do not have permission', 404);
    }

    await prisma.item.delete({
      where: { id: itemId },
    });

    return { success: true, message: 'Item deleted successfully' };
  }
}
