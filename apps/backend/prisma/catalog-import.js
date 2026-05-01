import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { slugify } from '@store/utils'

export const DEFAULT_MXN_TO_USD_RATE = Number(process.env.MXN_TO_USD_RATE || 17)

const DEFAULT_PALETTE = ['#f5ead8', '#ffffff']

const GENDER_MAP = {
  nina: 'girls',
  nino: 'boys',
  unisex: 'unisex',
}

const GENDER_LABELS = {
  girls: 'girls',
  boys: 'boys',
  unisex: 'kids',
}

const SEASON_MAP = {
  otono: { slug: 'fall', name: 'Fall' },
  invierno: { slug: 'winter', name: 'Winter' },
  primavera: { slug: 'spring', name: 'Spring' },
  verano: { slug: 'summer', name: 'Summer' },
  navidad: { slug: 'christmas', name: 'Christmas' },
  halloween: { slug: 'halloween', name: 'Halloween' },
}

const CATEGORY_MAP = {
  tops: {
    name: 'Tops',
    description: 'Everyday shirts, sweatshirts, and layering pieces.',
  },
  bottoms: {
    name: 'Bottoms',
    description: 'Comfortable pants and leggings for everyday wear.',
  },
  dresses: {
    name: 'Dresses',
    description: 'Easy dresses for play, parties, and outings.',
  },
  sleepwear: {
    name: 'Sleepwear',
    description: 'Soft pajamas and nightwear for cozy routines.',
  },
  rompers: {
    name: 'Rompers',
    description: 'One-piece looks for babies and little ones.',
  },
}

const TYPE_CATEGORY_MAP = {
  'camisa manga larga': 'tops',
  camison: 'sleepwear',
  mameluco: 'rompers',
  pantalon: 'bottoms',
  playera: 'tops',
  'playera manga larga': 'tops',
  sudadera: 'tops',
  'sudadera con capucha': 'tops',
  vestido: 'dresses',
}

const TYPE_LABEL_MAP = {
  'camisa manga larga': 'long-sleeve shirt',
  camison: 'nightgown',
  mameluco: 'romper',
  pantalon: 'pants',
  playera: 'tee',
  'playera manga larga': 'long-sleeve tee',
  sudadera: 'sweatshirt',
  'sudadera con capucha': 'hoodie',
  vestido: 'dress',
}

const COLOR_MAP = {
  'azul': '#5f8fd3',
  'azul claro': '#9bcaf2',
  'azul marino': '#203a5f',
  'azul oscuro': '#1f3558',
  'blanco': '#f8f8f4',
  'cafe': '#7a5a44',
  'cafe oscuro': '#5c4636',
  'gris': '#9aa1aa',
  'morado': '#7d67aa',
  'multicolor': '#f2b36f',
  'naranja': '#f08c42',
  'negro': '#2f3136',
  'rojo': '#d55454',
  'rosa': '#e8a0b9',
  'verde': '#72a56f',
  'verde agua': '#8fc7bf',
  'verde oscuro': '#3b5f4a',
  'verde turqueza oscuro': '#2f8d89',
  'vino': '#8a4157',
}

