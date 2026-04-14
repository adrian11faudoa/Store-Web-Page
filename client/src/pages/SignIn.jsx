// client/src/pages/SignIn.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/index.js'
import { auth as authApi } from '../api.js'

// Views: 'login' | 'register' | 'verify-email' | 'forgot' | 'reset-code'
export default function SignInPage() {
  const navigate = useNavigate()

  const [view,         setView]         = useState('login')
  const [identifier,   setIdentifier]   = useState('')   // email or phone
  const [password,     setPassword]     = useState('')
  const [confirmPw,    setConfirmPw]    = useState('')
  const [name,         setName]         = useState('')
  const [code,         setCode]         = useState('')
  const [newPw,        setNewPw]        = useState('')
  const [confirmNewPw, setConfirmNewPw] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [localMsg,     setLocalMsg]     = useState(null)
  const [localLoad,    setLocalLoad]    = useState(false)

  const login    = useAuth(s => s.login)
  const register = useAuth(s => s.register)
  const loading  = useAuth(s => s.loading)
  const error    = useAuth(s => s.error)
  const user     = useAuth(s => s.user)

  // Redirect away if already logged in
  useEffect(() => { if (user) navigate('/') }, [user, navigate])

  function resetAll() {
    setIdentifier(''); setPassword(''); setConfirmPw(''); setName('')
    setCode(''); setNewPw(''); setConfirmNewPw(''); setLocalMsg(null)
    useAuth.setState({ error: null })
  }

  function switchView(v) { resetAll(); setView(v) }

  // Detect if identifier is a phone number
  function isPhone(val) {
    return /^[\d\s\-\+\(\)]{7,}$/.test(val.trim())
  }

  // Normalise identifier: strip spaces/dashes from phone for submission
  function normaliseIdentifier(val) {
    if (isPhone(val)) return val.replace(/[\s\-\(\)]/g, '')
    return val.trim()
  }

  // ── Login ──
  async function handleLogin(e) {
    e.preventDefault()
    const id = normaliseIdentifier(identifier)
    try {
      await login(id, password)
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('verify')) {
        setPendingEmail(id)
        setLocalMsg({ type: 'err', text: err.message })
      }
    }
  }

  // ── Register ──
  async function handleRegister(e) {
    e.preventDefault()
    if (password !== confirmPw) return useAuth.setState({ error: 'Passwords do not match' })
    setLocalLoad(true)
    useAuth.setState({ error: null })
    const id = normaliseIdentifier(identifier)
    try {
      await authApi.register({ email: id, password, name })
      setPendingEmail(id)
      resetAll()
      setView('verify-email')
    } catch (err) {
      useAuth.setState({ error: err.message, loading: false })
    } finally {
      setLocalLoad(false)
    }
  }

  // ── Verify email code ──
  async function handleVerifyEmail(e) {
    e.preventDefault()
    setLocalLoad(true); setLocalMsg(null)
    try {
      const { token, user: u } = await authApi.verifyEmail({ email: pendingEmail, code })
      const { setGoogleUser } = useAuth.getState()
      setGoogleUser(token, u)
    } catch (err) {
      setLocalMsg({ type: 'err', text: err.message })
    } finally {
      setLocalLoad(false)
    }
  }

  async function handleResendVerification() {
    setLocalLoad(true); setLocalMsg(null)
    try {
      await authApi.resendVerification({ email: pendingEmail })
      setLocalMsg({ type: 'ok', text: 'New code sent — check your inbox.' })
    } catch (err) {
      setLocalMsg({ type: 'err', text: err.message })
    } finally {
      setLocalLoad(false)
    }
  }

  // ── Forgot password ──
  async function handleForgot(e) {
    e.preventDefault()
    setLocalLoad(true); setLocalMsg(null)
    const id = normaliseIdentifier(identifier)
    try {
      await authApi.forgotPassword({ email: id })
      setPendingEmail(id)
      setLocalMsg({ type: 'ok', text: 'A 6-digit code has been sent — check your inbox (and spam).' })
      setTimeout(() => switchView('reset-code'), 1200)
    } catch (err) {
      setLocalMsg({ type: 'err', text: err.message })
    } finally {
      setLocalLoad(false)
    }
  }

  // ── Reset password ──
  async function handleResetPassword(e) {
    e.preventDefault()
    if (newPw !== confirmNewPw) return setLocalMsg({ type: 'err', text: 'Passwords do not match' })
    if (newPw.length < 8) return setLocalMsg({ type: 'err', text: 'Password must be at least 8 characters' })
    setLocalLoad(true); setLocalMsg(null)
    try {
      await authApi.resetPassword({ email: pendingEmail, code, newPassword: newPw })
      setLocalMsg({ type: 'ok', text: 'Password reset! You can now sign in.' })
      setTimeout(() => switchView('login'), 1500)
    } catch (err) {
      setLocalMsg({ type: 'err', text: err.message })
    } finally {
      setLocalLoad(false)
    }
  }

  return (
    <div className="signin-page">
      <div className="signin-page__inner">

        {/* ── Login ── */}
        {view === 'login' && (
          <div className="signin-card">
            <h1 className="signin-card__title">Sign in or create account</h1>

            <form className="modal-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Mobile number or email</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Phone number or email address"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <div className="form-error">
                  ⚠ {error}
                  {pendingEmail && (
                    <> &nbsp;<button type="button" className="modal-switch-link" style={{ color: 'inherit', fontWeight: 800 }}
                      onClick={() => switchView('verify-email')}>Verify now →</button></>
                  )}
                </div>
              )}
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--amazon btn--full" disabled={loading}>
                {loading ? 'Please wait…' : 'Continue'}
              </button>
            </form>

            <p className="signin-card__legal">
              By continuing, you agree to our{' '}
              <a href="#" className="signin-link">Terms of use</a>{' '}and{' '}
              <a href="#" className="signin-link">Privacy notice</a>.
            </p>

            <div className="signin-card__divider" />

            <p className="signin-card__help">
              <a href="#" className="signin-link" onClick={e => { e.preventDefault(); switchView('forgot') }}>
                ¿Need help?
              </a>
            </p>

            <div className="signin-card__divider" />

            <div className="signin-card__business">
              <p className="signin-card__business-title">Shopping for work?</p>
              <a href="#" className="signin-link" onClick={e => { e.preventDefault(); switchView('register') }}>
                Create a free account
              </a>
            </div>

            <div className="signin-card__divider" />

            <p className="signin-card__create">
              New here?{' '}
              <button className="modal-switch-link" onClick={() => switchView('register')}>
                Create your account
              </button>
            </p>
          </div>
        )}

        {/* ── Register ── */}
        {view === 'register' && (
          <div className="signin-card">
            <h1 className="signin-card__title">Create account</h1>

            <form className="modal-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="First and last name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile number or email</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Phone number or email address"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Re-enter password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button type="submit" className="btn btn--amazon btn--full" disabled={loading || localLoad}>
                {localLoad || loading ? 'Please wait…' : 'Create your account'}
              </button>
            </form>

            <p className="signin-card__legal">
              By creating an account, you agree to our{' '}
              <a href="#" className="signin-link">Terms of use</a>{' '}and{' '}
              <a href="#" className="signin-link">Privacy notice</a>.
            </p>

            <div className="signin-card__divider" />

            <p className="signin-card__create">
              Already have an account?{' '}
              <button className="modal-switch-link" onClick={() => switchView('login')}>
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* ── Verify Email ── */}
        {view === 'verify-email' && (
          <div className="signin-card">
            <div className="modal-verify-icon">✉️</div>
            <h2 className="modal-heading">Check your inbox</h2>
            <p className="modal-subtext">
              We sent a 6-digit confirmation code to <strong>{pendingEmail}</strong>.<br />
              Enter it below to activate your account.
            </p>
            <form className="modal-form" onSubmit={handleVerifyEmail}>
              <div className="form-group">
                <label className="form-label">Confirmation code</label>
                <input
                  className="form-input form-input--code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--amazon btn--full" disabled={localLoad || code.length < 6}>
                {localLoad ? 'Verifying…' : 'Confirm'}
              </button>
            </form>
            <p className="signin-card__create">
              Didn&apos;t get it?{' '}
              <button className="modal-switch-link" onClick={handleResendVerification} disabled={localLoad}>
                Resend code
              </button>
              {' · '}
              <button className="modal-switch-link" onClick={() => switchView('login')}>Back to sign in</button>
            </p>
          </div>
        )}

        {/* ── Forgot password ── */}
        {view === 'forgot' && (
          <div className="signin-card">
            <h2 className="modal-heading">Password assistance</h2>
            <p className="modal-subtext">
              Enter your mobile number or email and we&apos;ll send a 6-digit reset code valid for 10 minutes.
            </p>
            <form className="modal-form" onSubmit={handleForgot}>
              <div className="form-group">
                <label className="form-label">Mobile number or email</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Phone number or email address"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--amazon btn--full" disabled={localLoad}>
                {localLoad ? 'Sending…' : 'Continue'}
              </button>
            </form>
            <p className="signin-card__create">
              <button className="modal-switch-link" onClick={() => switchView('login')}>← Back to sign in</button>
            </p>
          </div>
        )}

        {/* ── Reset code + new password ── */}
        {view === 'reset-code' && (
          <div className="signin-card">
            <h2 className="modal-heading">Reset password</h2>
            <p className="modal-subtext">
              Enter the code sent to <strong>{pendingEmail}</strong> and choose a new password.
            </p>
            <form className="modal-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">6-digit code</label>
                <input
                  className="form-input form-input--code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="At least 8 characters"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmNewPw}
                  onChange={e => setConfirmNewPw(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--amazon btn--full" disabled={localLoad}>
                {localLoad ? 'Resetting…' : 'Save changes'}
              </button>
            </form>
            <p className="signin-card__create">
              Didn&apos;t get a code?{' '}
              <button className="modal-switch-link" onClick={() => switchView('forgot')}>Resend</button>
              {' · '}
              <button className="modal-switch-link" onClick={() => switchView('login')}>Back to sign in</button>
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
