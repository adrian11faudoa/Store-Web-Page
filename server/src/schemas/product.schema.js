import { z } from 'zod'

const imageUrlSchema = z.string().trim().url('Each image must be a valid URL')

const tallaSchema = z.union([
  z.string().trim().min(1, 'Talla is required'),
  z.array(z.string().trim().min(1, 'Each size is required')).min(1, 'At least one size is required'),
])

const productBodySchema = z.object({
  temporada: z.string().trim().min(1, 'Temporada is required'),
  nombre: z.string().trim().min(1, 'Nombre is required'),
  genero: z.string().trim().min(1, 'Genero is required'),
  colorPrimario: z.string().trim().min(1, 'Color primario is required'),
  colorSecundario: z.string().trim().min(1, 'Color secundario is required'),
  estampado: z.string().trim().min(1, 'Estampado is required'),
  talla: tallaSchema,
  precio: z.coerce.number().finite('Precio must be a number').nonnegative('Precio must be 0 or more'),
  existencia: z.coerce.number().int('Existencia must be an integer').nonnegative('Existencia must be 0 or more'),
  tipoPrenda: z.string().trim().min(1, 'Tipo de prenda is required'),
  imagenes: z.array(imageUrlSchema).min(1, 'At least one image URL is required'),
})

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

export const createProductSchema = z.object({
  params: z.object({}),
  query: z.object({}),
  body: productBodySchema,
  cookies: z.object({}).optional(),
})

export const updateProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({}),
  body: productBodySchema.partial().refine(body => Object.keys(body).length > 0, {
    message: 'At least one field is required',
  }),
  cookies: z.object({}).optional(),
})
