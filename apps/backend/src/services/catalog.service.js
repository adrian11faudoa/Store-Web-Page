import { listCategories, listProducts, findProductBySlug } from '../repositories/catalog.repository.js'
import { AppError } from '../utils/app-error.js'

function formatProduct(product) {
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
  const result = await listProducts(filters)

  return {
    items: result.items.map(formatProduct),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / filters.limit)),
    },
  }
}

export async function getProduct(slug) {
  const product = await findProductBySlug(slug)

  if (!product || !product.isActive) {
    throw new AppError(404, 'Product not found')
  }

  return formatProduct(product)
}
