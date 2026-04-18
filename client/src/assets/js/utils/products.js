export const DEFAULT_FILTERS = {
  query: '',
  category: 'all',
  gender: 'all',
  ageGroup: 'all',
  sort: 'featured',
}

export function getFeaturedProducts(products, limit = 4) {
  return products.filter(product => product.featured).slice(0, limit)
}

export function getProductById(products, productId) {
  return products.find(product => product.id === productId) || null
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

export function filterProducts(products, filters) {
  const query = filters.query.trim().toLowerCase()

  const filtered = products.filter(product => {
    const matchesQuery = query.length === 0 || [
      product.name,
      product.category,
      product.gender,
      product.ageGroup,
      ...(product.tags || []),
    ].join(' ').toLowerCase().includes(query)

    const matchesCategory = filters.category === 'all' || product.category === filters.category
    const matchesGender = filters.gender === 'all' || product.gender === filters.gender
    const matchesAgeGroup = filters.ageGroup === 'all' || product.ageGroup === filters.ageGroup

    return matchesQuery && matchesCategory && matchesGender && matchesAgeGroup
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
