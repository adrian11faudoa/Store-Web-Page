import { z } from 'zod'

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().min(1).max(20).default(1),
    size: z.string().trim().max(32).optional().default(''),
  }),
  query: z.object({}),
  params: z.object({}),
  cookies: z.object({}).optional(),
})

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().min(0).max(20),
    size: z.string().trim().max(32).optional().default(''),
  }),
  params: z.object({
    productId: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
  cookies: z.object({}).optional(),
})
