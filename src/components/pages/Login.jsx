// components/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useStorage } from '../../hooks/useStorage'
import './Login.css'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const { getUsuarioByEmail } = useStorage()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    navigate('/admin/turnos', { replace: true })
    return null
  }

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) return setError('Completá todos los campos.')
    setLoading(true)
    try {
      const usuario = await getUsuarioByEmail(form.email.trim().toLowerCase())
      if (!usuario || usuario.password !== form.password) {
        return setError('Email o contraseña incorrectos.')
      }
      login({ id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol })
      const destino = location.state?.from?.pathname ?? '/admin/turnos'
      navigate(destino, { replace: true })
    } catch {
      setError('Error al iniciar sesión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-brand">
          <div className="login-logo">
            <span className="login-logo-accent"></span> TurnoSys
          </div>
          <p className="login-subtitle">Acceso de administrador</p>
        </div>

        <div className="card">
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input" type="email"
                placeholder="admin@turnos.com"
                value={form.email} onChange={set('email')} required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                className="form-input" type="password"
                placeholder="••••••••"
                value={form.password} onChange={set('password')} required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Ingresar'}
            </button>
          </form>

          <div className="login-demo">
            <strong>Demo:</strong> admin@turnos.com / admin123
          </div>
        </div>

        <Link to="/" className="login-back">← Ver turnos disponibles</Link>
      </div>
    </div>
  )
}
