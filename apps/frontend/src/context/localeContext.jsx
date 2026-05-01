import { createContext, useContext } from 'react'

const defaultValue = {
  language: 'en',
  currency: 'USD',
  labels: {},
  formatMoney(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(Number(value || 0))
  },
}

const LocaleContext = createContext(defaultValue)

export function LocaleProvider({ value, children }) {
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}

