// db/database.js
// Configuración de IndexedDB usando Dexie.js
// Se eligió IndexedDB sobre localStorage porque:
// - Mayor capacidad de almacenamiento (cientos de MB vs ~5MB)
// - Soporte para consultas por índices (buscar reservas por turnoId)
// - API asíncrona no bloqueante
// - Dexie.js agrega reactividad con useLiveQuery

import Dexie from 'dexie'

export const db = new Dexie('TurnosDB')

db.version(1).stores({
  turnos:   '++id, fecha, horaInicio, horaFin, capacidadMaxima, estado',
  reservas: '++id, turnoId, nombreCliente, carnetIdentidad, fechaReserva, estado',
  usuarios: '++id, email',
})

// Seed inicial: usuario administrador y turnos de ejemplo
db.on('populate', async () => {
  await db.usuarios.add({
    email: 'admin@turnos.com',
    password: 'admin123',
    nombre: 'Administrador',
    rol: 'admin',
  })

  const hoy = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const fecha = (offsetDias) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() + offsetDias)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  await db.turnos.bulkAdd([
    { fecha: fecha(1), horaInicio: '09:00', horaFin: '09:30', capacidadMaxima: 5, estado: 'activo' },
    { fecha: fecha(1), horaInicio: '10:00', horaFin: '10:30', capacidadMaxima: 5, estado: 'activo' },
    { fecha: fecha(1), horaInicio: '11:00', horaFin: '11:30', capacidadMaxima: 3, estado: 'activo' },
    { fecha: fecha(2), horaInicio: '09:00', horaFin: '09:30', capacidadMaxima: 4, estado: 'activo' },
    { fecha: fecha(2), horaInicio: '14:00', horaFin: '14:30', capacidadMaxima: 6, estado: 'activo' },
    { fecha: fecha(3), horaInicio: '10:00', horaFin: '10:30', capacidadMaxima: 5, estado: 'activo' },
  ])
})
