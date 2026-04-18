import { query } from '../db/pool.js'
import { ApiError } from '../lib/errors.js'

const ORDER_MAP = {
  featured: 'p.rating DESC, p.reviews DESC, p.id DESC',
  'price-asc': 'p.price ASC, p.id DESC',
  'price-desc': 'p.price DESC, p.id DESC',
  rating: 'p.rating DESC, p.reviews DESC, p.id DESC',
  name: 'p.name ASC, p.id DESC',
  newest: 'p.release_date DESC, p.id DESC',
}

function buildFilters(filters) {
  const clauses = ['p.in_stock = TRUE']
  const params = []

  if (filters.category && filters.category !== 'all') {
    params.push(filters.category)
    clauses.push(`c.slug = $${params.length}`)
  }

  if (filters.ageGroup && filters.ageGroup !== 'all') {
    params.push(filters.ageGroup)
    clauses.push(`ag.slug = $${params.length}`)
  }

  if (filters.gender && filters.gender !== 'all') {
    params.push(filters.gender)
    clauses.push(`p.gender = $${params.length}`)
  }

  if (filters.badge) {
    params.push(filters.badge)
    clauses.push(`p.badge = $${params.length}`)
  }

  if (filters.q) {
    params.push(filters.q)
    clauses.push(`p.search_vector @@ plainto_tsquery('english', $${params.length})`)
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export async function listProducts(filters) {
  const { where, params } = buildFilters(filters)
  const offset = (filters.page - 1) * filters.limit

  const countResult = await query(
    `SELECT COUNT(*) AS total
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN age_groups ag ON ag.id = p.age_group_id
     ${where}`,
    params
  )

  const dataResult = await query(
    `SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.old_price,
        p.badge,
        p.image_url,
        p.fallback_bg,
        p.palette,
        p.tags,
        p.release_date,
        p.sizes,
        p.rating,
        p.reviews,
        p.gender,
        c.slug AS category,
        c.label AS category_label,
        ag.slug AS age_group,
        ag.label AS age_label,
        ag.range AS age_range,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN age_groups ag ON ag.id = p.age_group_id
      ${where}
      ORDER BY ${ORDER_MAP[filters.sort] || ORDER_MAP.featured}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}`,
    [...params, filters.limit, offset]
  )

  const total = Number(countResult.rows[0].total)
  return {
    data: dataResult.rows,
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit) || 1,
    },
  }
}

export async function getProductById(id) {
  const result = await query(
    `SELECT
        p.*,
        c.slug AS category,
        c.label AS category_label,
        ag.slug AS age_group,
        ag.label AS age_label,
        ag.range AS age_range
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN age_groups ag ON ag.id = p.age_group_id
      WHERE p.id = $1`,
    [id]
  )

  if (!result.rows.length) throw new ApiError(404, 'Product not found')
  return result.rows[0]
}
