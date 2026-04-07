// server/routes/products.js
import { Router } from 'express'
import pool from '../db/pool.js'

const router = Router()

// GET /api/products
// Query params: category, ageGroup, minPrice, maxPrice, badge, q, sort, page, limit
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      ageGroup,
      minPrice = 0,
      maxPrice = 9999,
      badge,
      q,
      sort = 'featured',
      page = 1,
      limit = 48,
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    const params = []
    const conditions = ['p.in_stock = TRUE']

    // Category filter
    if (category && category !== 'all') {
      params.push(category)
      conditions.push(`c.slug = $${params.length}`)
    }

    // Age group filter
    if (ageGroup && ageGroup !== 'all') {
      params.push(ageGroup)
      conditions.push(`ag.slug = $${params.length}`)
    }

    // Price filter
    params.push(parseFloat(minPrice))
    conditions.push(`p.price >= $${params.length}`)
    params.push(parseFloat(maxPrice))
    conditions.push(`p.price <= $${params.length}`)

    // Badge filter
    if (badge && badge !== 'all') {
      params.push(badge)
      conditions.push(`p.badge = $${params.length}`)
    }

    // Full-text search
    if (q) {
      params.push(q)
      conditions.push(`p.search_vector @@ plainto_tsquery('english', $${params.length})`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    // Sort order
    const orderMap = {
      featured:   'p.reviews DESC, p.rating DESC',
      'price-asc':  'p.price ASC',
      'price-desc': 'p.price DESC',
      rating:     'p.rating DESC',
      name:       'p.name ASC',
      newest:     'p.created_at DESC',
    }
    const orderBy = orderMap[sort] || orderMap.featured

    // Count query
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p
       LEFT JOIN categories c  ON p.category_id  = c.id
       LEFT JOIN age_groups ag ON p.age_group_id = ag.id
       ${where}`,
      params
    )
    const totalCount = parseInt(countRes.rows[0].count)

    // Data query
    params.push(parseInt(limit))
    params.push(offset)
    const dataRes = await pool.query(
      `SELECT
         p.id, p.name, p.price, p.old_price, p.badge,
         p.image_url, p.fallback_bg, p.sizes, p.rating, p.reviews,
         c.slug  AS category,
         c.label AS category_label,
         c.icon  AS category_icon,
         ag.slug  AS age_group,
         ag.label AS age_label,
         ag.range AS age_range
       FROM products p
       LEFT JOIN categories c  ON p.category_id  = c.id
       LEFT JOIN age_groups ag ON p.age_group_id = ag.id
       ${where}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1}
       OFFSET $${params.length}`,
      params
    )

    res.json({
      products:   dataRes.rows,
      total:      totalCount,
      page:       parseInt(page),
      limit:      parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const res2 = await pool.query(
      `SELECT p.*, c.slug AS category, c.label AS category_label,
              ag.slug AS age_group, ag.label AS age_label, ag.range AS age_range
       FROM products p
       LEFT JOIN categories c  ON p.category_id  = c.id
       LEFT JOIN age_groups ag ON p.age_group_id = ag.id
       WHERE p.id = $1`,
      [id]
    )
    if (!res2.rows.length) return res.status(404).json({ error: 'Product not found' })
    res.json(res2.rows[0])
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id/related
router.get('/:id/related', async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await pool.query('SELECT category_id FROM products WHERE id=$1', [id])
    if (!product.rows.length) return res.status(404).json({ error: 'Not found' })

    const related = await pool.query(
      `SELECT p.id, p.name, p.price, p.old_price, p.badge, p.image_url, p.fallback_bg,
              p.sizes, p.rating
       FROM products p
       WHERE p.category_id = $1 AND p.id != $2 AND p.in_stock = TRUE
       ORDER BY RANDOM() LIMIT 8`,
      [product.rows[0].category_id, id]
    )
    res.json(related.rows)
  } catch (err) {
    next(err)
  }
})

export default router
