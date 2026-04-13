import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { updateProfileSchema } from '../../middleware/validation.js';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// GET /api/users/profile
router.get('/profile', userController.getProfile);

// PUT /api/users/profile
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

export default router;
