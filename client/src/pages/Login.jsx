import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'
import { useLocale } from '../locale/LocaleProvider.jsx'

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLocale()
  const login = useAppStore(state => state.login)
  const register = useAppStore(state => state.register)
  const user = useAppStore(state => state.user)
  const authLoading = useAppStore(state => state.authLoading)
  const authError = useAppStore(state => state.authError)
  const clearAuthError = useAppStore(state => state.clearAuthError)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(INITIAL_FORM)
  const [localError, setLocalError] = useState('')

  const redirectTarget = useMemo(() => {
    const from = location.state?.from
    if (typeof from === 'string' && from.startsWith('/')) return from
    return user?.role === 'admin' ? '/admin/products' : '/'
  }, [location.state?.from, user?.role])

  function updateField(key, value) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setLocalError('')
    clearAuthError()
    setForm(INITIAL_FORM)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    clearAuthError()

    if (!form.email.trim() || !form.password.trim()) {
      setLocalError(t('checkoutFillRequired'))
      return
    }

    if (mode === 'register') {
      if (!form.name.trim()) {
        setLocalError('Name is required.')
        return
      }

      if (form.password !== form.confirmPassword) {
        setLocalError('Passwords do not match.')
        return
      }

      const nextUser = await register(form.email.trim(), form.password, form.name.trim())
      if (!nextUser) return
      navigate(nextUser.role === 'admin' ? redirectTarget : '/', { replace: true })
      return
    }

    const nextUser = await login(form.email.trim(), form.password)
    if (!nextUser) return

    navigate(nextUser.role === 'admin' ? redirectTarget : '/', { replace: true })
  }

  return (
    <section className="section">
      <div className="container empty-state">
        <p className="eyebrow">{t('loginEyebrow')}</p>
        <h1>{mode === 'login' ? t('loginTitle') : 'Create your account'}</h1>
        <p>
          {location.state?.from && mode === 'login'
            ? t('loginNeedsPermission', { path: location.state.from })
            : mode === 'login'
              ? t('loginChooseRole')
              : 'Create an account first, then promote it to admin from the database if needed.'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'auth-tab is-active' : 'auth-tab'}
            onClick={() => switchMode('login')}
          >
            {t('signin')}
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-tab is-active' : 'auth-tab'}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              {t('checkoutName')}
              <input
                type="text"
                value={form.name}
                onChange={event => updateField('name', event.target.value)}
                placeholder="Jane Doe"
              />
            </label>
          )}

          <label>
            {t('checkoutEmail')}
            <input
              type="email"
              value={form.email}
              onChange={event => updateField('email', event.target.value)}
              placeholder="admin@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={event => updateField('password', event.target.value)}
              placeholder="••••••••"
            />
          </label>

          {mode === 'register' && (
            <label>
              Confirm password
              <input
                type="password"
                value={form.confirmPassword}
                onChange={event => updateField('confirmPassword', event.target.value)}
                placeholder="••••••••"
              />
            </label>
          )}

          {(localError || authError) && <div className="auth-error">{localError || authError}</div>}

          <button type="submit" className="button button--full" disabled={authLoading}>
            {authLoading ? '...' : (mode === 'login' ? t('signin') : 'Create account')}
          </button>
        </form>

        <Link className="text-link" to="/">{t('loginBackHome')}</Link>
      </div>
    </section>
  )
}
