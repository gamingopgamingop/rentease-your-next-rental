import { Router } from 'express';
import { ReviewController } from './review.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { createReviewSchema } from '../../middleware/validation.js';

const router = Router();
const reviewController = new ReviewController();

// All routes require authentication
router.use(authenticate);

// POST /api/reviews
router.post('/', validate(createReviewSchema), reviewController.createReview);

// GET /api/reviews/item/:itemId
router.get('/item/:itemId', reviewController.getItemReviews);

// PUT /api/reviews/:id
router.put('/:id', reviewController.updateReview);

// DELETE /api/reviews/:id
router.delete('/:id', reviewController.deleteReview);

export default router;
