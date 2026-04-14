// server/db/migrate_age_groups.js
// Run with: node db/migrate_age_groups.js
// Safely replaces chunked age groups (boys-2-4, girls-5-8 etc.) with
// per-year slugs (boys-2, boys-3 … boys-16, girls-2 … girls-16)
// WITHOUT wiping any products, users, or carts.

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })
const { default: pool } = await import('./pool.js')

// ── New per-year age groups ──────────────────────────────────────────────────
const NEW_AGE_GROUPS = [
  { slug: 'baby-boy',      label: 'Baby Boy',   range: '3M–24M',  sort_order: 1,  gender: 'boy'  },
  { slug: 'baby-girl',     label: 'Baby Girl',  range: '3M–24M',  sort_order: 2,  gender: 'girl' },
  { slug: 'boys-2',        label: '2 Años',     range: '2 años',  sort_order: 3,  gender: 'boy'  },
  { slug: 'boys-3',        label: '3 Años',     range: '3 años',  sort_order: 4,  gender: 'boy'  },
  { slug: 'boys-4',        label: '4 Años',     range: '4 años',  sort_order: 5,  gender: 'boy'  },
  { slug: 'boys-5',        label: '5 Años',     range: '5 años',  sort_order: 6,  gender: 'boy'  },
  { slug: 'boys-6',        label: '6 Años',     range: '6 años',  sort_order: 7,  gender: 'boy'  },
  { slug: 'boys-7',        label: '7 Años',     range: '7 años',  sort_order: 8,  gender: 'boy'  },
  { slug: 'boys-8',        label: '8 Años',     range: '8 años',  sort_order: 9,  gender: 'boy'  },
  { slug: 'boys-9',        label: '9 Años',     range: '9 años',  sort_order: 10, gender: 'boy'  },
  { slug: 'boys-10',       label: '10 Años',    range: '10 años', sort_order: 11, gender: 'boy'  },
  { slug: 'boys-11',       label: '11 Años',    range: '11 años', sort_order: 12, gender: 'boy'  },
  { slug: 'boys-12',       label: '12 Años',    range: '12 años', sort_order: 13, gender: 'boy'  },
  { slug: 'boys-13',       label: '13 Años',    range: '13 años', sort_order: 14, gender: 'boy'  },
  { slug: 'boys-14',       label: '14 Años',    range: '14 años', sort_order: 15, gender: 'boy'  },
  { slug: 'boys-15',       label: '15 Años',    range: '15 años', sort_order: 16, gender: 'boy'  },
  { slug: 'boys-16',       label: '16 Años',    range: '16 años', sort_order: 17, gender: 'boy'  },
  { slug: 'boys-unitalla', label: 'Unitalla',   range: 'Unitalla',sort_order: 18, gender: 'boy'  },
  { slug: 'girls-2',       label: '2 Años',     range: '2 años',  sort_order: 19, gender: 'girl' },
  { slug: 'girls-3',       label: '3 Años',     range: '3 años',  sort_order: 20, gender: 'girl' },
  { slug: 'girls-4',       label: '4 Años',     range: '4 años',  sort_order: 21, gender: 'girl' },
  { slug: 'girls-5',       label: '5 Años',     range: '5 años',  sort_order: 22, gender: 'girl' },
  { slug: 'girls-6',       label: '6 Años',     range: '6 años',  sort_order: 23, gender: 'girl' },
  { slug: 'girls-7',       label: '7 Años',     range: '7 años',  sort_order: 24, gender: 'girl' },
  { slug: 'girls-8',       label: '8 Años',     range: '8 años',  sort_order: 25, gender: 'girl' },
  { slug: 'girls-9',       label: '9 Años',     range: '9 años',  sort_order: 26, gender: 'girl' },
  { slug: 'girls-10',      label: '10 Años',    range: '10 años', sort_order: 27, gender: 'girl' },
  { slug: 'girls-11',      label: '11 Años',    range: '11 años', sort_order: 28, gender: 'girl' },
  { slug: 'girls-12',      label: '12 Años',    range: '12 años', sort_order: 29, gender: 'girl' },
  { slug: 'girls-13',      label: '13 Años',    range: '13 años', sort_order: 30, gender: 'girl' },
  { slug: 'girls-14',      label: '14 Años',    range: '14 años', sort_order: 31, gender: 'girl' },
  { slug: 'girls-15',      label: '15 Años',    range: '15 años', sort_order: 32, gender: 'girl' },
  { slug: 'girls-16',      label: '16 Años',    range: '16 años', sort_order: 33, gender: 'girl' },
  { slug: 'girls-unitalla',label: 'Unitalla',   range: 'Unitalla',sort_order: 34, gender: 'girl' },
]

