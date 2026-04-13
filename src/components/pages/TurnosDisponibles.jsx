// components/pages/TurnosDisponibles.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTurnos } from '../../hooks/useTurnos'
import { useReservas } from '../../hooks/useReservas'
import { useAuth } from '../../hooks/useAuth'
import Modal from '../ui/Modal'
import './TurnosDisponibles.css'

function formatFecha(fechaStr) {
  const [y, m, d] = fechaStr.split('-')
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default function TurnosDisponibles() {
  const { turnos } = useTurnos()
  const { hacerReserva } = useReservas()
  const { isAuthenticated } = useAuth()

  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null)
  const [form, setForm] = useState({ nombreCompleto: '', carnetIdentidad: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const abrirReserva = (turno) => {
    setTurnoSeleccionado(turno)
    setForm({ nombreCompleto: '', carnetIdentidad: '' })
    setError('')
    setSuccess('')
  }

  const handleReservar = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.nombreCompleto.trim()) {
      return setError('El nombre completo es obligatorio.')
    }
    // Carnet: exactamente 11 dígitos numéricos (puede empezar en cero)
    if (!/^\d{11}$/.test(form.carnetIdentidad)) {
      return setError('El carnet debe tener exactamente 11 dígitos numéricos.')
    }

    setLoading(true)
    try {
      await hacerReserva({
        turnoId: turnoSeleccionado.id,
        nombreCliente: form.nombreCompleto.trim(),
        carnetIdentidad: form.carnetIdentidad,
      })
      setSuccess('¡Reserva confirmada! Tu turno ha sido registrado.')
      setTurnoSeleccionado(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar turnos activos por fecha
  const turnosActivos = turnos?.filter((t) => t.estado === 'activo') ?? []
  const porFecha = turnosActivos.reduce((acc, t) => {
    if (!acc[t.fecha]) acc[t.fecha] = []
    acc[t.fecha].push(t)
    return acc
  }, {})
  const fechas = Object.keys(porFecha).sort()

  if (!turnos) return (
    <div className="turnos-loading">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="turnos-page-top">
          <div>
            <h1 className="page-title">Turnos disponibles</h1>
            <p className="page-subtitle">Hacé clic en un turno para reservar tu lugar</p>
          </div>
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-ghost btn-sm">
              🔒 Acceso administrador
            </Link>
          )}
        </div>
      </div>

      {success && <div className="alert alert-success">✓ {success}</div>}

      {fechas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>No hay turnos disponibles en este momento.</p>
        </div>
      ) : (
        fechas.map((fecha) => (
          <div key={fecha} className="fecha-grupo">
            <h2 className="fecha-titulo">{formatFecha(fecha)}</h2>
            <div className="turnos-grid">
              {porFecha[fecha].map((turno) => {
                const sinCupo = turno.cuposRestantes <= 0
                return (
                  <button
                    key={turno.id}
                    className="turno-card"
                    onClick={() => !sinCupo && abrirReserva(turno)}
                    disabled={sinCupo}
                  >
                    <div className="turno-hora">{turno.horaInicio}</div>
                    <div className="turno-hasta">hasta {turno.horaFin}</div>
                    <span className={`badge ${sinCupo ? 'badge-red' : turno.cuposRestantes <= 2 ? 'badge-blue' : 'badge-green'}`}>
                      {sinCupo ? 'Sin cupos' : `${turno.cuposRestantes} cupo${turno.cuposRestantes !== 1 ? 's' : ''}`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}

      {turnoSeleccionado && (
        <Modal title="Reservar turno" onClose={() => setTurnoSeleccionado(null)}>
          <div className="reserva-turno-info">
            <div className="reserva-turno-horario">
              {turnoSeleccionado.horaInicio} – {turnoSeleccionado.horaFin}
            </div>
            <div className="reserva-turno-meta">
              {formatFecha(turnoSeleccionado.fecha)} · {turnoSeleccionado.cuposRestantes} cupos restantes
            </div>
          </div>
          <form className="reserva-form" onSubmit={handleReservar}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input
                className="form-input"
                type="text"
                placeholder="Juan Pérez"
                value={form.nombreCompleto}
                onChange={set('nombreCompleto')}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Carnet de identidad (11 dígitos)</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                placeholder="00012345678"
                maxLength={11}
                value={form.carnetIdentidad}
                onChange={set('carnetIdentidad')}
                required
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setTurnoSeleccionado(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Confirmar reserva'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
