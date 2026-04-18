import { query, withTransaction } from '../db/pool.js'
import { ApiError } from '../lib/errors.js'

async function getOrCreateCart(client, { userId, sessionId }) {
  if (userId) {
    const existing = await client.query('SELECT id FROM carts WHERE user_id = $1 LIMIT 1', [userId])
    if (existing.rows.length) return existing.rows[0].id

    const created = await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId])
    return created.rows[0].id
  }

  if (!sessionId) throw new ApiError(400, 'Session is required for guest carts')

  const existing = await client.query(
    'SELECT id FROM carts WHERE session_id = $1 AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1',
    [sessionId]
  )
  if (existing.rows.length) return existing.rows[0].id

  const created = await client.query(
    'INSERT INTO carts (session_id, expires_at) VALUES ($1, NOW() + interval \'1 day\') RETURNING id',
    [sessionId]
  )
  return created.rows[0].id
}

export async function listCartItems({ userId, sessionId }) {
  if (!userId && !sessionId) return []

  const ownerColumn = userId ? 'c.user_id' : 'c.session_id'
  const ownerValue = userId || sessionId

  const result = await query(
    `SELECT
        ci.id,
        ci.qty AS quantity,
        ci.size,
        p.id AS product_id,
        p.name,
        p.price,
        p.image_url,
        p.fallback_bg
      FROM carts c
      JOIN cart_items ci ON ci.cart_id = c.id
      JOIN products p ON p.id = ci.product_id
      WHERE ${ownerColumn} = $1
      ORDER BY ci.id ASC`,
    [ownerValue]
  )

  return result.rows
}

export async function addCartItem({ userId, sessionId, productId, quantity }) {
  return withTransaction(async client => {
    const cartId = await getOrCreateCart(client, { userId, sessionId })
    await client.query(
      `INSERT INTO cart_items (cart_id, product_id, qty, size)
       VALUES ($1, $2, $3, '')
       ON CONFLICT (cart_id, product_id, size)
       DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty`,
      [cartId, productId, quantity]
    )

    return listCartItems({ userId, sessionId })
  })
}

export async function updateCartItem({ userId, sessionId, productId, quantity }) {
  return withTransaction(async client => {
    const cartId = await getOrCreateCart(client, { userId, sessionId })

    if (quantity === 0) {
      await client.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId])
    } else {
      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, qty, size)
         VALUES ($1, $2, $3, '')
         ON CONFLICT (cart_id, product_id, size)
         DO UPDATE SET qty = EXCLUDED.qty`,
        [cartId, productId, quantity]
      )
    }

    return listCartItems({ userId, sessionId })
  })
}
