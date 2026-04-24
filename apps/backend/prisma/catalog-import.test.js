import test from 'node:test'
import assert from 'node:assert/strict'
import {
  convertMxnToUsd,
  expandAgeTags,
  expandSizes,
  normalizeAgeGroup,
  normalizeSeasons,
  parseCsv,
} from './catalog-import.js'

test('parseCsv keeps quoted commas and quotes intact', () => {
  const [header, row] = parseCsv('name,description\n"Hoodie","Soft, ""cozy"" layer"')

  assert.deepEqual(header, ['name', 'description'])
  assert.deepEqual(row, ['Hoodie', 'Soft, "cozy" layer'])
})

test('normalizeSeasons expands composite season labels', () => {
  assert.deepEqual(normalizeSeasons('Otoño/Invierno'), ['fall', 'winter'])
  assert.deepEqual(normalizeSeasons('Invierno/Navidad'), ['winter', 'christmas'])
})

test('normalizeAgeGroup and expandAgeTags convert numeric ranges', () => {
  assert.equal(normalizeAgeGroup('6 – 8 años'), '6-8 years')
  assert.deepEqual(expandAgeTags('6 – 8 años'), ['6 years', '7 years', '8 years'])
})

test('expandSizes converts numeric size ranges into individual variants', () => {
  assert.deepEqual(expandSizes('6 – 8'), ['6', '7', '8'])
  assert.deepEqual(expandSizes('12M'), ['12M'])
})

test('convertMxnToUsd rounds imported MXN pricing for USD storefront output', () => {
  assert.equal(convertMxnToUsd(199, 17), 11.71)
})
