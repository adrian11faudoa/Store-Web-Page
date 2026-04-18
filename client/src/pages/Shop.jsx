import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import ProductFilters from '../components/ProductFilters.jsx'
import { DEFAULT_FILTERS, filterProducts, getCatalogMeta } from '../assets/js/utils/products.js'

function readFilters(searchParams) {
  return {
    query: searchParams.get('q') || DEFAULT_FILTERS.query,
    category: searchParams.get('category') || DEFAULT_FILTERS.category,
    gender: searchParams.get('gender') || DEFAULT_FILTERS.gender,
    ageGroup: searchParams.get('ageGroup') || DEFAULT_FILTERS.ageGroup,
    sort: searchParams.get('sort') || DEFAULT_FILTERS.sort,
  }
}

export default function Shop({ products, loading, error, cart }) {
  const [searchParams, setSearchParams] = useSearchParams()
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
  }

  return (
    <section className="section">
      <div className="container catalog-layout">
        <div className="catalog-layout__sidebar">
          <ProductFilters filters={filters} meta={meta} onChange={updateFilter} onReset={resetFilters} />
        </div>

        <div className="catalog-layout__content">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Catalog</p>
              <h1>Find pieces by category, gender, age group, or keyword</h1>
            </div>
            <p className="catalog-count">{filteredProducts.length} products</p>
          </div>

          {loading ? (
            <div className="empty-state"><p>Loading catalog...</p></div>
          ) : error ? (
            <div className="empty-state">
              <h2>Unable to load products</h2>
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <h2>No matching products</h2>
              <p>Try clearing filters or searching with a broader term.</p>
              <button type="button" className="button" onClick={resetFilters}>Reset filters</button>
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
    </section>
  )
}
