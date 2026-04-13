import { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const dashboardService = new DashboardService();

export class DashboardController {
  getOwnerDashboard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ownerId = req.user!.id;

    const dashboard = await dashboardService.getOwnerDashboard(ownerId);

    res.status(200).json({
      success: true,
      message: 'Owner dashboard retrieved successfully',
      data: dashboard,
    });
  });

  getRenterDashboard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const renterId = req.user!.id;

    const dashboard = await dashboardService.getRenterDashboard(renterId);

    res.status(200).json({
      success: true,
      message: 'Renter dashboard retrieved successfully',
      data: dashboard,
    });
  });
}
