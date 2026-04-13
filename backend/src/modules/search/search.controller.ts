import { Response, NextFunction } from 'express';
import { SearchService } from './search.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const searchService = new SearchService();

export class SearchController {
  searchItems = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      location,
      availableFrom,
      availableTo,
    } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await searchService.searchItems({
      keyword: keyword as string,
      category: category as string,
      minPrice: minPrice as string,
      maxPrice: maxPrice as string,
      location: location as string,
      availableFrom: availableFrom as string,
      availableTo: availableTo as string,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: result.items,
      pagination: result.pagination,
    });
  });
}
