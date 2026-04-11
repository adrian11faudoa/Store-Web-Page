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

// Age group structure: boys 2-16y (year by year), girls 2-16y (year by year),
// baby-boy & baby-girl by month (3M–24M)
const AGE_GROUPS = [
  { slug: 'baby-boy',     label: 'Baby Boy',      range: '3M–24M', sort_order: 1  },
  { slug: 'baby-girl',    label: 'Baby Girl',      range: '3M–24M', sort_order: 2  },
  { slug: 'boys-2',       label: '2 Años',         range: '2 años', sort_order: 3  },
  { slug: 'boys-3',       label: '3 Años',         range: '3 años', sort_order: 4  },
  { slug: 'boys-4',       label: '4 Años',         range: '4 años', sort_order: 5  },
  { slug: 'boys-5',       label: '5 Años',         range: '5 años', sort_order: 6  },
  { slug: 'boys-6',       label: '6 Años',         range: '6 años', sort_order: 7  },
  { slug: 'boys-7',       label: '7 Años',         range: '7 años', sort_order: 8  },
  { slug: 'boys-8',       label: '8 Años',         range: '8 años', sort_order: 9  },
  { slug: 'boys-9',       label: '9 Años',         range: '9 años', sort_order: 10 },
  { slug: 'boys-10',      label: '10 Años',        range: '10 años',sort_order: 11 },
  { slug: 'boys-11',      label: '11 Años',        range: '11 años',sort_order: 12 },
  { slug: 'boys-12',      label: '12 Años',        range: '12 años',sort_order: 13 },
  { slug: 'boys-13',      label: '13 Años',        range: '13 años',sort_order: 14 },
  { slug: 'boys-14',      label: '14 Años',        range: '14 años',sort_order: 15 },
  { slug: 'boys-15',      label: '15 Años',        range: '15 años',sort_order: 16 },
  { slug: 'boys-16',      label: '16 Años',        range: '16 años',sort_order: 17 },
  { slug: 'boys-unitalla',label: 'Unitalla',        range: 'Unitalla',sort_order: 18},
  { slug: 'girls-2',      label: '2 Años',         range: '2 años', sort_order: 19 },
  { slug: 'girls-3',      label: '3 Años',         range: '3 años', sort_order: 20 },
  { slug: 'girls-4',      label: '4 Años',         range: '4 años', sort_order: 21 },
  { slug: 'girls-5',      label: '5 Años',         range: '5 años', sort_order: 22 },
  { slug: 'girls-6',      label: '6 Años',         range: '6 años', sort_order: 23 },
  { slug: 'girls-7',      label: '7 Años',         range: '7 años', sort_order: 24 },
  { slug: 'girls-8',      label: '8 Años',         range: '8 años', sort_order: 25 },
  { slug: 'girls-9',      label: '9 Años',         range: '9 años', sort_order: 26 },
  { slug: 'girls-10',     label: '10 Años',        range: '10 años',sort_order: 27 },
  { slug: 'girls-11',     label: '11 Años',        range: '11 años',sort_order: 28 },
  { slug: 'girls-12',     label: '12 Años',        range: '12 años',sort_order: 29 },
  { slug: 'girls-13',     label: '13 Años',        range: '13 años',sort_order: 30 },
  { slug: 'girls-14',     label: '14 Años',        range: '14 años',sort_order: 31 },
  { slug: 'girls-15',     label: '15 Años',        range: '15 años',sort_order: 32 },
  { slug: 'girls-16',     label: '16 Años',        range: '16 años',sort_order: 33 },
  { slug: 'girls-unitalla',label: 'Unitalla',       range: 'Unitalla',sort_order: 34},
]

// Sizes per age group
const SIZES = {
  'baby-boy':      ['3M','6M','9M','12M','18M','24M'],
  'baby-girl':     ['3M','6M','9M','12M','18M','24M'],
  'boys-2':        ['2Y'],
  'boys-3':        ['3Y'],
  'boys-4':        ['4Y'],
  'boys-5':        ['5Y'],
  'boys-6':        ['6Y'],
  'boys-7':        ['7Y'],
  'boys-8':        ['8Y'],
  'boys-9':        ['9Y'],
  'boys-10':       ['10Y'],
  'boys-11':       ['11Y'],
  'boys-12':       ['12Y'],
  'boys-13':       ['13Y'],
  'boys-14':       ['14Y'],
  'boys-15':       ['15Y'],
  'boys-16':       ['16Y'],
  'boys-unitalla': ['Unitalla'],
  'girls-2':       ['2Y'],
  'girls-3':       ['3Y'],
  'girls-4':       ['4Y'],
  'girls-5':       ['5Y'],
  'girls-6':       ['6Y'],
  'girls-7':       ['7Y'],
  'girls-8':       ['8Y'],
  'girls-9':       ['9Y'],
  'girls-10':      ['10Y'],
  'girls-11':      ['11Y'],
  'girls-12':      ['12Y'],
  'girls-13':      ['13Y'],
  'girls-14':      ['14Y'],
  'girls-15':      ['15Y'],
  'girls-16':      ['16Y'],
  'girls-unitalla':['Unitalla'],
}

// Gender assignment based on age group
const AGE_GROUP_GENDER = {
  'baby-boy':      'boy',
  'baby-girl':     'girl',
  'boys-2':        'boy',  'boys-3':  'boy',  'boys-4':  'boy',  'boys-5':  'boy',
  'boys-6':        'boy',  'boys-7':  'boy',  'boys-8':  'boy',  'boys-9':  'boy',
  'boys-10':       'boy',  'boys-11': 'boy',  'boys-12': 'boy',  'boys-13': 'boy',
  'boys-14':       'boy',  'boys-15': 'boy',  'boys-16': 'boy',  'boys-unitalla': 'boy',
  'girls-2':       'girl', 'girls-3': 'girl', 'girls-4': 'girl', 'girls-5': 'girl',
  'girls-6':       'girl', 'girls-7': 'girl', 'girls-8': 'girl', 'girls-9': 'girl',
  'girls-10':      'girl', 'girls-11':'girl', 'girls-12':'girl', 'girls-13':'girl',
  'girls-14':      'girl', 'girls-15':'girl', 'girls-16':'girl', 'girls-unitalla': 'girl',
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
