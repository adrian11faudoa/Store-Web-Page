import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard.jsx'
import { useAppStore } from '../store/useAppStore.js'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'price-low', label: 'Precio: menor a mayor' },
  { value: 'price-high', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
]

const GENDER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'girls', label: 'Niñas' },
  { value: 'boys', label: 'Niños' },
  { value: 'unisex', label: 'Unisex' },
]

const ITEMS_PER_PAGE = 30

const CATEGORY_LABELS_ES = {
  tops: 'Playeras',
  bottoms: 'Pantalones',
  dresses: 'Vestidos',
  rompers: 'Mamelucos',
  sleepwear: 'Pijamas',
}

const GENDER_LABELS_ES = {
  girls: 'Niñas',
  boys: 'Niños',
  unisex: 'Unisex',
}

const SEASON_LABELS_ES = {
  fall: 'Otoño',
  winter: 'Invierno',
  spring: 'Primavera',
  summer: 'Verano',
  christmas: 'Navidad',
  halloween: 'Halloween',
}

function titleCase(value) {
  return String(value || '')
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function categoryLabelEs(value) {
  const key = String(value || '').toLowerCase()
  return CATEGORY_LABELS_ES[key] || titleCase(value)
}

function genderLabelEs(value) {
  const key = String(value || '').toLowerCase()
  return GENDER_LABELS_ES[key] || titleCase(value)
}

function seasonLabelEs(value) {
  const key = String(value || '').toLowerCase()
  return SEASON_LABELS_ES[key] || titleCase(value)
}

function readFilters(searchParams) {
  const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10)

  return {
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    gender: searchParams.get('gender') || 'all',
    ageGroup: searchParams.get('ageGroup') || 'all',
    season: searchParams.get('season') || 'all',
    sort: searchParams.get('sort') || 'featured',
  }
}

function closeDropdownMenu(event) {
  const details = event.currentTarget.closest('details')
  if (details) details.open = false
}

function handleDropdownToggle(event) {
  const current = event.currentTarget
  if (!current.open) return

  const toolbar = current.closest('.filter-toolbar')
  if (!toolbar) return

  const openDropdowns = toolbar.querySelectorAll('.filter-dropdown-select[open]')
  openDropdowns.forEach(dropdown => {
    if (dropdown !== current) dropdown.open = false
  })
}

