import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import ProductFilters from '../components/ProductFilters.jsx'
import ProductSkeleton from '../components/ProductSkeleton.jsx'
import { DEFAULT_FILTERS, filterProducts, getCatalogMeta } from '../assets/js/utils/products.js'
import { formatLabel } from '../assets/js/utils/format.js'

function readFilters(searchParams) {
  return {
    query: searchParams.get('q') || DEFAULT_FILTERS.query,
    category: searchParams.get('category') || DEFAULT_FILTERS.category,
    gender: searchParams.get('gender') || DEFAULT_FILTERS.gender,
    ageGroup: searchParams.get('ageGroup') || DEFAULT_FILTERS.ageGroup,
    badge: searchParams.get('badge') || DEFAULT_FILTERS.badge,
    sort: searchParams.get('sort') || DEFAULT_FILTERS.sort,
  }
}

export default function Shop({ products, loading, error, cart }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filters = readFilters(searchParams)
  const meta = useMemo(() => getCatalogMeta(products), [products])
  const filteredProducts = useMemo(() => filterProducts(products, filters), [products, filters])

  function updateFilter(key, value) {
    const nextParams = new URLSearchParams(searchParams)
    const paramKey = key === 'query' ? 'q' : key

    if (!value || value === 'all' || value === DEFAULT_FILTERS[key]) nextParams.delete(paramKey)
    else nextParams.set(paramKey, value)

    setSearchParams(nextParams)
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams())
    setFiltersOpen(false)
  }

  const activeFilters = [
    filters.category !== 'all' && { key: 'category', label: `Category: ${formatLabel(filters.category)}` },
    filters.gender !== 'all' && { key: 'gender', label: `Gender: ${formatLabel(filters.gender)}` },
    filters.ageGroup !== 'all' && { key: 'ageGroup', label: `Age: ${filters.ageGroup}` },
    filters.badge && { key: 'badge', label: `Badge: ${formatLabel(filters.badge)}` },
    filters.query && { key: 'query', label: `"${filters.query}"` },
  ].filter(Boolean)

  return (
    <section className="section">
      <div className="container">
        <div className="mobile-filter-bar">
          <button type="button" className="button button--ghost" onClick={() => setFiltersOpen(true)}>
            🔧 Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
          <p className="catalog-count">{filteredProducts.length} products</p>
        </div>

        {filtersOpen && <button type="button" className="mobile-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />}

        <div className="catalog-layout">
          <div className={filtersOpen ? 'catalog-layout__sidebar is-open' : 'catalog-layout__sidebar'}>
            <ProductFilters
              filters={filters}
              meta={meta}
              onChange={updateFilter}
              onReset={resetFilters}
              onClose={() => setFiltersOpen(false)}
            />
          </div>

          <div className="catalog-layout__content">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Fresh picks for every playdate</p>
                <h1>Shop playful pieces for babies, toddlers, and big kids</h1>
              </div>
              <p className="catalog-count">{filteredProducts.length} products</p>
            </div>

            {activeFilters.length > 0 && (
              <div className="active-filters">
                {activeFilters.map(filter => (
                  <span key={filter.key} className="active-filter-tag">
                    {filter.label}
                    <button
                      type="button"
                      onClick={() => updateFilter(filter.key, filter.key === 'query' ? '' : 'all')}
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {loading ? (
              <ProductSkeleton />
            ) : error ? (
              <div className="empty-state">
                <h2>Unable to load products</h2>
                <p>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__illustration">🧺</div>
                <h2>Nothing here yet</h2>
                <p>Try adjusting your filters or search with a broader keyword.</p>
                <button type="button" className="button" onClick={resetFilters}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={cart.addItem} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
