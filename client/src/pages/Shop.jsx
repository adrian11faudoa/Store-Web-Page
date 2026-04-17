import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories as catsApi } from '../api.js'
import ProductCard from '../components/ProductCard.jsx'
import { CAT_AVATARS } from '../constants/navCategories.js'
import { useProducts } from '../hooks/useProducts.js'
import { filtersFromSearchParams, filtersToSearchParams } from '../lib/productFilters.js'
import { formatMoney } from '../lib/money.js'
import { t, useLang } from '../store/lang.js'

function isToddlerSlug(slug) {
  return /-(2|3|4|5)$/.test(slug)
}

export default function Shop() {
  const lang = useLang(state => state.lang)
  const [searchParams, setSearchParams] = useSearchParams()
  const [cats, setCats] = useState([])
  const [ageGroups, setAgeGroups] = useState([])
  const [totalAll, setTotalAll] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ageSection, setAgeSection] = useState('all')
  const [babyGender, setBabyGender] = useState('all')
  const [babyMonth, setBabyMonth] = useState('')

  const sortOptions = [
    { value: 'featured', label: t(lang, 'featured') },
    { value: 'newest', label: t(lang, 'newest') },
    { value: 'price-asc', label: t(lang, 'priceLowHigh') },
    { value: 'price-desc', label: t(lang, 'priceHighLow') },
    { value: 'rating', label: t(lang, 'topRated') },
    { value: 'name', label: t(lang, 'az') },
  ]

  const shopAgeCards = [
    { key: 'girls', label: t(lang, 'girl'), avatar: CAT_AVATARS.girl },
    { key: 'boys', label: t(lang, 'boy'), avatar: CAT_AVATARS.boy },
    { key: 'toddler-girls', label: t(lang, 'toddlerGirl'), avatar: CAT_AVATARS.toddlerGirl },
    { key: 'toddler-boys', label: t(lang, 'toddlerBoy'), avatar: CAT_AVATARS.toddlerBoy },
    { key: 'baby', label: t(lang, 'baby'), avatar: CAT_AVATARS.baby },
  ]

  const babyGenderOptions = [
    { value: 'all', label: t(lang, 'allBabies') },
    { value: 'boy', label: t(lang, 'babyBoys') },
    { value: 'girl', label: t(lang, 'babyGirls') },
  ]

  const urlFilters = filtersFromSearchParams(searchParams)
  const { products, total, totalPages, loading, error, filters, update, setPage } = useProducts(urlFilters)

  useEffect(() => {
    update({
      category: urlFilters.category,
      ageGroup: urlFilters.ageGroup,
      gender: urlFilters.gender,
      badge: urlFilters.badge,
      q: urlFilters.q,
      page: 1,
    })
    setSidebarOpen(false)

    if (urlFilters.ageGroup === 'baby' || urlFilters.ageGroup === 'baby-boy' || urlFilters.ageGroup === 'baby-girl') {
      setAgeSection('baby')
      setBabyGender(urlFilters.ageGroup === 'baby-boy' ? 'boy' : urlFilters.ageGroup === 'baby-girl' ? 'girl' : 'all')
    } else if (urlFilters.ageGroup === 'toddler-boys') {
      setAgeSection('toddler-boys')
    } else if (urlFilters.ageGroup === 'toddler-girls') {
      setAgeSection('toddler-girls')
    } else if (urlFilters.gender === 'boy' || urlFilters.ageGroup === 'boys' || urlFilters.ageGroup.startsWith('boys-')) {
      setAgeSection('boys')
    } else if (urlFilters.gender === 'girl' || urlFilters.ageGroup === 'girls' || urlFilters.ageGroup.startsWith('girls-')) {
      setAgeSection('girls')
    } else {
      setAgeSection('all')
    }

    setBabyMonth('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlFilters.ageGroup, urlFilters.badge, urlFilters.category, urlFilters.gender, urlFilters.q])

  useEffect(() => {
    const next = filtersToSearchParams(filters).toString()
    const current = searchParams.toString()
    if (next !== current) {
      setSearchParams(next, { replace: true })
    }
  }, [filters, searchParams, setSearchParams])

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
    if (section === 'all') update({ ageGroup: 'all', gender: 'all' })
    else if (section === 'girls') update({ ageGroup: 'girls', gender: 'girl' })
    else if (section === 'boys') update({ ageGroup: 'boys', gender: 'boy' })
    else if (section === 'toddler-girls') update({ ageGroup: 'toddler-girls', gender: 'girl' })
    else if (section === 'toddler-boys') update({ ageGroup: 'toddler-boys', gender: 'boy' })
    else if (section === 'baby') update({ ageGroup: 'baby', gender: 'all' })
  }

  function selectBabyGender(value) {
    setBabyGender(value)
    setBabyMonth('')
    if (value === 'all') update({ ageGroup: 'baby', gender: 'all', sizeFilter: '' })
    else if (value === 'boy') update({ ageGroup: 'baby-boy', gender: 'boy', sizeFilter: '' })
    else update({ ageGroup: 'baby-girl', gender: 'girl', sizeFilter: '' })
  }

  const activeFilterCount = [
    filters.category !== 'all',
    filters.ageGroup !== 'all',
    filters.gender !== 'all',
    filters.badge !== '',
    filters.maxPrice < 70,
    !!filters.sizeFilter,
  ].filter(Boolean).length

  function renderSubAgeGroups(groups, label) {
    return (
      <div className="sidebar-subgroups">
        <button className={`sidebar-option${filters.ageGroup === 'all' ? ' active' : ''}`} onClick={() => update({ ageGroup: 'all' })}>
          {label}
        </button>
        {groups.map(group => (
          <button key={group.slug} className={`sidebar-option${filters.ageGroup === group.slug ? ' active' : ''}`} onClick={() => update({ ageGroup: group.slug })}>
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
          {t(lang, 'filters')}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          <span className="sidebar-chevron">{sidebarOpen ? '▲' : '▼'}</span>
        </button>

        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

        <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
          <div className="sidebar-mobile-header">
            <span style={{ fontWeight: 700 }}>{t(lang, 'filters')}</span>
            <button className="sidebar-mobile-close" onClick={() => setSidebarOpen(false)}>{t(lang, 'close')}</button>
          </div>

          <h3>{t(lang, 'genderAge')}</h3>
          <div className="sidebar-gender-cards">
            {shopAgeCards.map(card => (
              <button key={card.key} className={`sidebar-gender-card${ageSection === card.key ? ' sidebar-gender-card--active' : ''}`} onClick={() => selectGenderSection(card.key)}>
                <div className="sidebar-gender-card__avatar" style={{ background: card.avatar.bg, borderColor: card.avatar.border, boxShadow: ageSection === card.key ? `0 0 0 2px ${card.avatar.border}` : 'none' }}>
                  <span className="sidebar-gender-card__emoji">{card.avatar.emoji}</span>
                </div>
                <span className="sidebar-gender-card__label">{card.label}</span>
              </button>
            ))}
          </div>

          <button className={`sidebar-option sidebar-option--all${ageSection === 'all' ? ' active' : ''}`} onClick={() => selectGenderSection('all')}>
            {t(lang, 'viewAllAges')}
            <span className="sidebar-count">{totalAll}</span>
          </button>

          {ageSection === 'boys' && <><div className="sidebar-sub-label">{t(lang, 'ageRange')}</div>{renderSubAgeGroups(boysGroups, t(lang, 'allBoys'))}</>}
          {ageSection === 'girls' && <><div className="sidebar-sub-label">{t(lang, 'ageRange')}</div>{renderSubAgeGroups(girlsGroups, t(lang, 'allGirls'))}</>}
          {ageSection === 'toddler-boys' && <><div className="sidebar-sub-label">{t(lang, 'toddlerSizes')}</div>{renderSubAgeGroups(toddlerBoyGroups, t(lang, 'allToddlerBoys'))}</>}
          {ageSection === 'toddler-girls' && <><div className="sidebar-sub-label">{t(lang, 'toddlerSizes')}</div>{renderSubAgeGroups(toddlerGirlGroups, t(lang, 'allToddlerGirls'))}</>}

          {ageSection === 'baby' && (
            <>
              <div className="sidebar-sub-label">{t(lang, 'babyGender')}</div>
              {babyGenderOptions.map(option => (
                <button key={option.value} className={`sidebar-option${babyGender === option.value ? ' active' : ''}`} onClick={() => selectBabyGender(option.value)}>
                  {option.label}
                  {option.value === 'boy' && babyBoyGroup && <span className="sidebar-count">{babyBoyGroup.product_count}</span>}
                  {option.value === 'girl' && babyGirlGroup && <span className="sidebar-count">{babyGirlGroup.product_count}</span>}
                  {option.value === 'all' && babyBoyGroup && babyGirlGroup && <span className="sidebar-count">{Number(babyBoyGroup.product_count) + Number(babyGirlGroup.product_count)}</span>}
                </button>
              ))}

              {babyGender !== 'all' && (
                <>
                  <div className="sidebar-sub-label" style={{ marginTop: 10 }}>{t(lang, 'sizeMonths')}</div>
                  <div className="sidebar-months">
                    {babyMonths.map(month => (
                      <button key={month} className={`sidebar-month${babyMonth === month ? ' sidebar-month--active' : ''}`} onClick={() => { const next = babyMonth === month ? '' : month; setBabyMonth(next); update({ sizeFilter: next }) }}>
                        {month}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <h3 style={{ marginTop: 20 }}>{t(lang, 'category')}</h3>
          <button className={`sidebar-option${filters.category === 'all' ? ' active' : ''}`} onClick={() => update({ category: 'all' })}>
            {t(lang, 'all')}
            <span className="sidebar-count">{totalAll}</span>
          </button>
          {cats.map(category => (
            <button key={category.slug} className={`sidebar-option${filters.category === category.slug ? ' active' : ''}`} onClick={() => update({ category: category.slug })}>
              {category.icon} {category.label}
              <span className="sidebar-count">{category.product_count}</span>
            </button>
          ))}

          <h3>{t(lang, 'maxPrice')}: <strong>{formatMoney(filters.maxPrice, lang)}</strong></h3>
          <input type="range" min="8" max="70" step="1" value={filters.maxPrice} onChange={event => update({ maxPrice: Number(event.target.value) })} style={{ width: '100%', accentColor: 'var(--color-brand)', margin: '8px 0' }} />
          <div className="sidebar-price-range">
            <span>{formatMoney(8, lang)}</span>
            <span>{formatMoney(70, lang)}</span>
          </div>

          <h3>{t(lang, 'availability')}</h3>
          <button className={`sidebar-option${filters.badge === 'sale' ? ' active' : ''}`} onClick={() => update({ badge: filters.badge === 'sale' ? '' : 'sale' })}>{t(lang, 'onSale')}</button>
          <button className={`sidebar-option${filters.badge === 'new' ? ' active' : ''}`} onClick={() => update({ badge: filters.badge === 'new' ? '' : 'new' })}>{t(lang, 'newIn')}</button>

          {activeFilterCount > 0 && (
            <button className="sidebar-clear" onClick={() => { update({ category: 'all', ageGroup: 'all', gender: 'all', badge: '', maxPrice: 70, q: '', page: 1, sizeFilter: '' }); setAgeSection('all'); setBabyGender('all'); setBabyMonth('') }}>
              {t(lang, 'clearAllFilters')}
            </button>
          )}
        </aside>

        <main className="shop-main">
          <div className="shop-toolbar">
            <span className="result-count">
              <strong>{total}</strong> {t(lang, total === 1 ? 'item' : 'items')}
              {filters.q && <span style={{ fontWeight: 400 }}> {t(lang, 'forSearch')} "{filters.q}"</span>}
            </span>
            <select className="sort-select" value={filters.sort} onChange={event => update({ sort: event.target.value })}>
              {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          {error && <div style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>{t(lang, 'warning')}: {error}</div>}

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 20 }).map((_, index) => <div key={index} className="product-card skeleton" style={{ height: 340 }} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>{t(lang, 'searchBtn')}</div>
              <h3>{t(lang, 'noProductsFound')}</h3>
              <p>{t(lang, 'tryAdjusting')}</p>
              <button className="btn btn--primary" style={{ marginTop: '1.5rem' }} onClick={() => { update({ category: 'all', ageGroup: 'all', gender: 'all', badge: '', q: '', maxPrice: 70, sizeFilter: '' }); setAgeSection('all'); setBabyGender('all'); setBabyMonth('') }}>
                {t(lang, 'clearAllFilters')}
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
            <button className="page-btn page-btn--nav" disabled={filters.page <= 1} onClick={() => { setPage(filters.page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              {t(lang, 'previous')}
            </button>
            <div className="pagination__info">
              <span className="pagination__current">{t(lang, 'page')} {filters.page}</span>
              <span className="pagination__sep">{t(lang, 'of')}</span>
              <span className="pagination__total">{totalPages}</span>
              <span className="pagination__sep" style={{ margin: '0 6px' }}>·</span>
              <span className="pagination__count">{total} {t(lang, total === 1 ? 'item' : 'items')}</span>
            </div>
            <button className="page-btn page-btn--nav" disabled={filters.page >= totalPages} onClick={() => { setPage(filters.page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              {t(lang, 'next')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
