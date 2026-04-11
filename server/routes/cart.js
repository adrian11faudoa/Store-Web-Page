// server/routes/cart.js
import { Router } from 'express'
import pool from '../db/pool.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// Helper: get or create cart for user/session
async function getOrCreateCart(client, userId, sessionId) {
  if (userId) {
    // Logged-in: find existing user cart or create (no expiry)
    let res = await client.query('SELECT id FROM carts WHERE user_id=$1', [userId])
    if (res.rows.length) return res.rows[0].id
    res = await client.query(
      'INSERT INTO carts (user_id, expires_at) VALUES ($1, NULL) RETURNING id', [userId]
    )
    return res.rows[0].id
  } else {
    // Guest: expire in 1 day, skip expired carts
    let res = await client.query(
      'SELECT id FROM carts WHERE session_id=$1 AND (expires_at IS NULL OR expires_at > NOW())',
      [sessionId]
    )
    if (res.rows.length) return res.rows[0].id
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    res = await client.query(
      'INSERT INTO carts (session_id, expires_at) VALUES ($1, $2) RETURNING id',
      [sessionId, expiresAt]
    )
    return res.rows[0].id
  }
}

// GET /api/cart
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId    = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null
    if (!userId && !sessionId) return res.json({ items: [] })

    const col = userId ? 'c.user_id' : 'c.session_id'
    const val = userId || sessionId

    const result = await pool.query(
      `SELECT ci.id, ci.qty,
              p.id AS product_id, p.name, p.price, p.old_price,
              p.image_url, p.fallback_bg, p.sizes
       FROM carts c
       JOIN cart_items ci ON ci.cart_id = c.id
       JOIN products  p   ON p.id = ci.product_id
       WHERE ${col} = $1
         AND (c.expires_at IS NULL OR c.expires_at > NOW())`,
      [val]
    )
    res.json({ items: result.rows })
  } catch (err) { next(err) }
})

// POST /api/cart/add
router.post('/add', optionalAuth, async (req, res, next) => {
  const client = await pool.connect()
  try {
    const { productId, qty = 1 } = req.body
    const userId    = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null
    if (!userId && !sessionId) return res.status(400).json({ error: 'Session required' })

    await client.query('BEGIN')
    const cartId = await getOrCreateCart(client, userId, sessionId)
    await client.query(
      `INSERT INTO cart_items (cart_id, product_id, qty)
       VALUES ($1,$2,$3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET qty = cart_items.qty + $3`,
      [cartId, productId, qty]
    )
    await client.query('COMMIT')
    res.json({ ok: true })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

// DELETE /api/cart/product/:productId  — deletes by product_id (used by guest/cookie flow)
router.delete('/product/:productId', optionalAuth, async (req, res, next) => {
  try {
    const userId    = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null

    if (userId) {
      await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.product_id = $1 AND ci.cart_id = c.id AND c.user_id = $2`,
        [req.params.productId, userId]
      )
    } else {
      await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.product_id = $1 AND ci.cart_id = c.id AND c.session_id = $2`,
        [req.params.productId, sessionId]
      )
    }
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// DELETE /api/cart/:itemId  — deletes by cart_item id
router.delete('/:itemId', optionalAuth, async (req, res, next) => {
  try {
    const userId    = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null

    // Verify the item belongs to the right cart before deleting
    if (userId) {
      await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.id = $1 AND ci.cart_id = c.id AND c.user_id = $2`,
        [req.params.itemId, userId]
      )
    } else {
      await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.id = $1 AND ci.cart_id = c.id AND c.session_id = $2`,
        [req.params.itemId, sessionId]
      )
    }
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
