// client/src/components/AuthModal.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../store/index.js'

export default function AuthModal({ open, onClose }) {
  const [tab,      setTab]      = useState('login')   // 'login' | 'register'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')

  const login    = useAuth(s => s.login)
  const register = useAuth(s => s.register)
  const loading  = useAuth(s => s.loading)
  const error    = useAuth(s => s.error)
  const user     = useAuth(s => s.user)

  // Close when user becomes logged in
  useEffect(() => { if (user && open) onClose() }, [user])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function reset() {
    setEmail(''); setPassword(''); setName('')
  }

  function switchTab(t) {
    setTab(t); reset()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (tab === 'login') {
      await login(email, password)
    } else {
      await register(email, password, name)
    }
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} role="dialog" aria-label="Sign in">

        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`modal-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Sign in
          </button>
          <button
            className={`modal-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Create account
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder={tab === 'register' ? 'At least 8 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={tab === 'register' ? 8 : 1}
            />
          </div>

          {error && (
            <div className="form-error">⚠ {error}</div>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="modal-footer-note">
          {tab === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '
          }
          <button
            className="modal-switch-link"
            onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
          >
            {tab === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
