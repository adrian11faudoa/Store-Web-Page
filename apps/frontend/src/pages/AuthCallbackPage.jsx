import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const loadSession = useAppStore().loadSession

  useEffect(() => {
    loadSession().finally(() => navigate('/'))
  }, [loadSession, navigate])

  return <section className="panel auth-panel"><p>Finalizando inicio de sesion...</p></section>
}
