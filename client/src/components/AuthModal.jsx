// client/src/components/AuthModal.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../store/index.js'
import { auth as authApi } from '../api.js'

// Views: 'login' | 'register' | 'forgot' | 'verify-code'
export default function AuthModal({ open, onClose }) {
  const [view,      setView]      = useState('login')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [name,      setName]      = useState('')
  const [code,      setCode]      = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmNewPw, setConfirmNewPw] = useState('')
  const [localMsg,  setLocalMsg]  = useState(null) // { type: 'ok'|'err', text }
  const [localLoad, setLocalLoad] = useState(false)

  const login    = useAuth(s => s.login)
  const register = useAuth(s => s.register)
  const loading  = useAuth(s => s.loading)
  const error    = useAuth(s => s.error)
  const user     = useAuth(s => s.user)

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

  // Clear all fields when modal closes or view changes
  function resetAll() {
    setEmail(''); setPassword(''); setConfirmPw(''); setName('')
    setCode(''); setNewPw(''); setConfirmNewPw(''); setLocalMsg(null)
  }

  function switchView(v) { resetAll(); setView(v) }

  async function handleLogin(e) {
    e.preventDefault()
    await login(email, password)
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (password !== confirmPw) {
      return useAuth.setState({ error: 'Passwords do not match' })
    }
    await register(email, password, name)
  }

  async function handleForgot(e) {
    e.preventDefault()
    setLocalLoad(true); setLocalMsg(null)
    try {
      await authApi.forgotPassword({ email })
      setLocalMsg({ type: 'ok', text: 'A 6-digit code has been sent to your email. Check your inbox (and spam).' })
      setView('verify-code')
    } catch (err) {
      setLocalMsg({ type: 'err', text: err.message })
    } finally {
      setLocalLoad(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (newPw !== confirmNewPw) return setLocalMsg({ type: 'err', text: 'Passwords do not match' })
    if (newPw.length < 8) return setLocalMsg({ type: 'err', text: 'Password must be at least 8 characters' })
    setLocalLoad(true); setLocalMsg(null)
    try {
      await authApi.resetPassword({ email, code, newPassword: newPw })
      setLocalMsg({ type: 'ok', text: 'Password reset! You can now sign in.' })
      setTimeout(() => switchView('login'), 1800)
    } catch (err) {
      setLocalMsg({ type: 'err', text: err.message })
    } finally {
      setLocalLoad(false)
    }
  }

  if (!open) return null

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

            {/* Social login buttons */}
            <div className="social-login-group">
              <button className="social-btn social-btn--google" onClick={() => alert('Google OAuth requires backend configuration. See README.')}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
              <button className="social-btn social-btn--facebook" onClick={() => alert('Facebook OAuth requires backend configuration. See README.')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Continue with Facebook
              </button>
            </div>

            <div className="social-divider"><span>or sign in with email</span></div>

            <form className="modal-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Your password"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={1} />
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button type="submit" className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={loading}>
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
              <button className="social-btn social-btn--google" onClick={() => alert('Google OAuth requires backend configuration.')}>
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Sign up with Google
              </button>
            </div>
            <div className="social-divider"><span>or create with email</span></div>

            <form className="modal-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" type="text" placeholder="Your name"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="At least 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password</label>
                <input className="form-input" type="password" placeholder="Repeat your password"
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required minLength={8} />
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button type="submit" className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={loading}>
                {loading ? 'Please wait…' : 'Create account'}
              </button>
            </form>
            <p className="modal-footer-note">
              Already have an account?{' '}
              <button className="modal-switch-link" onClick={() => switchView('login')}>Sign in</button>
            </p>
          </>
        )}

        {/* ── Forgot password ── */}
        {view === 'forgot' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Forgot password</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
              Enter your email and we'll send a 6-digit code valid for 10 minutes.
            </p>
            <form className="modal-form" onSubmit={handleForgot}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center' }} disabled={localLoad}>
                {localLoad ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
            <p className="modal-footer-note">
              <button className="modal-switch-link" onClick={() => switchView('login')}>← Back to sign in</button>
            </p>
          </>
        )}

        {/* ── Verify code & set new password ── */}
        {view === 'verify-code' && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Enter reset code</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
              We sent a code to <strong>{email}</strong>. Enter it below along with your new password. The code expires in 10 minutes.
            </p>
            <form className="modal-form" onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">6-digit code</label>
                <input className="form-input" type="text" placeholder="123456"
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                  required maxLength={6} style={{ letterSpacing: 6, fontSize: 20, textAlign: 'center' }} />
              </div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input className="form-input" type="password" placeholder="At least 8 characters"
                  value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={8} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input className="form-input" type="password" placeholder="Repeat new password"
                  value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)} required minLength={8} />
              </div>
              {localMsg && (
                <div className={localMsg.type === 'ok' ? 'form-success' : 'form-error'}>
                  {localMsg.type === 'ok' ? '✓ ' : '⚠ '}{localMsg.text}
                </div>
              )}
              <button type="submit" className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center' }} disabled={localLoad}>
                {localLoad ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
            <p className="modal-footer-note">
              Didn't get a code?{' '}
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
