import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useStorage } from './useStorage'

export function useTurnos() {
  const { addTurno, updateTurno, deleteTurno } = useStorage()

  const turnos = useLiveQuery(() =>
    db.turnos.orderBy('fecha').toArray(), []
  )

  const reservasConfirmadas = useLiveQuery(() =>
    db.reservas.where('estado').equals('confirmada').toArray(), []
  )

  const turnosConDisponibilidad = turnos?.map((turno) => {
    const reservas = reservasConfirmadas?.filter((r) => r.turnoId === turno.id) ?? []
    const cuposOcupados = reservas.length
    const cuposRestantes = turno.capacidadMaxima - cuposOcupados
    return { ...turno, cuposRestantes, cuposOcupados }
  })

  const hayConflictoHorario = (fecha, horaInicio, horaFin, excludeId = null) => {
    if (!turnos) return false
    return turnos.some((t) => {
      if (t.id === excludeId) return false
      if (t.fecha !== fecha) return false
      return horaInicio < t.horaFin && horaFin > t.horaInicio
    })
  }

  const crearTurno = async (datos) => {
    if (hayConflictoHorario(datos.fecha, datos.horaInicio, datos.horaFin)) {
      throw new Error('Ya existe un turno en ese horario. Verifique solapamientos.')
    }
    return addTurno(datos)
  }

  const editarTurno = async (id, datos) => {
    if (hayConflictoHorario(datos.fecha, datos.horaInicio, datos.horaFin, id)) {
      throw new Error('Ya existe un turno en ese horario. Verifique solapamientos.')
    }
    return updateTurno(id, datos)
  }

  const eliminarTurno = (id) => deleteTurno(id)

  return {
    turnos: turnosConDisponibilidad,
    crearTurno,
    editarTurno,
    eliminarTurno,
    hayConflictoHorario,
  }
}
