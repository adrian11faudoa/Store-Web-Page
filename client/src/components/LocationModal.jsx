import { useState, useEffect } from 'react'
import { useLocation as useLocStore } from '../store/location.js'
import { useLang, t } from '../store/lang.js'

export default function LocationModal({ open, onClose }) {
  const lang = useLang(state => state.lang)
  const { location, status, requestGeolocation, setManual, clear } = useLocStore()
  const [manual, setManualInput] = useState('')

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = event => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function handleManual(event) {
    event.preventDefault()
    if (!manual.trim()) return
    setManual(manual.trim())
    setManualInput('')
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card loc-modal" onClick={event => event.stopPropagation()} role="dialog">
        <button className="modal-close" onClick={onClose}>x</button>

        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>📍</div>
        <h2 className="modal-heading" style={{ textAlign: 'center' }}>{t(lang, 'locationTitle')}</h2>
        <p className="modal-subtext" style={{ textAlign: 'center' }}>{t(lang, 'locationSub')}</p>

        {location && (
          <div className="loc-current">
            <span>📍 {location.label}</span>
            <button onClick={() => { clear(); setManualInput('') }} className="loc-clear-btn">x</button>
          </div>
        )}

        <button className="btn btn--primary btn--full" onClick={requestGeolocation} disabled={status === 'requesting'} style={{ marginBottom: 12 }}>
          {status === 'requesting' ? t(lang, 'gettingLocation') : t(lang, 'allowBtn')}
        </button>

        {status === 'denied' && (
          <p style={{ fontSize: 12, color: 'var(--color-accent)', textAlign: 'center', marginBottom: 8 }}>
            {t(lang, 'permissionDenied')}
          </p>
        )}

        <div className="loc-divider"><span>{t(lang, 'or')}</span></div>

        <form onSubmit={handleManual} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input className="form-input" placeholder={t(lang, 'enterManual')} value={manual} onChange={event => setManualInput(event.target.value)} style={{ flex: 1, fontSize: 13 }} />
          <button type="submit" className="btn btn--primary" style={{ whiteSpace: 'nowrap', padding: '0 16px' }}>
            {t(lang, 'save')}
          </button>
        </form>

        {(status === 'granted' || status === 'saved') && (
          <p style={{ fontSize: 13, color: 'var(--color-green)', textAlign: 'center', marginTop: 12, fontWeight: 700 }}>
            ✓ {t(lang, 'locationSaved')}
          </p>
        )}
      </div>
    </div>
  )
}
