import pool from './pool.js'
import { logger } from '../lib/logger.js'

const categories = [
  ['tops', 'Tops', 'shirt', 1],
  ['bottoms', 'Bottoms', 'pants', 2],
  ['dresses', 'Dresses', 'dress', 3],
  ['outerwear', 'Outerwear', 'coat', 4],
  ['sets', 'Sets', 'gift', 5],
]

const ageGroups = [
  ['baby-0-24m', 'Baby', '0-24 months', 1],
  ['kids-2-4', '2-4 years', '2-4 years', 2],
  ['kids-4-6', '4-6 years', '4-6 years', 3],
  ['kids-7-10', '7-10 years', '7-10 years', 4],
  ['kids-10-14', '10-14 years', '10-14 years', 5],
]

const products = [
  ['Sunny Denim Layer Set', 'sets', 'kids-7-10', 'girls', 38, 4.8],
  ['Coastline Play Dress', 'dresses', 'kids-4-6', 'girls', 32, 4.7],
  ['Harbor Utility Jacket', 'outerwear', 'kids-7-10', 'boys', 46, 4.9],
  ['Little Scout Joggers', 'bottoms', 'kids-4-6', 'boys', 24, 4.5],
]

async function seed() {
  await pool.query('BEGIN')
  try {
    await pool.query('DELETE FROM cart_items')
    await pool.query('DELETE FROM carts')
    await pool.query('DELETE FROM refresh_tokens')
    await pool.query('DELETE FROM products')
    await pool.query('DELETE FROM categories')
    await pool.query('DELETE FROM age_groups')

    for (const [slug, label, icon, sortOrder] of categories) {
      await pool.query(
        'INSERT INTO categories (slug, label, icon, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING',
        [slug, label, icon, sortOrder]
      )
    }

    for (const [slug, label, range, sortOrder] of ageGroups) {
      await pool.query(
        'INSERT INTO age_groups (slug, label, range, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING',
        [slug, label, range, sortOrder]
      )
    }

    for (const [name, categorySlug, ageGroupSlug, gender, price, rating] of products) {
      await pool.query(
        `INSERT INTO products (name, category_id, age_group_id, gender, price, rating, sizes, badge)
         VALUES (
           $1,
           (SELECT id FROM categories WHERE slug = $2),
           (SELECT id FROM age_groups WHERE slug = $3),
           $4,
           $5,
           $6,
           ARRAY['S', 'M', 'L'],
           'featured'
         )`,
        [name, categorySlug, ageGroupSlug, gender, price, rating]
      )
    }

    await pool.query('COMMIT')
    logger.info('Seed complete')
  } catch (error) {
    await pool.query('ROLLBACK')
    logger.error({ err: error }, 'Seed failed')
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
