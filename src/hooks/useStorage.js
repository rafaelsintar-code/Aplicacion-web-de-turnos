import { db } from '../db/database'

export function useStorage() {
  const getTurnos = () => db.turnos.orderBy('fecha').toArray()

  const getTurnoById = (id) => db.turnos.get(id)

  const addTurno = (turno) => db.turnos.add({ ...turno, estado: 'activo' })

  const updateTurno = (id, cambios) => db.turnos.update(id, cambios)

  const deleteTurno = async (id) => {
    await db.reservas.where('turnoId').equals(id).modify({ estado: 'cancelada' })
    await db.turnos.delete(id)
  }

  const getReservas = () => db.reservas.orderBy('fechaReserva').reverse().toArray()

  const getReservasByTurno = (turnoId) =>
    db.reservas.where('turnoId').equals(turnoId).toArray()

  const addReserva = (reserva) =>
    db.reservas.add({
      ...reserva,
      fechaReserva: new Date().toISOString(),
      estado: 'confirmada',
    })

  const cancelReserva = (id) => db.reservas.update(id, { estado: 'cancelada' })

  const getUsuarioByEmail = (email) =>
    db.usuarios.where('email').equals(email).first()

  return {
    getTurnos,
    getTurnoById,
    addTurno,
    updateTurno,
    deleteTurno,
    getReservas,
    getReservasByTurno,
    addReserva,
    cancelReserva,
    getUsuarioByEmail,
  }
}
