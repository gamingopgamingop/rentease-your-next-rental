import { Response, NextFunction } from 'express';
import { SmartPricingService } from './pricing.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const pricingService = new SmartPricingService();

export class PricingController {
  getSuggestion = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { category, location } = req.query;

    if (!category) {
      res.status(400).json({
        success: false,
        message: 'Category is required',
      });
      return;
    }

    const suggestion = await pricingService.suggestPrice(
      category as string,
      location as string
    );

    res.status(200).json({
      success: true,
      message: 'Price suggestion generated',
      data: suggestion,
    });
  });

  getOwnerAnalytics = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ownerId = req.user!.id;

    const analytics = await pricingService.getPricingAnalytics(ownerId);

    res.status(200).json({
      success: true,
      message: 'Pricing analytics retrieved',
      data: analytics,
    });
  });
}
