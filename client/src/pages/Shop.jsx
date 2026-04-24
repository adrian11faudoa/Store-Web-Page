import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import ProductFilters from '../components/ProductFilters.jsx'
import ProductSkeleton from '../components/ProductSkeleton.jsx'
import { DEFAULT_FILTERS, filterProducts, getCatalogMeta } from '../assets/js/utils/products.js'
import { formatLabel } from '../assets/js/utils/format.js'
import { useLocale } from '../locale/LocaleProvider.jsx'

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
  const { language, t } = useLocale()
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

  const ageLabel = value => {
    if (language === 'es') {
      return value
        .replace('months', 'meses')
        .replace('years', 'anos')
    }
    return value
  }

  const activeFilters = [
    filters.category !== 'all' && { key: 'category', label: t('shopCategory', { value: formatLabel(filters.category) }) },
    filters.gender !== 'all' && { key: 'gender', label: t('shopGender', { value: formatLabel(filters.gender) }) },
    filters.ageGroup !== 'all' && { key: 'ageGroup', label: t('shopAge', { value: ageLabel(filters.ageGroup) }) },
    filters.badge && { key: 'badge', label: t('shopBadge', { value: formatLabel(filters.badge) }) },
    filters.query && { key: 'query', label: `"${filters.query}"` },
  ].filter(Boolean)

  return (
    <section className="section">
      <div className="container">
        <div className="mobile-filter-bar">
          <button type="button" className="button button--ghost" onClick={() => setFiltersOpen(true)}>
            {t('filtersOpen')} {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>
          <p className="catalog-count">{t('shopProductsCount', { count: filteredProducts.length })}</p>
        </div>

        {filtersOpen && <button type="button" className="mobile-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label={t('filtersClose')} />}

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
                <p className="eyebrow">{t('shopEyebrow')}</p>
                <h1>{t('shopTitle')}</h1>
              </div>
              <p className="catalog-count">{t('shopProductsCount', { count: filteredProducts.length })}</p>
            </div>

            {activeFilters.length > 0 && (
              <div className="active-filters">
                {activeFilters.map(filter => (
                  <span key={filter.key} className="active-filter-tag">
                    {filter.label}
                    <button
                      type="button"
                      onClick={() => updateFilter(filter.key, filter.key === 'query' ? '' : 'all')}
                      aria-label={t('remove')}
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
                <h2>{t('shopUnable')}</h2>
                <p>{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__illustration">🧺</div>
                <h2>{t('shopNothing')}</h2>
                <p>{t('shopAdjust')}</p>
                <button type="button" className="button" onClick={resetFilters}>
                  {t('shopClearAll')}
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
