import { listCategories, listProducts, findProductBySlug } from '../repositories/catalog.repository.js'
import { AppError } from '../utils/app-error.js'
import { loadCatalogFromCsv } from '../../prisma/catalog-import.js'

async function getCatalogImageMap() {
  return loadCatalogFromCsv()
    .then(catalog => new Map(catalog.map(entry => [entry.slug, entry.imageUrls || (entry.imageUrl ? [entry.imageUrl] : [])])))
    .catch(() => new Map())
}

function formatProduct(product, imageMap) {
  const csvImageUrls = imageMap?.get(product.slug)?.filter(Boolean) || []
  const imageUrls = csvImageUrls.length > 0
    ? csvImageUrls
    : (product.imageUrl ? [product.imageUrl] : [])

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    badge: product.badge,
    gender: product.gender,
    ageGroup: product.ageGroup,
    ageTags: product.ageTags,
    seasons: product.seasons,
    price: Number(product.price),
    sourcePriceMxn: product.sourcePriceMxn ? Number(product.sourcePriceMxn) : null,
    rating: Number(product.rating),
    releaseDate: product.releaseDate,
    imageUrl: product.imageUrl,
    imageUrls,
    palette: [product.paletteStart, product.paletteEnd],
    isFeatured: product.isFeatured,
    category: {
      id: product.category.id,
      slug: product.category.slug,
      name: product.category.name,
    },
    variants: product.variants.map(variant => ({
      id: variant.id,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
      inStock: variant.stock > 0,
    })),
  }
}

export async function getCategories() {
  return listCategories()
}

export async function getProducts(filters) {
  const [result, imageMap] = await Promise.all([listProducts(filters), getCatalogImageMap()])

  return {
    items: result.items.map(item => formatProduct(item, imageMap)),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / filters.limit)),
    },
  }
}

export async function getProduct(slug) {
  const [product, imageMap] = await Promise.all([findProductBySlug(slug), getCatalogImageMap()])

  if (!product || !product.isActive) {
    throw new AppError(404, 'Product not found')
  }

  return formatProduct(product, imageMap)
}
