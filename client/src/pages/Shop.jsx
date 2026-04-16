import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories as catsApi } from '../api.js'
import ProductCard from '../components/ProductCard.jsx'
import { CAT_AVATARS } from '../constants/navCategories.js'
import { useProducts } from '../hooks/useProducts.js'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'A-Z' },
]

const SHOP_AGE_CARDS = [
  { key: 'girls', label: 'Girl', avatar: CAT_AVATARS.girl },
  { key: 'boys', label: 'Boy', avatar: CAT_AVATARS.boy },
  { key: 'toddler-girls', label: 'Toddler Girl', avatar: CAT_AVATARS.toddlerGirl },
  { key: 'toddler-boys', label: 'Toddler Boy', avatar: CAT_AVATARS.toddlerBoy },
  { key: 'baby', label: 'Baby', avatar: CAT_AVATARS.baby },
]

const BABY_GENDER_OPTIONS = [
  { value: 'all', label: 'All babies' },
  { value: 'boy', label: 'Baby boys' },
  { value: 'girl', label: 'Baby girls' },
]

function isToddlerSlug(slug) {
  return /-(2|3|4|5)$/.test(slug)
}

export default function Shop() {
  const [searchParams] = useSearchParams()
  const [cats, setCats] = useState([])
  const [ageGroups, setAgeGroups] = useState([])
  const [totalAll, setTotalAll] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ageSection, setAgeSection] = useState('all')
  const [babyGender, setBabyGender] = useState('all')
  const [babyMonth, setBabyMonth] = useState('')

  const urlCategory = searchParams.get('category') || 'all'
  const urlAgeGroup = searchParams.get('ageGroup') || 'all'
  const urlBadge = searchParams.get('badge') || ''
  const urlQ = searchParams.get('q') || ''
  const urlGender = searchParams.get('gender') || 'all'

  const {
    products,
    total,
    totalPages,
    loading,
    error,
    filters,
    update,
    setPage,
  } = useProducts({
    category: urlCategory,
    ageGroup: urlAgeGroup,
    gender: urlGender,
    badge: urlBadge,
    q: urlQ,
  })

  useEffect(() => {
    update({
      category: urlCategory,
      ageGroup: urlAgeGroup,
      gender: urlGender,
      badge: urlBadge,
      q: urlQ,
      page: 1,
    })
    setSidebarOpen(false)

    if (urlAgeGroup === 'baby' || urlAgeGroup === 'baby-boy' || urlAgeGroup === 'baby-girl') {
      setAgeSection('baby')
      if (urlAgeGroup === 'baby-boy') setBabyGender('boy')
      else if (urlAgeGroup === 'baby-girl') setBabyGender('girl')
      else setBabyGender('all')
    } else if (urlAgeGroup === 'toddler-boys') {
      setAgeSection('toddler-boys')
    } else if (urlAgeGroup === 'toddler-girls') {
      setAgeSection('toddler-girls')
    } else if (urlGender === 'boy' || urlAgeGroup === 'boys' || urlAgeGroup.startsWith('boys-')) {
      setAgeSection('boys')
    } else if (urlGender === 'girl' || urlAgeGroup === 'girls' || urlAgeGroup.startsWith('girls-')) {
      setAgeSection('girls')
    } else {
      setAgeSection('all')
    }

    setBabyMonth('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlAgeGroup, urlBadge, urlCategory, urlGender, urlQ])

  useEffect(() => {
    catsApi.list().then(setCats)
    catsApi.ageGroups().then(setAgeGroups)
    catsApi.total().then(data => setTotalAll(data.total))
  }, [])

  const boysGroups = ageGroups.filter(group => group.slug.startsWith('boys-'))
  const girlsGroups = ageGroups.filter(group => group.slug.startsWith('girls-'))
  const toddlerBoyGroups = boysGroups.filter(group => isToddlerSlug(group.slug))
  const toddlerGirlGroups = girlsGroups.filter(group => isToddlerSlug(group.slug))
  const babyBoyGroup = ageGroups.find(group => group.slug === 'baby-boy')
  const babyGirlGroup = ageGroups.find(group => group.slug === 'baby-girl')
  const babyMonths = ['3M', '6M', '9M', '12M', '18M', '24M']

  function selectGenderSection(section) {
    setAgeSection(section)
    setBabyGender('all')
    setBabyMonth('')

    if (section === 'all') {
      update({ ageGroup: 'all', gender: 'all' })
    } else if (section === 'girls') {
      update({ ageGroup: 'girls', gender: 'girl' })
    } else if (section === 'boys') {
      update({ ageGroup: 'boys', gender: 'boy' })
    } else if (section === 'toddler-girls') {
      update({ ageGroup: 'toddler-girls', gender: 'girl' })
    } else if (section === 'toddler-boys') {
      update({ ageGroup: 'toddler-boys', gender: 'boy' })
    } else if (section === 'baby') {
      update({ ageGroup: 'baby', gender: 'all' })
    }
  }

  function selectBabyGender(value) {
    setBabyGender(value)
    setBabyMonth('')

    if (value === 'all') {
      update({ ageGroup: 'baby', gender: 'all', sizeFilter: '' })
    } else if (value === 'boy') {
      update({ ageGroup: 'baby-boy', gender: 'boy', sizeFilter: '' })
    } else {
      update({ ageGroup: 'baby-girl', gender: 'girl', sizeFilter: '' })
    }
  }

  function selectBabyMonth(month) {
    const nextValue = babyMonth === month ? '' : month
    setBabyMonth(nextValue)
    update({ sizeFilter: nextValue })
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

  function renderSubAgeGroups(groups, label = 'All ages') {
    return (
      <div className="sidebar-subgroups">
        <button
          className={`sidebar-option${filters.ageGroup === 'all' ? ' active' : ''}`}
          onClick={() => selectAgeGroup('all')}
        >
          {label}
        </button>
        {groups.map(group => (
          <button
            key={group.slug}
            className={`sidebar-option${filters.ageGroup === group.slug ? ' active' : ''}`}
            onClick={() => selectAgeGroup(group.slug)}
          >
            {group.label}
            <span className="sidebar-count">{group.product_count}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="shop-layout">
      <button className="sidebar-mobile-toggle" onClick={() => setSidebarOpen(open => !open)}>
        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        <span className="sidebar-chevron">{sidebarOpen ? '▲' : '▼'}</span>
      </button>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-mobile-header">
          <span style={{ fontWeight: 700 }}>Filters</span>
          <button className="sidebar-mobile-close" onClick={() => setSidebarOpen(false)}>Close</button>
        </div>

        <h3>Gender &amp; Age</h3>
        <div className="sidebar-gender-cards">
          {SHOP_AGE_CARDS.map(card => (
            <button
              key={card.key}
              className={`sidebar-gender-card${ageSection === card.key ? ' sidebar-gender-card--active' : ''}`}
              onClick={() => selectGenderSection(card.key)}
            >
              <div
                className="sidebar-gender-card__avatar"
                style={{
                  background: card.avatar.bg,
                  borderColor: card.avatar.border,
                  boxShadow: ageSection === card.key ? `0 0 0 2px ${card.avatar.border}` : 'none',
                }}
              >
                <span className="sidebar-gender-card__emoji">{card.avatar.emoji}</span>
              </div>
              <span className="sidebar-gender-card__label">{card.label}</span>
            </button>
          ))}
        </div>

        <button
          className={`sidebar-option sidebar-option--all${ageSection === 'all' ? ' active' : ''}`}
          onClick={() => selectGenderSection('all')}
        >
          View all ages
          <span className="sidebar-count">{totalAll}</span>
        </button>

        {ageSection === 'boys' && (
          <>
            <div className="sidebar-sub-label">Age range</div>
            {renderSubAgeGroups(boysGroups, 'All boys')}
          </>
        )}

        {ageSection === 'girls' && (
          <>
            <div className="sidebar-sub-label">Age range</div>
            {renderSubAgeGroups(girlsGroups, 'All girls')}
          </>
        )}

        {ageSection === 'toddler-boys' && (
          <>
            <div className="sidebar-sub-label">Toddler sizes</div>
            {renderSubAgeGroups(toddlerBoyGroups, 'All toddler boys')}
          </>
        )}

        {ageSection === 'toddler-girls' && (
          <>
            <div className="sidebar-sub-label">Toddler sizes</div>
            {renderSubAgeGroups(toddlerGirlGroups, 'All toddler girls')}
          </>
        )}

        {ageSection === 'baby' && (
          <>
            <div className="sidebar-sub-label">Baby gender</div>
            {BABY_GENDER_OPTIONS.map(option => (
              <button
                key={option.value}
                className={`sidebar-option${babyGender === option.value ? ' active' : ''}`}
                onClick={() => selectBabyGender(option.value)}
              >
                {option.label}
                {option.value === 'boy' && babyBoyGroup && <span className="sidebar-count">{babyBoyGroup.product_count}</span>}
                {option.value === 'girl' && babyGirlGroup && <span className="sidebar-count">{babyGirlGroup.product_count}</span>}
                {option.value === 'all' && babyBoyGroup && babyGirlGroup && (
                  <span className="sidebar-count">{Number(babyBoyGroup.product_count) + Number(babyGirlGroup.product_count)}</span>
                )}
              </button>
            ))}

            {babyGender !== 'all' && (
              <>
                <div className="sidebar-sub-label" style={{ marginTop: 10 }}>Size (months)</div>
                <div className="sidebar-months">
                  {babyMonths.map(month => (
                    <button
                      key={month}
                      className={`sidebar-month${babyMonth === month ? ' sidebar-month--active' : ''}`}
                      onClick={event => {
                        event.stopPropagation()
                        selectBabyMonth(month)
                      }}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <h3 style={{ marginTop: 20 }}>Category</h3>
        <button
          className={`sidebar-option${filters.category === 'all' ? ' active' : ''}`}
          onClick={() => update({ category: 'all' })}
        >
          All
          <span className="sidebar-count">{totalAll}</span>
        </button>
        {cats.map(category => (
          <button
            key={category.slug}
            className={`sidebar-option${filters.category === category.slug ? ' active' : ''}`}
            onClick={() => update({ category: category.slug })}
          >
            {category.icon} {category.label}
            <span className="sidebar-count">{category.product_count}</span>
          </button>
        ))}

        <h3>Max price: <strong>${filters.maxPrice}</strong></h3>
        <input
          type="range"
          min="8"
          max="70"
          step="1"
          value={filters.maxPrice}
          onChange={event => update({ maxPrice: Number(event.target.value) })}
          style={{ width: '100%', accentColor: 'var(--color-brand)', margin: '8px 0' }}
        />
        <div className="sidebar-price-range">
          <span>$8</span>
          <span>$70</span>
        </div>

        <h3>Availability</h3>
        <button
          className={`sidebar-option${filters.badge === 'sale' ? ' active' : ''}`}
          onClick={() => update({ badge: filters.badge === 'sale' ? '' : 'sale' })}
        >
          On sale
        </button>
        <button
          className={`sidebar-option${filters.badge === 'new' ? ' active' : ''}`}
          onClick={() => update({ badge: filters.badge === 'new' ? '' : 'new' })}
        >
          New in
        </button>

        {activeFilterCount > 0 && (
          <button
            className="sidebar-clear"
            onClick={() => {
              update({
                category: 'all',
                ageGroup: 'all',
                gender: 'all',
                badge: '',
                maxPrice: 70,
                q: '',
                page: 1,
                sizeFilter: '',
              })
              setAgeSection('all')
              setBabyGender('all')
              setBabyMonth('')
            }}
          >
            Clear all filters
          </button>
        )}
      </aside>

      <main className="shop-main">
        <div className="shop-toolbar">
          <span className="result-count">
            <strong>{total}</strong> items
            {filters.q && <span style={{ fontWeight: 400 }}> for "{filters.q}"</span>}
          </span>
          <select className="sort-select" value={filters.sort} onChange={event => update({ sort: event.target.value })}>
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            Warning: {error}
          </div>
        )}

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="product-card skeleton" style={{ height: 340 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: '1rem' }}>Search</div>
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
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

      </main>
      </div>

      {totalPages > 1 && (
        <div className="shop-pagination-wrap">
          <div className="pagination">
            <button
              className="page-btn page-btn--nav"
              disabled={filters.page <= 1}
              onClick={() => {
                setPage(filters.page - 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Previous
            </button>
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
              onClick={() => {
                setPage(filters.page + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  )
}
