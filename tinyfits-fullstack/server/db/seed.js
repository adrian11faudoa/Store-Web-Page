// server/db/seed.js
// Run with: npm run seed
import 'dotenv/config'
import pool from './pool.js'

// ── Reference data ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'tops',        label: 'Tops',        icon: '👕', sort_order: 1 },
  { slug: 'bottoms',     label: 'Bottoms',      icon: '👖', sort_order: 2 },
  { slug: 'dresses',     label: 'Dresses',      icon: '👗', sort_order: 3 },
  { slug: 'outerwear',   label: 'Outerwear',    icon: '🧥', sort_order: 4 },
  { slug: 'swimwear',    label: 'Swimwear',     icon: '🩱', sort_order: 5 },
  { slug: 'footwear',    label: 'Footwear',     icon: '👟', sort_order: 6 },
  { slug: 'accessories', label: 'Accessories',  icon: '🧢', sort_order: 7 },
  { slug: 'sleepwear',   label: 'Sleepwear',    icon: '🌙', sort_order: 8 },
  { slug: 'sets',        label: 'Sets',         icon: '🎁', sort_order: 9 },
]

const AGE_GROUPS = [
  { slug: 'baby',    label: 'Baby',       range: '0–18m', sort_order: 1 },
  { slug: 'toddler', label: 'Toddler',    range: '1–3y',  sort_order: 2 },
  { slug: 'kids',    label: 'Kids',       range: '4–8y',  sort_order: 3 },
  { slug: 'older',   label: 'Older Kids', range: '9–14y', sort_order: 4 },
]

const SIZES = {
  baby:    ['0m','3m','6m','9m','12m','18m'],
  toddler: ['1y','2y','3y'],
  kids:    ['4y','5y','6y','7y','8y'],
  older:   ['9y','10y','11y','12y','13y','14y'],
}

const PALETTES = [
  '#EEEDFE','#CECBF6','#FAECE7','#F5C4B3',
  '#E1F5EE','#9FE1CB','#FBEAF0','#F4C0D1',
  '#FAEEDA','#FAC775','#EAF3DE','#C0DD97',
  '#E6F1FB','#B5D4F4',
]

const NAMES = {
  tops:        ['Colour-block hoodie','Striped long-sleeve tee','Graphic print tee','Ribbed tank top','Polo shirt','Button-up shirt','Henley top','Oversized sweatshirt','Cropped hoodie','V-neck sweater','Floral blouse','Smocked top','Ruffle sleeve top','Cable-knit jumper','Puffed sleeve top','Terry cloth pullover','Baseball tee','Velour tracksuit top','Tie-dye tee','Linen shirt'],
  bottoms:     ['Cargo joggers','Pull-on shorts','Slim-fit jeans','Wide-leg trousers','Jersey shorts','Pleated skirt','Denim shorts','Flowy midi skirt','Leggings','Bike shorts','Corduroy trousers','Paperbag waist pants','Printed leggings','Twill chinos','Skort','Track pants','Linen blend trousers','Broderie skirt','Ribbed leggings','Plaid skirt'],
  dresses:     ['Floral wrap dress','Smocked sundress','Pinafore dress','Tiered ruffle dress','Denim pinafore','Jersey midi dress','Printed shift dress','Broderie dress','Puffed sleeve dress','Checked dress','Velvet party dress','Shirt dress','Linen dress','Knit dress','Rainbow stripe dress','Ditsy floral dress','Pleated midi dress','Balloon sleeve dress','Gingham dress','A-line skirt dress'],
  outerwear:   ['Puffer jacket','Rain mac','Fleece zip-up','Teddy bear coat','Denim jacket','Trench coat','Waterproof anorak','Quilted gilet','Faux fur coat','Bomber jacket','Woven coat','Windbreaker','Sherpa hoodie','Padded gilet','Softshell jacket','Wool blend coat','Cagoule','Stadium jacket','Double-breasted coat','Corduroy jacket'],
  swimwear:    ['Swim bodysuit','Rash guard set','Printed swim trunks','Bikini set','One-piece swimsuit','UV-protect swim top','Board shorts','Tankini set','Swim shorts','Ruffle swimsuit','Striped trunks','Tropical print bikini','Long-sleeve rash vest','Neoprene shorts','Colour-block swimsuit','Animal print swimsuit','Surf set','Beach cover-up','Swim dress','Wetsuit top'],
  footwear:    ['Velcro trainers','Slip-on canvas shoes','Chunky sandals','Rain boots','Hi-top trainers','Mary Jane shoes','Chelsea boots','Clog sandals','Platform trainers','Suede loafers','Jelly sandals','Desert boots','Running trainers','Ballet flats','Western boots','Moccasins','Fisherman sandals','Snow boots','Espadrilles','Light-up trainers'],
  accessories: ['Knit mittens','Stripe scarf','Logo cap','Bucket hat','Sunglasses','Beanie hat','Canvas backpack','Lunch bag','Hair clips set','Beaded bracelet set','Rainbow belt','Sock 5-pack','Swim goggles','Sun hat','Crossbody bag','Snap-back cap','Headband set','Coin purse','Fingerless gloves','Slap bracelet set'],
  sleepwear:   ['Dinosaur pyjama set','Floral nightgown','Star print onesie','Striped pyjamas','Animal hoodie onesie','Cloud print pjs','Rainbow shorts pyjamas','Monster pyjama set','Glow-in-dark pjs','Waffle knit pyjamas','Fairy print nightie','Space print onesie','Cotton pyjama set','Fluffy dressing gown','Checked pyjamas','Superhero pyjamas','Fox onesie','Planet print pjs','Brushed cotton set','Satin trim pyjamas'],
  sets:        ['Tie-dye matching set','Linen co-ord set','Jogger + hoodie set','Swim + rash guard set','Denim shorts + tee set','Floral top + skirt set','Sports set','Striped matching set','Velour tracksuit','Printed shorts set','Terry beach set','Gingham set','Ribbed co-ord','Colour-block set','Animal print set','Floral playsuit set','Linen holiday set','Rainbow co-ord','Broderie set','Retro tracksuit'],
}

