// client/src/pages/SignIn.jsx
// Amazon-style multi-step auth flow:
// Step 1 (identifier)  → user types email or phone, hits Continue
// Step 2a (password)   → existing user: show password screen
// Step 2b (new-user)   → new identifier: "Looks like you're new" screen
// Step 3 (create)      → full registration form (identifier pre-filled)
// Step 4 (verify)      → email OTP  OR  WhatsApp OTP for phone
// Step 5 (forgot)      → password recovery
// Step 6 (reset-code)  → enter reset code + new password

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/index.js'
import { auth as authApi } from '../api.js'

// ── helpers ──────────────────────────────────────────────────────────────────
function isPhoneNumber(val) {
  const digits = val.replace(/\D/g, '')
  return digits.length >= 7 && /^[\d\s\-\+\(\)]+$/.test(val.trim())
}

function normalise(val) {
  if (isPhoneNumber(val)) {
    const stripped = val.replace(/[\s\-\(\)]/g, '')
    if (/^\d/.test(stripped)) return '+52' + stripped
    return stripped
  }
  return val.trim().toLowerCase()
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="amz-logo">
      <span className="amz-logo__text">Sahara<span className="amz-logo__kids">Kids</span></span>
    </div>
  )
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children }) {
  return <div className="amz-card">{children}</div>
}

