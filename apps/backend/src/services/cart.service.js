import { findOrCreateCart, upsertCartItem } from '../repositories/cart.repository.js'

function formatCart(cart) {
  return {
    id: cart.id,
    items: cart.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      variant: {
        id: item.variant.id,
        size: item.variant.size,
        sku: item.variant.sku,
        stock: item.variant.stock,
      },
      product: {
        id: item.variant.product.id,
        slug: item.variant.product.slug,
        name: item.variant.product.name,
        price: Number(item.variant.product.price),
        badge: item.variant.product.badge,
        imageUrl: item.variant.product.imageUrl,
        palette: [item.variant.product.paletteStart, item.variant.product.paletteEnd],
      },
      lineTotal: Number(item.variant.product.price) * item.quantity,
    })),
  }
}

export async function getCart(context) {
  const cart = await findOrCreateCart(context)
  return formatCart(cart)
}

export async function setCartItem(context, variantId, quantity) {
  const cart = await findOrCreateCart(context)
  const updated = await upsertCartItem(cart.id, variantId, quantity)
  return formatCart(updated)
}
