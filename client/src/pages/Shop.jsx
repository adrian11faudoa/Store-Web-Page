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

// Same icon style as Navbar catbar
const GENDER_AGE_CARDS = [
  { key: 'all',   emoji: '🛍️', bg: '#F5F5F5', border: '#E0E0E0', label: 'All' },
  { key: 'girls', emoji: '👧',  bg: '#FFE0EC', border: '#FFB6D0', label: 'Girl' },
  { key: 'boys',  emoji: '👦',  bg: '#DBEAFE', border: '#93C5FD', label: 'Boy' },
  { key: 'baby',  emoji: '👶',  bg: '#FEF3C7', border: '#FCD34D', label: 'Baby' },
]

const BABY_GENDER_OPTIONS = [
  { value: 'all',  label: 'All babies' },
  { value: 'boy',  label: '👦 Baby boys' },
  { value: 'girl', label: '👧 Baby girls' },
]

export default function Shop() {
  const [searchParams] = useSearchParams()
  const [cats,        setCats]        = useState([])
  const [ageGroups,   setAgeGroups]   = useState([])
  const [totalAll,    setTotalAll]    = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [ageSection, setAgeSection] = useState('all')
  const [babyGender, setBabyGender] = useState('all')
  const [babyMonth,  setBabyMonth]  = useState('')

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
    if (urlAgeGroup === 'baby' || urlAgeGroup === 'baby-boy' || urlAgeGroup === 'baby-girl') {
      setAgeSection('baby')
      if (urlAgeGroup === 'baby-boy') setBabyGender('boy')
      else if (urlAgeGroup === 'baby-girl') setBabyGender('girl')
      else setBabyGender('all')
    } else if (urlGender === 'boy' || urlAgeGroup === 'boys' || urlAgeGroup === 'toddler-boys' || urlAgeGroup.startsWith('boys-')) {
      setAgeSection('boys')
    } else if (urlGender === 'girl' || urlAgeGroup === 'girls' || urlAgeGroup === 'toddler-girls' || urlAgeGroup.startsWith('girls-')) {
      setAgeSection('girls')
    } else {
      setAgeSection('all')
    }
    setBabyMonth('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory, urlAgeGroup, urlGender, urlBadge, urlQ])

  useEffect(() => {
    catsApi.list().then(data => setCats(data))
    catsApi.ageGroups().then(setAgeGroups)
    catsApi.total().then(d => setTotalAll(d.total))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const boysGroups  = ageGroups.filter(a => a.slug.startsWith('boys-'))
  const girlsGroups = ageGroups.filter(a => a.slug.startsWith('girls-'))
  const babyBoyGrp  = ageGroups.find(a => a.slug === 'baby-boy')
  const babyGirlGrp = ageGroups.find(a => a.slug === 'baby-girl')

  const BABY_MONTHS = ['3M','6M','9M','12M','18M','24M']

  function selectGenderSection(section) {
    setAgeSection(section)
    setBabyGender('all')
    setBabyMonth('')
    if (section === 'all') {
      update({ ageGroup: 'all', gender: 'all' })
    } else if (section === 'boys') {
      update({ gender: 'boy', ageGroup: 'boys' })
    } else if (section === 'girls') {
      update({ gender: 'girl', ageGroup: 'girls' })
    } else if (section === 'baby') {
      update({ ageGroup: 'baby', gender: 'all' })
    }
  }

  function selectBabyGender(bg) {
    setBabyGender(bg)
    setBabyMonth('')
    if (bg === 'all') {
      update({ ageGroup: 'baby', gender: 'all', sizeFilter: '' })
    } else if (bg === 'boy') {
      update({ ageGroup: 'baby-boy', gender: 'boy', sizeFilter: '' })
    } else {
      update({ ageGroup: 'baby-girl', gender: 'girl', sizeFilter: '' })
    }
  }

  function selectBabyMonth(m) {
    const next = babyMonth === m ? '' : m
    setBabyMonth(next)
    update({ sizeFilter: next })
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
    !!filters.sizeFilter,
  ].filter(Boolean).length

  function renderSubAgeGroups(groups) {
    return (
      <div style={{ marginLeft: 12 }}>
        <button
          className={`sidebar-option${filters.ageGroup === 'all' ? ' active' : ''}`}
          onClick={() => selectAgeGroup('all')}
        >All ages</button>
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
      <button className="sidebar-mobile-toggle" onClick={() => setSidebarOpen(o => !o)}>
        🎛 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        <span className="sidebar-chevron">{sidebarOpen ? '▲' : '▼'}</span>
      </button>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-mobile-header">
          <span style={{ fontWeight: 700 }}>Filters</span>
          <button className="sidebar-mobile-close" onClick={() => setSidebarOpen(false)}>✕ Close</button>
        </div>

        {/* ── Gender & Age — FIRST with icon cards matching navbar ── */}
        <h3>Gender &amp; Age</h3>
        <div className="sidebar-gender-cards">
          {GENDER_AGE_CARDS.map(card => (
            <button
              key={card.key}
              className={`sidebar-gender-card${ageSection === card.key ? ' sidebar-gender-card--active' : ''}`}
              onClick={() => selectGenderSection(card.key)}
            >
              <div
                className="sidebar-gender-card__avatar"
                style={{
                  background: card.bg,
                  borderColor: ageSection === card.key ? card.border : card.border,
                  boxShadow: ageSection === card.key ? `0 0 0 2px ${card.border}` : 'none',
                }}
              >
                <span className="sidebar-gender-card__emoji">{card.emoji}</span>
              </div>
              <span className="sidebar-gender-card__label">{card.label}</span>
            </button>
          ))}
        </div>

        {/* Boys: age sub-selection */}
        {ageSection === 'boys' && (
          <>
            <div className="sidebar-sub-label">Age range</div>
            {renderSubAgeGroups(boysGroups)}
          </>
        )}

        {/* Girls: age sub-selection */}
        {ageSection === 'girls' && (
          <>
            <div className="sidebar-sub-label">Age range</div>
            {renderSubAgeGroups(girlsGroups)}
          </>
        )}

        {/* Baby: gender then month */}
        {ageSection === 'baby' && (
          <>
            <div className="sidebar-sub-label">Baby gender</div>
            {BABY_GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`sidebar-option${babyGender === opt.value ? ' active' : ''}`}
                onClick={() => selectBabyGender(opt.value)}
              >
                {opt.label}
                {opt.value === 'boy'  && babyBoyGrp  && <span className="sidebar-count">{babyBoyGrp.product_count}</span>}
                {opt.value === 'girl' && babyGirlGrp && <span className="sidebar-count">{babyGirlGrp.product_count}</span>}
                {opt.value === 'all'  && babyBoyGrp  && babyGirlGrp && (
                  <span className="sidebar-count">{+babyBoyGrp.product_count + +babyGirlGrp.product_count}</span>
                )}
              </button>
            ))}
            {babyGender !== 'all' && (
              <>
                <div className="sidebar-sub-label" style={{ marginTop: 10 }}>Size (months)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 4 }}>
                  {BABY_MONTHS.map(m => (
                    <button
                      key={m}
                      onClick={e => { e.stopPropagation(); selectBabyMonth(m) }}
                      style={{
                        padding: '4px 9px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${babyMonth === m ? 'var(--color-brand)' : 'var(--color-border-md)'}`,
                        background: babyMonth === m ? 'var(--color-brand)' : 'none',
                        color: babyMonth === m ? '#fff' : 'var(--color-text-muted)',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                      }}
                    >{m}</button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Category ── */}
        <h3 style={{ marginTop: 20 }}>Category</h3>
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
        <button className={`sidebar-option${filters.badge === 'sale' ? ' active' : ''}`} onClick={() => update({ badge: filters.badge === 'sale' ? '' : 'sale' })}>🏷 On sale</button>
        <button className={`sidebar-option${filters.badge === 'new'  ? ' active' : ''}`} onClick={() => update({ badge: filters.badge === 'new'  ? '' : 'new'  })}>✨ New in</button>

        {activeFilterCount > 0 && (
          <button
            className="sidebar-clear"
            onClick={() => {
              update({ category: 'all', ageGroup: 'all', gender: 'all', badge: '', maxPrice: 70, q: '', page: 1, sizeFilter: '' })
              setAgeSection('all')
              setBabyGender('all')
              setBabyMonth('')
            }}
          >Clear all filters</button>
        )}
      </aside>

      {/* ── Main content ── */}
      <main className="shop-main">
        <div className="shop-toolbar">
          <span className="result-count">
            <strong>{total}</strong> items
            {filters.q && <span style={{ fontWeight: 400 }}> for "{filters.q}"</span>}
          </span>
          <select className="sort-select" value={filters.sort} onChange={e => update({ sort: e.target.value })}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {error && (
          <div style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 20 }).map((_, i) => (
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
                update({ category: 'all', ageGroup: 'all', gender: 'all', badge: '', q: '', maxPrice: 70, sizeFilter: '' })
                setAgeSection('all')
                setBabyGender('all')
                setBabyMonth('')
              }}
            >Clear all filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn page-btn--nav"
              disabled={filters.page <= 1}
              onClick={() => { setPage(filters.page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            >← Previous</button>
            <div className="pagination__info">
              <span className="pagination__current">Page {filters.page}</span>
              <span className="pagination__sep">of</span>
              <span className="pagination__total">{totalPages}</span>
              <span className="pagination__sep" style={{ margin: '0 6px' }}>·</span>
              <span className="pagination__count">{total} items</span>
            </div>
            <button
              className="page-btn page-btn--nav"
              disabled={filters.page >= totalPages}
              onClick={() => { setPage(filters.page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            >Next →</button>
          </div>
        )}
      </main>
    </div>
  )
}
