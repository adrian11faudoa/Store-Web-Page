import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().trim().min(2).max(120),
  }),
  query: z.object({}),
  params: z.object({}),
  cookies: z.object({}).optional(),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  query: z.object({}),
  params: z.object({}),
  cookies: z.object({}).optional(),
})

export const refreshSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}),
  params: z.object({}),
  cookies: z.object({
    sk_rt: z.string().optional(),
  }),
})
