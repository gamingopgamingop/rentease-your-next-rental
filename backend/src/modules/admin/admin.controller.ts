import { Response } from 'express';
import { AdminService } from './admin.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const adminService = new AdminService();

export class AdminController {
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await adminService.getAllUsers(page, limit);

    res.status(200).json({
      success: true,
      message: 'Users retrieved',
      data: result,
    });
  });

  getItems = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      category: req.query.category as string,
      isAvailable: req.query.isAvailable === 'true' ? true : req.query.isAvailable === 'false' ? false : undefined,
    };

    const result = await adminService.getAllItems(filters);

    res.status(200).json({
      success: true,
      message: 'Items retrieved',
      data: result,
    });
  });

  removeItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await adminService.removeItem(id, reason);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  });

  banUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await adminService.banUser(id, reason);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await adminService.getPlatformStats();

    res.status(200).json({
      success: true,
      message: 'Platform statistics',
      data: stats,
    });
  });
}
