function escapeCsvValue(value) {
  const normalized = value == null ? '' : String(value)
  if (!/[",\n]/.test(normalized)) return normalized
  return `"${normalized.replace(/"/g, '""')}"`
}

export function stringifyCsv(rows, headers) {
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCsvValue(row[header])).join(',')),
  ]

  return lines.join('\n')
}

export function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let index = 0
  let inQuotes = false

  while (index < text.length) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        value += '"'
        index += 2
        continue
      }

      inQuotes = !inQuotes
      index += 1
      continue
    }

    if (character === ',' && !inQuotes) {
      row.push(value)
      value = ''
      index += 1
      continue
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      row.push(value)
      if (row.some(cell => cell.trim() !== '')) rows.push(row)
      row = []
      value = ''
      index += 1
      continue
    }

    value += character
    index += 1
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value)
    if (row.some(cell => cell.trim() !== '')) rows.push(row)
  }

  if (!rows.length) return []

  const [headerRow, ...dataRows] = rows
  const headers = headerRow.map(header => header.trim())

  return dataRows.map(values => Object.fromEntries(
    headers.map((header, headerIndex) => [header, values[headerIndex] ?? ''])
  ))
}
