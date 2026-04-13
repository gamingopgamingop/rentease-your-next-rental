import { Router } from 'express';
import { SearchController } from './search.controller.js';
import { validate } from '../../middleware/validation.js';
import { searchItemsSchema } from '../../middleware/validation.js';

const router = Router();
const searchController = new SearchController();

// GET /api/search/items
router.get('/items', validate(searchItemsSchema), searchController.searchItems);

export default router;
