import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'

export function SignInPage() {
  const navigate = useNavigate()
  const store = useAppStore()
  const requestPhoneCode = store.requestPhoneCode
  const verifyPhoneCode = store.verifyPhoneCode
  const logout = store.logout
  const currentUser = store.auth.user
  const [form, setForm] = useState({ name: '', phone: '', challengeId: '', code: '' })
  const [step, setStep] = useState('request')

  if (currentUser) {
    return (
      <section className="panel auth-panel">
        <h1>{currentUser.name}</h1>
        <p>{currentUser.phone || currentUser.email || 'Sesion activa'}</p>
        <button className="button" type="button" onClick={() => logout()}>Cerrar sesion</button>
      </section>
    )
  }

  async function handleRequestCode(event) {
    event.preventDefault()
    const response = await requestPhoneCode({ phone: form.phone, name: form.name || undefined })
    setForm(current => ({ ...current, challengeId: response.challengeId }))
    setStep('verify')
  }

  async function handleVerifyCode(event) {
    event.preventDefault()
    await verifyPhoneCode({
      challengeId: form.challengeId,
      phone: form.phone,
      code: form.code,
      name: form.name || undefined,
    })
    navigate('/')
  }

  return (
    <section className="auth-grid">
      <form className="panel auth-panel" onSubmit={step === 'request' ? handleRequestCode : handleVerifyCode}>
        <h1>Iniciar sesion</h1>
        <p>Usa tu numero de telefono. Te enviaremos un codigo por WhatsApp.</p>
        <input
          className="input"
          type="text"
          placeholder="Nombre (opcional)"
          value={form.name}
          onChange={event => setForm({ ...form, name: event.target.value })}
        />
        <input
          className="input"
          type="tel"
          placeholder="+5215512345678"
          value={form.phone}
          onChange={event => setForm({ ...form, phone: event.target.value })}
          required
        />

        {step === 'verify' ? (
          <input
            className="input"
            type="text"
            placeholder="Codigo de 6 digitos"
            value={form.code}
            onChange={event => setForm({ ...form, code: event.target.value })}
            required
          />
        ) : null}

        <button className="button" type="submit">{step === 'request' ? 'Enviar codigo' : 'Verificar e ingresar'}</button>

        {step === 'verify' ? (
          <button className="button button--ghost" type="button" onClick={() => setStep('request')}>
            Reenviar codigo
          </button>
        ) : null}
      </form>
    </section>
  )
}
