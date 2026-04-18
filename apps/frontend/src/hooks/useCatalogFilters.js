import { useAppStore } from '../store/useAppStore.js'

export function useCatalogFilters() {
  const store = useAppStore()
  const filters = store.catalog.filters
  const loadCatalog = store.loadCatalog

  return {
    filters,
    updateFilters: updates => loadCatalog({ ...updates, page: 1 }),
  }
}
