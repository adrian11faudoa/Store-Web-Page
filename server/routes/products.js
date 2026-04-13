// server/routes/products.js
import { Router } from 'express'
import pool from '../db/pool.js'

const router = Router()

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const {
      category,
      ageGroup,
      gender,
      minPrice = 0,
      maxPrice = 9999,
      badge,
      q,
      sizeFilter,
      sort = 'featured',
      page = 1,
      limit = 48,
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)
    const params = []
    const conditions = ['p.in_stock = TRUE']

    if (category && category !== 'all') {
      params.push(category)
      conditions.push(`c.slug = $${params.length}`)
    }

    if (ageGroup && ageGroup !== 'all') {
      if (ageGroup === 'baby') {
        // Match both baby-boy and baby-girl
        conditions.push(`ag.slug IN ('baby-boy', 'baby-girl')`)
      } else {
        params.push(ageGroup)
        conditions.push(`ag.slug = $${params.length}`)
      }
    }

    if (gender && gender !== 'all') {
      // 'unisex' shows for both boys and girls
      params.push(gender)
      conditions.push(`(p.gender = $${params.length} OR p.gender = 'unisex')`)
    }

    params.push(parseFloat(minPrice))
    conditions.push(`p.price >= $${params.length}`)
    params.push(parseFloat(maxPrice))
    conditions.push(`p.price <= $${params.length}`)

    if (badge && badge !== 'all') {
      params.push(badge)
      conditions.push(`p.badge = $${params.length}`)
    }

    if (sizeFilter) {
      params.push(sizeFilter)
      conditions.push(`$${params.length} = ANY(p.sizes)`)
    }

    if (q) {
      params.push(q)
      conditions.push(`p.search_vector @@ plainto_tsquery('english', $${params.length})`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const orderMap = {
      featured:    'p.reviews DESC, p.rating DESC, p.id ASC',
      'price-asc': 'p.price ASC, p.id ASC',
      'price-desc':'p.price DESC, p.id ASC',
      rating:      'p.rating DESC, p.reviews DESC, p.id ASC',
      name:        'p.name ASC, p.id ASC',
      newest:      'p.created_at DESC, p.id DESC',
    }
    const orderBy = orderMap[sort] || orderMap.featured

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p
       LEFT JOIN categories c  ON p.category_id  = c.id
       LEFT JOIN age_groups ag ON p.age_group_id = ag.id
       ${where}`,
      params
    )
    const totalCount = parseInt(countRes.rows[0].count)

    params.push(parseInt(limit))
    params.push(offset)
    const dataRes = await pool.query(
      `SELECT
         p.id, p.name, p.price, p.old_price, p.badge,
         p.image_url, p.fallback_bg, p.sizes, p.rating, p.reviews,
         p.gender,
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
              p.sizes, p.rating, p.gender,
              ag.range AS age_range
       FROM products p
       LEFT JOIN age_groups ag ON p.age_group_id = ag.id
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
