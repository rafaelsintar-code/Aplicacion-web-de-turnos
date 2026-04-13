// components/admin/ListadoReservas.jsx
import { useState } from 'react'
import { useReservas } from '../../hooks/useReservas'
import Modal from '../ui/Modal'
import './ListadoReservas.css'

function formatFecha(f) {
  if (!f) return '—'
  const [y, m, d] = f.split('-')
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatFechaHora(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) +
    ' ' +
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  )
}

export default function ListadoReservas() {
  const { reservasConTurno, cancelarReserva, eliminarReserva } = useReservas()

  const [reservaAccion, setReservaAccion] = useState(null) // { reserva, tipo: 'cancelar'|'eliminar' }
  const [loading, setLoading] = useState(false)
  const [alerta, setAlerta] = useState(null)
  const [filtro, setFiltro] = useState('todas')

  const mostrarAlerta = (tipo, msg) => {
    setAlerta({ tipo, msg })
    setTimeout(() => setAlerta(null), 3500)
  }

  const handleConfirmar = async () => {
    setLoading(true)
    try {
      if (reservaAccion.tipo === 'cancelar') {
        await cancelarReserva(reservaAccion.reserva.id)
        mostrarAlerta('success', 'Reserva cancelada correctamente.')
      } else {
        await eliminarReserva(reservaAccion.reserva.id)
        mostrarAlerta('success', 'Registro eliminado del sistema.')
      }
      setReservaAccion(null)
    } finally {
      setLoading(false)
    }
  }

  if (!reservasConTurno) return (
    <div className="reservas-loading">
      <div className="spinner" />
    </div>
  )

  const reservasFiltradas =
    filtro === 'todas'
      ? reservasConTurno
      : reservasConTurno.filter((r) => r.estado === filtro)

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Gestión de Reservas</h1>
        <p className="page-subtitle">
          {reservasConTurno.length} reserva{reservasConTurno.length !== 1 ? 's' : ''} en total
        </p>
      </div>

      {alerta && <div className={`alert alert-${alerta.tipo}`}>{alerta.msg}</div>}

      {/* Filtros */}
      <div className="filtros">
        {['todas', 'confirmada', 'cancelada'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filtro === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFiltro(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {reservasFiltradas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No hay reservas {filtro !== 'todas' ? filtro + 's' : ''}.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Carnet</th>
                <th>Turno</th>
                <th>Fecha reserva</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.map((r) => (
                <tr key={r.id}>
                  <td className="td-nombre">{r.nombreCliente}</td>
                  <td className="td-carnet">{r.carnetIdentidad}</td>
                  <td>
                    {r.turno ? (
                      <>
                        <span className="td-turno-nombre">
                          {r.turno.horaInicio}–{r.turno.horaFin}
                        </span>
                        <br />
                        <span className="td-turno-fecha">{formatFecha(r.turno.fecha)}</span>
                      </>
                    ) : (
                      <span className="td-eliminado">Turno eliminado</span>
                    )}
                  </td>
                  <td className="td-fecha-reserva">{formatFechaHora(r.fechaReserva)}</td>
                  <td>
                    <span className={`badge ${r.estado === 'confirmada' ? 'badge-green' : 'badge-red'}`}>
                      {r.estado}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      {r.estado === 'confirmada' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setReservaAccion({ reserva: r, tipo: 'cancelar' })}
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setReservaAccion({ reserva: r, tipo: 'eliminar' })}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal unificado para cancelar o eliminar */}
      {reservaAccion && (
        <Modal
          title={reservaAccion.tipo === 'cancelar' ? 'Cancelar reserva' : 'Eliminar registro'}
          onClose={() => setReservaAccion(null)}
          footer={
            <>
              <button
                className="btn btn-ghost"
                onClick={() => setReservaAccion(null)}
                disabled={loading}
              >
                Volver
              </button>
              <button
                className={`btn ${reservaAccion.tipo === 'cancelar' ? 'btn-danger' : 'btn-danger'}`}
                onClick={handleConfirmar}
                disabled={loading}
              >
                {loading
                  ? <span className="spinner" />
                  : reservaAccion.tipo === 'cancelar'
                    ? 'Sí, cancelar reserva'
                    : 'Sí, eliminar registro'}
              </button>
            </>
          }
        >
          <p className="cancelar-modal-texto">
            {reservaAccion.tipo === 'cancelar' ? (
              <>
                ¿Cancelar la reserva de{' '}
                <strong>{reservaAccion.reserva.nombreCliente}</strong>?
                {reservaAccion.reserva.turno && (
                  <> Turno del{' '}
                    <strong>
                      {formatFecha(reservaAccion.reserva.turno.fecha)} a las{' '}
                      {reservaAccion.reserva.turno.horaInicio}
                    </strong>.
                  </>
                )}
                {' '}El registro quedará en el sistema con estado <strong>cancelada</strong>.
              </>
            ) : (
              <>
                ¿Eliminar permanentemente el registro de{' '}
                <strong>{reservaAccion.reserva.nombreCliente}</strong>?
                <br /><br />
                Esta acción <strong>no se puede deshacer</strong>. El registro desaparecerá completamente del sistema.
              </>
            )}
          </p>
        </Modal>
      )}
    </div>
  )
}
