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

// Gender options for the sidebar
const GENDER_OPTIONS = [
  { value: 'all',  label: 'All' },
  { value: 'boy',  label: '👦 Boys' },
  { value: 'girl', label: '👧 Girls' },
]

// Baby gender options
const BABY_GENDER_OPTIONS = [
  { value: 'all',  label: 'All babies' },
  { value: 'boy',  label: '👦 Baby boys' },
  { value: 'girl', label: '👧 Baby girls' },
]

export default function Shop() {
  const [searchParams] = useSearchParams()
  const [cats,       setCats]       = useState([])
  const [ageGroups,  setAgeGroups]  = useState([])
  const [totalAll,   setTotalAll]   = useState(0)
  const [sidebarOpen,setSidebarOpen]= useState(false)

  // Sidebar age-group UI state
  const [ageSection, setAgeSection] = useState('all') // 'all' | 'boys' | 'girls' | 'baby'
  const [babyGender, setBabyGender] = useState('all')  // 'all' | 'boy' | 'girl'

  const urlCategory = searchParams.get('category') || 'all'
  const urlAgeGroup = searchParams.get('ageGroup')  || 'all'
  const urlBadge    = searchParams.get('badge')     || ''
  const urlQ        = searchParams.get('q')         || ''
  const urlGender   = searchParams.get('gender')    || 'all'

  const {
    products, total, totalPages, loading, error,
    filters, update, setPage,
  } = useProducts({
    category: urlCategory,
    ageGroup: urlAgeGroup,
    gender:   urlGender,
    badge:    urlBadge,
    q:        urlQ,
  })

  useEffect(() => {
    update({
      category: urlCategory,
      ageGroup: urlAgeGroup,
      gender:   urlGender,
      badge:    urlBadge,
      q:        urlQ,
      page:     1,
    })
    setSidebarOpen(false)
    // Sync sidebar age section UI to URL params
    if (urlAgeGroup === 'baby' || urlAgeGroup === 'baby-boy' || urlAgeGroup === 'baby-girl') {
      setAgeSection('baby')
      if (urlAgeGroup === 'baby-boy') setBabyGender('boy')
      else if (urlAgeGroup === 'baby-girl') setBabyGender('girl')
      else setBabyGender('all')
    } else if (urlGender === 'boy' || urlAgeGroup.startsWith('boys-')) {
      setAgeSection('boys')
    } else if (urlGender === 'girl' || urlAgeGroup.startsWith('girls-')) {
      setAgeSection('girls')
    } else {
      setAgeSection('all')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlAgeGroup, urlGender, urlBadge, urlQ])

  useEffect(() => {
    catsApi.list().then(data => setCats(data))
    catsApi.ageGroups().then(setAgeGroups)
    catsApi.total().then(d => setTotalAll(d.total))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Group age groups by type (boys-/girls- slugs exclude baby-boy/baby-girl)
  const boysGroups  = ageGroups.filter(a => a.slug.startsWith('boys-'))
  const girlsGroups = ageGroups.filter(a => a.slug.startsWith('girls-'))
  const babyBoyGrp  = ageGroups.find(a => a.slug === 'baby-boy')
  const babyGirlGrp = ageGroups.find(a => a.slug === 'baby-girl')

  // Baby month sizes for display
  const BABY_MONTHS = ['3M','6M','9M','12M','18M','24M']

  function selectGenderSection(section) {
    setAgeSection(section)
    setBabyGender('all')
    if (section === 'all') {
      update({ ageGroup: 'all', gender: 'all' })
    } else if (section === 'boys') {
      update({ gender: 'boy', ageGroup: 'all' })
    } else if (section === 'girls') {
      update({ gender: 'girl', ageGroup: 'all' })
    } else if (section === 'baby') {
      // Show all babies (both baby-boy and baby-girl) until user sub-selects
      update({ ageGroup: 'baby', gender: 'all' })
    }
  }

  function selectBabyGender(bg) {
    setBabyGender(bg)
    if (bg === 'all') {
      update({ ageGroup: 'baby', gender: 'all' })
    } else if (bg === 'boy') {
      update({ ageGroup: 'baby-boy', gender: 'boy' })
    } else {
      update({ ageGroup: 'baby-girl', gender: 'girl' })
    }
  }

  function selectAgeGroup(slug) {
    update({ ageGroup: slug })
  }

  const activeFilterCount = [
    filters.category !== 'all',
    filters.ageGroup !== 'all',
    filters.gender !== 'all',
    filters.badge !== '',
    filters.maxPrice < 70,
  ].filter(Boolean).length

  // Render age group buttons for boys/girls sub-sections
  function renderSubAgeGroups(groups) {
    return (
      <div style={{ marginLeft: 12 }}>
        <button
          className={`sidebar-option${filters.ageGroup === 'all' ? ' active' : ''}`}
          onClick={() => selectAgeGroup('all')}
        >
          All ages
        </button>
        {groups.map(a => (
          <button
            key={a.slug}
            className={`sidebar-option${filters.ageGroup === a.slug ? ' active' : ''}`}
            onClick={() => selectAgeGroup(a.slug)}
          >
            {a.label}
            <span className="sidebar-count">{a.product_count}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="shop-layout">
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setSidebarOpen(o => !o)}
      >
        🎛 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        <span className="sidebar-chevron">{sidebarOpen ? '▲' : '▼'}</span>
      </button>

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-mobile-header">
          <span style={{ fontWeight: 700 }}>Filters</span>
          <button className="sidebar-mobile-close" onClick={() => setSidebarOpen(false)}>✕ Close</button>
        </div>

        {/* ── Category ── */}
        <h3>Category</h3>
        <button
          className={`sidebar-option${filters.category === 'all' ? ' active' : ''}`}
          onClick={() => update({ category: 'all' })}
        >
          All
          <span className="sidebar-count">{totalAll}</span>
        </button>
        {cats.map(c => (
          <button
            key={c.slug}
            className={`sidebar-option${filters.category === c.slug ? ' active' : ''}`}
            onClick={() => update({ category: c.slug })}
          >
            {c.icon} {c.label}
            <span className="sidebar-count">{c.product_count}</span>
          </button>
        ))}

        {/* ── Gender & Age ── */}
        <h3>Gender &amp; Age</h3>

        {/* Top-level gender tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {[
            { key: 'all',   label: 'All' },
            { key: 'boys',  label: '👦 Boys' },
            { key: 'girls', label: '👧 Girls' },
            { key: 'baby',  label: '🍼 Baby' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => selectGenderSection(opt.key)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid',
                borderColor: ageSection === opt.key ? 'var(--color-brand)' : 'var(--color-border-md)',
                background: ageSection === opt.key ? 'var(--color-brand-light)' : 'none',
                color: ageSection === opt.key ? 'var(--color-brand)' : 'var(--color-text-muted)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Boys: age sub-selection 2-16y */}
        {ageSection === 'boys' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Age range</div>
            {renderSubAgeGroups(boysGroups)}
          </>
        )}

        {/* Girls: age sub-selection 2-16y */}
        {ageSection === 'girls' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Age range</div>
            {renderSubAgeGroups(girlsGroups)}
          </>
        )}

        {/* Baby: select boy/girl, then filter by month */}
        {ageSection === 'baby' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Baby gender</div>
            {BABY_GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`sidebar-option${babyGender === opt.value ? ' active' : ''}`}
                onClick={() => selectBabyGender(opt.value)}
              >
                {opt.label}
                {opt.value === 'boy' && babyBoyGrp && <span className="sidebar-count">{babyBoyGrp.product_count}</span>}
                {opt.value === 'girl' && babyGirlGrp && <span className="sidebar-count">{babyGirlGrp.product_count}</span>}
                {opt.value === 'all' && babyBoyGrp && babyGirlGrp && (
                  <span className="sidebar-count">{+babyBoyGrp.product_count + +babyGirlGrp.product_count}</span>
                )}
              </button>
            ))}
            {babyGender !== 'all' && (
              <>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>Talla (meses)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 4 }}>
                  {BABY_MONTHS.map(m => (
                    <button
                      key={m}
                      style={{
                        padding: '4px 9px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--color-border-md)',
                        background: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Max Price ── */}
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

        {/* ── Availability ── */}
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
            onClick={() => {
              update({ category: 'all', ageGroup: 'all', gender: 'all', badge: '', maxPrice: 70, q: '', page: 1 })
              setAgeSection('all')
              setBabyGender('all')
            }}
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
              onClick={() => {
                update({ category: 'all', ageGroup: 'all', gender: 'all', badge: '', q: '', maxPrice: 70 })
                setAgeSection('all')
                setBabyGender('all')
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={filters.page <= 1}
              onClick={() => setPage(filters.page - 1)}
            >← Prev</button>

            {(() => {
              const current = filters.page
              let start = Math.max(1, current - 3)
              const end = Math.min(totalPages, start + 6)
              if (end - start < 6) start = Math.max(1, end - 6)
              const pages = []
              if (start > 1) {
                pages.push(<button key={1} className="page-btn" onClick={() => setPage(1)}>1</button>)
                if (start > 2) pages.push(<span key="e1" className="page-btn" style={{ border: 'none' }}>…</span>)
              }
              for (let pg = start; pg <= end; pg++) {
                pages.push(
                  <button key={pg} className={`page-btn${current === pg ? ' active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>
                )
              }
              if (end < totalPages) {
                if (end < totalPages - 1) pages.push(<span key="e2" className="page-btn" style={{ border: 'none' }}>…</span>)
                pages.push(<button key={totalPages} className="page-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>)
              }
              return pages
            })()}

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
