import { query } from '../db/pool.js'

export async function listCategories() {
  const result = await query(
    `SELECT c.id, c.slug, c.label, c.icon, COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.in_stock = TRUE
     GROUP BY c.id
     ORDER BY c.sort_order ASC`
  )

  return result.rows
}

export async function listAgeGroups() {
  const result = await query(
    `SELECT ag.id, ag.slug, ag.label, ag.range, COUNT(p.id) AS product_count
     FROM age_groups ag
     LEFT JOIN products p ON p.age_group_id = ag.id AND p.in_stock = TRUE
     GROUP BY ag.id
     ORDER BY ag.sort_order ASC`
  )

  return result.rows
}