function FilterDropdown({ id, label, value, iconClassName, icon, options, onChange, fieldClassName = '' }) {
  const selectedOption = options.find(option => option.value === value) || options[0]

  return (
    <div className={`filter-field ${fieldClassName}`.trim()}>
      <label htmlFor={`${id}-trigger`}>{label}</label>
      <details className="filter-dropdown-select" onToggle={handleDropdownToggle}>
        <summary id={`${id}-trigger`} className="filter-control filter-control--select">
          <span className={`filter-control__icon ${iconClassName || ''}`} aria-hidden="true">{icon}</span>
          <span className="filter-control__value">{selectedOption?.label || ''}</span>
        </summary>
        <div className="filter-dropdown-menu" role="listbox" aria-label={label}>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              className={value === option.value ? 'filter-dropdown-option is-active' : 'filter-dropdown-option'}
              onClick={event => {
                onChange(option.value)
                closeDropdownMenu(event)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterToolbarRef = useRef(null)
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(filters.page, totalPages)
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const pageEndIndex = pageStartIndex + ITEMS_PER_PAGE
  const visibleProducts = filteredProducts.slice(pageStartIndex, pageEndIndex)
  const showingFrom = filteredProducts.length === 0 ? 0 : pageStartIndex + 1
  const showingTo = Math.min(pageEndIndex, filteredProducts.length)

  const activeFilters = [
    filters.category !== 'all' && { key: 'category', label: categoryLabelEs(filters.category) },
    filters.gender !== 'all' && { key: 'gender', label: genderLabelEs(filters.gender) },
    filters.ageGroup !== 'all' && { key: 'ageGroup', label: filters.ageGroup },
    filters.season !== 'all' && { key: 'season', label: seasonLabelEs(filters.season) },
    filters.q && { key: 'q', label: `"${filters.q}"` },
  ].filter(Boolean)
  const categoryOptions = [{ value: 'all', label: 'Todas' }, ...categories.map(category => ({ value: category.slug, label: categoryLabelEs(category.slug || category.name) }))]
  const ageGroupOptions = [{ value: 'all', label: 'Todas las edades' }, ...meta.ageGroups.map(ageGroup => ({ value: ageGroup, label: ageGroup }))]
  const seasonOptions = [{ value: 'all', label: 'Todas' }, ...meta.seasons.map(season => ({ value: season, label: seasonLabelEs(season) }))]

  function updateFilter(key, value) {
    const nextParams = new URLSearchParams(searchParams)

    if (key === 'page') {
      const nextPage = Math.max(1, Number.parseInt(String(value || 1), 10) || 1)

      if (nextPage <= 1) {
        nextParams.delete('page')
      } else {
        nextParams.set('page', String(nextPage))
      }

      setSearchParams(nextParams)
      return
    }

    const fallbackValue = key === 'sort' ? 'featured' : 'all'

    if (!value || value === fallbackValue) {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }

    nextParams.delete('page')
    setSearchParams(nextParams)
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams())
    setFiltersOpen(false)
  }
  useEffect(() => {
    function closeAllFilterDropdowns() {
      if (!filterToolbarRef.current) return
      const openDropdowns = filterToolbarRef.current.querySelectorAll('.filter-dropdown-select[open]')
      openDropdowns.forEach(dropdown => {
        dropdown.open = false
      })
    }

    function handlePointerDown(event) {
      const toolbar = filterToolbarRef.current
      if (!toolbar) return

      const target = event.target
      const clickedInsideDropdown = target instanceof Element && Boolean(target.closest('.filter-dropdown-select'))
      if (!clickedInsideDropdown) closeAllFilterDropdowns()
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') closeAllFilterDropdowns()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <section className="section section--catalog-page">
      <div className="container container--catalog">
        <div className="mobile-filter-bar">
          <button type="button" className="button button--ghost" onClick={() => setFiltersOpen(true)}>
            Filtros{activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
          </button>
          <p className="catalog-count catalog-count--mobile">{filteredProducts.length} productos</p>
        </div>

        {filtersOpen ? (
          <button
            type="button"
            className="mobile-filter-backdrop"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
          />
        ) : null}

        <div className="catalog-layout">
          <div className={filtersOpen ? 'catalog-layout__sidebar is-open' : 'catalog-layout__sidebar'}>
            <aside className="filters-panel">
              <div className="filters-panel__header">
                <strong>
                  <span className="filters-panel__header-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="presentation">
                      <path d="M4 5h16l-6 7v6l-4 2v-8z" />
                    </svg>
                  </span>
                  Filtros
                </strong>
                <div className="filters-panel__header-meta">
                  <p className="catalog-count catalog-count--panel">{filteredProducts.length} productos</p>
                  <button type="button" className="icon-button filters-panel__close" onClick={() => setFiltersOpen(false)}>
                    Cerrar
                  </button>
                </div>
              </div>

              <div className="filter-toolbar" ref={filterToolbarRef}>
                <div className="filter-field filter-field--search">
                  <label htmlFor="catalog-search">Buscar</label>
                  <div className="filter-control filter-control--search">
                    <span className="filter-control__icon" aria-hidden="true">🔎</span>
                    <input
                      id="catalog-search"
                      type="search"
                      value={filters.q}
                      onChange={event => updateFilter('q', event.target.value)}
                      placeholder="Busca por producto, edad o temporada"
                    />
                  </div>
                </div>

                <FilterDropdown
                  id="filter-category"
                  label="Categoría"
                  value={filters.category}
                  iconClassName="filter-control__icon--rose"
                  icon="👜"
                  options={categoryOptions}
                  onChange={value => updateFilter('category', value)}
                />

                <FilterDropdown
                  id="filter-gender"
                  label="Género"
                  value={filters.gender}
                  iconClassName="filter-control__icon--mint"
                  icon="👗"
                  options={GENDER_OPTIONS}
                  onChange={value => updateFilter('gender', value)}
                />

                <FilterDropdown
                  id="filter-age"
                  label="Edad"
                  value={filters.ageGroup}
                  iconClassName="filter-control__icon--sand"
                  icon="🧒"
                  options={ageGroupOptions}
                  onChange={value => updateFilter('ageGroup', value)}
                  fieldClassName="filter-field--wide"
                />

                <FilterDropdown
                  id="filter-season"
                  label="Temporada"
                  value={filters.season}
                  iconClassName="filter-control__icon--lavender"
                  icon="📅"
                  options={seasonOptions}
                  onChange={value => updateFilter('season', value)}
                />

                <FilterDropdown
                  id="filter-sort"
                  label="Ordenar por"
                  value={filters.sort}
                  iconClassName=""
                  icon="↕"
                  options={SORT_OPTIONS}
                  onChange={value => updateFilter('sort', value)}
                  fieldClassName="filter-field--wide"
                />

                <div className="filter-field filter-field--clear">
                  <label aria-hidden="true">&nbsp;</label>
                  <button type="button" className="button filter-clear-button" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </aside>
          </div>

          <div className="catalog-layout__content">

            {activeFilters.length > 0 ? (
              <div className="active-filters">
                {activeFilters.map(filter => (
                  <span key={filter.key} className="active-filter-tag">
                    {filter.label}
                    <button type="button" onClick={() => updateFilter(filter.key, filter.key === 'q' ? '' : 'all')} aria-label="Quitar filtro">
                      x
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="product-grid">
              {visibleProducts.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={variantId => addToCart(variantId)} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="catalog-pagination" aria-label="Paginación de catálogo">
                <p className="catalog-pagination__summary">Mostrando {showingFrom}-{showingTo} de {filteredProducts.length}</p>
                <div className="catalog-pagination__controls">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => updateFilter('page', currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Anterior
                  </button>
                  <span className="catalog-pagination__page">Página {currentPage} de {totalPages}</span>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => updateFilter('page', currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}




