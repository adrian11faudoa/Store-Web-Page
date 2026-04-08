// client/src/components/UserMenu.jsx
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../store/index.js'
import { auth as authApi } from '../api.js'

export default function UserMenu({ open, onClose, anchorRef }) {
  const logout = useAuth(s => s.logout)
  const user   = useAuth(s => s.user)
  const [view, setView] = useState('menu') // 'menu' | 'change-password'
  const [curPw,  setCurPw]  = useState('')
  const [newPw,  setNewPw]  = useState('')
  const [confPw, setConfPw] = useState('')
  const [msg,    setMsg]    = useState(null) // { type: 'ok'|'err', text }
  const [loading,setLoading]= useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setView('menu')
      setCurPw(''); setNewPw(''); setConfPw(''); setMsg(null)
    }
  }, [open])

  useEffect(() => {
    function handleClick(e) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose, anchorRef])

  async function handleChangePw(e) {
    e.preventDefault()
    if (newPw !== confPw) return setMsg({ type: 'err', text: 'New passwords do not match' })
    if (newPw.length < 8) return setMsg({ type: 'err', text: 'Password must be at least 8 characters' })
    setLoading(true); setMsg(null)
    try {
      await authApi.changePassword({ currentPassword: curPw, newPassword: newPw })
      setMsg({ type: 'ok', text: 'Password changed successfully!' })
      setCurPw(''); setNewPw(''); setConfPw('')
      setTimeout(() => { setView('menu'); setMsg(null); onClose() }, 1500)
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div ref={menuRef} className="user-menu">
      {view === 'menu' && (
        <>
          <div className="user-menu__header">
            <span className="user-menu__name">{user?.name || user?.email}</span>
            <span className="user-menu__email">{user?.email}</span>
          </div>
          <div className="user-menu__divider" />
          <button className="user-menu__item" onClick={() => setView('change-password')}>
            🔑 Change password
          </button>
          <div className="user-menu__divider" />
          <button
            className="user-menu__item user-menu__item--danger"
            onClick={() => { logout(); onClose() }}
          >
            👋 Sign out
          </button>
        </>
      )}

      {view === 'change-password' && (
        <>
          <div className="user-menu__header">
            <button className="user-menu__back" onClick={() => { setView('menu'); setMsg(null) }}>← Back</button>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Change Password</span>
          </div>
          <form className="user-menu__form" onSubmit={handleChangePw}>
            <input
              className="form-input"
              type="password"
              placeholder="Current password"
              value={curPw}
              onChange={e => setCurPw(e.target.value)}
              required
            />
            <input
              className="form-input"
              type="password"
              placeholder="New password (min 8 chars)"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
              minLength={8}
            />
            <input
              className="form-input"
              type="password"
              placeholder="Confirm new password"
              value={confPw}
              onChange={e => setConfPw(e.target.value)}
              required
            />
            {msg && (
              <div className={`form-${msg.type === 'ok' ? 'success' : 'error'}`}>
                {msg.type === 'ok' ? '✓ ' : '⚠ '}{msg.text}
              </div>
            )}
            <button
              type="submit"
              className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px' }}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
