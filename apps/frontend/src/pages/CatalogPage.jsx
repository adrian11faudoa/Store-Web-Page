import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard.jsx'
import { useAppStore } from '../store/useAppStore.js'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price low to high' },
  { value: 'price-high', label: 'Price high to low' },
  { value: 'name', label: 'Name A-Z' },
]

const GENDER_OPTIONS = [
  { value: 'all', label: 'All', emoji: '✨' },
  { value: 'girls', label: 'Girls', emoji: '🌸' },
  { value: 'boys', label: 'Boys', emoji: '🚀' },
  { value: 'unisex', label: 'Unisex', emoji: '🧸' },
]

function titleCase(value) {
  return String(value || '')
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function readFilters(searchParams) {
  return {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    gender: searchParams.get('gender') || 'all',
    ageGroup: searchParams.get('ageGroup') || 'all',
    season: searchParams.get('season') || 'all',
    sort: searchParams.get('sort') || 'featured',
  }
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const store = useAppStore()
  const products = store.catalog.products
  const categories = store.catalog.categories
  const addToCart = store.addToCart
  const filters = readFilters(searchParams)

  const meta = useMemo(() => ({
    ageGroups: [...new Set(products.map(product => product.ageGroup))].sort((left, right) => left.localeCompare(right)),
    seasons: [...new Set(products.flatMap(product => product.seasons || []))],
  }), [products])

  const filteredProducts = useMemo(() => {
    const query = filters.q.trim().toLowerCase()
    const matchingProducts = products.filter(product => {
      const haystack = [
        product.name,
        product.description,
        product.category?.name,
        product.gender,
        product.ageGroup,
        ...(product.ageTags || []),
        ...(product.seasons || []),
      ].join(' ').toLowerCase()

      const matchesQuery = query.length === 0 || haystack.includes(query)
      const matchesCategory = filters.category === 'all' || product.category?.slug === filters.category
      const matchesGender = filters.gender === 'all' || product.gender === filters.gender
      const matchesAge = filters.ageGroup === 'all' || product.ageGroup === filters.ageGroup
      const matchesSeason = filters.season === 'all' || product.seasons?.includes(filters.season)

      return matchesQuery && matchesCategory && matchesGender && matchesAge && matchesSeason
    })

    return [...matchingProducts].sort((left, right) => {
      switch (filters.sort) {
        case 'newest':
          return new Date(right.releaseDate) - new Date(left.releaseDate)
        case 'price-low':
          return left.price - right.price
        case 'price-high':
          return right.price - left.price
        case 'name':
          return left.name.localeCompare(right.name)
        default:
          return Number(right.isFeatured) - Number(left.isFeatured) || right.rating - left.rating
      }
    })
  }, [filters, products])

  const activeFilters = [
    filters.category !== 'all' && { key: 'category', label: titleCase(filters.category) },
    filters.gender !== 'all' && { key: 'gender', label: titleCase(filters.gender) },
    filters.ageGroup !== 'all' && { key: 'ageGroup', label: filters.ageGroup },
    filters.season !== 'all' && { key: 'season', label: titleCase(filters.season) },
    filters.q && { key: 'q', label: `"${filters.q}"` },
  ].filter(Boolean)

  function updateFilter(key, value) {
    const nextParams = new URLSearchParams(searchParams)
    const fallbackValue = key === 'sort' ? 'featured' : 'all'

    if (!value || value === fallbackValue) {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }

    setSearchParams(nextParams)
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams())
    setFiltersOpen(false)
  }

  return (
    <section className="section">
      <div className="container">
        <div className="mobile-filter-bar">
          <button type="button" className="button button--ghost" onClick={() => setFiltersOpen(true)}>
            Filter styles {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
          </button>
          <p className="catalog-count">{filteredProducts.length} products</p>
        </div>

        {filtersOpen ? <button type="button" className="mobile-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" /> : null}

        <div className="catalog-layout">
          <div className={filtersOpen ? 'catalog-layout__sidebar is-open' : 'catalog-layout__sidebar'}>
            <aside className="filters-panel">
              <div className="filters-panel__header">
                <strong>Filter styles</strong>
                <button type="button" className="icon-button" onClick={() => setFiltersOpen(false)}>Close</button>
              </div>

              <div className="filters-panel__group">
                <label htmlFor="catalog-search">Search</label>
                <input
                  id="catalog-search"
                  type="search"
                  value={filters.q}
                  onChange={event => updateFilter('q', event.target.value)}
                  placeholder="Search by product, age, or season"
                />
              </div>

              <div className="filters-panel__group">
                <span className="filters-panel__label">Category</span>
                <div className="filter-pills">
                  <button type="button" className={filters.category === 'all' ? 'filter-pill is-active' : 'filter-pill'} onClick={() => updateFilter('category', 'all')}>🛍️ All</button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      className={filters.category === category.slug ? 'filter-pill is-active' : 'filter-pill'}
                      onClick={() => updateFilter('category', category.slug)}
                    >
                      {titleCase(category.name)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-panel__group">
                <span className="filters-panel__label">Gender</span>
                <div className="filter-pills">
                  {GENDER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={filters.gender === option.value ? 'filter-pill is-active' : 'filter-pill'}
                      onClick={() => updateFilter('gender', option.value)}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-panel__group">
                <span className="filters-panel__label">Age group</span>
                <div className="filter-pills">
                  <button type="button" className={filters.ageGroup === 'all' ? 'filter-pill is-active' : 'filter-pill'} onClick={() => updateFilter('ageGroup', 'all')}>All ages</button>
                  {meta.ageGroups.map(ageGroup => (
                    <button
                      key={ageGroup}
                      type="button"
                      className={filters.ageGroup === ageGroup ? 'filter-pill is-active' : 'filter-pill'}
                      onClick={() => updateFilter('ageGroup', ageGroup)}
                    >
                      {ageGroup}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-panel__group">
                <span className="filters-panel__label">Season</span>
                <div className="filter-pills">
                  <button type="button" className={filters.season === 'all' ? 'filter-pill is-active' : 'filter-pill'} onClick={() => updateFilter('season', 'all')}>All seasons</button>
                  {meta.seasons.map(season => (
                    <button
                      key={season}
                      type="button"
                      className={filters.season === season ? 'filter-pill is-active' : 'filter-pill'}
                      onClick={() => updateFilter('season', season)}
                    >
                      {titleCase(season)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-panel__group">
                <label htmlFor="catalog-sort">Sort by</label>
                <select id="catalog-sort" className="sort-select" value={filters.sort} onChange={event => updateFilter('sort', event.target.value)}>
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <button type="button" className="button button--ghost button--full" onClick={clearFilters}>
                Clear all filters
              </button>
            </aside>
          </div>

          <div className="catalog-layout__content">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Fresh picks for every playdate</p>
                <h1>Shop playful pieces for babies, toddlers, and big kids</h1>
              </div>
              <p className="catalog-count">{filteredProducts.length} products</p>
            </div>

            {activeFilters.length > 0 ? (
              <div className="active-filters">
                {activeFilters.map(filter => (
                  <span key={filter.key} className="active-filter-tag">
                    {filter.label}
                    <button type="button" onClick={() => updateFilter(filter.key, filter.key === 'q' ? '' : 'all')} aria-label="Remove filter">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={variantId => addToCart(variantId)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
