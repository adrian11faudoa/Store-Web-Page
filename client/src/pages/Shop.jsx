// client/src/pages/Shop.jsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts.js'
import { categories as catsApi } from '../api.js'
import ProductCard from '../components/ProductCard.jsx'

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'newest',     label: 'Newest' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top rated' },
  { value: 'name',       label: 'A–Z' },
]

export default function Shop() {
  const [searchParams] = useSearchParams()
  const [cats,      setCats]      = useState([])
  const [ageGroups, setAges]      = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Derive initial filters directly from URL — recalculated every render
  // so when the URL changes (navbar links), the hook gets fresh values
  const urlCategory = searchParams.get('category') || 'all'
  const urlAgeGroup = searchParams.get('ageGroup')  || 'all'
  const urlBadge    = searchParams.get('badge')     || ''
  const urlQ        = searchParams.get('q')         || ''

  const {
    products, total, totalPages, loading, error,
    filters, update, setPage,
  } = useProducts({
    category: urlCategory,
    ageGroup: urlAgeGroup,
    badge:    urlBadge,
    q:        urlQ,
  })

  // When the URL params change (e.g. from navbar "Boys" button), sync filters
  useEffect(() => {
    update({
      category: urlCategory,
      ageGroup: urlAgeGroup,
      badge:    urlBadge,
      q:        urlQ,
      page:     1,
    })
    // Close mobile sidebar whenever filters change from outside
    setSidebarOpen(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlAgeGroup, urlBadge, urlQ])

  useEffect(() => {
    catsApi.list().then(data =>
      setCats([{ slug: 'all', label: 'All', product_count: total }, ...data])
    )
    catsApi.ageGroups().then(setAges)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeFilterCount = [
    filters.category !== 'all',
    filters.ageGroup !== 'all',
    filters.badge !== '',
    filters.maxPrice < 70,
  ].filter(Boolean).length

  return (
    <div className="shop-layout">

      {/* ── Mobile sidebar toggle ── */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setSidebarOpen(o => !o)}
      >
        🎛 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        <span className="sidebar-chevron">{sidebarOpen ? '▲' : '▼'}</span>
      </button>

      {/* ── Sidebar backdrop (mobile) ── */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>

        {/* Mobile header */}
        <div className="sidebar-mobile-header">
          <span style={{ fontWeight: 700 }}>Filters</span>
          <button className="sidebar-mobile-close" onClick={() => setSidebarOpen(false)}>✕ Close</button>
        </div>

        <h3>Category</h3>
        {cats.map(c => (
          <button
            key={c.slug}
            className={`sidebar-option${filters.category === c.slug ? ' active' : ''}`}
            onClick={() => update({ category: c.slug })}
          >
            {c.label}
            <span className="sidebar-count">{c.product_count}</span>
          </button>
        ))}

        <h3>Age group</h3>
        <button
          className={`sidebar-option${filters.ageGroup === 'all' ? ' active' : ''}`}
          onClick={() => update({ ageGroup: 'all' })}
        >All ages</button>
        {ageGroups.map(a => (
          <button
            key={a.slug}
            className={`sidebar-option${filters.ageGroup === a.slug ? ' active' : ''}`}
            onClick={() => update({ ageGroup: a.slug })}
          >
            {a.label}
            <span className="sidebar-count">{a.product_count}</span>
          </button>
        ))}

        <h3>Max price: <strong>${filters.maxPrice}</strong></h3>
        <input
          type="range" min="8" max="70" step="1"
          value={filters.maxPrice}
          onChange={e => update({ maxPrice: +e.target.value })}
          style={{ width: '100%', accentColor: 'var(--color-brand)', margin: '8px 0' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
          <span>$8</span><span>$70</span>
        </div>

        <h3>Availability</h3>
        <button
          className={`sidebar-option${filters.badge === 'sale' ? ' active' : ''}`}
          onClick={() => update({ badge: filters.badge === 'sale' ? '' : 'sale' })}
        >🏷 On sale</button>
        <button
          className={`sidebar-option${filters.badge === 'new' ? ' active' : ''}`}
          onClick={() => update({ badge: filters.badge === 'new' ? '' : 'new' })}
        >✨ New in</button>

        {activeFilterCount > 0 && (
          <button
            className="sidebar-clear"
            onClick={() => update({ category: 'all', ageGroup: 'all', badge: '', maxPrice: 70, q: '', page: 1 })}
          >
            Clear all filters
          </button>
        )}
      </aside>

      {/* ── Main content ── */}
      <main className="shop-main">

        <div className="shop-toolbar">
          <span className="result-count">
            <strong>{total}</strong> items
            {filters.q && <span style={{ fontWeight: 400 }}> for "{filters.q}"</span>}
          </span>
          <select
            className="sort-select"
            value={filters.sort}
            onChange={e => update({ sort: e.target.value })}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="product-card skeleton" style={{ height: 340 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search term.</p>
            <button
              className="btn btn--primary"
              style={{ marginTop: '1.5rem' }}
              onClick={() => update({ category: 'all', ageGroup: 'all', badge: '', q: '', maxPrice: 70 })}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={filters.page <= 1}
              onClick={() => setPage(filters.page - 1)}
            >← Prev</button>

            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  className={`page-btn${filters.page === p ? ' active' : ''}`}
                  onClick={() => setPage(p)}
                >{p}</button>
              )
            })}

            {totalPages > 7 && (
              <span className="page-btn" style={{ border: 'none' }}>…{totalPages}</span>
            )}

            <button
              className="page-btn"
              disabled={filters.page >= totalPages}
              onClick={() => setPage(filters.page + 1)}
            >Next →</button>
          </div>
        )}
      </main>
    </div>
  )
}
