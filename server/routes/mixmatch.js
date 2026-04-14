// server/routes/mixmatch.js
import { Router } from 'express'
import pool from '../db/pool.js'

const router = Router()

// GET /api/mix-match?gender=girl|boy&limit=12
// Returns tops and bottoms for the mix & match carousel
router.get('/', async (req, res, next) => {
  try {
    const { gender = 'girl', limit = 12 } = req.query
    const genderVal = gender === 'boy' ? 'boy' : 'girl'
    const lim = Math.min(parseInt(limit) || 12, 24)

    // Fetch tops and bottoms in parallel
    const [topsRes, bottomsRes] = await Promise.all([
      pool.query(
        `SELECT p.id, p.name, p.price, p.old_price, p.badge,
                p.image_url, p.fallback_bg, p.sizes, p.rating, p.gender,
                ag.range AS age_range, c.slug AS category
         FROM products p
         LEFT JOIN categories c  ON p.category_id  = c.id
         LEFT JOIN age_groups ag ON p.age_group_id  = ag.id
         WHERE c.slug = 'tops'
           AND (p.gender = $1 OR p.gender = 'unisex')
           AND p.in_stock = TRUE
         ORDER BY p.rating DESC, RANDOM()
         LIMIT $2`,
        [genderVal, lim]
      ),
      pool.query(
        `SELECT p.id, p.name, p.price, p.old_price, p.badge,
                p.image_url, p.fallback_bg, p.sizes, p.rating, p.gender,
                ag.range AS age_range, c.slug AS category
         FROM products p
         LEFT JOIN categories c  ON p.category_id  = c.id
         LEFT JOIN age_groups ag ON p.age_group_id  = ag.id
         WHERE c.slug IN ('bottoms', 'dresses', 'skirts')
           AND (p.gender = $1 OR p.gender = 'unisex')
           AND p.in_stock = TRUE
         ORDER BY p.rating DESC, RANDOM()
         LIMIT $2`,
        [genderVal, lim]
      ),
    ])

    res.json({
      gender: genderVal,
      tops:    topsRes.rows,
      bottoms: bottomsRes.rows,
    })
  } catch (err) {
    next(err)
  }
})

export default router
