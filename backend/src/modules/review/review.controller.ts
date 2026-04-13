import { Response, NextFunction } from 'express';
import { ReviewService } from './review.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const reviewService = new ReviewService();

export class ReviewController {
  createReview = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reviewerId = req.user!.id;
    const { itemId, rating, comment } = req.body;

    const review = await reviewService.createReview(
      reviewerId,
      itemId,
      rating,
      comment
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  });

  getItemReviews = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await reviewService.getItemReviews(itemId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: result.reviews,
      averageRating: result.averageRating,
      pagination: result.pagination,
    });
  });

  updateReview = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reviewerId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    const review = await reviewService.updateUserReview(id, reviewerId, updateData);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  });

  deleteReview = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const reviewerId = req.user!.id;
    const { id } = req.params;

    const result = await reviewService.deleteUserReview(id, reviewerId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
