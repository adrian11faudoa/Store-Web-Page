import { formatLabel } from '../assets/js/utils/format.js'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
]

export default function ProductFilters({ filters, meta, onChange, onReset }) {
  return (
    <aside className="filters-panel" aria-label="Product filters">
      <div className="filters-panel__group">
        <label htmlFor="catalog-search">Search</label>
        <input
          id="catalog-search"
          type="search"
          value={filters.query}
          onChange={event => onChange('query', event.target.value)}
          placeholder="Search by product, age or category"
        />
      </div>

      <div className="filters-panel__group">
        <label htmlFor="category-filter">Category</label>
        <select id="category-filter" value={filters.category} onChange={event => onChange('category', event.target.value)}>
          <option value="all">All categories</option>
          {meta.categories.map(category => (
            <option key={category} value={category}>{formatLabel(category)}</option>
          ))}
        </select>
      </div>

      <div className="filters-panel__group">
        <label htmlFor="gender-filter">Gender</label>
        <select id="gender-filter" value={filters.gender} onChange={event => onChange('gender', event.target.value)}>
          <option value="all">All genders</option>
          {meta.genders.map(gender => (
            <option key={gender} value={gender}>{formatLabel(gender)}</option>
          ))}
        </select>
      </div>

      <div className="filters-panel__group">
        <label htmlFor="age-filter">Age group</label>
        <select id="age-filter" value={filters.ageGroup} onChange={event => onChange('ageGroup', event.target.value)}>
          <option value="all">All age groups</option>
          {meta.ageGroups.map(ageGroup => (
            <option key={ageGroup} value={ageGroup}>{formatLabel(ageGroup)}</option>
          ))}
        </select>
      </div>

      <div className="filters-panel__group">
        <label htmlFor="sort-filter">Sort by</label>
        <select id="sort-filter" value={filters.sort} onChange={event => onChange('sort', event.target.value)}>
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
