import { z } from 'zod';

// Auth Validation
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['OWNER', 'RENTER']).default('RENTER'),
    phone: z.string().optional(),
    location: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// User Validation
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().optional(),
  }),
});

// Item Validation
export const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    category: z.enum([
      'TOOLS',
      'ELECTRONICS',
      'APPLIANCES',
      'VEHICLES',
      'SPORTS',
      'FURNITURE',
      'CLOTHING',
      'OTHER',
    ]),
    description: z.string().optional(),
    condition: z
      .enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'WORN'])
      .default('GOOD'),
    pricePerDay: z.number().positive('Price must be positive'),
    location: z.string().optional(),
    imageUrl: z.string().url().optional(),
    availableFrom: z.string().datetime().optional(),
    availableTo: z.string().datetime().optional(),
  }),
});

export const updateItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    category: z
      .enum([
        'TOOLS',
        'ELECTRONICS',
        'APPLIANCES',
        'VEHICLES',
        'SPORTS',
        'FURNITURE',
        'CLOTHING',
        'OTHER',
      ])
      .optional(),
    description: z.string().optional(),
    condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'WORN']).optional(),
    pricePerDay: z.number().positive().optional(),
    location: z.string().optional(),
    imageUrl: z.string().url().optional(),
    availableFrom: z.string().datetime().optional(),
    availableTo: z.string().datetime().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

// Search Validation
export const searchItemsSchema = z.object({
  query: z.object({
    keyword: z.string().optional(),
    category: z
      .enum([
        'TOOLS',
        'ELECTRONICS',
        'APPLIANCES',
        'VEHICLES',
        'SPORTS',
        'FURNITURE',
        'CLOTHING',
        'OTHER',
      ])
      .optional(),
    minPrice: z.string().regex(/^\d+$/).optional(),
    maxPrice: z.string().regex(/^\d+$/).optional(),
    location: z.string().optional(),
    availableFrom: z.string().datetime().optional(),
    availableTo: z.string().datetime().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

// Booking Validation
export const createBookingSchema = z.object({
  body: z.object({
    itemId: z.string().uuid('Invalid item ID'),
    startDate: z.string().datetime('Invalid start date'),
    endDate: z.string().datetime('Invalid end date'),
  }),
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  }),
});

// Review Validation
export const createReviewSchema = z.object({
  body: z.object({
    itemId: z.string().uuid('Invalid item ID'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
});

// Payment Validation
export const processPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid('Invalid booking ID'),
    paymentMethod: z.string().default('mock_card'),
  }),
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
};