const KEYWORDS = {
  tops:        ['kids,hoodie','children,tshirt','kids,sweater','children,shirt','kids,blouse'],
  bottoms:     ['kids,jeans','children,shorts','kids,pants','children,skirt','kids,leggings'],
  dresses:     ['kids,dress','children,dress','girls,dress','kids,sundress','children,frock'],
  outerwear:   ['kids,jacket','children,coat','kids,puffer','children,raincoat','kids,anorak'],
  swimwear:    ['kids,swimsuit','children,swimwear','kids,bikini','children,swimtrunks','kids,rashguard'],
  footwear:    ['kids,sneakers','children,shoes','kids,boots','children,sandals','kids,trainers'],
  accessories: ['kids,hat','children,backpack','kids,scarf','children,accessories','kids,bag'],
  sleepwear:   ['kids,pajamas','children,pyjamas','kids,onesie','children,nightwear','kids,sleepwear'],
  sets:        ['kids,matching,outfit','children,co-ord','kids,tracksuit','children,set,outfit','kids,twinset'],
}

function rand(arr)            { return arr[Math.floor(Math.random() * arr.length)] }
function randBetween(min,max) { return Math.floor(Math.random() * (max - min + 1)) + min }

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Clear existing data
    console.log('Clearing existing data…')
    await client.query('DELETE FROM cart_items')
    await client.query('DELETE FROM carts')
    await client.query('DELETE FROM wishlists')
    await client.query('DELETE FROM products')
    await client.query('DELETE FROM categories')
    await client.query('DELETE FROM age_groups')

    // Insert categories
    console.log('Seeding categories…')
    const catMap = {}
    for (const cat of CATEGORIES) {
      const res = await client.query(
        `INSERT INTO categories (slug, label, icon, sort_order)
         VALUES ($1,$2,$3,$4) RETURNING id`,
        [cat.slug, cat.label, cat.icon, cat.sort_order]
      )
      catMap[cat.slug] = res.rows[0].id
    }

    // Insert age groups
    console.log('Seeding age groups…')
    const ageMap = {}
    for (const ag of AGE_GROUPS) {
      const res = await client.query(
        `INSERT INTO age_groups (slug, label, range, sort_order)
         VALUES ($1,$2,$3,$4) RETURNING id`,
        [ag.slug, ag.label, ag.range, ag.sort_order]
      )
      ageMap[ag.slug] = res.rows[0].id
    }

    // Insert products — 100 per category = 900 total
    console.log('Seeding products…')
    let id = 1
    let total = 0

    for (const [catSlug, names] of Object.entries(NAMES)) {
      const keywords = KEYWORDS[catSlug]
      const catId    = catMap[catSlug]
      const ageSlugs = Object.keys(SIZES)

      for (let i = 0; i < 100; i++) {
        const ageSlug  = ageSlugs[i % ageSlugs.length]
        const ageId    = ageMap[ageSlug]
        const sizesArr = SIZES[ageSlug].slice(0, randBetween(2, SIZES[ageSlug].length))
        const basePrice= randBetween(8, 65)
        const onSale   = Math.random() < 0.2
        const oldPrice = onSale ? basePrice : null
        const price    = onSale ? Math.round(basePrice * (0.6 + Math.random() * 0.3)) : basePrice
        const badge    = onSale ? 'sale' : (Math.random() < 0.3 ? 'new' : null)
        const nameBase = names[i % names.length]
        const name     = i >= names.length ? `${nameBase} v${Math.floor(i/names.length)+1}` : nameBase
        const keyword  = keywords[i % keywords.length]
        const sig      = id * 7 + i
        const imageUrl = `https://source.unsplash.com/400x500/?${encodeURIComponent(keyword)}&sig=${sig}`
        const bg       = PALETTES[id % PALETTES.length]
        const rating   = +(3.5 + Math.random() * 1.5).toFixed(1)
        const reviews  = randBetween(2, 340)

        await client.query(
          `INSERT INTO products
             (name, category_id, age_group_id, price, old_price, badge,
              image_url, fallback_bg, sizes, in_stock, rating, reviews)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [name, catId, ageId, price, oldPrice, badge,
           imageUrl, bg, sizesArr, Math.random() > 0.05, rating, reviews]
        )
        id++
        total++
      }
      console.log(`  ✓ ${catSlug}: 100 products`)
    }

    await client.query('COMMIT')
    console.log(`\n✅ Seeded ${total} products across ${CATEGORIES.length} categories`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('✗ Seed failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
