// client/src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart, useAuth } from '../store/index.js'
import { useLang, t } from '../store/lang.js'
import { useLocation as useLocStore } from '../store/location.js'
import CartDrawer from './CartDrawer.jsx'
import UserMenu from './UserMenu.jsx'
import LocationModal from './LocationModal.jsx'

function LangSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const flags = { en: 'US', es: 'MX' }
  const labels = { en: 'ENG', es: 'ESP' }
  return (
    <div ref={ref} className="lang-switcher">
      <button className="lang-btn" onClick={() => setOpen(o => !o)}>
        <span>{flags[lang]} | {labels[lang]}</span>
        <span className="lang-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="lang-dropdown">
          {['en', 'es'].map(l => (
            <button key={l} className={`lang-option${lang === l ? ' active' : ''}`} onClick={() => { setLang(l); setOpen(false) }}>
              {flags[l]} | {labels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function GiraffeMascot({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="95" rx="28" ry="16" fill="#e8e0d8" opacity="0.5"/>
      <ellipse cx="22" cy="90" rx="18" ry="12" fill="#e8e0d8" opacity="0.4"/>
      <ellipse cx="62" cy="112" rx="22" ry="18" fill="#F9C846"/>
      <rect x="48" y="122" width="6" height="14" rx="3" fill="#F9C846"/>
      <rect x="68" y="122" width="6" height="14" rx="3" fill="#F9C846"/>
      <rect x="47" y="133" width="8" height="4" rx="2" fill="#8B6914"/>
      <rect x="67" y="133" width="8" height="4" rx="2" fill="#8B6914"/>
      <rect x="56" y="55" width="14" height="60" rx="7" fill="#F9C846"/>
      <circle cx="60" cy="70" r="3" fill="#D4951A" opacity="0.6"/>
      <circle cx="66" cy="82" r="2.5" fill="#D4951A" opacity="0.6"/>
      <circle cx="59" cy="92" r="3" fill="#D4951A" opacity="0.6"/>
      <circle cx="52" cy="108" r="3.5" fill="#D4951A" opacity="0.5"/>
      <circle cx="72" cy="105" r="3" fill="#D4951A" opacity="0.5"/>
      <circle cx="62" cy="118" r="2.5" fill="#D4951A" opacity="0.5"/>
      <ellipse cx="63" cy="45" rx="18" ry="16" fill="#F9C846"/>
      <ellipse cx="47" cy="34" rx="5" ry="8" fill="#F9C846" transform="rotate(-15 47 34)"/>
      <ellipse cx="47" cy="34" rx="3" ry="5" fill="#FFB6C1" transform="rotate(-15 47 34)"/>
      <ellipse cx="79" cy="34" rx="5" ry="8" fill="#F9C846" transform="rotate(15 79 34)"/>
      <ellipse cx="79" cy="34" rx="3" ry="5" fill="#FFB6C1" transform="rotate(15 79 34)"/>
      <line x1="55" y1="30" x2="53" y2="18" stroke="#8B6914" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="53" cy="16" r="3.5" fill="#8B6914"/>
      <line x1="71" y1="30" x2="73" y2="18" stroke="#8B6914" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="73" cy="16" r="3.5" fill="#8B6914"/>
      <circle cx="55" cy="44" r="4" fill="#2c1a0e"/>
      <circle cx="55" cy="43" r="1.5" fill="#fff"/>
      <circle cx="71" cy="44" r="4" fill="#2c1a0e"/>
      <circle cx="71" cy="43" r="1.5" fill="#fff"/>
      <ellipse cx="63" cy="52" rx="8" ry="5" fill="#FFE0A0"/>
      <circle cx="60" cy="52" r="1" fill="#D4951A"/>
      <circle cx="66" cy="52" r="1" fill="#D4951A"/>
      <path d="M58 55 Q63 59 68 55" stroke="#8B6914" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="49" cy="50" r="3" fill="#FFB6C1" opacity="0.4"/>
      <circle cx="77" cy="50" r="3" fill="#FFB6C1" opacity="0.4"/>
      <path d="M84 108 Q92 100 88 92" stroke="#F9C846" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="88" cy="90" rx="3" ry="4" fill="#8B6914"/>
      <path d="M40 134 Q36 128 42 126" stroke="#6AAF50" strokeWidth="2" fill="#8BC34A" opacity="0.7"/>
      <path d="M42 132 Q38 126 44 124" stroke="#6AAF50" strokeWidth="1.5" fill="#8BC34A" opacity="0.5"/>
    </svg>
  )
}

const CAT_AVATARS = {
  girl:        { emoji: '👧',  bg: '#FFE0EC', border: '#FFB6D0' },
  boy:         { emoji: '👦',  bg: '#DBEAFE', border: '#93C5FD' },
  toddlerGirl: { emoji: '👧🏻', bg: '#F3E8FF', border: '#D8B4FE' },
  toddlerBoy:  { emoji: '🧒',  bg: '#D1FAE5', border: '#6EE7B7' },
  baby:        { emoji: '👶',  bg: '#FEF3C7', border: '#FCD34D' },
  pajamas:     { emoji: '👕',  bg: '#EDE9FE', border: '#C4B5FD' },
  shoes:       { emoji: '👟',  bg: '#E0F2FE', border: '#7DD3FC' },
}

export default function Navbar() {
  const items    = useCart(s => s.items)
  const count    = items.reduce((s, i) => s + i.qty, 0)
  const user     = useAuth(s => s.user)
  const lang     = useLang(s => s.lang)
  const locStore = useLocStore()

  const [cartOpen,     setCartOpen]     = useState(false)
  const [locOpen,      setLocOpen]      = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [navDrawer,    setNavDrawer]    = useState(false)
  const [searchQ,      setSearchQ]      = useState('')
  const [catbarVisible, setCatbarVisible] = useState(true)

  const lastScrollY = useRef(0)
  const searchRef   = useRef(null)
  const userBtnRef  = useRef(null)
  const navigate    = useNavigate()
  const location    = useLocation()

  // Catbar only shows on home page
  const isHome = location.pathname === '/'

  useEffect(() => {
    setSearchQ('')
    setUserMenuOpen(false)
    setNavDrawer(false)
    setCatbarVisible(true)
    lastScrollY.current = 0
  }, [location.pathname + location.search])

  useEffect(() => {
    function onResize() { if (window.innerWidth > 900) setNavDrawer(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Hide catbar on scroll down, show on scroll up — home only
  useEffect(() => {
    if (!isHome) return
    function onScroll() {
      const y = window.scrollY
      if (y > lastScrollY.current && y > 60) {
        setCatbarVisible(false)
      } else {
        setCatbarVisible(true)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!searchQ.trim()) return
    navigate(`/shop?q=${encodeURIComponent(searchQ.trim())}`)
    setSearchQ('')
  }

  function navTo(params) { navigate(`/shop?${params}`) }

  const NAV_CATS = [
    { key: 'girl',        sub: t(lang, 'sizes418'),  onClick: () => navTo('ageGroup=girls&gender=girl') },
    { key: 'boy',         sub: t(lang, 'sizes418'),  onClick: () => navTo('ageGroup=boys&gender=boy')  },
    { key: 'toddlerGirl', sub: t(lang, 'sizes6m5t'), onClick: () => navTo('ageGroup=toddler-girls&gender=girl') },
    { key: 'toddlerBoy',  sub: t(lang, 'sizes6m5t'), onClick: () => navTo('ageGroup=toddler-boys&gender=boy')  },
    { key: 'baby',        sub: t(lang, 'sizes024m'), onClick: () => navTo('ageGroup=baby') },
    { key: 'pajamas',     sub: null,                  onClick: () => navTo('category=sleepwear') },
    { key: 'shoes',       sub: null,                  onClick: () => navTo('category=footwear') },
  ]

  return (
    <>
      <header className="sk-navbar">
        <div className="sk-navbar__top">
          <button className="sk-hamburger" onClick={() => setNavDrawer(o => !o)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E91E63" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>

          <Link to="/" className="sk-brand">
            <GiraffeMascot className="sk-brand__giraffe" />
            <div className="sk-brand__text">
              <span className="sk-brand__heart">&#x2764;&#xFE0F;</span>
              <span className="sk-brand__name">Sahara<span className="sk-brand__kids">Kids</span></span>
            </div>
          </Link>

          <span className="sk-sparkle" aria-hidden="true">✦</span>

          <form className="sk-search" onSubmit={handleSearchSubmit}>
            <span className="sk-search__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input ref={searchRef} type="text" placeholder={t(lang, 'search')} value={searchQ} onChange={e => setSearchQ(e.target.value)} className="sk-search__input" />
            {searchQ && <button type="button" className="sk-search__clear" onClick={() => setSearchQ('')}>✕</button>}
            <button type="submit" className="sk-search__btn" aria-label={t(lang, 'searchBtn')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </form>

          <div className="sk-icons">
            <LangSwitcher />
            <button className="sk-icon-btn sk-icon-btn--loc" onClick={() => setLocOpen(true)} aria-label={t(lang, 'location')} title={t(lang, 'location')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
              </svg>
            </button>
            <button className="sk-icon-btn sk-icon-btn--wish" onClick={() => {}} aria-label={t(lang, 'wishlist')} title={t(lang, 'wishlist')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button ref={userBtnRef} className="sk-icon-btn sk-icon-btn--acct" onClick={() => setUserMenuOpen(o => !o)} title={t(lang, 'account')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
                <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} anchorRef={userBtnRef} />
              </div>
            ) : (
              <button className="sk-icon-btn sk-icon-btn--acct" onClick={() => navigate('/signin')} aria-label={t(lang, 'signIn')} title={t(lang, 'signIn')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}
            <button className="sk-icon-btn sk-icon-btn--cart" onClick={() => setCartOpen(true)} aria-label={t(lang, 'bag')} title={t(lang, 'bag')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {count > 0 && <span className="sk-icon-btn__badge">{count}</span>}
            </button>
          </div>
        </div>

        {/* Category bar: home only, hide/show on scroll */}
        {isHome && (
          <div className={`sk-catbar${catbarVisible ? '' : ' sk-catbar--hidden'}`}>
            <div className="sk-catbar__inner">
              {NAV_CATS.map(cat => {
                const av = CAT_AVATARS[cat.key]
                return (
                  <button key={cat.key} className="sk-catcard" onClick={cat.onClick}>
                    <div className="sk-catcard__avatar" style={{ background: av.bg, borderColor: av.border }}>
                      <span className="sk-catcard__emoji">{av.emoji}</span>
                    </div>
                    <span className="sk-catcard__name">{t(lang, cat.key)}</span>
                    {cat.sub && <span className="sk-catcard__sub">{cat.sub}</span>}
                  </button>
                )
              })}
              <button className="sk-catcard sk-catcard--offers" onClick={() => navTo('sort=price_asc')}>
                <div className="sk-catcard__offers-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#E91E63" stroke="none">
                    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                  </svg>
                </div>
                <span className="sk-catcard__name">{t(lang, 'specialOffers')}</span>
                <span className="sk-catcard__see-all">{t(lang, 'seeAll')} →</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile nav drawer */}
      <div className={`drawer-backdrop${navDrawer ? ' open' : ''}`} onClick={() => setNavDrawer(false)} />
      <nav className={`nav-drawer${navDrawer ? ' open' : ''}`}>
        <div className="nav-drawer__header">
          {user
            ? <span className="nav-drawer__greeting">{t(lang, 'account')}</span>
            : (
              <div className="nav-drawer__auth">
                <button className="nav-drawer__auth-link" onClick={() => { setNavDrawer(false); navigate('/signin') }}>{t(lang, 'createAccount')}</button>
                <span className="nav-drawer__auth-sep">|</span>
                <button className="nav-drawer__auth-link" onClick={() => { setNavDrawer(false); navigate('/signin') }}>{t(lang, 'login')}</button>
              </div>
            )
          }
          <button className="nav-drawer__close" onClick={() => setNavDrawer(false)} aria-label="Close">✕</button>
        </div>
        <div className="nav-drawer__body">
          <h3 className="nav-drawer__heading">{t(lang, 'shopByAge')}</h3>
          {NAV_CATS.filter(c => c.sub).map(cat => (
            <button key={cat.key} className="nav-drawer__item" onClick={() => { cat.onClick(); setNavDrawer(false) }}>
              <span className="nav-drawer__item-label">{t(lang, cat.key)}<span className="nav-drawer__item-sub">({cat.sub})</span></span>
              <span className="nav-drawer__chevron">›</span>
            </button>
          ))}
          {NAV_CATS.filter(c => !c.sub).map(cat => (
            <button key={cat.key} className="nav-drawer__item" onClick={() => { cat.onClick(); setNavDrawer(false) }}>
              <span className="nav-drawer__item-label">{t(lang, cat.key)}</span>
              <span className="nav-drawer__chevron">›</span>
            </button>
          ))}
          <button className="nav-drawer__item" onClick={() => { navTo('sort=price_asc'); setNavDrawer(false) }}>
            <span className="nav-drawer__item-label" style={{ color: '#E91E63' }}>{t(lang, 'specialOffers')}</span>
            <span className="nav-drawer__chevron">›</span>
          </button>
        </div>
      </nav>

      <CartDrawer    open={cartOpen} onClose={() => setCartOpen(false)} />
      <LocationModal open={locOpen}  onClose={() => setLocOpen(false)} />
    </>
  )
}
