import { env } from '../config/env.js'
import { sendSuccess } from '../utils/api-response.js'
import * as cartService from '../services/cart.service.js'

function getCartContext(req) {
  return {
    userId: req.auth?.sub || null,
    guestCartId: req.cookies[env.cookieNames.guestCart],
  }
}

export async function getCart(req, res) {
  const cart = await cartService.getCart(getCartContext(req))
  return sendSuccess(res, { cart })
}

export async function addCartItem(req, res) {
  const cart = await cartService.addCartItem(
    getCartContext(req),
    req.validated.body.variantId,
    req.validated.body.quantity,
  )
  return sendSuccess(res, { cart }, 201)
}

export async function updateCartItem(req, res) {
  const cart = await cartService.setCartItem(
    getCartContext(req),
    req.params.variantId,
    req.validated.body.quantity,
  )
  return sendSuccess(res, { cart })
}
