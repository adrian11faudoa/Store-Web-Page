import { query } from '../db/pool.js'

export async function getOverview(req, res) {
  const [users, products, carts] = await Promise.all([
    query('SELECT COUNT(*)::int AS total FROM users'),
    query('SELECT COUNT(*)::int AS total FROM products'),
    query('SELECT COUNT(*)::int AS total FROM carts'),
  ])

  res.json({
    data: {
      users: users.rows[0].total,
      products: products.rows[0].total,
      carts: carts.rows[0].total,
    },
  })
}
