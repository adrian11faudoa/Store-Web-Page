// client/src/components/LocationModal.jsx
import { useState, useEffect } from 'react'
import { useLocation as useLocStore } from '../store/location.js'
import { useLang, t } from '../store/lang.js'

export default function LocationModal({ open, onClose }) {
  const lang        = useLang(s => s.lang)
  const { location, status, requestGeolocation, setManual, clear } = useLocStore()
  const [manual, setManualInput] = useState('')

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  function handleAllow() { requestGeolocation() }

  function handleManual(e) {
    e.preventDefault()
    if (!manual.trim()) return
    setManual(manual.trim())
    setManualInput('')
  }

  const requesting = status === 'requesting'

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card loc-modal" onClick={e => e.stopPropagation()} role="dialog">
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>📍</div>
        <h2 className="modal-heading" style={{ textAlign: 'center' }}>{t(lang, 'locationTitle')}</h2>
        <p className="modal-subtext" style={{ textAlign: 'center' }}>{t(lang, 'locationSub')}</p>

        {/* Current location badge */}
        {location && (
          <div className="loc-current">
            <span>📍 {location.label}</span>
            <button onClick={() => { clear(); setManualInput('') }} className="loc-clear-btn">✕</button>
          </div>
        )}

        {/* Geolocation button */}
        <button
          className="btn btn--primary btn--full"
          onClick={handleAllow}
          disabled={requesting}
          style={{ marginBottom: 12 }}
        >
          {requesting ? (lang === 'es' ? 'Obteniendo ubicación…' : 'Getting location…') : t(lang, 'allowBtn')}
        </button>

        {status === 'denied' && (
          <p style={{ fontSize: 12, color: 'var(--color-accent)', textAlign: 'center', marginBottom: 8 }}>
            {lang === 'es'
              ? 'Permiso denegado. Ingresa tu dirección manualmente.'
              : 'Permission denied. Enter your address manually.'}
          </p>
        )}

        <div className="loc-divider"><span>{lang === 'es' ? 'o' : 'or'}</span></div>

        <form onSubmit={handleManual} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input
            className="form-input"
            placeholder={t(lang, 'enterManual')}
            value={manual}
            onChange={e => setManualInput(e.target.value)}
            style={{ flex: 1, fontSize: 13 }}
          />
          <button type="submit" className="btn btn--primary" style={{ whiteSpace: 'nowrap', padding: '0 16px' }}>
            {lang === 'es' ? 'Guardar' : 'Save'}
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
