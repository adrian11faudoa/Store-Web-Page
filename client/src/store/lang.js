// client/src/store/lang.js
// Language store — persists to localStorage
import { create } from 'zustand'

const SAVED = localStorage.getItem('sk_lang') || 'en'

export const useLang = create((set) => ({
  lang: SAVED,
  setLang(l) {
    localStorage.setItem('sk_lang', l)
    set({ lang: l })
  },
}))

// ── Translations ─────────────────────────────────────────────────────────────
export const T = {
  en: {
    // Navbar
    girl:        'Girl',
    boy:         'Boy',
    toddlerGirl: 'Toddler Girl',
    toddlerBoy:  'Toddler Boy',
    baby:        'Baby',
    search:      'What are you looking for?',
    searchBtn:   'Search',
    signIn:      'Sign in',
    account:     'Account',
    bag:         'Bag',
    location:    'Delivery location',
    wishlist:    'Wishlist',
    // Location modal
    locationTitle: 'Set delivery location',
    locationSub:   'Allow location access so we can show accurate delivery times and shipping costs.',
    allowBtn:      'Allow location',
    enterManual:   'Enter address manually',
    locationSaved: 'Location saved',
    // Sizes
    sizes418:  'Sizes 4–18',
    sizes6m5t: 'Sizes 6M–5T',
    sizes024m: 'Sizes 0–24M',
    // General
    trendingNow: 'Trending Now',
    shoes:       'Shoes & Accessories',
    pajamas:     'Pajamas',
    shopByAge:   'Shop By Age',
    createAccount: 'Create Account',
    login:       'Login',
    specialOffers: 'Special Offers',
    seeAll:      'See all',
  },
  es: {
    girl:        'Niña',
    boy:         'Niño',
    toddlerGirl: 'Niña Pequeña',
    toddlerBoy:  'Niño Pequeño',
    baby:        'Bebé',
    search:      '¿Qué estás buscando?',
    searchBtn:   'Buscar',
    signIn:      'Iniciar sesión',
    account:     'Cuenta',
    bag:         'Bolsa',
    location:    'Ubicación de entrega',
    wishlist:    'Favoritos',
    locationTitle: 'Establecer ubicación de entrega',
    locationSub:   'Permite el acceso a tu ubicación para mostrarte tiempos de entrega y costos de envío precisos.',
    allowBtn:      'Permitir ubicación',
    enterManual:   'Ingresar dirección manualmente',
    locationSaved: 'Ubicación guardada',
    sizes418:  'Tallas 4–18',
    sizes6m5t: 'Tallas 6M–5T',
    sizes024m: 'Tallas 0–24M',
    trendingNow: 'Tendencias',
    shoes:       'Zapatos y Accesorios',
    pajamas:     'Pijamas',
    shopByAge:   'Comprar por Edad',
    createAccount: 'Crear Cuenta',
    login:       'Iniciar sesión',
    specialOffers: 'Ofertas Especiales',
    seeAll:      'Ver todo',
  },
}

export function t(lang, key) {
  return T[lang]?.[key] ?? T.en[key] ?? key
}