function removeDiacritics(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalizeKey(value) {
  return removeDiacritics(String(value || ''))
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCase(value) {
  return value.replace(/\b\w/g, letter => letter.toUpperCase())
}

export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1
      }

      row.push(field)
      if (row.some(value => value !== '')) {
        rows.push(row)
      }

      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

export function convertMxnToUsd(amount, exchangeRate = DEFAULT_MXN_TO_USD_RATE) {
  const numericAmount = parseCurrencyValue(amount)
  return Number(((numericAmount ?? 0) / exchangeRate).toFixed(2))
}

function parseCurrencyValue(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const normalized = String(value || '')
    .trim()
    .replace(/[^0-9,.-]/g, '')

  if (!normalized) {
    return null
  }

  const numeric = Number(normalized.replace(/,/g, ''))
  return Number.isFinite(numeric) ? numeric : null
}

function normalizeDelimitedValue(value, delimiter = '/') {
  return String(value || '')
    .split(delimiter)
    .map(item => item.trim())
    .filter(Boolean)
}

export function normalizeGender(value) {
  return GENDER_MAP[normalizeKey(value)] || 'unisex'
}

export function normalizeAgeGroup(value) {
  const normalized = normalizeKey(value)
  const match = normalized.match(/(\d+)\s*-\s*(\d+)\s*(anos|meses)/)

  if (!match) {
    return titleCase(String(value || '').trim())
  }

  const [, start, end, unit] = match
  return `${start}-${end} ${unit === 'meses' ? 'months' : 'years'}`
}

export function expandAgeTags(value) {
  const normalized = normalizeKey(value)
  const match = normalized.match(/(\d+)\s*-\s*(\d+)\s*(anos|meses)/)

  if (!match) {
    return [normalizeAgeGroup(value)]
  }

  const start = Number(match[1])
  const end = Number(match[2])
  const unit = match[3] === 'meses' ? 'months' : 'years'
  const tags = []

  for (let current = start; current <= end; current += 1) {
    tags.push(`${current} ${unit}`)
  }

  return tags
}

export function expandSizes(value) {
  const normalized = normalizeKey(value)
  const numericRange = normalized.match(/^(\d+)\s*-\s*(\d+)$/)

  if (!numericRange) {
    return [String(value || '').trim()]
  }

  const start = Number(numericRange[1])
  const end = Number(numericRange[2])
  const sizes = []

  for (let current = start; current <= end; current += 1) {
    sizes.push(String(current))
  }

  return sizes
}

export function normalizeSeasons(value) {
  return normalizeDelimitedValue(value).map(item => {
    const normalized = normalizeKey(item)
    return SEASON_MAP[normalized]?.slug || slugify(normalized)
  })
}

function seasonNamesFromSlugs(seasons) {
  return seasons.map(season => {
    const entry = Object.values(SEASON_MAP).find(item => item.slug === season)
    return entry?.name || titleCase(season)
  })
}

function resolveCategory(type) {
  const normalizedType = normalizeKey(type)
  const slug = TYPE_CATEGORY_MAP[normalizedType] || 'tops'
  return {
    slug,
    ...CATEGORY_MAP[slug],
  }
}

function normalizeTypeLabel(type) {
  const normalizedType = normalizeKey(type)
  return TYPE_LABEL_MAP[normalizedType] || String(type || '').trim()
}

function normalizeColor(value) {
  const normalized = normalizeKey(value)

  if (!normalized || normalized === '-') {
    return null
  }

  return {
    label: titleCase(String(value).trim()),
    hex: COLOR_MAP[normalized] || DEFAULT_PALETTE[0],
  }
}

function buildPalette(primaryColor, secondaryColor) {
  const primary = normalizeColor(primaryColor)
  const secondary = normalizeColor(secondaryColor)

  return [primary?.hex || DEFAULT_PALETTE[0], secondary?.hex || DEFAULT_PALETTE[1]]
}

function buildDescription(row, normalizedAgeGroup, seasonSlugs) {
  const gender = normalizeGender(row.Genero)
  const typeLabel = normalizeTypeLabel(row['Tipo de prenda'])
  const primaryColor = normalizeColor(row['Color Primario'])
  const secondaryColor = normalizeColor(row['Color Secundario'])
  const colors = [primaryColor?.label, secondaryColor?.label].filter(Boolean).join(' with ')
  const printed = normalizeKey(row.Estampado).startsWith('si')
  const seasonText = seasonNamesFromSlugs(seasonSlugs).join(', ')

  return `${titleCase(typeLabel)} for ${GENDER_LABELS[gender]} in ${colors || 'a versatile palette'}. ${printed ? 'Printed design.' : 'Solid design.'} Best suited for ${normalizedAgeGroup}${seasonText ? ` and styled for ${seasonText}.` : '.'}`
}

function buildBadge(seasons) {
  if (seasons.includes('christmas') || seasons.includes('halloween')) {
    return 'holiday'
  }

  if (seasons.length > 1) {
    return 'seasonal'
  }

  return null
}

function buildProductEntry(row, index, exchangeRate) {
  const id = String(row.id).trim()
  const name = String(row['Nombre de la prenda'] || '').trim()
  const type = String(row['Tipo de prenda'] || '').trim()
  const seasons = normalizeSeasons(row.Temporada)
  const ageGroup = normalizeAgeGroup(row.Edad)
  const ageTags = expandAgeTags(row.Edad)
  const sizes = expandSizes(row.Talla)
  const stock = Number(row.Existencia || 0)
  const category = resolveCategory(type)
  const palette = buildPalette(row['Color Primario'], row['Color Secundario'])
  const sourcePriceMxn = parseCurrencyValue(row.Precio)
  const priceMxn = sourcePriceMxn ?? 0
  const slugBase = slugify(`${name}-${id}`)

  return {
    slug: slugBase,
    name,
    description: buildDescription(row, ageGroup, seasons),
    badge: buildBadge(seasons),
    gender: normalizeGender(row.Genero),
    ageGroup,
    ageTags,
    seasons,
    price: convertMxnToUsd(priceMxn, exchangeRate),
    sourcePriceMxn,
    rating: 4.5,
    releaseDate: new Date(Date.UTC(2026, 0, Math.min(index + 1, 28))),
    imageUrl: String(row.url1 || '').trim() || null,
    palette,
    isFeatured: index < 8,
    isActive: true,
    category,
    variants: sizes.map(size => ({
      size,
      stock,
      sku: `${slugBase.toUpperCase()}-${slugify(size).toUpperCase() || size.toUpperCase()}`,
    })),
  }
}

export async function loadCatalogFromCsv({
  csvPath = resolve(process.cwd(), '..', '..', 'text.csv'),
  exchangeRate = DEFAULT_MXN_TO_USD_RATE,
} = {}) {
  const csvText = await readFile(csvPath, 'utf8')
  const [header, ...rows] = parseCsv(csvText)
  const keys = header.map(column => column.trim())

  return rows.map((values, index) => {
    const row = Object.fromEntries(keys.map((key, keyIndex) => [key, values[keyIndex] ?? '']))
    return buildProductEntry(row, index, exchangeRate)
  })
}
