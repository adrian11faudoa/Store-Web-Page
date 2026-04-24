import { useAppStore } from '../store/useAppStore.js'

function resolveCatalogUpdates(updates) {
  return Object.prototype.hasOwnProperty.call(updates, 'page')
    ? updates
    : { ...updates, page: 1 }
}

export function useCatalogFilters() {
  const store = useAppStore()
  const filters = store.catalog.filters
  const loadCatalog = store.loadCatalog

  return {
    filters,
    updateFilters: updates => loadCatalog(resolveCatalogUpdates(updates)),
  }
}
