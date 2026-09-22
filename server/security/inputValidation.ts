import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Section 126 Password Policy: Minimum 10 chars, at least 1 letter, 1 number
export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().trim().email('Invalid email address format'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().or(z.string().startsWith('/')).optional(),
}).passthrough();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(10, 'New password must be at least 10 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Strict Privileged Account Password Policy for Admin Credentials
export const adminPasswordSchema = z
  .string()
  .min(14, 'Admin password must be at least 14 characters long')
  .regex(/[A-Z]/, 'Admin password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Admin password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Admin password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Admin password must contain at least one special character');

export const cartItemSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  quantity: z.number().int().min(1).default(1),
}).passthrough();

export const checkoutSchema = z.object({
  paymentMethod: z.enum(['simulated_card', 'simulated_upi', 'demo_wallet', 'free']),
  promoCode: z.string().trim().optional(),
  discountRate: z.number().optional(),
  simulateFailure: z.boolean().optional(),
}).passthrough();

export const gameAdminSchema = z.object({
  title: z.string().trim().min(2).max(150),
  publisher: z.string().trim().min(2).max(100),
  developer: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  pricePaise: z.number().int().min(0, 'Price cannot be negative'),
  originalPricePaise: z.number().int().min(0).optional(),
  discountPercent: z.number().int().min(0).max(100, 'Discount cannot exceed 100%'),
  rating: z.number().min(0).max(5).default(4.5),
  releaseDate: z.string(),
  featured: z.boolean().default(false),
  popular: z.boolean().default(false),
  availability: z.enum(['available', 'unavailable', 'delisted']).default('available'),
  image: z.string().default('/assets/games/default.svg'),
});

export const categoryAdminSchema = z.object({
  name: z.string().trim().min(2).max(50),
  slug: z.string().trim().min(2).max(50).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const promotionAdminSchema = z.object({
  code: z.string().trim().min(3).max(30),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(1),
  maxDiscountPaise: z.number().int().min(0).default(0),
  minimumOrderPaise: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  startsAt: z.string(),
  endsAt: z.string(),
  usageLimit: z.number().int().min(1).default(100),
});

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.errors[0]?.message || 'Invalid input data format.',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}
