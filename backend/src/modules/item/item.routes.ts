import { Router } from 'express';
import { ItemController } from './item.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { createItemSchema, updateItemSchema } from '../../middleware/validation.js';

const router = Router();
const itemController = new ItemController();

// All routes require authentication
router.use(authenticate);

// POST /api/items - Owner only
router.post(
  '/',
  authorize('OWNER'),
  validate(createItemSchema),
  itemController.createItem
);

// GET /api/items/my-items - Owner's items
router.get('/my-items', authorize('OWNER'), itemController.getOwnerItems);

// GET /api/items/:id
router.get('/:id', itemController.getItemById);

// PUT /api/items/:id - Owner only
router.put(
  '/:id',
  authorize('OWNER'),
  validate(updateItemSchema),
  itemController.updateItem
);

// DELETE /api/items/:id - Owner only
router.delete('/:id', authorize('OWNER'), itemController.deleteItem);

export default router;
