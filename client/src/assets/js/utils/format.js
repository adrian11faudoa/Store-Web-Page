export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatLabel(value) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}
