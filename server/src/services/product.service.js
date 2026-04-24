import { query } from '../db/pool.js'
import { ApiError } from '../lib/errors.js'
import { logger } from '../lib/logger.js'
import { parseCsv, stringifyCsv } from '../utils/csv.js'

const ORDER_MAP = {
  featured: 'p.rating DESC, p.reviews DESC, p.id DESC',
  'price-asc': 'p.price ASC, p.id DESC',
  'price-desc': 'p.price DESC, p.id DESC',
  rating: 'p.rating DESC, p.reviews DESC, p.id DESC',
  name: 'p.name ASC, p.id DESC',
  newest: 'p.release_date DESC, p.id DESC',
}

function slugify(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeTalla(talla) {
  if (Array.isArray(talla)) return talla
  return [talla]
}

function normalizePayload(payload) {
  return {
    temporada: payload.temporada?.trim(),
    nombre: payload.nombre?.trim(),
    genero: payload.genero?.trim(),
    colorPrimario: payload.colorPrimario?.trim(),
    colorSecundario: payload.colorSecundario?.trim(),
    estampado: payload.estampado?.trim(),
    talla: payload.talla == null ? undefined : normalizeTalla(payload.talla),
    precio: payload.precio,
    existencia: payload.existencia,
    tipoPrenda: payload.tipoPrenda?.trim(),
    imagenes: payload.imagenes?.map(image => image.trim()),
  }
}

function isValidUrl(value) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function validateProductInput(payload) {
  const normalized = normalizePayload(payload)
  const errors = []

  const requiredFields = [
    ['temporada', 'Temporada is required'],
    ['nombre', 'Nombre is required'],
    ['genero', 'Genero is required'],
    ['colorPrimario', 'Color primario is required'],
    ['colorSecundario', 'Color secundario is required'],
    ['estampado', 'Estampado is required'],
    ['tipoPrenda', 'Tipo de prenda is required'],
  ]

  requiredFields.forEach(([field, message]) => {
    if (!normalized[field]?.trim()) errors.push(message)
  })

  if (!normalized.talla?.length || normalized.talla.some(size => !String(size).trim())) {
    errors.push('At least one talla is required')
  }

  if (typeof normalized.precio !== 'number' || Number.isNaN(normalized.precio)) {
    errors.push('Precio must be a number')
  } else if (normalized.precio < 0) {
    errors.push('Precio must be 0 or more')
  }

  if (!Number.isInteger(normalized.existencia)) {
    errors.push('Existencia must be an integer')
  } else if (normalized.existencia < 0) {
    errors.push('Existencia must be 0 or more')
  }

  if (!normalized.imagenes?.length) {
    errors.push('At least one image URL is required')
  } else if (normalized.imagenes.some(image => !isValidUrl(image))) {
    errors.push('Every image must be a valid URL')
  }

  return {
    normalized,
    errors,
  }
}

function mapProduct(row) {
  const nombre = row.nombre || row.name
  const talla = row.talla?.length ? row.talla : (row.sizes?.length ? row.sizes : ['One Size'])
  const imagenes = row.imagenes?.length
    ? row.imagenes
    : (row.image_url ? [row.image_url] : [])
  const tipoPrenda = row.tipo_prenda || row.category_label || row.category || 'general'
  const colorPrimario = row.color_primario || row.fallback_bg || '#EEEDFE'
  const colorSecundario = row.color_secundario || row.palette?.[1] || '#FFFFFF'
  const precio = Number(row.precio ?? row.price ?? 0)
  const existencia = Number(row.existencia ?? 0)
  const categorySlug = row.category || slugify(tipoPrenda) || 'general'
  const description = row.description?.trim() || [
    row.temporada || 'Coleccion',
    row.estampado || 'sin estampado',
    row.genero || row.gender || 'unisex',
    tipoPrenda,
  ].join(' | ')

  return {
    id: row.id,
    temporada: row.temporada || 'general',
    nombre,
    genero: row.genero || row.gender || 'unisex',
    colorPrimario,
    colorSecundario,
    estampado: row.estampado || 'sin estampado',
    talla: talla.length === 1 ? talla[0] : talla,
    precio,
    existencia,
    tipoPrenda,
    imagenes,
    name: nombre,
    gender: row.genero || row.gender || 'unisex',
    price: precio,
    image_url: imagenes[0] || row.image_url || '',
    sizes: talla,
    category: categorySlug,
    category_label: row.category_label || tipoPrenda,
    description,
    age_group: row.age_group,
    age_label: row.age_label,
    age_range: row.age_range || 'all ages',
    badge: row.badge || '',
    palette: row.palette?.length ? row.palette : [colorPrimario, colorSecundario],
    old_price: Number(row.old_price || 0),
    rating: Number(row.rating || 4.5),
    reviews: Number(row.reviews || 0),
    release_date: row.release_date,
    releaseDate: row.release_date || row.created_at,
    tags: row.tags || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function productSelect(where, orderBy = 'p.id DESC', paginationClause = '', extraParams = []) {
  return query(
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
        p.created_at,
        p.updated_at,
        p.temporada,
        p.nombre,
        p.genero,
        p.color_primario,
        p.color_secundario,
        p.estampado,
        p.talla,
        p.precio,
        p.existencia,
        p.tipo_prenda,
        p.imagenes,
        c.slug AS category,
        c.label AS category_label,
        ag.slug AS age_group,
        ag.label AS age_label,
        ag.range AS age_range
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN age_groups ag ON ag.id = p.age_group_id
      ${where}
      ORDER BY ${orderBy}
      ${paginationClause}`,
    extraParams
  )
}

function buildFilters(filters) {
  const clauses = ['TRUE']
  const params = []

  if (filters.category && filters.category !== 'all') {
    params.push(filters.category)
    clauses.push(`COALESCE(c.slug, lower(regexp_replace(COALESCE(p.tipo_prenda, ''), '[^a-z0-9]+', '-', 'g'))) = $${params.length}`)
  }

  if (filters.ageGroup && filters.ageGroup !== 'all') {
    params.push(filters.ageGroup)
    clauses.push(`ag.slug = $${params.length}`)
  }

  if (filters.gender && filters.gender !== 'all') {
    params.push(filters.gender)
    clauses.push(`COALESCE(p.genero, p.gender) = $${params.length}`)
  }

  if (filters.badge) {
    params.push(filters.badge)
    clauses.push(`p.badge = $${params.length}`)
  }

  if (filters.q) {
    params.push(`%${filters.q}%`)
    clauses.push(`(
      COALESCE(p.nombre, p.name) ILIKE $${params.length}
      OR COALESCE(p.tipo_prenda, '') ILIKE $${params.length}
      OR COALESCE(p.temporada, '') ILIKE $${params.length}
      OR COALESCE(p.genero, p.gender, '') ILIKE $${params.length}
      OR COALESCE(p.estampado, '') ILIKE $${params.length}
    )`)
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
        p.created_at,
        p.updated_at,
        p.temporada,
        p.nombre,
        p.genero,
        p.color_primario,
        p.color_secundario,
        p.estampado,
        p.talla,
        p.precio,
        p.existencia,
        p.tipo_prenda,
        p.imagenes,
        c.slug AS category,
        c.label AS category_label,
        ag.slug AS age_group,
        ag.label AS age_label,
        ag.range AS age_range
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
    data: dataResult.rows.map(mapProduct),
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit) || 1,
    },
  }
}

export async function getProductById(id) {
  const result = await productSelect('WHERE p.id = $1', 'p.id DESC', '', [id])

  if (!result.rows.length) throw new ApiError(404, 'Product not found')
  return mapProduct(result.rows[0])
}

export async function createProduct(payload) {
  const { normalized: product, errors } = validateProductInput(payload)
  if (errors.length) throw new ApiError(400, 'Invalid product payload', { product: errors })
  const result = await query(
    `INSERT INTO products (
      temporada,
      nombre,
      genero,
      color_primario,
      color_secundario,
      estampado,
      talla,
      precio,
      existencia,
      tipo_prenda,
      imagenes,
      name,
      gender,
      price,
      sizes,
      image_url,
      fallback_bg,
      palette,
      in_stock,
      description
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
      $2, $3, $8, $7, $12, $4, ARRAY[$4, $5], $13,
      $14
    )
    RETURNING id`,
    [
      product.temporada,
      product.nombre,
      product.genero,
      product.colorPrimario,
      product.colorSecundario,
      product.estampado,
      product.talla,
      product.precio,
      product.existencia,
      product.tipoPrenda,
      product.imagenes,
      product.imagenes[0],
      product.existencia > 0,
      `${product.temporada} ${product.tipoPrenda} ${product.estampado}`.trim(),
    ]
  )

  return getProductById(result.rows[0].id)
}

export async function updateProduct(id, payload) {
  await getProductById(id)

  const { normalized: product, errors } = validateProductInput({
    ...await getProductById(id),
    ...payload,
  })
  if (errors.length) throw new ApiError(400, 'Invalid product payload', { product: errors })
  const current = await query('SELECT * FROM products WHERE id = $1', [id])
  const row = current.rows[0]

  const nextTalla = product.talla ?? row.talla ?? row.sizes ?? ['One Size']
  const nextImagenes = product.imagenes ?? row.imagenes ?? (row.image_url ? [row.image_url] : [])
  const nextPrecio = product.precio ?? Number(row.precio ?? row.price ?? 0)
  const nextColorPrimario = product.colorPrimario ?? row.color_primario ?? row.fallback_bg ?? '#EEEDFE'
  const nextColorSecundario = product.colorSecundario ?? row.color_secundario ?? row.palette?.[1] ?? '#FFFFFF'
  const nextExistencia = product.existencia ?? Number(row.existencia ?? 0)
  const nextNombre = product.nombre ?? row.nombre ?? row.name
  const nextGenero = product.genero ?? row.genero ?? row.gender
  const nextTemporada = product.temporada ?? row.temporada ?? 'general'
  const nextEstampado = product.estampado ?? row.estampado ?? 'sin estampado'
  const nextTipoPrenda = product.tipoPrenda ?? row.tipo_prenda ?? row.category ?? 'general'

  await query(
    `UPDATE products
     SET
      temporada = $2,
      nombre = $3,
      genero = $4,
      color_primario = $5,
      color_secundario = $6,
      estampado = $7,
      talla = $8,
      precio = $9,
      existencia = $10,
      tipo_prenda = $11,
      imagenes = $12,
      name = $3,
      gender = $4,
      price = $9,
      sizes = $8,
      image_url = $13,
      fallback_bg = $5,
      palette = ARRAY[$5, $6],
      in_stock = $14,
      description = $15
     WHERE id = $1`,
    [
      id,
      nextTemporada,
      nextNombre,
      nextGenero,
      nextColorPrimario,
      nextColorSecundario,
      nextEstampado,
      nextTalla,
      nextPrecio,
      nextExistencia,
      nextTipoPrenda,
      nextImagenes,
      nextImagenes[0] || '',
      nextExistencia > 0,
      `${nextTemporada} ${nextTipoPrenda} ${nextEstampado}`.trim(),
    ]
  )

  return getProductById(id)
}

export async function deleteProduct(id) {
  const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id])
  if (!result.rows.length) throw new ApiError(404, 'Product not found')
}

export async function exportProductsCsv() {
  const result = await listProducts({ page: 1, limit: 10000, sort: 'newest' })
  const headers = ['id', 'Temporada', 'Nombre de la prenda', 'Genero', 'Color Primario', 'Color Secundario', 'Estampado', 'Talla', 'Precio', 'Existencia', 'Tipo de prenda', 'urls']
  const rows = result.data.map(product => ({
    id: product.id,
    Temporada: product.temporada,
    'Nombre de la prenda': product.nombre,
    Genero: product.genero,
    'Color Primario': product.colorPrimario,
    'Color Secundario': product.colorSecundario,
    Estampado: product.estampado,
    Talla: Array.isArray(product.talla) ? product.talla.join('|') : product.talla,
    Precio: product.precio,
    Existencia: product.existencia,
    'Tipo de prenda': product.tipoPrenda,
    urls: product.imagenes.join('|'),
  }))

  return stringifyCsv(rows, headers)
}

export async function importProductsCsv(csvText) {
  const rows = parseCsv(csvText)

  if (!rows.length) {
    throw new ApiError(400, 'CSV file is empty or malformed')
  }

  const errors = []
  let inserted = 0

  for (const [index, row] of rows.entries()) {
    const getValue = (...keys) => {
      for (const key of keys) {
        if (row[key] != null && row[key] !== '') return row[key]
      }
      return ''
    }

    const payload = {
      temporada: getValue('Temporada', 'temporada'),
      nombre: getValue('Nombre de la prenda', 'nombre'),
      genero: getValue('Genero', 'genero'),
      colorPrimario: getValue('Color Primario', 'colorPrimario'),
      colorSecundario: getValue('Color Secundario', 'colorSecundario'),
      estampado: getValue('Estampado', 'estampado'),
      talla: getValue('Talla', 'talla').split('|').map(value => value.trim()).filter(Boolean),
      precio: getValue('Precio', 'precio').trim() === '' ? Number.NaN : Number(getValue('Precio', 'precio')),
      existencia: getValue('Existencia', 'existencia').trim() === '' ? Number.NaN : Number(getValue('Existencia', 'existencia')),
      tipoPrenda: getValue('Tipo de prenda', 'tipoPrenda'),
      imagenes: getValue('urls', 'imagenes').split('|').map(value => value.trim()).filter(Boolean),
    }

    const validation = validateProductInput(payload)
    if (validation.errors.length) {
      const error = { row: index + 2, nombre: row.nombre || '', errors: validation.errors }
      errors.push(error)
      logger.warn({ csvRow: error }, 'Skipping invalid product CSV row')
      continue
    }

    await createProduct(validation.normalized)
    inserted += 1
  }

  return {
    inserted,
    skipped: errors.length,
    errors,
  }
}
