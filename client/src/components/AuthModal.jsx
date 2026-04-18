import { useEffect, useState } from 'react'
import { API_BASE_URL, apiRequest } from '../services/api/client.js'
import { useAppStore } from '../store/useAppStore.js'

const INITIAL_FIELDS = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  resetCode: '',
  newPassword: '',
  confirmNewPassword: '',
}

export default function AuthModal({ onClose }) {
  const [view, setView] = useState('signin')
  const [fields, setFields] = useState(INITIAL_FIELDS)
  const [recoverEmail, setRecoverEmail] = useState('')
  const [localError, setLocalError] = useState('')
  const [recoverLoading, setRecoverLoading] = useState(false)
  const login = useAppStore(state => state.login)
  const register = useAppStore(state => state.register)
  const authLoading = useAppStore(state => state.authLoading)
  const authError = useAppStore(state => state.authError)
  const clearAuthError = useAppStore(state => state.clearAuthError)

  useEffect(() => {
    setFields(INITIAL_FIELDS)
    setLocalError('')
    setRecoverEmail('')
    clearAuthError()
  }, [clearAuthError])

  function updateField(key, value) {
    setFields(current => ({ ...current, [key]: value }))
  }

  function changeView(nextView) {
    setLocalError('')
    clearAuthError()

    if (nextView === 'signin' || nextView === 'register' || nextView === 'recover-email') {
      setFields(INITIAL_FIELDS)
      setRecoverEmail('')
    }

    setView(nextView)
  }

  async function handleSignIn(event) {
    event.preventDefault()
    const user = await login(fields.email, fields.password)
    if (user) onClose()
  }

  async function handleRegister(event) {
    event.preventDefault()
    if (fields.password !== fields.confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    const user = await register(fields.email, fields.password, fields.name)
    if (user) onClose()
  }

  async function handleForgotRequest(event) {
    event.preventDefault()
    setRecoverLoading(true)
    setLocalError('')

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: fields.email }),
        skipRefresh: true,
      })
      setRecoverEmail(fields.email)
      setFields(current => ({ ...current, resetCode: '', newPassword: '', confirmNewPassword: '' }))
      setView('recover-reset')
    } catch (error) {
      setLocalError(error.message)
    } finally {
      setRecoverLoading(false)
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault()
    if (fields.newPassword !== fields.confirmNewPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    setRecoverLoading(true)
    setLocalError('')

    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: recoverEmail,
          code: fields.resetCode,
          newPassword: fields.newPassword,
        }),
        skipRefresh: true,
      })
      setView('recover-success')
    } catch (error) {
      setLocalError(error.message)
    } finally {
      setRecoverLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" role="presentation" onClick={onClose}>
      <div className="auth-modal" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}>
        <button type="button" className="auth-modal__close" onClick={onClose} aria-label="Close sign in modal">×</button>

        {(view === 'signin' || view === 'register') && (
          <>
            <div className="auth-tabs">
              <button type="button" className={view === 'signin' ? 'auth-tab is-active' : 'auth-tab'} onClick={() => changeView('signin')}>
                Sign in
              </button>
              <button type="button" className={view === 'register' ? 'auth-tab is-active' : 'auth-tab'} onClick={() => changeView('register')}>
                Create account
              </button>
            </div>

            {view === 'signin' ? (
              <form className="auth-form" onSubmit={handleSignIn}>
                <h2>Welcome back</h2>
                <label>
                  Email
                  <input type="email" value={fields.email} onChange={event => updateField('email', event.target.value)} required />
                </label>
                <label>
                  Password
                  <input type="password" value={fields.password} onChange={event => updateField('password', event.target.value)} required />
                </label>
                <button type="button" className="auth-link-button" onClick={() => changeView('recover-email')}>
                  Forgot password?
                </button>
                {(localError || authError) && <div className="auth-error">{localError || authError}</div>}
                <button type="submit" className="button button--full" disabled={authLoading}>
                  {authLoading ? <span className="button__spinner" aria-hidden="true" /> : 'Sign in'}
                </button>
                <div className="auth-divider">or continue with</div>
                <a className="google-btn" href={`${API_BASE_URL}/auth/google`}>
                  <span>G</span>
                  <span>Continue with Google</span>
                </a>
                <p className="auth-switch">
                  New here? <button type="button" className="auth-link-button" onClick={() => changeView('register')}>Create an account</button>
                </p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister}>
                <h2>Create your account</h2>
                <label>
                  Name
                  <input type="text" value={fields.name} onChange={event => updateField('name', event.target.value)} required />
                </label>
                <label>
                  Email
                  <input type="email" value={fields.email} onChange={event => updateField('email', event.target.value)} required />
                </label>
                <label>
                  Password
                  <input type="password" minLength="8" value={fields.password} onChange={event => updateField('password', event.target.value)} required />
                </label>
                <label>
                  Confirm password
                  <input type="password" minLength="8" value={fields.confirmPassword} onChange={event => updateField('confirmPassword', event.target.value)} required />
                </label>
                {(localError || authError) && <div className="auth-error">{localError || authError}</div>}
                <button type="submit" className="button button--full" disabled={authLoading}>
                  {authLoading ? <span className="button__spinner" aria-hidden="true" /> : 'Create account'}
                </button>
                <p className="auth-switch">
                  Already have an account? <button type="button" className="auth-link-button" onClick={() => changeView('signin')}>Sign in</button>
                </p>
              </form>
            )}
          </>
        )}

        {view === 'recover-email' && (
          <form className="auth-form" onSubmit={handleForgotRequest}>
            <h2>Reset your password</h2>
            <p className="auth-helper">Enter your email and we&apos;ll send you a six-character reset code.</p>
            <label>
              Email
              <input type="email" value={fields.email} onChange={event => updateField('email', event.target.value)} required />
            </label>
            {localError && <div className="auth-error">{localError}</div>}
            <button type="submit" className="button button--full" disabled={recoverLoading}>
              {recoverLoading ? <span className="button__spinner" aria-hidden="true" /> : 'Send code'}
            </button>
            <button type="button" className="auth-link-button" onClick={() => changeView('signin')}>Back to sign in</button>
          </form>
        )}

        {view === 'recover-reset' && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <h2>Enter your code</h2>
            <p className="auth-helper">We sent a code to {recoverEmail}.</p>
            <label>
              Reset code
              <input type="text" maxLength="6" value={fields.resetCode} onChange={event => updateField('resetCode', event.target.value.toUpperCase())} required />
            </label>
            <label>
              New password
              <input type="password" minLength="8" value={fields.newPassword} onChange={event => updateField('newPassword', event.target.value)} required />
            </label>
            <label>
              Confirm new password
              <input type="password" minLength="8" value={fields.confirmNewPassword} onChange={event => updateField('confirmNewPassword', event.target.value)} required />
            </label>
            {localError && <div className="auth-error">{localError}</div>}
            <button type="submit" className="button button--full" disabled={recoverLoading}>
              {recoverLoading ? <span className="button__spinner" aria-hidden="true" /> : 'Update password'}
            </button>
          </form>
        )}

        {view === 'recover-success' && (
          <div className="auth-success">
            <div className="empty-state__illustration">🎉</div>
            <h3>Password updated!</h3>
            <p className="auth-helper">You can now sign in with your new password.</p>
            <button type="button" className="button" onClick={() => changeView('signin')}>
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
