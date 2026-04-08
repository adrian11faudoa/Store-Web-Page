// server/db/seed.js
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })

const { default: pool } = await import('./pool.js')

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

// New age group structure: boys 2-16y, girls 2-16y, baby-boy 3-24m, baby-girl 3-24m
const AGE_GROUPS = [
  { slug: 'baby-boy',    label: 'Baby Boy',    range: '3M–24M', sort_order: 1 },
  { slug: 'baby-girl',   label: 'Baby Girl',   range: '3M–24M', sort_order: 2 },
  { slug: 'boys-2-4',    label: 'Boys 2–4y',   range: '2–4y',   sort_order: 3 },
  { slug: 'boys-5-8',    label: 'Boys 5–8y',   range: '5–8y',   sort_order: 4 },
  { slug: 'boys-9-12',   label: 'Boys 9–12y',  range: '9–12y',  sort_order: 5 },
  { slug: 'boys-13-16',  label: 'Boys 13–16y', range: '13–16y', sort_order: 6 },
  { slug: 'girls-2-4',   label: 'Girls 2–4y',  range: '2–4y',   sort_order: 7 },
  { slug: 'girls-5-8',   label: 'Girls 5–8y',  range: '5–8y',   sort_order: 8 },
  { slug: 'girls-9-12',  label: 'Girls 9–12y', range: '9–12y',  sort_order: 9 },
  { slug: 'girls-13-16', label: 'Girls 13–16y',range: '13–16y', sort_order: 10 },
]

// Sizes per age group
const SIZES = {
  'baby-boy':    ['3M','6M','9M','12M','18M','24M'],
  'baby-girl':   ['3M','6M','9M','12M','18M','24M'],
  'boys-2-4':    ['2Y','3Y','4Y'],
  'boys-5-8':    ['5Y','6Y','7Y','8Y'],
  'boys-9-12':   ['9Y','10Y','11Y','12Y'],
  'boys-13-16':  ['13Y','14Y','15Y','16Y'],
  'girls-2-4':   ['2Y','3Y','4Y'],
  'girls-5-8':   ['5Y','6Y','7Y','8Y'],
  'girls-9-12':  ['9Y','10Y','11Y','12Y'],
  'girls-13-16': ['13Y','14Y','15Y','16Y'],
}

// Gender assignment based on age group
const AGE_GROUP_GENDER = {
  'baby-boy':    'boy',
  'baby-girl':   'girl',
  'boys-2-4':    'boy',
  'boys-5-8':    'boy',
  'boys-9-12':   'boy',
  'boys-13-16':  'boy',
  'girls-2-4':   'girl',
  'girls-5-8':   'girl',
  'girls-9-12':  'girl',
  'girls-13-16': 'girl',
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

const IMAGE_SEEDS = {
  tops:        'fashion-top',
  bottoms:     'fashion-pants',
  dresses:     'fashion-dress',
  outerwear:   'fashion-jacket',
  swimwear:    'fashion-swim',
  footwear:    'fashion-shoes',
  accessories: 'fashion-accessory',
  sleepwear:   'fashion-pajama',
  sets:        'fashion-outfit',
}

function rand(arr)            { return arr[Math.floor(Math.random() * arr.length)] }
function randBetween(min,max) { return Math.floor(Math.random() * (max - min + 1)) + min }

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    console.log('Clearing existing data...')
    await client.query('DELETE FROM cart_items')
    await client.query('DELETE FROM carts')
    await client.query('DELETE FROM wishlists')
    await client.query('DELETE FROM products')
    await client.query('DELETE FROM categories')
    await client.query('DELETE FROM age_groups')

    console.log('Seeding categories...')
    const catMap = {}
    for (const cat of CATEGORIES) {
      const res = await client.query(
        'INSERT INTO categories (slug, label, icon, sort_order) VALUES ($1,$2,$3,$4) RETURNING id',
        [cat.slug, cat.label, cat.icon, cat.sort_order]
      )
      catMap[cat.slug] = res.rows[0].id
    }

    console.log('Seeding age groups...')
    const ageMap = {}
    for (const ag of AGE_GROUPS) {
      const res = await client.query(
        'INSERT INTO age_groups (slug, label, range, sort_order) VALUES ($1,$2,$3,$4) RETURNING id',
        [ag.slug, ag.label, ag.range, ag.sort_order]
      )
      ageMap[ag.slug] = res.rows[0].id
    }

    console.log('Seeding products...')
    let id = 1
    let total = 0
    const ageSlugs = Object.keys(SIZES)

    for (const [catSlug, names] of Object.entries(NAMES)) {
      const catId   = catMap[catSlug]
      const imgSeed = IMAGE_SEEDS[catSlug]

      for (let i = 0; i < 100; i++) {
        const ageSlug  = ageSlugs[i % ageSlugs.length]
        const ageId    = ageMap[ageSlug]
        const gender   = AGE_GROUP_GENDER[ageSlug]
        const sizesArr = SIZES[ageSlug].slice(0, randBetween(2, SIZES[ageSlug].length))
        const basePrice= randBetween(8, 65)
        const onSale   = Math.random() < 0.2
        const oldPrice = onSale ? basePrice : null
        const price    = onSale ? Math.round(basePrice * (0.6 + Math.random() * 0.3)) : basePrice
        const badge    = onSale ? 'sale' : (Math.random() < 0.3 ? 'new' : null)
        const nameBase = names[i % names.length]
        const name     = i >= names.length ? `${nameBase} v${Math.floor(i/names.length)+1}` : nameBase
        const imageUrl = `https://picsum.photos/seed/${imgSeed}-${i}/400/500`
        const bg       = PALETTES[id % PALETTES.length]
        const rating   = +(3.5 + Math.random() * 1.5).toFixed(1)
        const reviews  = randBetween(2, 340)

        await client.query(
          `INSERT INTO products
             (name, category_id, age_group_id, gender, price, old_price, badge,
              image_url, fallback_bg, sizes, in_stock, rating, reviews)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [name, catId, ageId, gender, price, oldPrice, badge,
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
