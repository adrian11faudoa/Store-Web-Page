export const DEFAULT_FILTERS = {
  query: '',
  category: 'all',
  gender: 'all',
  ageGroup: 'all',
  badge: '',
  sort: 'featured',
}

export const AGE_GROUP_FILTERS = {
  all: ['all'],
  '0–24 months': ['3-12 months', '6-24 months'],
  '2–4 years': ['2-4 years'],
  '4–6 years': ['4-6 years'],
  '7–10 years': ['7-10 years'],
  '10–14 years': ['8-12 years', '10-14 years'],
}

export function getProductImageFallback(product) {
  const CATEGORY_EMOJIS = {
    tops: '👕',
    bottoms: '👖',
    dresses: '👗',
    outerwear: '🧥',
    sets: '🎁',
  }

  const emoji = CATEGORY_EMOJIS[product.category] || '👕'
  const [bg1, bg2] = product.palette

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bg1}"/>
          <stop offset="100%" stop-color="${bg2}"/>
        </linearGradient>
      </defs>
      <rect width="320" height="400" fill="url(#g)" rx="0"/>
      <text x="160" y="215" text-anchor="middle" font-size="100" font-family="system-ui">${emoji}</text>
    </svg>
  `)}`
}

export function getFeaturedProducts(products, limit = 4) {
  return products.filter(product => product.featured).slice(0, limit)
}

export function getProductById(products, productId) {
  return products.find(product => product.id === String(productId)) || null
}

export function getRelatedProducts(products, currentProduct, limit = 3) {
  if (!currentProduct) return []

  return products
    .filter(product => (
      product.id !== currentProduct.id
      && (product.category === currentProduct.category || product.gender === currentProduct.gender)
    ))
    .slice(0, limit)
}

export function getCatalogMeta(products) {
  return {
    categories: [...new Set(products.map(product => product.category))],
    genders: [...new Set(products.map(product => product.gender))],
    ageGroups: [...new Set(products.map(product => product.ageGroup))],
  }
}

function matchesAgeGroup(product, filterValue) {
  if (filterValue === 'all') return true
  return (AGE_GROUP_FILTERS[filterValue] || [filterValue]).includes(product.ageGroup)
}

export function filterProducts(products, filters) {
  const query = filters.query.trim().toLowerCase()

  const filtered = products.filter(product => {
    const matchesQuery = query.length === 0 || [
      product.name,
      product.category,
      product.gender,
      product.ageGroup,
      product.description,
      ...(product.tags || []),
    ].join(' ').toLowerCase().includes(query)

    const matchesCategory = filters.category === 'all' || product.category === filters.category
    const matchesGender = filters.gender === 'all' || product.gender === filters.gender
    const matchesAge = matchesAgeGroup(product, filters.ageGroup)
    const productBadge = product.old_price > product.price ? 'sale' : product.badge
    const matchesBadge = !filters.badge || productBadge === filters.badge

    return matchesQuery && matchesCategory && matchesGender && matchesAge && matchesBadge
  })

  return [...filtered].sort((left, right) => {
    switch (filters.sort) {
      case 'price-low':
        return left.price - right.price
      case 'price-high':
        return right.price - left.price
      case 'name':
        return left.name.localeCompare(right.name)
      case 'newest':
        return new Date(right.releaseDate) - new Date(left.releaseDate)
      default:
        return Number(right.featured) - Number(left.featured) || right.rating - left.rating
    }
  })
}
