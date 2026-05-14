import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getTurnos = async (req: Request, res: Response): Promise<void> => {
  const turnos = await prisma.turno.findMany({
    include: {
      reservas: {
        where: { estado: 'confirmada' },
        select: { id: true },
      },
    },
    orderBy: [{ fecha: 'asc' }, { horaInicio: 'asc' }],
  });

  const resultado = turnos.map((t) => {
    const cuposOcupados = t.reservas.length;
    const { reservas, ...turno } = t;
    return { ...turno, cuposOcupados, cuposRestantes: t.capacidadMaxima - cuposOcupados };
  });

  res.json(resultado);
};

export const getTurnoById = async (req: Request, res: Response): Promise<void> => {
  const turno = await prisma.turno.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      reservas: {
        where: { estado: 'confirmada' },
        select: { id: true },
      },
    },
  });

  if (!turno) {
    res.status(404).json({ error: 'Turno no encontrado.' });
    return;
  }

  const cuposOcupados = turno.reservas.length;
  const { reservas, ...datos } = turno;
  res.json({ ...datos, cuposOcupados, cuposRestantes: turno.capacidadMaxima - cuposOcupados });
};

export const crearTurno = async (req: Request, res: Response): Promise<void> => {
  const { fecha, horaInicio, horaFin, capacidadMaxima, estado } = req.body;

  const nuevo = await prisma.turno.create({
    data: {
      fecha,
      horaInicio,
      horaFin,
      capacidadMaxima: Number(capacidadMaxima),
      estado: estado ?? 'activo',
    },
  });

  res.status(201).json(nuevo);
};

export const editarTurno = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const existe = await prisma.turno.findUnique({ where: { id } });

  if (!existe) {
    res.status(404).json({ error: 'Turno no encontrado.' });
    return;
  }

  const { fecha, horaInicio, horaFin, capacidadMaxima, estado } = req.body;

  const actualizado = await prisma.turno.update({
    where: { id },
    data: {
      ...(fecha           && { fecha }),
      ...(horaInicio      && { horaInicio }),
      ...(horaFin         && { horaFin }),
      ...(capacidadMaxima !== undefined && { capacidadMaxima: Number(capacidadMaxima) }),
      ...(estado          && { estado }),
    },
  });

  res.json(actualizado);
};

export const eliminarTurno = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const existe = await prisma.turno.findUnique({ where: { id } });

  if (!existe) {
    res.status(404).json({ error: 'Turno no encontrado.' });
    return;
  }

  await prisma.$transaction([
    prisma.reserva.updateMany({
      where: { turnoId: id },
      data: { estado: 'cancelada' },
    }),
    prisma.turno.delete({ where: { id } }),
  ]);

  res.json({ mensaje: 'Turno eliminado. Reservas asociadas canceladas.' });
};
