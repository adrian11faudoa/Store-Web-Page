import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Header({ cartCount, onOpenCart, theme, onToggleTheme }) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    navigate(`/shop?${params.toString()}`)
  }

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="container header-row">
        <Link className="brand" to="/">
          <span className="brand__mark">SK</span>
          <span>
            <strong>Sahara Kids</strong>
            <small>Modern essentials for growing families</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Primary">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/checkout">Checkout</NavLink>
        </nav>

        <form className="header-search" onSubmit={handleSubmit} role="search">
          <label className="sr-only" htmlFor="site-search">Search products</label>
          <input
            id="site-search"
            type="search"
            placeholder="Search sets, denim, dresses..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
          <button type="submit" className="button button--ghost">Search</button>
        </form>

        <div className="header-actions">
          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button type="button" className="icon-button icon-button--cart" onClick={onOpenCart}>
            Cart
            <span aria-live="polite">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
