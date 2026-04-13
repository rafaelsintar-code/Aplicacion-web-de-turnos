import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            Sistema de Turnos
          </div>
          <div className="admin-sidebar-tagline">Panel de Administración</div>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/turnos"
            className={({ isActive }) =>
              'admin-nav-link' + (isActive ? ' active' : '')
            }
          >
            Turnos
          </NavLink>
          <NavLink
            to="/admin/reservas"
            className={({ isActive }) =>
              'admin-nav-link' + (isActive ? ' active' : '')
            }
          >
            Reservas
          </NavLink>
          <NavLink
            to="/"
            className="admin-nav-link admin-nav-link--secondary"
          >
            Ver público
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            {user?.nombre ?? user?.email}
          </div>
          <button className="btn btn-danger btn-sm btn-full" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