// Maps old chunked slug → array of new per-year slugs that replace it
// Products in old chunk are redistributed round-robin across the new year slugs
const OLD_TO_NEW = {
  'baby-boy':    ['baby-boy'],
  'baby-girl':   ['baby-girl'],
  'boys-2-4':    ['boys-2','boys-3','boys-4'],
  'boys-5-8':    ['boys-5','boys-6','boys-7','boys-8'],
  'boys-9-12':   ['boys-9','boys-10','boys-11','boys-12'],
  'boys-13-16':  ['boys-13','boys-14','boys-15','boys-16'],
  'girls-2-4':   ['girls-2','girls-3','girls-4'],
  'girls-5-8':   ['girls-5','girls-6','girls-7','girls-8'],
  'girls-9-12':  ['girls-9','girls-10','girls-11','girls-12'],
  'girls-13-16': ['girls-13','girls-14','girls-15','girls-16'],
}

// Sizes per new slug
const SIZES = {
  'baby-boy':      ['3M','6M','9M','12M','18M','24M'],
  'baby-girl':     ['3M','6M','9M','12M','18M','24M'],
  'boys-2': ['2Y'], 'boys-3': ['3Y'], 'boys-4': ['4Y'], 'boys-5': ['5Y'],
  'boys-6': ['6Y'], 'boys-7': ['7Y'], 'boys-8': ['8Y'], 'boys-9': ['9Y'],
  'boys-10':['10Y'],'boys-11':['11Y'],'boys-12':['12Y'],'boys-13':['13Y'],
  'boys-14':['14Y'],'boys-15':['15Y'],'boys-16':['16Y'],'boys-unitalla':['Unitalla'],
  'girls-2': ['2Y'], 'girls-3': ['3Y'], 'girls-4': ['4Y'], 'girls-5': ['5Y'],
  'girls-6': ['6Y'], 'girls-7': ['7Y'], 'girls-8': ['8Y'], 'girls-9': ['9Y'],
  'girls-10':['10Y'],'girls-11':['11Y'],'girls-12':['12Y'],'girls-13':['13Y'],
  'girls-14':['14Y'],'girls-15':['15Y'],'girls-16':['16Y'],'girls-unitalla':['Unitalla'],
}

async function run() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Read current age_groups from DB
    const { rows: existing } = await client.query('SELECT id, slug FROM age_groups')
    const existingBySlug = Object.fromEntries(existing.map(r => [r.slug, r.id]))
    console.log('Existing age groups in DB:', existing.map(r => r.slug).join(', '))

    // 2. Upsert all new age groups
    const newIdBySlug = {}
    for (const ag of NEW_AGE_GROUPS) {
      if (existingBySlug[ag.slug]) {
        // Already exists — just update label/range/sort
        await client.query(
          'UPDATE age_groups SET label=$1, range=$2, sort_order=$3 WHERE slug=$4',
          [ag.label, ag.range, ag.sort_order, ag.slug]
        )
        newIdBySlug[ag.slug] = existingBySlug[ag.slug]
        console.log(`  ✓ kept   ${ag.slug}`)
      } else {
        const r = await client.query(
          'INSERT INTO age_groups (slug, label, range, sort_order) VALUES ($1,$2,$3,$4) RETURNING id',
          [ag.slug, ag.label, ag.range, ag.sort_order]
        )
        newIdBySlug[ag.slug] = r.rows[0].id
        console.log(`  + added  ${ag.slug}`)
      }
    }

    // 3. Re-assign products from old chunked slugs to new per-year slugs
    for (const [oldSlug, newSlugs] of Object.entries(OLD_TO_NEW)) {
      if (!existingBySlug[oldSlug]) continue // old slug doesn't exist — already migrated or never existed
      if (newSlugs.length === 1 && newSlugs[0] === oldSlug) continue // no change needed

      const oldId = existingBySlug[oldSlug]
      const { rows: prods } = await client.query(
        'SELECT id FROM products WHERE age_group_id=$1 ORDER BY id', [oldId]
      )
      console.log(`  Migrating ${prods.length} products from ${oldSlug} → [${newSlugs.join(',')}]`)

      for (let i = 0; i < prods.length; i++) {
        const targetSlug = newSlugs[i % newSlugs.length]
        const targetId   = newIdBySlug[targetSlug]
        const gender     = NEW_AGE_GROUPS.find(a => a.slug === targetSlug).gender
        const sizes      = SIZES[targetSlug]
        await client.query(
          'UPDATE products SET age_group_id=$1, gender=$2, sizes=$3 WHERE id=$4',
          [targetId, gender, sizes, prods[i].id]
        )
      }
    }

    // 4. Remove old chunked age_groups that are now empty
    const oldChunkedSlugs = Object.keys(OLD_TO_NEW).filter(s => !NEW_AGE_GROUPS.find(n => n.slug === s))
    for (const slug of oldChunkedSlugs) {
      if (!existingBySlug[slug]) continue
      const { rows } = await client.query(
        'SELECT COUNT(*) FROM products WHERE age_group_id=$1', [existingBySlug[slug]]
      )
      if (parseInt(rows[0].count) === 0) {
        await client.query('DELETE FROM age_groups WHERE slug=$1', [slug])
        console.log(`  - removed empty old group: ${slug}`)
      } else {
        console.log(`  ⚠ old group ${slug} still has ${rows[0].count} products — skipping delete`)
      }
    }

    await client.query('COMMIT')
    console.log('\n✅ Age group migration complete')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('✗ Migration failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

run()
