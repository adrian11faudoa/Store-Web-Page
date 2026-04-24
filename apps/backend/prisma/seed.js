import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { loadCatalogFromCsv } from './catalog-import.js'

const candidatePaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '.env.development'),
  resolve(process.cwd(), '..', '..', '.env'),
  resolve(process.cwd(), '..', '..', '.env.development'),
]

for (const path of candidatePaths) {
  if (existsSync(path)) {
    loadEnv({ path, override: true })
    break
  }
}

const prisma = new PrismaClient()

async function seed() {
  const catalog = await loadCatalogFromCsv()

  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.authAccount.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  const categories = {}

  for (const category of catalog.map(entry => entry.category)) {
    if (categories[category.slug]) {
      continue
    }

    categories[category.slug] = await prisma.category.create({
      data: {
        slug: category.slug,
        name: category.name,
        description: category.description,
      },
    })
  }

  for (const entry of catalog) {
    const product = await prisma.product.create({
      data: {
        slug: entry.slug,
        name: entry.name,
        description: entry.description,
        categoryId: categories[entry.category.slug].id,
        gender: entry.gender,
        ageGroup: entry.ageGroup,
        ageTags: entry.ageTags,
        seasons: entry.seasons,
        price: entry.price,
        sourcePriceMxn: entry.sourcePriceMxn,
        rating: entry.rating,
        badge: entry.badge,
        isFeatured: entry.isFeatured,
        isActive: entry.isActive,
        releaseDate: entry.releaseDate,
        imageUrl: entry.imageUrl,
        paletteStart: entry.palette[0],
        paletteEnd: entry.palette[1],
      },
    })

    await prisma.productVariant.createMany({
      data: entry.variants.map(variant => ({
        productId: product.id,
        size: variant.size,
        stock: variant.stock,
        sku: variant.sku,
      })),
    })
  }

  await prisma.user.create({
    data: {
      email: 'admin@storeplatform.dev',
      name: 'Platform Admin',
      role: UserRole.admin,
      emailVerified: true,
      passwordHash: await bcrypt.hash('AdminPassword123!', 12),
    },
  })
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async error => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
