import { Response } from 'express';
import { RecommendationService } from './recommendation.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const recommendationService = new RecommendationService();

export class RecommendationController {
  getPersonalized = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;

    const recommendations = await recommendationService.getPersonalizedRecommendations(
      userId,
      limit
    );

    res.status(200).json({
      success: true,
      message: 'Personalized recommendations',
      data: recommendations,
    });
  });

  getPopular = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const popular = await recommendationService.getPopularItems(limit);

    res.status(200).json({
      success: true,
      message: 'Popular items',
      data: popular,
    });
  });

  getSimilar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { itemId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const similar = await recommendationService.getSimilarItems(itemId, limit);

    res.status(200).json({
      success: true,
      message: 'Similar items',
      data: similar,
    });
  });

  getTrending = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const trending = await recommendationService.getTrendingItems(limit);

    res.status(200).json({
      success: true,
      message: 'Trending items',
      data: trending,
    });
  });

  getLocal = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { location } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const local = await recommendationService.getLocalRecommendations(location, limit);

    res.status(200).json({
      success: true,
      message: 'Local recommendations',
      data: local,
    });
  });
}
