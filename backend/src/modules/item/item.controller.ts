import { Response, NextFunction } from 'express';
import { ItemService } from './item.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const itemService = new ItemService();

export class ItemController {
  createItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ownerId = req.user!.id;
    const itemData = req.body;

    const item = await itemService.createItem(ownerId, itemData);

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  });

  getItemById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const item = await itemService.getItemById(id);

    res.status(200).json({
      success: true,
      message: 'Item retrieved successfully',
      data: item,
    });
  });

  getOwnerItems = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ownerId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await itemService.getOwnerItems(ownerId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Items retrieved successfully',
      data: result.items,
      pagination: result.pagination,
    });
  });

  updateItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ownerId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    const item = await itemService.updateItem(id, ownerId, updateData);

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item,
    });
  });

  deleteItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const ownerId = req.user!.id;
    const { id } = req.params;

    const result = await itemService.deleteItem(id, ownerId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
