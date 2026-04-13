import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useStorage } from './useStorage'

export function useReservas() {
  const { addReserva, cancelReserva } = useStorage()

  const reservasConTurno = useLiveQuery(async () => {
    const reservas = await db.reservas.orderBy('fechaReserva').reverse().toArray()
    const turnosMap = {}
    const turnosIds = [...new Set(reservas.map((r) => r.turnoId))]
    const turnos = await db.turnos.bulkGet(turnosIds)
    turnos.forEach((t) => { if (t) turnosMap[t.id] = t })
    return reservas.map((r) => ({ ...r, turno: turnosMap[r.turnoId] ?? null }))
  }, [])

  const hacerReserva = async ({ turnoId, nombreCliente, carnetIdentidad }) => {
    const turno = await db.turnos.get(turnoId)
    if (!turno) throw new Error('El turno no existe.')
    if (turno.estado !== 'activo') throw new Error('Este turno no está disponible.')

    const reservasActivas = await db.reservas
      .where('turnoId').equals(turnoId)
      .filter((r) => r.estado === 'confirmada')
      .count()

    if (reservasActivas >= turno.capacidadMaxima) {
      throw new Error('No hay cupos disponibles para este turno.')
    }

    return addReserva({ turnoId, nombreCliente, carnetIdentidad })
  }

  const cancelarReserva = (id) => cancelReserva(id)

  const eliminarReserva = (id) => db.reservas.delete(id)

  return {
    reservasConTurno,
    hacerReserva,
    cancelarReserva,
    eliminarReserva,
  }
}
