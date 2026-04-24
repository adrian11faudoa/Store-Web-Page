import { useLocale } from '../locale/LocaleProvider.jsx'

export default function ProductFilters({ filters, onChange, onReset, onClose }) {
  const { language, t } = useLocale()
  const SORT_OPTIONS = [
    { value: 'featured', label: t('filtersFeatured') },
    { value: 'newest', label: t('filtersNewest') },
    { value: 'price-low', label: t('filtersPriceLow') },
    { value: 'price-high', label: t('filtersPriceHigh') },
    { value: 'name', label: t('filtersName') },
  ]

  const GENDER_OPTIONS = [
    { value: 'all', label: t('filtersAll'), emoji: '✨' },
    { value: 'girls', label: language === 'es' ? 'Ninas' : 'Girls', emoji: '🌸' },
    { value: 'boys', label: language === 'es' ? 'Ninos' : 'Boys', emoji: '🚀' },
    { value: 'baby girls', label: language === 'es' ? 'Bebe niña' : 'Baby girls', emoji: '🩷' },
    { value: 'baby boys', label: language === 'es' ? 'Bebe niño' : 'Baby boys', emoji: '💙' },
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
    { value: 'all', label: t('filtersAllAges') },
    { value: '0–24 months', label: language === 'es' ? '0-24 meses' : '0-24 months' },
    { value: '2–4 years', label: language === 'es' ? '2-4 anos' : '2-4 years' },
    { value: '4–6 years', label: language === 'es' ? '4-6 anos' : '4-6 years' },
    { value: '7–10 years', label: language === 'es' ? '7-10 anos' : '7-10 years' },
    { value: '10–14 years', label: language === 'es' ? '10-14 anos' : '10-14 years' },
  ]

  return (
    <aside className="filters-panel" aria-label="Product filters">
      <div className="filters-panel__header">
        <strong>{t('filtersPanelTitle')}</strong>
        {onClose && <button type="button" className="icon-button" onClick={onClose}>{t('drawerClose')}</button>}
      </div>

      <div className="filters-panel__group">
        <label htmlFor="catalog-search">{t('filtersSearchLabel')}</label>
        <input
          id="catalog-search"
          type="search"
          value={filters.query}
          onChange={event => onChange('query', event.target.value)}
          placeholder={t('filtersSearchPlaceholder')}
        />
      </div>

      <div className="filters-panel__group">
        <span className="filters-panel__label">{t('filtersCategory')}</span>
        <div className="filter-pills">
          {Object.entries(CATEGORY_ICONS).map(([value, icon]) => (
            <button
              key={value}
              type="button"
              className={filters.category === value ? 'filter-pill is-active' : 'filter-pill'}
              onClick={() => onChange('category', value)}
            >
              {icon} {value === 'all' ? t('filtersAll') : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="filters-panel__group">
        <span className="filters-panel__label">{t('filtersGender')}</span>
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
        <span className="filters-panel__label">{t('filtersAgeGroup')}</span>
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
        <label htmlFor="sort-filter">{t('filtersSortBy')}</label>
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
        {t('filtersClear')}
      </button>
    </aside>
  )
}