// ── Footer ────────────────────────────────────────────────────────────────────
function AmzFooter() {
  return (
    <div className="amz-footer">
      <div className="amz-footer__fade" />
      <div className="amz-footer__links">
        <a href="#" className="amz-link">Terms of use</a>
        <a href="#" className="amz-link">Privacy notice</a>
        <a href="#" className="amz-link">Help</a>
      </div>
      <p className="amz-footer__copy">&copy; 1996–{new Date().getFullYear()}, SaharaKids Inc. or its affiliates</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SignInPage() {
  const navigate = useNavigate()

  const [step,         setStep]         = useState('identifier')
  const [identifier,   setIdentifier]   = useState('')
  const [normId,       setNormId]       = useState('')
  const [isPhone,      setIsPhone]      = useState(false)

  const [password,     setPassword]     = useState('')
  const [confirmPw,    setConfirmPw]    = useState('')
  const [name,         setName]         = useState('')
  const [code,         setCode]         = useState('')
  const [newPw,        setNewPw]        = useState('')
  const [confirmNewPw, setConfirmNewPw] = useState('')

  const [msg,  setMsg]  = useState(null)
  const [busy, setBusy] = useState(false)

  const login   = useAuth(s => s.login)
  const error   = useAuth(s => s.error)
  const loading = useAuth(s => s.loading)
  const user    = useAuth(s => s.user)

  const inputRef = useRef(null)

  useEffect(() => { if (user) navigate('/') }, [user, navigate])
  useEffect(() => { inputRef.current?.focus() }, [step])

  function clearMsg() { setMsg(null); useAuth.setState({ error: null }) }

  function goBack() {
    clearMsg()
    setPassword(''); setCode(''); setNewPw(''); setConfirmNewPw(''); setConfirmPw('')
    setStep('identifier')
  }

  // ── Step 1 ────────────────────────────────────────────────────────────────
  async function handleIdentifier(e) {
    e.preventDefault()
    clearMsg()
    const id    = normalise(identifier)
    const phone = isPhoneNumber(identifier)
    setNormId(id)
    setIsPhone(phone)
    setBusy(true)
    try {
      const res = await authApi.checkIdentifier({ identifier: id })
      setStep(res.exists ? 'password' : 'new-user')
    } catch (err) {
      setMsg({ type: 'err', text: err.message || 'Something went wrong' })
    } finally {
      setBusy(false)
    }
  }

  // ── Step 2a ───────────────────────────────────────────────────────────────
  async function handlePassword(e) {
    e.preventDefault()
    clearMsg()
    try {
      await login(normId, password)
    } catch (err) {
      if (err.message?.toLowerCase().includes('verify')) setStep('verify')
    }
  }

  // ── Step 3 ────────────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    clearMsg()
    if (password !== confirmPw) return setMsg({ type: 'err', text: 'Passwords do not match' })
    if (password.length < 6)    return setMsg({ type: 'err', text: 'Password must be at least 6 characters' })
    setBusy(true)
    try {
      await authApi.register({ email: normId, password, name })
      setStep('verify')
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  // ── Step 4 ────────────────────────────────────────────────────────────────
  async function handleVerify(e) {
    e.preventDefault()
    clearMsg()
    setBusy(true)
    try {
      const { token, user: u } = await authApi.verifyEmail({ email: normId, code })
      useAuth.getState().setGoogleUser(token, u)
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  async function handleResend() {
    clearMsg()
    setBusy(true)
    try {
      await authApi.resendVerification({ email: normId })
      setMsg({ type: 'ok', text: isPhone ? 'New code sent via WhatsApp.' : 'New code sent — check your inbox.' })
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  // ── Step 5 ────────────────────────────────────────────────────────────────
  async function handleForgot(e) {
    e.preventDefault()
    clearMsg()
    setBusy(true)
    try {
      await authApi.forgotPassword({ email: normId })
      setMsg({ type: 'ok', text: 'Code sent!' })
      setTimeout(() => { clearMsg(); setStep('reset-code') }, 1000)
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  // ── Step 6 ────────────────────────────────────────────────────────────────
  async function handleReset(e) {
    e.preventDefault()
    clearMsg()
    if (newPw !== confirmNewPw) return setMsg({ type: 'err', text: 'Passwords do not match' })
    if (newPw.length < 6)       return setMsg({ type: 'err', text: 'Password must be at least 6 characters' })
    setBusy(true)
    try {
      await authApi.resetPassword({ email: normId, code, newPassword: newPw })
      setMsg({ type: 'ok', text: 'Password changed! Redirecting…' })
      setTimeout(() => { clearMsg(); setStep('password') }, 1500)
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const isBusy = busy || loading

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="amz-page">
      <Logo />

      {/* ══ STEP 1: Identifier ═══════════════════════════════════════════════ */}
      {step === 'identifier' && (
        <Card>
          <h1 className="amz-card__title">Sign in or create account.</h1>
          <form onSubmit={handleIdentifier} className="amz-form">
            <div className="amz-field">
              <label className="amz-label"><strong>Enter your mobile number or email address.</strong></label>
              <input
                ref={inputRef}
                className="amz-input"
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            {(msg || error) && <div className="amz-error">⚠ {msg?.text || error}</div>}
            <button className="amz-btn" type="submit" disabled={isBusy}>
              {isBusy ? 'Please wait…' : 'Continue'}
            </button>
          </form>
          <p className="amz-legal">
            By continuing, you agree to our{' '}
            <a href="#" className="amz-link">Terms of use</a>{' '}and{' '}
            <a href="#" className="amz-link">Privacy notice</a>.
          </p>
          <div className="amz-sep" />
          <p className="amz-help"><a href="#" className="amz-link">¿Need help?</a></p>
          <div className="amz-sep" />
          <p className="amz-biz-title">¿Shopping for work?</p>
          <a href="#" className="amz-link">Create a free Business account</a>
        </Card>
      )}

      {/* ══ STEP 2a: Password (existing user) ════════════════════════════════ */}
      {step === 'password' && (
        <Card>
          <h1 className="amz-card__title">Sign in</h1>
          <p className="amz-id-row">
            {normId}{' '}
            <button className="amz-link" onClick={goBack}>Change</button>
          </p>
          <form onSubmit={handlePassword} className="amz-form">
            <div className="amz-field">
              <div className="amz-label-row">
                <label className="amz-label"><strong>Password</strong></label>
                <button type="button" className="amz-link" onClick={() => { clearMsg(); setStep('forgot') }}>
                  ¿Forgot your password?
                </button>
              </div>
              <input
                ref={inputRef}
                className="amz-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {(msg || error) && <div className="amz-error">⚠ {msg?.text || error}</div>}
            <button className="amz-btn" type="submit" disabled={isBusy}>
              {isBusy ? 'Please wait…' : 'Sign in'}
            </button>
          </form>
        </Card>
      )}

      {/* ══ STEP 2b: New user ═════════════════════════════════════════════════ */}
      {step === 'new-user' && (
        <Card>
          <h1 className="amz-card__title">Looks like you're new to SaharaKids.</h1>
          <p className="amz-id-row">
            {normId}{' '}
            <button className="amz-link" onClick={goBack}>Change</button>
          </p>
          <p className="amz-new-text">
            We'll create an account with your {isPhone ? 'mobile number' : 'email address'}
          </p>
          <button className="amz-btn" onClick={() => setStep('create')}>
            Proceed to create account
          </button>
          <div className="amz-sep" />
          <p className="amz-biz-title">Already a customer?</p>
          <button className="amz-link" onClick={goBack}>
            Sign in with another email or mobile number.
          </button>
        </Card>
      )}

      {/* ══ STEP 3: Create account ════════════════════════════════════════════ */}
      {step === 'create' && (
        <Card>
          <h1 className="amz-card__title">Create account</h1>
          <form onSubmit={handleRegister} className="amz-form">
            <div className="amz-field">
              <label className="amz-label">Enter your mobile number or email address</label>
              <input className="amz-input" type="text" value={identifier} readOnly />
            </div>
            <div className="amz-field">
              <label className="amz-label">Name</label>
              <input
                ref={inputRef}
                className="amz-input"
                type="text"
                placeholder="First and last name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="amz-field">
              <label className="amz-label">Password (at least 6 characters)</label>
              <input
                className="amz-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              {password.length > 0 && password.length < 6 && (
                <div className="amz-hint">
                  <span className="amz-hint__icon">ℹ</span>
                  Password must contain at least six characters.
                </div>
              )}
            </div>
            <div className="amz-field">
              <label className="amz-label">Re-enter password</label>
              <input
                className="amz-input"
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {msg && <div className={msg.type === 'ok' ? 'amz-success' : 'amz-error'}>{msg.type === 'ok' ? '✓ ' : '⚠ '}{msg.text}</div>}
            <button className="amz-btn" type="submit" disabled={isBusy}>
              {isBusy ? 'Creating account…' : 'Verify email'}
            </button>
          </form>
          <div className="amz-sep" />
          <p className="amz-biz-title">Already a customer?</p>
          <button className="amz-link" onClick={goBack}>
            Sign in with another email or mobile number.
          </button>
        </Card>
      )}

      {/* ══ STEP 4: Verify ════════════════════════════════════════════════════ */}
      {step === 'verify' && (
        <Card>
          <h1 className="amz-card__title">
            Verify your {isPhone ? 'mobile number' : 'email address'}
          </h1>
          <p className="amz-verify-text">
            To verify your {isPhone ? 'mobile number' : 'email'}, we have sent a code to{' '}
            <span className="amz-verify-id">{normId}</span>{' '}
            <button className="amz-link" onClick={goBack}>(Change)</button>
          </p>
          <form onSubmit={handleVerify} className="amz-form">
            <div className="amz-field">
              <label className="amz-label"><strong>Enter the security code</strong></label>
              <input
                ref={inputRef}
                className="amz-input"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
            {msg && <div className={msg.type === 'ok' ? 'amz-success' : 'amz-error'}>{msg.type === 'ok' ? '✓ ' : '⚠ '}{msg.text}</div>}
            <button className="amz-btn" type="submit" disabled={isBusy || code.length < 6}>
              {isBusy ? 'Verifying…' : 'Create your SaharaKids account'}
            </button>
          </form>
          <p className="amz-legal">
            By creating an account, you agree to our{' '}
            <a href="#" className="amz-link">Terms of use</a>{' '}and{' '}
            <a href="#" className="amz-link">Privacy notice</a>.
          </p>
          <div className="amz-sep" />
          <button className="amz-link" onClick={handleResend} disabled={isBusy}>
            Resend code
          </button>
        </Card>
      )}

      {/* ══ STEP 5: Forgot password ═══════════════════════════════════════════ */}
      {step === 'forgot' && (
        <Card>
          <h1 className="amz-card__title">Password assistance</h1>
          <p className="amz-verify-text">
            We'll send a 6-digit reset code to <span className="amz-verify-id">{normId}</span>.
          </p>
          <form onSubmit={handleForgot} className="amz-form">
            {msg && <div className={msg.type === 'ok' ? 'amz-success' : 'amz-error'}>{msg.type === 'ok' ? '✓ ' : '⚠ '}{msg.text}</div>}
            <button className="amz-btn" type="submit" disabled={isBusy}>
              {isBusy ? 'Sending…' : 'Continue'}
            </button>
          </form>
          <div className="amz-sep" />
          <button className="amz-link" onClick={() => setStep('password')}>← Back to sign in</button>
        </Card>
      )}

      {/* ══ STEP 6: Reset password ════════════════════════════════════════════ */}
      {step === 'reset-code' && (
        <Card>
          <h1 className="amz-card__title">Reset password</h1>
          <p className="amz-verify-text">
            Enter the code sent to <span className="amz-verify-id">{normId}</span> and choose a new password.
          </p>
          <form onSubmit={handleReset} className="amz-form">
            <div className="amz-field">
              <label className="amz-label">6-digit code</label>
              <input
                ref={inputRef}
                className="amz-input"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>
            <div className="amz-field">
              <label className="amz-label">New password</label>
              <input className="amz-input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
            <div className="amz-field">
              <label className="amz-label">Re-enter new password</label>
              <input className="amz-input" type="password" value={confirmNewPw} onChange={e => setConfirmNewPw(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
            {msg && <div className={msg.type === 'ok' ? 'amz-success' : 'amz-error'}>{msg.type === 'ok' ? '✓ ' : '⚠ '}{msg.text}</div>}
            <button className="amz-btn" type="submit" disabled={isBusy}>
              {isBusy ? 'Saving…' : 'Save changes'}
            </button>
          </form>
          <div className="amz-sep" />
          <button className="amz-link" onClick={() => setStep('forgot')}>Resend code</button>
          {' · '}
          <button className="amz-link" onClick={goBack}>Back to sign in</button>
        </Card>
      )}

      <AmzFooter />
    </div>
  )
}
