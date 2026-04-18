import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'

export function SignInPage() {
  const navigate = useNavigate()
  const store = useAppStore()
  const login = store.login
  const register = store.register
  const logout = store.logout
  const currentUser = store.auth.user
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  if (currentUser) {
    return (
      <section className="panel auth-panel">
        <h1>{currentUser.name}</h1>
        <p>{currentUser.email}</p>
        <button className="button" type="button" onClick={() => logout()}>Logout</button>
      </section>
    )
  }

  async function handleLogin(event) {
    event.preventDefault()
    await login({ email: form.email, password: form.password })
    navigate('/')
  }

  async function handleRegister(event) {
    event.preventDefault()
    await register(form)
    navigate('/')
  }

  return (
    <section className="auth-grid">
      <form className="panel auth-panel" onSubmit={handleLogin}>
        <h1>Sign in</h1>
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} />
        <button className="button" type="submit">Sign in</button>
        <a className="button ghost" href={`${import.meta.env.VITE_API_URL || '/api/v1'}/auth/google`}>Continue with Google</a>
      </form>
      <form className="panel auth-panel" onSubmit={handleRegister}>
        <h2>Create account</h2>
        <input className="input" type="text" placeholder="Name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} />
        <button className="button" type="submit">Register</button>
      </form>
    </section>
  )
}
