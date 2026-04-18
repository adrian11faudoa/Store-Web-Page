import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const loadSession = useAppStore(state => state.loadSession)

  useEffect(() => {
    loadSession().finally(() => navigate('/'))
  }, [loadSession, navigate])

  return <section className="panel auth-panel"><p>Finalizing sign-in...</p></section>
}
