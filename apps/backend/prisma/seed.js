import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { slugify } from '@store/utils'

const prisma = new PrismaClient()

const catalog = [
  {
    name: 'Sunny Denim Layer Set',
    category: 'sets',
    description: 'A coordinated denim layer with a soft jersey base for school-to-weekend comfort.',
    gender: 'girls',
    ageGroup: '7-10 years',
    price: 38,
    rating: 4.8,
    badge: 'featured',
    isFeatured: true,
    releaseDate: '2026-03-15',
    palette: ['#F6D7B0', '#D8E4F2'],
    sizes: ['7Y', '8Y', '9Y', '10Y'],
  },
  {
    name: 'Coastline Play Dress',
    category: 'dresses',
    description: 'An easy everyday dress with structured seams and a playful summer palette.',
    gender: 'girls',
    ageGroup: '4-6 years',
    price: 32,
    rating: 4.7,
    badge: 'new',
    isFeatured: true,
    releaseDate: '2026-04-04',
    palette: ['#F4C1B3', '#FFF1D6'],
    sizes: ['4Y', '5Y', '6Y'],
  },
  {
    name: 'Harbor Utility Jacket',
    category: 'outerwear',
    description: 'A lightweight utility jacket with polished hardware and a neat everyday silhouette.',
    gender: 'boys',
    ageGroup: '8-12 years',
    price: 46,
    rating: 4.9,
    badge: 'best seller',
    isFeatured: true,
    releaseDate: '2026-02-20',
    palette: ['#B8C5B2', '#DDE5D8'],
    sizes: ['8Y', '10Y', '12Y'],
  },
  {
    name: 'Meadow Party Set',
    category: 'sets',
    description: 'A polished top-and-skirt pairing that feels dressed up without losing comfort.',
    gender: 'girls',
    ageGroup: '2-4 years',
    price: 34,
    rating: 4.9,
    badge: 'featured',
    isFeatured: true,
    releaseDate: '2026-04-10',
    palette: ['#F7DCC8', '#E6EED9'],
    sizes: ['2Y', '3Y', '4Y'],
  },
  {
    name: 'Atlas Rib Tee',
    category: 'tops',
    description: 'A clean ribbed tee that works as a base layer or a standalone everyday essential.',
    gender: 'boys',
    ageGroup: '10-14 years',
    price: 19,
    rating: 4.3,
    badge: null,
    isFeatured: false,
    releaseDate: '2026-02-05',
    palette: ['#B9CDD8', '#EAF1F4'],
    sizes: ['10Y', '12Y', '14Y'],
  },
]

async function seed() {
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.authAccount.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  const categoryNames = {
    tops: 'Tops',
    dresses: 'Dresses',
    outerwear: 'Outerwear',
    sets: 'Sets',
  }

  const categories = {}

  for (const [slug, name] of Object.entries(categoryNames)) {
    categories[slug] = await prisma.category.create({
      data: {
        slug,
        name,
        description: `${name} built for a merchandised storefront experience.`,
      },
    })
  }

  for (const entry of catalog) {
    const product = await prisma.product.create({
      data: {
        slug: slugify(entry.name),
        name: entry.name,
        description: entry.description,
        categoryId: categories[entry.category].id,
        gender: entry.gender,
        ageGroup: entry.ageGroup,
        price: entry.price,
        rating: entry.rating,
        badge: entry.badge,
        isFeatured: entry.isFeatured,
        releaseDate: new Date(entry.releaseDate),
        paletteStart: entry.palette[0],
        paletteEnd: entry.palette[1],
      },
    })

    await prisma.productVariant.createMany({
      data: entry.sizes.map((size, index) => ({
        productId: product.id,
        size,
        stock: 25 - index,
        sku: `${slugify(entry.name).toUpperCase()}-${size}`,
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
