import { Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

const authService = new AuthService();

export class AuthController {
  register = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password, name, role, phone, location } = req.body;

    const result = await authService.register(
      email,
      password,
      name,
      role,
      phone,
      location
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result,
    });
  });

  login = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  refreshToken = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  });
}
