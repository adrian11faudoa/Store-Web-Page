export function formatCurrency(value) {
  // TODO: localise currency and locale based on shopper region.
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
