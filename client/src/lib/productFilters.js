export const DEFAULT_PRODUCT_FILTERS = {
  category: 'all',
  ageGroup: 'all',
  gender: 'all',
  maxPrice: 70,
  badge: '',
  q: '',
  sizeFilter: '',
  sort: 'featured',
  page: 1,
  limit: 20,
}

export function buildProductParams(filters) {
  return {
    ...(filters.category && filters.category !== 'all' ? { category: filters.category } : {}),
    ...(filters.ageGroup && filters.ageGroup !== 'all' ? { ageGroup: filters.ageGroup } : {}),
    ...(filters.gender && filters.gender !== 'all' ? { gender: filters.gender } : {}),
    maxPrice: filters.maxPrice,
    ...(filters.badge ? { badge: filters.badge } : {}),
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.sizeFilter ? { sizeFilter: filters.sizeFilter } : {}),
    sort: filters.sort,
    page: filters.page,
    limit: filters.limit,
  }
}

export function filtersFromSearchParams(searchParams, initialFilters = {}) {
  return {
    ...DEFAULT_PRODUCT_FILTERS,
    ...initialFilters,
    category: searchParams.get('category') || initialFilters.category || DEFAULT_PRODUCT_FILTERS.category,
    ageGroup: searchParams.get('ageGroup') || initialFilters.ageGroup || DEFAULT_PRODUCT_FILTERS.ageGroup,
    gender: searchParams.get('gender') || initialFilters.gender || DEFAULT_PRODUCT_FILTERS.gender,
    badge: searchParams.get('badge') || initialFilters.badge || DEFAULT_PRODUCT_FILTERS.badge,
    q: searchParams.get('q') || initialFilters.q || DEFAULT_PRODUCT_FILTERS.q,
    sizeFilter: searchParams.get('size') || initialFilters.sizeFilter || DEFAULT_PRODUCT_FILTERS.sizeFilter,
    sort: searchParams.get('sort') || initialFilters.sort || DEFAULT_PRODUCT_FILTERS.sort,
    maxPrice: Number(searchParams.get('maxPrice') || initialFilters.maxPrice || DEFAULT_PRODUCT_FILTERS.maxPrice),
    page: Number(searchParams.get('page') || initialFilters.page || DEFAULT_PRODUCT_FILTERS.page),
  }
}

export function filtersToSearchParams(filters) {
  const params = new URLSearchParams()

  if (filters.category && filters.category !== 'all') params.set('category', filters.category)
  if (filters.ageGroup && filters.ageGroup !== 'all') params.set('ageGroup', filters.ageGroup)
  if (filters.gender && filters.gender !== 'all') params.set('gender', filters.gender)
  if (filters.badge) params.set('badge', filters.badge)
  if (filters.q) params.set('q', filters.q)
  if (filters.sizeFilter) params.set('size', filters.sizeFilter)
  if (filters.sort && filters.sort !== DEFAULT_PRODUCT_FILTERS.sort) params.set('sort', filters.sort)
  if (filters.maxPrice < DEFAULT_PRODUCT_FILTERS.maxPrice) params.set('maxPrice', String(filters.maxPrice))
  if (filters.page > 1) params.set('page', String(filters.page))

  return params
}
