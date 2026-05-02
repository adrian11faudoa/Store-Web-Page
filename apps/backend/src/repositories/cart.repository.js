import { prisma } from '../db/client.js'

const cartInclude = {
  items: {
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      variant: {
        include: { product: true },
      },
    },
  },
}

export async function findOrCreateCart({ userId, guestCartId }) {
  if (userId) {
    const existing = await prisma.cart.findFirst({
      where: { userId },
      include: cartInclude,
    })

    if (existing) {
      return existing
    }

    return prisma.cart.create({
      data: { userId },
      include: cartInclude,
    })
  }

  const existing = await prisma.cart.findUnique({
    where: { guestCartId },
    include: cartInclude,
  })

  if (existing) {
    return existing
  }

  return prisma.cart.create({
    data: {
      guestCartId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: cartInclude,
  })
}

export async function upsertCartItem(cartId, variantId, quantity) {
  if (quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId, variantId },
    })
  } else {
    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
      update: { quantity },
      create: {
        cartId,
        variantId,
        quantity,
      },
    })
  }

  return prisma.cart.findUnique({
    where: { id: cartId },
    include: cartInclude,
  })
}
