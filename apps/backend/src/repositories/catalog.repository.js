import { prisma } from '../db/client.js'

export function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
    },
  })
}

export async function listProducts({ page, limit, q, category, sortBy, sortOrder }) {
  const where = {
    isActive: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        variants: {
          orderBy: { size: 'asc' },
        },
      },
    }),
  ])

  return { total, items }
}

export function findProductBySlug(slug) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        orderBy: { size: 'asc' },
      },
    },
  })
}
