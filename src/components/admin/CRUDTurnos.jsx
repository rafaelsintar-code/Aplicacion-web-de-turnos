import { useState } from 'react'
import { useTurnos } from '../../hooks/useTurnos'
import Modal from '../ui/Modal'
import FormularioTurno from '../ui/FormularioTurno'
import './CRUDTurnos.css'

function formatFecha(f) {
  const [y, m, d] = f.split('-')
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function CRUDTurnos() {
  const { turnos, crearTurno, editarTurno, eliminarTurno } = useTurnos()

  const [modalCrear, setModalCrear] = useState(false)
  const [turnoEditar, setTurnoEditar] = useState(null)
  const [turnoEliminar, setTurnoEliminar] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alerta, setAlerta] = useState(null)

  const mostrarAlerta = (tipo, msg) => {
    setAlerta({ tipo, msg })
    setTimeout(() => setAlerta(null), 3500)
  }

  const handleCrear = async (datos) => {
    setLoading(true)
    try {
      await crearTurno(datos)
      setModalCrear(false)
      mostrarAlerta('success', 'Turno creado correctamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = async (datos) => {
    setLoading(true)
    try {
      await editarTurno(turnoEditar.id, datos)
      setTurnoEditar(null)
      mostrarAlerta('success', 'Turno actualizado.')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async () => {
    setLoading(true)
    try {
      await eliminarTurno(turnoEliminar.id)
      setTurnoEliminar(null)
      mostrarAlerta('success', 'Turno eliminado y sus reservas canceladas.')
    } finally {
      setLoading(false)
    }
  }

  if (!turnos) return (
    <div className="crud-loading">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="section-header">
          <div>
            <h1 className="page-title">Gestión de Turnos</h1>
            <p className="page-subtitle">
              {turnos.length} turno{turnos.length !== 1 ? 's' : ''} registrado{turnos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalCrear(true)}>+ Nuevo turno</button>
        </div>
      </div>

      {alerta && <div className={`alert alert-${alerta.tipo}`}>{alerta.msg}</div>}

      {turnos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗓</div>
          <p>No hay turnos. Creá el primero.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Capacidad</th>
                <th>Ocupados</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t) => (
                <tr key={t.id}>
                  <td>{formatFecha(t.fecha)}</td>
                  <td>{t.horaInicio} – {t.horaFin}</td>
                  <td>{t.capacidadMaxima}</td>
                  <td>
                    <span className={`turno-cupos ${t.cuposOcupados >= t.capacidadMaxima ? 'turno-cupos--lleno' : 'turno-cupos--libre'}`}>
                      {t.cuposOcupados} / {t.capacidadMaxima}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${t.estado === 'activo' ? 'badge-green' : 'badge-gray'}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setTurnoEditar(t)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setTurnoEliminar(t)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalCrear && (
        <Modal title="Nuevo turno" onClose={() => setModalCrear(false)}>
          <FormularioTurno onSubmit={handleCrear} onCancel={() => setModalCrear(false)} loading={loading} />
        </Modal>
      )}

      {turnoEditar && (
        <Modal title="Editar turno" onClose={() => setTurnoEditar(null)}>
          <FormularioTurno turno={turnoEditar} onSubmit={handleEditar} onCancel={() => setTurnoEditar(null)} loading={loading} />
        </Modal>
      )}

      {turnoEliminar && (
        <Modal
          title="Eliminar turno"
          onClose={() => setTurnoEliminar(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setTurnoEliminar(null)} disabled={loading}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleEliminar} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Sí, eliminar'}
              </button>
            </>
          }
        >
          <p className="eliminar-modal-texto">
            ¿Confirmas eliminar el turno del{' '}
            <strong>{formatFecha(turnoEliminar.fecha)} — {turnoEliminar.horaInicio}</strong>?
            <br /><br />
            Todas las reservas asociadas serán canceladas.
          </p>
        </Modal>
      )}
    </div>
  )
}
