import { Router } from 'express'
import pool from '../db/pool.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

function normalizeSize(size) {
  return typeof size === 'string' ? size : ''
}

async function getCartItems(client, userId, sessionId) {
  if (!userId && !sessionId) return []

  const col = userId ? 'c.user_id' : 'c.session_id'
  const val = userId || sessionId

  const result = await client.query(
    `SELECT ci.id, ci.qty, ci.size,
            p.id AS product_id, p.name, p.price, p.old_price,
            p.image_url, p.fallback_bg, p.sizes
     FROM carts c
     JOIN cart_items ci ON ci.cart_id = c.id
     JOIN products p ON p.id = ci.product_id
     WHERE ${col} = $1
       AND (c.expires_at IS NULL OR c.expires_at > NOW())
     ORDER BY ci.id ASC`,
    [val]
  )

  return result.rows
}

async function getOrCreateCart(client, userId, sessionId) {
  if (userId) {
    let res = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId])
    if (res.rows.length) return res.rows[0].id

    res = await client.query(
      'INSERT INTO carts (user_id, expires_at) VALUES ($1, NULL) RETURNING id',
      [userId]
    )
    return res.rows[0].id
  }

  let res = await client.query(
    'SELECT id FROM carts WHERE session_id = $1 AND (expires_at IS NULL OR expires_at > NOW())',
    [sessionId]
  )
  if (res.rows.length) return res.rows[0].id

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  res = await client.query(
    'INSERT INTO carts (session_id, expires_at) VALUES ($1, $2) RETURNING id',
    [sessionId, expiresAt]
  )
  return res.rows[0].id
}

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null
    const items = await getCartItems(pool, userId, sessionId)
    res.json({ items })
  } catch (err) {
    next(err)
  }
})

router.post('/add', optionalAuth, async (req, res, next) => {
  const client = await pool.connect()
  try {
    const { productId, qty = 1 } = req.body
    const size = normalizeSize(req.body.size)
    const userId = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'Session required' })
    }

    await client.query('BEGIN')
    const cartId = await getOrCreateCart(client, userId, sessionId)
    await client.query(
      `INSERT INTO cart_items (cart_id, product_id, size, qty)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (cart_id, product_id, size)
       DO UPDATE SET qty = cart_items.qty + $4`,
      [cartId, productId, size, qty]
    )
    const items = await getCartItems(client, userId, sessionId)
    await client.query('COMMIT')
    res.json({ ok: true, items })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

router.post('/sync', optionalAuth, async (req, res, next) => {
  const client = await pool.connect()
  try {
    const userId = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null
    const incomingItems = Array.isArray(req.body?.items) ? req.body.items : []

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'Session required' })
    }

    await client.query('BEGIN')
    const cartId = await getOrCreateCart(client, userId, sessionId)

    for (const item of incomingItems) {
      const productId = Number(item.product_id ?? item.productId)
      const qty = Number(item.qty)
      const size = normalizeSize(item.size)

      if (!Number.isInteger(productId) || !Number.isInteger(qty) || qty <= 0) continue

      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, size, qty)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (cart_id, product_id, size)
         DO UPDATE SET qty = GREATEST(cart_items.qty, EXCLUDED.qty)`,
        [cartId, productId, size, qty]
      )
    }

    const items = await getCartItems(client, userId, sessionId)
    await client.query('COMMIT')
    res.json({ ok: true, items })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

router.patch('/product/:productId', optionalAuth, async (req, res, next) => {
  const client = await pool.connect()
  try {
    const userId = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null
    const qty = Number(req.body?.qty)
    const size = normalizeSize(req.body?.size)

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'Session required' })
    }
    if (!Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ error: 'A valid quantity is required' })
    }

    await client.query('BEGIN')

    if (qty === 0) {
      if (userId) {
        await client.query(
          `DELETE FROM cart_items ci
           USING carts c
           WHERE ci.product_id = $1
             AND ci.cart_id = c.id
             AND c.user_id = $2
             AND ci.size IS NOT DISTINCT FROM $3`,
          [req.params.productId, userId, size]
        )
      } else {
        await client.query(
          `DELETE FROM cart_items ci
           USING carts c
           WHERE ci.product_id = $1
             AND ci.cart_id = c.id
             AND c.session_id = $2
             AND ci.size IS NOT DISTINCT FROM $3`,
          [req.params.productId, sessionId, size]
        )
      }
    } else {
      const cartId = await getOrCreateCart(client, userId, sessionId)
      await client.query(
        `INSERT INTO cart_items (cart_id, product_id, size, qty)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (cart_id, product_id, size)
         DO UPDATE SET qty = EXCLUDED.qty`,
        [cartId, req.params.productId, size, qty]
      )
    }

    const items = await getCartItems(client, userId, sessionId)
    await client.query('COMMIT')
    res.json({ ok: true, items })
  } catch (err) {
    await client.query('ROLLBACK')
    next(err)
  } finally {
    client.release()
  }
})

router.delete('/product/:productId', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null
    const size = normalizeSize(req.query.size)

    if (userId) {
      await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.product_id = $1
           AND ci.cart_id = c.id
           AND c.user_id = $2
           AND ci.size IS NOT DISTINCT FROM $3`,
        [req.params.productId, userId, size]
      )
    } else {
      await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.product_id = $1
           AND ci.cart_id = c.id
           AND c.session_id = $2
           AND ci.size IS NOT DISTINCT FROM $3`,
        [req.params.productId, sessionId, size]
      )
    }

    const items = await getCartItems(pool, userId, sessionId)
    res.json({ ok: true, items })
  } catch (err) {
    next(err)
  }
})

router.delete('/:itemId', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id || null
    const sessionId = req.headers['x-session-id'] || null

    if (userId) {
      await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.id = $1
           AND ci.cart_id = c.id
           AND c.user_id = $2`,
        [req.params.itemId, userId]
      )
    } else {
      await pool.query(
        `DELETE FROM cart_items ci
         USING carts c
         WHERE ci.id = $1
           AND ci.cart_id = c.id
           AND c.session_id = $2`,
        [req.params.itemId, sessionId]
      )
    }

    const items = await getCartItems(pool, userId, sessionId)
    res.json({ ok: true, items })
  } catch (err) {
    next(err)
  }
})

export default router
