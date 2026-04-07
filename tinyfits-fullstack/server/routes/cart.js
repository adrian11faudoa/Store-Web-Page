// server/routes/cart.js
import { Router } from 'express'
import pool from '../db/pool.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// Helper: get or create cart for user/session
async function getOrCreateCart(client, userId, sessionId) {
  const col = userId ? 'user_id' : 'session_id'
  const val = userId || sessionId
  let res = await client.query(`SELECT id FROM carts WHERE ${col}=$1`, [val])
  if (res.rows.length) return res.rows[0].id
  res = await client.query(
    `INSERT INTO carts (${col}) VALUES ($1) RETURNING id`, [val]
  )
  return res.rows[0].id
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
              p.image_url, p.fallback_bg
       FROM carts c
       JOIN cart_items ci ON ci.cart_id = c.id
       JOIN products  p   ON p.id = ci.product_id
       WHERE ${col} = $1`,
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

// DELETE /api/cart/:itemId
router.delete('/:itemId', optionalAuth, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id=$1', [req.params.itemId])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

export default router
