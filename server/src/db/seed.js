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
  ['baby-3-12m', 'Baby', '3-12 months', 1],
  ['baby-6-24m', 'Baby', '6-24 months', 2],
  ['kids-2-4', '2-4 years', '2-4 years', 3],
  ['kids-4-6', '4-6 years', '4-6 years', 4],
  ['kids-7-10', '7-10 years', '7-10 years', 5],
  ['kids-8-12', '8-12 years', '8-12 years', 6],
  ['kids-10-14', '10-14 years', '10-14 years', 7],
]

const products = [
  ['Sunny Denim Layer Set', 'A sunshine-hued denim jacket with matching shorts and a soft jersey tee for easy all-day outfits.', ['denim', 'set', 'summer', 'girls'], 'sets', 'kids-7-10', 'girls', 38, 46, 4.8, 121, ['7Y', '8Y', '9Y', '10Y'], 'sale', '#FFD0C7', ['#FFD0C7', '#A8E6CF'], '2026-03-15'],
  ['Coastline Play Dress', 'A twirl-ready dress in cheerful stripes with breezy sleeves and a comfy cotton lining.', ['dress', 'spring', 'party'], 'dresses', 'kids-4-6', 'girls', 32, null, 4.7, 83, ['4Y', '5Y', '6Y'], 'new', '#FFDEE2', ['#FFDEE2', '#FFE66D'], '2026-04-04'],
  ['Harbor Utility Jacket', 'A lightweight field jacket with roomy pockets and an easy zip front for play-anywhere layering.', ['jacket', 'school', 'layer'], 'outerwear', 'kids-8-12', 'boys', 46, null, 4.9, 156, ['8Y', '10Y', '12Y'], 'best seller', '#74B9FF', ['#74B9FF', '#CDE7FF'], '2026-02-20'],
  ['Little Scout Joggers', 'Soft stretch joggers with reinforced knees and a pull-on waist built for climbing, running, and recess.', ['joggers', 'play', 'bottoms'], 'bottoms', 'kids-4-6', 'boys', 24, null, 4.5, 68, ['4Y', '5Y', '6Y'], '', '#B6D8FF', ['#B6D8FF', '#EAF5FF'], '2026-01-14'],
  ['Mini Bloom Romper', 'A flower-soft romper set with a matching headband and snap closures for extra-easy outfit changes.', ['baby', 'romper', 'gift'], 'sets', 'baby-6-24m', 'baby girls', 28, null, 4.8, 102, ['6M', '12M', '18M', '24M'], 'new', '#FFD8E4', ['#FFD8E4', '#FFF1D8'], '2026-03-28'],
  ['Tiny Trail Overall', 'Cloud-soft overalls with adjustable straps and roomy legs for first steps and stroller naps alike.', ['baby', 'overall', 'layer'], 'bottoms', 'baby-6-24m', 'baby boys', 30, null, 4.6, 58, ['6M', '12M', '18M', '24M'], '', '#A8E6CF', ['#A8E6CF', '#E8FFF5'], '2026-01-30'],
  ['Studio Knit Cardigan', 'A cozy rib-knit cardigan with pearl-look buttons that dresses up jeans, skirts, and party sets.', ['cardigan', 'layer', 'knit'], 'outerwear', 'kids-10-14', 'girls', 42, 52, 4.7, 77, ['10Y', '12Y', '14Y'], 'sale', '#E2D7FF', ['#E2D7FF', '#FFF4FD'], '2026-02-11'],
  ['Weekend Cargo Shorts', 'Easy cargo shorts with deep pockets, a soft waistband, and enough durability for nonstop exploring.', ['shorts', 'cargo', 'summer'], 'bottoms', 'kids-7-10', 'boys', 26, null, 4.4, 51, ['7Y', '8Y', '9Y', '10Y'], '', '#CDE4C7', ['#CDE4C7', '#F5F8E8'], '2026-03-02'],
  ['Meadow Party Set', 'A special-occasion blouse and skirt duo with plenty of stretch for dancing, snacks, and photos.', ['party', 'set', 'girls'], 'sets', 'kids-2-4', 'girls', 34, null, 4.9, 88, ['2Y', '3Y', '4Y'], 'featured', '#FFE7BE', ['#FFE7BE', '#FFD1E4'], '2026-04-10'],
  ['Atlas Rib Tee', 'A soft ribbed tee with a neat fit and a hint of stretch for school days and weekend hangs.', ['tee', 'basic', 'tops'], 'tops', 'kids-10-14', 'boys', 19, null, 4.3, 44, ['10Y', '12Y', '14Y'], '', '#9CD1FF', ['#9CD1FF', '#E8F6FF'], '2026-02-05'],
  ['Garden Tulle Skirt', 'Layers of airy tulle over a super-soft lining make this skirt perfect for parties and everyday sparkle.', ['skirt', 'occasion', 'girls'], 'bottoms', 'kids-7-10', 'girls', 29, null, 4.8, 96, ['7Y', '8Y', '9Y', '10Y'], '', '#FFD6EE', ['#FFD6EE', '#FFF6FB'], '2026-03-18'],
  ['Shoreline Baby Knit Set', 'A breezy knit top and bloomer set that keeps little ones cool and cuddly on sunny afternoons.', ['baby', 'knit', 'set'], 'tops', 'baby-3-12m', 'baby boys', 27, null, 4.5, 61, ['3M', '6M', '9M', '12M'], 'new', '#BFE6FF', ['#BFE6FF', '#F3FBFF'], '2026-04-08'],
  ['Coral Sun Tee', 'A cheerful puff-sleeve tee with sunny embroidery and a buttery-soft feel kids want to wear every day.', ['tee', 'girls', 'everyday'], 'tops', 'kids-2-4', 'girls', 18, null, 4.6, 72, ['2Y', '3Y', '4Y'], 'featured', '#FFAAA5', ['#FFAAA5', '#FFF1F0'], '2026-04-12'],
  ['Minty Morning Leggings', 'Super-stretch leggings with a smooth waistband and playful all-over print for busy little movers.', ['leggings', 'soft', 'play'], 'bottoms', 'kids-4-6', 'girls', 20, null, 4.7, 79, ['4Y', '5Y', '6Y'], '', '#A8E6CF', ['#A8E6CF', '#F1FFF8'], '2026-03-11'],
  ['Rocket Stripe Hoodie', 'A sporty zip hoodie with bold stripes, fleece-soft lining, and a fit made for everyday adventures.', ['hoodie', 'boys', 'sports'], 'outerwear', 'kids-7-10', 'boys', 36, null, 4.9, 130, ['7Y', '8Y', '9Y', '10Y'], 'best seller', '#74B9FF', ['#74B9FF', '#4ECDC4'], '2026-04-01'],
  ['Sunbeam Skater Dress', 'A bright skater silhouette with a soft stretch bodice and floaty skirt for parties and polished days out.', ['dress', 'party', 'twirl'], 'dresses', 'kids-10-14', 'girls', 41, 49, 4.8, 91, ['10Y', '12Y', '14Y'], 'sale', '#FFE66D', ['#FFE66D', '#FFD3B6'], '2026-03-25'],
  ['Snuggle Cloud Bodysuit', 'A dreamy ribbed bodysuit with envelope shoulders and snap legs to make everyday changes wonderfully easy.', ['bodysuit', 'baby', 'soft'], 'tops', 'baby-3-12m', 'baby girls', 16, null, 4.9, 112, ['3M', '6M', '9M', '12M'], 'featured', '#FFDCE8', ['#FFDCE8', '#FFFFFF'], '2026-04-13'],
  ['Little Comet Set', 'A tee-and-shorts combo with bright rocket graphics and soft cotton made for all-day play.', ['set', 'rocket', 'play'], 'sets', 'kids-2-4', 'boys', 31, null, 4.6, 64, ['2Y', '3Y', '4Y'], 'new', '#8FD3FF', ['#8FD3FF', '#FFE66D'], '2026-04-09'],
  ['Puddle Jump Raincoat', 'A splash-proof raincoat with a happy pop of color, roomy hood, and soft lining for drizzly-day adventures.', ['raincoat', 'unisex', 'outerwear'], 'outerwear', 'kids-4-6', 'unisex', 39, null, 4.7, 85, ['4Y', '5Y', '6Y'], 'featured', '#4ECDC4', ['#4ECDC4', '#FFE66D'], '2026-03-29'],
  ['Cubby Bear Pants', 'Pull-on baby pants with a bear-face pocket and a stretchy waistband that stays comfy through naps and cuddles.', ['baby', 'pants', 'cozy'], 'bottoms', 'baby-3-12m', 'baby boys', 17, null, 4.5, 53, ['3M', '6M', '9M', '12M'], '', '#C7E7C1', ['#C7E7C1', '#FFF6E5'], '2026-02-22'],
]

async function seed() {
  await pool.query('BEGIN')
  try {
    await pool.query('DELETE FROM cart_items')
    await pool.query('DELETE FROM carts')
    await pool.query('DELETE FROM refresh_tokens')
    await pool.query('DELETE FROM password_reset_codes')
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

    for (const [name, description, tags, categorySlug, ageGroupSlug, gender, price, oldPrice, rating, reviews, sizes, badge, fallbackBg, palette, releaseDate] of products) {
      await pool.query(
        `INSERT INTO products (
          name,
          description,
          tags,
          category_id,
          age_group_id,
          gender,
          price,
          old_price,
          rating,
          reviews,
          sizes,
          badge,
          fallback_bg,
          palette,
          release_date
        )
        VALUES (
          $1,
          $2,
          $3,
          (SELECT id FROM categories WHERE slug = $4),
          (SELECT id FROM age_groups WHERE slug = $5),
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15
        )`,
        [name, description, tags, categorySlug, ageGroupSlug, gender, price, oldPrice, rating, reviews, sizes, badge, fallbackBg, palette, releaseDate]
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
