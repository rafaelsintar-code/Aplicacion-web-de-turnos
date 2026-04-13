import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import PublicLayout from './components/layouts/PublicLayout'
import AdminLayout from './components/layouts/AdminLayout'
import ProtectedRoute from './components/ui/ProtectedRoute'

import TurnosDisponibles from './components/pages/TurnosDisponibles'
import Login from './components/pages/Login'
import CRUDTurnos from './components/admin/CRUDTurnos'
import ListadoReservas from './components/admin/ListadoReservas'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout><TurnosDisponibles /></PublicLayout>} path="/" />
          <Route element={<Login />} path="/login" />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/turnos" replace />} />
            <Route path="turnos" element={<CRUDTurnos />} />
            <Route path="reservas" element={<ListadoReservas />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
