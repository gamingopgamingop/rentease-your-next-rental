import prisma from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ReviewService {
  async createReview(
    reviewerId: string,
    itemId: string,
    rating: number,
    comment?: string
  ) {
    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Check if user has completed booking for this item
    const completedBooking = await prisma.booking.findFirst({
      where: {
        itemId,
        renterId: reviewerId,
        status: 'COMPLETED',
      },
    });

    if (!completedBooking) {
      throw new AppError('You can only review items from completed bookings', 400);
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        itemId_reviewerId: {
          itemId,
          reviewerId,
        },
      },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this item', 400);
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        itemId,
        reviewerId,
        rating,
        comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        item: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return review;
  }

  async getItemReviews(itemId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, averageRating] = await Promise.all([
      prisma.review.findMany({
        where: { itemId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { itemId } }),
      prisma.review.aggregate({
        where: { itemId },
        _avg: {
          rating: true,
        },
      }),
    ]);

    return {
      reviews,
      averageRating: averageRating._avg.rating || 0,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserReview(
    reviewId: string,
    reviewerId: string,
    data: { rating?: number; comment?: string }
  ) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, reviewerId },
    });

    if (!review) {
      throw new AppError('Review not found or you do not have permission', 404);
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data,
    });

    return updatedReview;
  }

  async deleteUserReview(reviewId: string, reviewerId: string) {
    const review = await prisma.review.findFirst({
      where: { id: reviewId, reviewerId },
    });

    if (!review) {
      throw new AppError('Review not found or you do not have permission', 404);
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return { success: true, message: 'Review deleted successfully' };
  }
}
