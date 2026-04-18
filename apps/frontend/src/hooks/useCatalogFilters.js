import { useAppStore } from '../store/useAppStore.js'

export function useCatalogFilters() {
  const filters = useAppStore(state => state.catalog.filters)
  const loadCatalog = useAppStore(state => state.loadCatalog)

  return {
    filters,
    updateFilters: updates => loadCatalog({ ...updates, page: 1 }),
  }
}
