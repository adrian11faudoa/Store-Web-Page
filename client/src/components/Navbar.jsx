// client/src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart, useAuth } from '../store/index.js'
import { useLang, t } from '../store/lang.js'
import { useLocation as useLocStore } from '../store/location.js'
import CartDrawer from './CartDrawer.jsx'
import UserMenu from './UserMenu.jsx'
import LocationModal from './LocationModal.jsx'

// ── Language switcher dropdown ────────────────────────────────────────────────
function LangSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const flags = { en: '🇺🇸', es: '🇲🇽' }
  const labels = { en: 'ENG', es: 'ESP' }

  return (
    <div ref={ref} className="lang-switcher">
      <button className="lang-btn" onClick={() => setOpen(o => !o)}>
        <span>{flags[lang]}</span>
        <span>{labels[lang]}</span>
        <span className="lang-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="lang-dropdown">
          {['en', 'es'].map(l => (
            <button
              key={l}
              className={`lang-option${lang === l ? ' active' : ''}`}
              onClick={() => { setLang(l); setOpen(false) }}
            >
              {flags[l]} {labels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Icon button ───────────────────────────────────────────────────────────────
function IconBtn({ icon, label, onClick, badge }) {
  return (
    <button className="navbar-icon-btn" onClick={onClick} aria-label={label} title={label}>
      <span className="navbar-icon-btn__icon">{icon}</span>
      {badge != null && badge > 0 && (
        <span className="navbar-icon-btn__badge">{badge}</span>
      )}
    </button>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const items    = useCart(s => s.items)
  const count    = items.reduce((s, i) => s + i.qty, 0)
  const user     = useAuth(s => s.user)
  const lang     = useLang(s => s.lang)
  const locStore = useLocStore()

  const [cartOpen,     setCartOpen]     = useState(false)
  const [locOpen,      setLocOpen]      = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQ,      setSearchQ]      = useState('')
  const searchRef  = useRef(null)
  const userBtnRef = useRef(null)
  const navigate   = useNavigate()
  const location   = useLocation()

  useEffect(() => {
    setSearchQ('')
    setUserMenuOpen(false)
  }, [location.pathname + location.search])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!searchQ.trim()) return
    navigate(`/shop?q=${encodeURIComponent(searchQ.trim())}`)
    setSearchQ('')
  }

  function navTo(params) { navigate(`/shop?${params}`) }

  // Category nav items — structured like the reference image
  const NAV_CATS = [
    { key: 'girl',        sub: t(lang, 'sizes418'),  onClick: () => navTo('ageGroup=girls&gender=girl') },
    { key: 'boy',         sub: t(lang, 'sizes418'),  onClick: () => navTo('ageGroup=boys&gender=boy')  },
    { key: 'toddlerGirl', sub: t(lang, 'sizes6m5t'), onClick: () => navTo('ageGroup=toddler-girls&gender=girl') },
    { key: 'toddlerBoy',  sub: t(lang, 'sizes6m5t'), onClick: () => navTo('ageGroup=toddler-boys&gender=boy')  },
    { key: 'baby',        sub: t(lang, 'sizes024m'), onClick: () => navTo('ageGroup=baby') },
    { key: 'pajamas',     sub: null,                  onClick: () => navTo('category=sleepwear') },
    { key: 'shoes',       sub: null,                  onClick: () => navTo('category=footwear') },
    { key: 'newIn',       sub: null,                  onClick: () => navTo('badge=new') },
    { key: 'sale',        sub: null,                  onClick: () => navTo('badge=sale'), accent: true },
  ]

  return (
    <>
      {/* ── TOP ROW: logo + search + icons ── */}
      <div className="navbar-top">
        <Link to="/" className="navbar-logo">
          Sahara<span>Kids</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <span className="navbar-search__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            ref={searchRef}
            type="text"
            placeholder={t(lang, 'search')}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="navbar-search__input"
          />
          {searchQ && (
            <button type="button" className="navbar-search__clear" onClick={() => setSearchQ('')}>✕</button>
          )}
        </form>

        <div className="navbar-icons">
          {/* Language switcher */}
          <LangSwitcher />

          {/* Location */}
          <IconBtn
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            }
            label={t(lang, 'location')}
            onClick={() => setLocOpen(true)}
          />
          {locStore.location && (
            <span className="navbar-loc-label">{locStore.location.label}</span>
          )}

          {/* Wishlist */}
          <IconBtn
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            }
            label={t(lang, 'wishlist')}
            onClick={() => {}}
          />

          {/* Account */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button ref={userBtnRef} className="navbar-icon-btn" onClick={() => setUserMenuOpen(o => !o)} title={t(lang, 'account')}>
                <span className="navbar-icon-btn__icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
              </button>
              <UserMenu open={userMenuOpen} onClose={() => setUserMenuOpen(false)} anchorRef={userBtnRef} />
            </div>
          ) : (
            <IconBtn
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
              label={t(lang, 'signIn')}
              onClick={() => navigate('/signin')}
            />
          )}

          {/* Cart */}
          <button className="navbar-cart-btn" onClick={() => setCartOpen(true)} aria-label={t(lang, 'bag')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="navbar-cart-badge">{count}</span>}
          </button>
        </div>
      </div>

      {/* ── BOTTOM ROW: category links ── */}
      <div className="navbar-bottom">
        <ul className="navbar-cats">
          {NAV_CATS.map(cat => (
            <li key={cat.key}>
              <button
                className={`navbar-cat-btn${cat.accent ? ' navbar-cat-btn--sale' : ''}`}
                onClick={cat.onClick}
              >
                <span className="navbar-cat-btn__name">{t(lang, cat.key)}</span>
                {cat.sub && <span className="navbar-cat-btn__sub">{cat.sub}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <CartDrawer   open={cartOpen}  onClose={() => setCartOpen(false)} />
      <LocationModal open={locOpen}  onClose={() => setLocOpen(false)} />
    </>
  )
}
