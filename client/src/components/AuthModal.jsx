// client/src/components/AuthModal.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../store/index.js'
import { auth as authApi } from '../api.js'

// Views: 'login' | 'register' | 'verify-email' | 'forgot' | 'reset-code'
export default function AuthModal({ open, onClose }) {
  const [view,         setView]         = useState('login')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPw,    setConfirmPw]    = useState('')
  const [name,         setName]         = useState('')
  const [code,         setCode]         = useState('')
  const [newPw,        setNewPw]        = useState('')
  const [confirmNewPw, setConfirmNewPw] = useState('')
  const [pendingEmail, setPendingEmail] = useState('') // email awaiting verification
  const [localMsg,     setLocalMsg]     = useState(null)
  const [localLoad,    setLocalLoad]    = useState(false)

  const login    = useAuth(s => s.login)
  const register = useAuth(s => s.register)
  const loading  = useAuth(s => s.loading)
  const error    = useAuth(s => s.error)
  const user     = useAuth(s => s.user)

  // Close when logged in
  useEffect(() => { if (user && open) onClose() }, [user, open, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // Clear ALL fields whenever modal closes
  useEffect(() => {
    if (!open) {
      setEmail(''); setPassword(''); setConfirmPw(''); setName('')
      setCode(''); setNewPw(''); setConfirmNewPw('')
      setLocalMsg(null); setLocalLoad(false); setView('login')
    }
  }, [open])

  function resetAll() {
    setEmail(''); setPassword(''); setConfirmPw(''); setName('')
    setCode(''); setNewPw(''); setConfirmNewPw(''); setLocalMsg(null)
    useAuth.setState({ error: null })
  }

  function switchView(v) { resetAll(); setView(v) }

  // ── Login ──
  async function handleLogin(e) {
    e.preventDefault()
    try {
      await login(email, password)
    } catch (err) {
      // If account exists but not verified, offer to go verify
      if (err.message && err.message.toLowerCase().includes('verify')) {
        setPendingEmail(email)
        setLocalMsg({ type: 'err', text: err.message })
      }
    }
  }

  // ── Register → triggers server to send verification email ──
  async function handleRegister(e) {
    e.preventDefault()
    if (password !== confirmPw) return useAuth.setState({ error: 'Passwords do not match' })
    setLocalLoad(true)
    useAuth.setState({ error: null })
    try {
      await authApi.register({ email, password, name })
      // Server created unverified account and sent code
      setPendingEmail(email)
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
      // Log them straight in
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
    try {
      await authApi.forgotPassword({ email })
      setPendingEmail(email)
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

  if (!open) return null

  const GOOGLE_SVG = (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} role="dialog" aria-label="Sign in">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* ── Login ── */}
        {view === 'login' && (
          <>
            <div className="modal-tabs">
              <button className="modal-tab active">Sign in</button>
              <button className="modal-tab" onClick={() => switchView('register')}>Create account</button>
            </div>
            <div className="social-login-group">
              <button className="social-btn social-btn--google" onClick={() => { window.location.href = '/api/auth/google' }}>
                {GOOGLE_SVG} Continue with Google
              </button>
            </div>
            <div className="social-divider"><span>or sign in with email</span></div>
            <form className="modal-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Your password"
                  value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              {error && (
                <div className="form-error">
                  ⚠ {error}
                  {pendingEmail && (
                    <> &nbsp;<button type="button" className="modal-switch-link" style={{color:'inherit',fontWeight:800}}
                      onClick={() => switchView('verify-email')}>Verify now →</button></>
                  )}
                </div>
              )}
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                {loading ? 'Please wait…' : 'Sign in'}
              </button>
            </form>
            <p className="modal-footer-note">
              <button className="modal-switch-link" onClick={() => switchView('forgot')}>Forgot your password?</button>
            </p>
            <p className="modal-footer-note">
              Don&apos;t have an account?{' '}
              <button className="modal-switch-link" onClick={() => switchView('register')}>Create one</button>
            </p>
          </>
        )}

        {/* ── Register ── */}
        {view === 'register' && (
          <>
            <div className="modal-tabs">
              <button className="modal-tab" onClick={() => switchView('login')}>Sign in</button>
              <button className="modal-tab active">Create account</button>
            </div>
            <div className="social-login-group">
              <button className="social-btn social-btn--google" onClick={() => { window.location.href = '/api/auth/google' }}>
                {GOOGLE_SVG} Sign up with Google
              </button>
            </div>
            <div className="social-divider"><span>or create with email</span></div>
            <form className="modal-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" type="text" placeholder="Your name"
                  value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="At least 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <input className="form-input" type="password" placeholder="Repeat your password"
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button type="submit" className="btn btn--primary btn--full" disabled={loading || localLoad}>
                {localLoad || loading ? 'Please wait…' : 'Create account'}
              </button>
            </form>
            <p className="modal-footer-note">
              Already have an account?{' '}
              <button className="modal-switch-link" onClick={() => switchView('login')}>Sign in</button>
            </p>
          </>
        )}

        {/* ── Verify Email ── */}
        {view === 'verify-email' && (
          <>
            <div className="modal-verify-icon">✉️</div>
            <h2 className="modal-heading">Check your inbox</h2>
            <p className="modal-subtext">
              We sent a 6-digit confirmation code to <strong>{pendingEmail}</strong>.<br />
              Enter it below to activate your account.
            </p>
            <form className="modal-form" onSubmit={handleVerifyEmail}>
              <div className="form-group">
                <label className="form-label">Confirmation code</label>
                <input className="form-input form-input--code" type="text" placeholder="123456"
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                  required maxLength={6} autoComplete="one-time-code" />
              </div>
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--primary btn--full" disabled={localLoad || code.length < 6}>
                {localLoad ? 'Verifying…' : 'Confirm email'}
              </button>
            </form>
            <p className="modal-footer-note">
              Didn't get it?{' '}
              <button className="modal-switch-link" onClick={handleResendVerification} disabled={localLoad}>
                Resend code
              </button>
              {' · '}
              <button className="modal-switch-link" onClick={() => switchView('login')}>Back to sign in</button>
            </p>
          </>
        )}

        {/* ── Forgot password ── */}
        {view === 'forgot' && (
          <>
            <h2 className="modal-heading">Forgot password</h2>
            <p className="modal-subtext">
              Enter your email and we&apos;ll send a 6-digit reset code valid for 10 minutes.
            </p>
            <form className="modal-form" onSubmit={handleForgot}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--primary btn--full" disabled={localLoad}>
                {localLoad ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
            <p className="modal-footer-note">
              <button className="modal-switch-link" onClick={() => switchView('login')}>← Back to sign in</button>
            </p>
          </>
        )}

        {/* ── Reset code + new password ── */}
        {view === 'reset-code' && (
          <>
            <h2 className="modal-heading">Reset password</h2>
            <p className="modal-subtext">
              Enter the code sent to <strong>{pendingEmail}</strong> and choose a new password.
            </p>
            <form className="modal-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">6-digit code</label>
                <input className="form-input form-input--code" type="text" placeholder="123456"
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                  required maxLength={6} autoComplete="one-time-code" />
              </div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input className="form-input" type="password" placeholder="At least 8 characters"
                  value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input className="form-input" type="password" placeholder="Repeat new password"
                  value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)} required minLength={8} autoComplete="new-password" />
              </div>
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--primary btn--full" disabled={localLoad}>
                {localLoad ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
            <p className="modal-footer-note">
              Didn&apos;t get a code?{' '}
              <button className="modal-switch-link" onClick={() => switchView('forgot')}>Resend</button>
              {' · '}
              <button className="modal-switch-link" onClick={() => switchView('login')}>Back to sign in</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
