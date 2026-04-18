import { z } from 'zod'

export const productListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(24),
    category: z.string().trim().optional(),
    ageGroup: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    badge: z.string().trim().optional(),
    q: z.string().trim().optional(),
    sort: z.enum(['featured', 'price-asc', 'price-desc', 'rating', 'name', 'newest']).default('featured'),
  }),
  params: z.object({}),
  body: z.object({}).optional(),
  cookies: z.object({}).optional(),
})

export const productIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
  body: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
