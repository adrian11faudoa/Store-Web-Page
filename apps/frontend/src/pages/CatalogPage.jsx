import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard.jsx'
import { useAppStore } from '../store/useAppStore.js'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Mas nuevos' },
  { value: 'price-low', label: 'Precio: menor a mayor' },
  { value: 'price-high', label: 'Precio: mayor a menor' },
  { value: 'name', label: 'Nombre A-Z' },
]

const GENDER_OPTIONS = [
  { value: 'all', label: 'Todos', emoji: '✨' },
  { value: 'girls', label: 'Ninas', emoji: '🌸' },
  { value: 'boys', label: 'Ninos', emoji: '🚀' },
  { value: 'unisex', label: 'Unisex', emoji: '🧸' },
]

const ITEMS_PER_PAGE = 20

function titleCase(value) {
  return String(value || '')
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
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

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
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
    filters.category !== 'all' && { key: 'category', label: titleCase(filters.category) },
    filters.gender !== 'all' && { key: 'gender', label: titleCase(filters.gender) },
    filters.ageGroup !== 'all' && { key: 'ageGroup', label: filters.ageGroup },
    filters.season !== 'all' && { key: 'season', label: titleCase(filters.season) },
    filters.q && { key: 'q', label: `"${filters.q}"` },
  ].filter(Boolean)

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

  return (
    <section className="section">
      <div className="container container--catalog">
        <div className="mobile-filter-bar">
          <button type="button" className="button button--ghost" onClick={() => setFiltersOpen(true)}>
            Filtrar estilos {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
          </button>
          <p className="catalog-count">{filteredProducts.length} productos</p>
        </div>

        {filtersOpen ? <button type="button" className="mobile-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="Cerrar filtros" /> : null}

        <div className="catalog-layout">
          <div className={filtersOpen ? 'catalog-layout__sidebar is-open' : 'catalog-layout__sidebar'}>
            <aside className="filters-panel">
              <div className="filters-panel__header">
                <strong>Filtrar estilos</strong>
                <button type="button" className="icon-button" onClick={() => setFiltersOpen(false)}>Cerrar</button>
              </div>

              <div className="filters-panel__group">
                <label htmlFor="catalog-search">Buscar</label>
                <input
                  id="catalog-search"
                  type="search"
                  value={filters.q}
                  onChange={event => updateFilter('q', event.target.value)}
                  placeholder="Busca por producto, edad o temporada"
                />
              </div>

              <div className="filters-panel__group">
                <span className="filters-panel__label">Categoria</span>
                <div className="filter-pills">
                  <button type="button" className={filters.category === 'all' ? 'filter-pill is-active' : 'filter-pill'} onClick={() => updateFilter('category', 'all')}>🛍️ Todos</button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      className={filters.category === category.slug ? 'filter-pill is-active' : 'filter-pill'}
                      onClick={() => updateFilter('category', category.slug)}
                    >
                      {titleCase(category.name)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-panel__group">
                <span className="filters-panel__label">Genero</span>
                <div className="filter-pills">
                  {GENDER_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={filters.gender === option.value ? 'filter-pill is-active' : 'filter-pill'}
                      onClick={() => updateFilter('gender', option.value)}
                    >
                      {option.emoji} {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-panel__group">
                <span className="filters-panel__label">Grupo de edad</span>
                <div className="filter-pills">
                  <button type="button" className={filters.ageGroup === 'all' ? 'filter-pill is-active' : 'filter-pill'} onClick={() => updateFilter('ageGroup', 'all')}>Todas las edades</button>
                  {meta.ageGroups.map(ageGroup => (
                    <button
                      key={ageGroup}
                      type="button"
                      className={filters.ageGroup === ageGroup ? 'filter-pill is-active' : 'filter-pill'}
                      onClick={() => updateFilter('ageGroup', ageGroup)}
                    >
                      {ageGroup}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-panel__group">
                <span className="filters-panel__label">Temporada</span>
                <div className="filter-pills">
                  <button type="button" className={filters.season === 'all' ? 'filter-pill is-active' : 'filter-pill'} onClick={() => updateFilter('season', 'all')}>Todas</button>
                  {meta.seasons.map(season => (
                    <button
                      key={season}
                      type="button"
                      className={filters.season === season ? 'filter-pill is-active' : 'filter-pill'}
                      onClick={() => updateFilter('season', season)}
                    >
                      {titleCase(season)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters-panel__group">
                <label htmlFor="catalog-sort">Ordenar por</label>
                <select id="catalog-sort" className="sort-select" value={filters.sort} onChange={event => updateFilter('sort', event.target.value)}>
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <button type="button" className="button button--ghost button--full" onClick={clearFilters}>
                Limpiar filtros
              </button>
            </aside>
          </div>

          <div className="catalog-layout__content">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Selecciones frescas para cada dia de juego</p>
                <h1>Compra prendas divertidas para bebes, peques y ninos grandes</h1>
              </div>
              <p className="catalog-count">{filteredProducts.length} productos</p>
            </div>

            {activeFilters.length > 0 ? (
              <div className="active-filters">
                {activeFilters.map(filter => (
                  <span key={filter.key} className="active-filter-tag">
                    {filter.label}
                    <button type="button" onClick={() => updateFilter(filter.key, filter.key === 'q' ? '' : 'all')} aria-label="Quitar filtro">
                      ×
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
              <div className="catalog-pagination" aria-label="Paginacion de catalogo">
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
                  <span className="catalog-pagination__page">Pagina {currentPage} de {totalPages}</span>
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
