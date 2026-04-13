// components/layouts/PublicLayout.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './PublicLayout.css'

export default function PublicLayout({ children }) {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="public-layout">
      <header className="public-header">
        <Link to="/" className="public-header-brand">
          <span className="public-header-brand-accent">◈</span> TurnoSys
        </Link>
        <div className="public-header-actions">
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="btn btn-ghost btn-sm">Panel Admin</Link>
              <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/') }}>Salir</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">Admin </Link>
          )}
        </div>
      </header>
      <main className="public-main">
        {children}
      </main>
      <footer className="public-footer">
        Sistema de Gestión de Turnos 
      </footer>
    </div>
  )
}
