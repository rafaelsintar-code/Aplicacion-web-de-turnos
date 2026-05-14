import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getReservas = async (req: Request, res: Response): Promise<void> => {
  const reservas = await prisma.reserva.findMany({
    include: { turno: true },
    orderBy: { fechaReserva: 'desc' },
  });
  res.json(reservas);
};

export const getReservaById = async (req: Request, res: Response): Promise<void> => {
  const reserva = await prisma.reserva.findUnique({
    where: { id: Number(req.params.id) },
    include: { turno: true },
  });

  if (!reserva) {
    res.status(404).json({ error: 'Reserva no encontrada.' });
    return;
  }

  res.json(reserva);
};

export const crearReserva = async (req: Request, res: Response): Promise<void> => {
  const { turnoId, nombreCliente, carnetIdentidad } = req.body;

  const turno = await prisma.turno.findUnique({ where: { id: Number(turnoId) } });

  if (!turno) {
    res.status(404).json({ error: 'Turno no encontrado.' });
    return;
  }
  if (turno.estado !== 'activo') {
    res.status(400).json({ error: 'El turno no está disponible.' });
    return;
  }

  const ocupados = await prisma.reserva.count({
    where: { turnoId: turno.id, estado: 'confirmada' },
  });

  if (ocupados >= turno.capacidadMaxima) {
    res.status(400).json({ error: 'No hay cupos disponibles para este turno.' });
    return;
  }

  const nueva = await prisma.reserva.create({
    data: {
      turnoId: Number(turnoId),
      nombreCliente: nombreCliente.trim(),
      carnetIdentidad: String(carnetIdentidad),
      estado: 'confirmada',
    },
    include: { turno: true },
  });

  res.status(201).json(nueva);
};

export const cancelarReserva = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const reserva = await prisma.reserva.findUnique({ where: { id } });

  if (!reserva) {
    res.status(404).json({ error: 'Reserva no encontrada.' });
    return;
  }
  if (reserva.estado === 'cancelada') {
    res.status(400).json({ error: 'La reserva ya está cancelada.' });
    return;
  }

  const actualizada = await prisma.reserva.update({
    where: { id },
    data: { estado: 'cancelada' },
    include: { turno: true },
  });

  res.json(actualizada);
};

export const eliminarReserva = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const existe = await prisma.reserva.findUnique({ where: { id } });

  if (!existe) {
    res.status(404).json({ error: 'Reserva no encontrada.' });
    return;
  }

  await prisma.reserva.delete({ where: { id } });
  res.json({ mensaje: 'Reserva eliminada.' });
};
