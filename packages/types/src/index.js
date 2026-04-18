import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

export const productFiltersSchema = paginationSchema.extend({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  sortBy: z.enum(['createdAt', 'price', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(10).max(128),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10).max(128),
})

export const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(20),
})

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(20),
})
