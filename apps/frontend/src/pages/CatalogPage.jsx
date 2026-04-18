import { useCatalogFilters } from '../hooks/useCatalogFilters.js'
import { useAppStore } from '../store/useAppStore.js'
import { ProductCard } from '../components/ProductCard.jsx'

export function CatalogPage() {
  const { filters, updateFilters } = useCatalogFilters()
  const categories = useAppStore(state => state.catalog.categories)
  const products = useAppStore(state => state.catalog.products)
  const pagination = useAppStore(state => state.catalog.pagination)
  const addToCart = useAppStore(state => state.addToCart)

  return (
    <section className="section-stack">
      <div className="filter-row">
        <input
          className="input"
          type="search"
          placeholder="Search products"
          value={filters.q}
          onChange={event => updateFilters({ q: event.target.value })}
        />
        <select className="input" value={filters.category} onChange={event => updateFilters({ category: event.target.value })}>
          <option value="">All categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.slug}>{category.name}</option>
          ))}
        </select>
        <select className="input" value={`${filters.sortBy}:${filters.sortOrder}`} onChange={event => {
          const [sortBy, sortOrder] = event.target.value.split(':')
          updateFilters({ sortBy, sortOrder })
        }}>
          <option value="createdAt:desc">Newest</option>
          <option value="price:asc">Price low to high</option>
          <option value="price:desc">Price high to low</option>
          <option value="name:asc">Name A-Z</option>
        </select>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={variantId => addToCart(variantId)} />
        ))}
      </div>

      <div className="pagination-row">
        <button
          className="button ghost"
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => updateFilters({ page: pagination.page - 1 })}
        >
          Previous
        </button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button
          className="button ghost"
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => updateFilters({ page: pagination.page + 1 })}
        >
          Next
        </button>
      </div>
    </section>
  )
}
