import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { config } from '../../config/env.js';
import prisma from '../../database/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

// Environment safety: Throw error if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing from environment variables');
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is missing from environment variables');
}

const JWT_SECRET: Secret = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET as string;

export class AuthService {
  async register(
    email: string,
    password: string,
    name: string,
    role: 'OWNER' | 'RENTER',
    phone?: string,
    location?: string
  ) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcryptSaltRounds
    );

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        phone,
        location,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        location: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as {
        id: string;
        email: string;
        role: string;
      };

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Generate new tokens
      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { id: userId, email, role };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: (config.jwt.expiresIn || '7d') as string,
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: (config.jwt.refreshExpiresIn || '30d') as string,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
