import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validation.js';
import { registerSchema, loginSchema } from '../../middleware/validation.js';

const router = Router();
const authController = new AuthController();

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

export default router;
