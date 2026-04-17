import { useLang } from '../store/lang.js'

const CURRENCY_BY_LANG = {
  en: 'USD',
  es: 'MXN',
}

const LOCALE_BY_LANG = {
  en: 'en-US',
  es: 'es-MX',
}

export function getCurrencyForLang(lang) {
  return CURRENCY_BY_LANG[lang] || 'USD'
}

export function getLocaleForLang(lang) {
  return LOCALE_BY_LANG[lang] || 'en-US'
}

export function formatMoney(amount, lang = 'en') {
  const value = Number(amount) || 0
  return new Intl.NumberFormat(getLocaleForLang(lang), {
    style: 'currency',
    currency: getCurrencyForLang(lang),
    maximumFractionDigits: 2,
  }).format(value)
}

export function useMoney() {
  const lang = useLang(state => state.lang)
  return {
    lang,
    currency: getCurrencyForLang(lang),
    formatMoney: amount => formatMoney(amount, lang),
  }
}
