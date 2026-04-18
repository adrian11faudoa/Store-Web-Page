import * as cartService from '../services/cart.service.js'

function getCartContext(req) {
  return {
    userId: req.auth?.sub ? Number(req.auth.sub) : null,
    sessionId: req.cookies.sk_sid || req.headers['x-session-id'] || null,
  }
}

export async function getCart(req, res) {
  const items = await cartService.listCartItems(getCartContext(req))
  res.json({ data: items })
}

export async function addCartItem(req, res) {
  const { productId, quantity, size } = req.validated.body
  const items = await cartService.addCartItem({ ...getCartContext(req), productId, quantity, size })
  res.status(201).json({ data: items })
}

export async function updateCartItem(req, res) {
  const items = await cartService.updateCartItem({
    ...getCartContext(req),
    productId: req.validated.params.productId,
    quantity: req.validated.body.quantity,
    size: req.validated.body.size,
  })
  res.json({ data: items })
}
