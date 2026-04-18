const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
]

const GENDER_OPTIONS = [
  { value: 'all', label: 'All', emoji: '✨' },
  { value: 'girls', label: 'Girls', emoji: '🌸' },
  { value: 'boys', label: 'Boys', emoji: '🚀' },
  { value: 'baby girls', label: 'Baby ♀', emoji: '🩷' },
  { value: 'baby boys', label: 'Baby ♂', emoji: '💙' },
]

const CATEGORY_ICONS = {
  all: '🛍️',
  tops: '👕',
  bottoms: '👖',
  dresses: '👗',
  outerwear: '🧥',
  sets: '🎁',
}

const AGE_OPTIONS = [
  { value: 'all', label: 'All ages' },
  { value: '0–24 months', label: '0–24 months' },
  { value: '2–4 years', label: '2–4 years' },
  { value: '4–6 years', label: '4–6 years' },
  { value: '7–10 years', label: '7–10 years' },
  { value: '10–14 years', label: '10–14 years' },
]

export default function ProductFilters({ filters, onChange, onReset, onClose }) {
  return (
    <aside className="filters-panel" aria-label="Product filters">
      <div className="filters-panel__header">
        <strong>Filter styles</strong>
        {onClose && <button type="button" className="icon-button" onClick={onClose}>Close</button>}
      </div>

      <div className="filters-panel__group">
        <label htmlFor="catalog-search">Search</label>
        <input
          id="catalog-search"
          type="search"
          value={filters.query}
          onChange={event => onChange('query', event.target.value)}
          placeholder="Search by product, age, or vibe"
        />
      </div>

      <div className="filters-panel__group">
        <span className="filters-panel__label">Category</span>
        <div className="filter-pills">
          {Object.entries(CATEGORY_ICONS).map(([value, icon]) => (
            <button
              key={value}
              type="button"
              className={filters.category === value ? 'filter-pill is-active' : 'filter-pill'}
              onClick={() => onChange('category', value)}
            >
              {icon} {value === 'all' ? 'All' : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-panel__group">
        <span className="filters-panel__label">Gender</span>
        <div className="filter-pills">
          {GENDER_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              className={filters.gender === option.value ? 'filter-pill is-active' : 'filter-pill'}
              onClick={() => onChange('gender', option.value)}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-panel__group">
        <span className="filters-panel__label">Age group</span>
        <div className="filter-pills">
          {AGE_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              className={filters.ageGroup === option.value ? 'filter-pill is-active' : 'filter-pill'}
              onClick={() => onChange('ageGroup', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-panel__group">
        <label htmlFor="sort-filter">Sort by</label>
        <select
          id="sort-filter"
          className="sort-select"
          value={filters.sort}
          onChange={event => onChange('sort', event.target.value)}
        >
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <button type="button" className="button button--ghost button--full" onClick={onReset}>
        Clear filters
      </button>
    </aside>
  )
}
