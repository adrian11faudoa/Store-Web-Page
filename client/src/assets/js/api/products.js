const PRODUCTS_URL = `${import.meta.env.BASE_URL}data/products.json`

export async function fetchProducts(signal) {
  const response = await fetch(PRODUCTS_URL, { signal })

  if (!response.ok) {
    throw new Error('Unable to load product catalog.')
  }

  const data = await response.json()
  return Array.isArray(data.products) ? data.products : []
}
