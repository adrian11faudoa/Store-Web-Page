// server/routes/categories.js
import { Router } from 'express'
import pool from '../db/pool.js'

const router = Router()

// GET /api/categories — with product counts
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.slug, c.label, c.icon,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.in_stock = TRUE
       GROUP BY c.id
       ORDER BY c.sort_order`
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/categories/age-groups
router.get('/age-groups', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ag.id, ag.slug, ag.label, ag.range,
              COUNT(p.id) AS product_count
       FROM age_groups ag
       LEFT JOIN products p ON p.age_group_id = ag.id AND p.in_stock = TRUE
       GROUP BY ag.id
       ORDER BY ag.sort_order`
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

// GET /api/categories/total — total in-stock product count
router.get('/total', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM products WHERE in_stock = TRUE')
    res.json({ total: parseInt(result.rows[0].count) })
  } catch (err) {
    next(err)
  }
})

export default router
