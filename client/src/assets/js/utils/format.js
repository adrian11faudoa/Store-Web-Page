export function formatCurrency(value, { locale = 'en-US', currency = 'USD' } = {}) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatLabel(value) {
  if (!value) return ''

  return value
    .replace(/(\d+)-(\d+)/g, '$1–$2')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}
