import { useState } from 'react'
import './FormularioTurno.css'

const estadoInicial = {
  fecha: '', horaInicio: '', horaFin: '', capacidadMaxima: '', estado: 'activo',
}

function hoyISO() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function FormularioTurno({ turno, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(turno ? {
    fecha: turno.fecha,
    horaInicio: turno.horaInicio,
    horaFin: turno.horaFin,
    capacidadMaxima: turno.capacidadMaxima,
    estado: turno.estado,
  } : estadoInicial)

  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.fecha || !form.horaInicio || !form.horaFin || !form.capacidadMaxima) {
      return setError('Todos los campos son obligatorios.')
    }
    if (form.fecha < hoyISO()) {
      return setError('La fecha no puede ser anterior a hoy.')
    }
    if (form.horaInicio >= form.horaFin) {
      return setError('La hora de inicio debe ser anterior a la hora de fin.')
    }
    if (Number(form.capacidadMaxima) < 1) {
      return setError('La capacidad debe ser al menos 1.')
    }
    try {
      await onSubmit({ ...form, capacidadMaxima: Number(form.capacidadMaxima) })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="form-turno" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="form-label">Fecha</label>
        <input type="date" className="form-input" value={form.fecha} min={hoyISO()} onChange={set('fecha')} required />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Hora inicio</label>
          <input type="time" className="form-input" value={form.horaInicio} onChange={set('horaInicio')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Hora fin</label>
          <input type="time" className="form-input" value={form.horaFin} onChange={set('horaFin')} required />
        </div>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Capacidad máxima</label>
          <input type="number" min="1" className="form-input" value={form.capacidadMaxima} onChange={set('capacidadMaxima')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Estado</label>
          <select className="form-select" value={form.estado} onChange={set('estado')}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : turno ? 'Guardar cambios' : 'Crear turno'}
        </button>
      </div>
    </form>
  )
}