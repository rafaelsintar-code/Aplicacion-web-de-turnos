import { Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma';

// ─── TURNOS ──────────────────────────────────────────────────────────────────

export const validarCrearTurno = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { fecha, horaInicio, horaFin, capacidadMaxima } = req.body;

  if (!fecha || !horaInicio || !horaFin || !capacidadMaxima) {
    res.status(400).json({ error: 'Faltan campos obligatorios: fecha, horaInicio, horaFin, capacidadMaxima.' });
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    res.status(400).json({ error: 'El campo fecha debe tener el formato YYYY-MM-DD.' });
    return;
  }

  const hoy = new Date().toISOString().split('T')[0];
  if (fecha < hoy) {
    res.status(400).json({ error: 'La fecha no puede ser anterior a hoy.' });
    return;
  }

  if (!/^\d{2}:\d{2}$/.test(horaInicio) || !/^\d{2}:\d{2}$/.test(horaFin)) {
    res.status(400).json({ error: 'Las horas deben tener el formato HH:MM.' });
    return;
  }

  if (horaInicio >= horaFin) {
    res.status(400).json({ error: 'horaInicio debe ser anterior a horaFin.' });
    return;
  }

  if (Number(capacidadMaxima) < 1 || isNaN(Number(capacidadMaxima))) {
    res.status(400).json({ error: 'capacidadMaxima debe ser un número mayor a 0.' });
    return;
  }

  // Verificar solapamiento en la BD
  const conflicto = await prisma.turno.findFirst({
    where: {
      fecha,
      horaInicio: { lt: horaFin },
      horaFin:    { gt: horaInicio },
    },
  });

  if (conflicto) {
    res.status(400).json({ error: 'Ya existe un turno en ese horario. Verifique solapamientos.' });
    return;
  }

  next();
};

export const validarEditarTurno = (req: Request, res: Response, next: NextFunction): void => {
  const { fecha, horaInicio, horaFin, capacidadMaxima, estado } = req.body;

  if (fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      res.status(400).json({ error: 'El campo fecha debe tener el formato YYYY-MM-DD.' });
      return;
    }
    const hoy = new Date().toISOString().split('T')[0];
    if (fecha < hoy) {
      res.status(400).json({ error: 'La fecha no puede ser anterior a hoy.' });
      return;
    }
  }

  if (horaInicio && !/^\d{2}:\d{2}$/.test(horaInicio)) {
    res.status(400).json({ error: 'horaInicio debe tener el formato HH:MM.' });
    return;
  }

  if (horaFin && !/^\d{2}:\d{2}$/.test(horaFin)) {
    res.status(400).json({ error: 'horaFin debe tener el formato HH:MM.' });
    return;
  }

  if (horaInicio && horaFin && horaInicio >= horaFin) {
    res.status(400).json({ error: 'horaInicio debe ser anterior a horaFin.' });
    return;
  }

  if (capacidadMaxima !== undefined && (isNaN(Number(capacidadMaxima)) || Number(capacidadMaxima) < 1)) {
    res.status(400).json({ error: 'capacidadMaxima debe ser un número mayor a 0.' });
    return;
  }

  if (estado && !['activo', 'inactivo'].includes(estado)) {
    res.status(400).json({ error: 'El estado debe ser "activo" o "inactivo".' });
    return;
  }

  next();
};

// ─── RESERVAS ────────────────────────────────────────────────────────────────

export const validarCrearReserva = (req: Request, res: Response, next: NextFunction): void => {
  const { turnoId, nombreCliente, carnetIdentidad } = req.body;

  if (!turnoId || !nombreCliente || !carnetIdentidad) {
    res.status(400).json({ error: 'Faltan campos obligatorios: turnoId, nombreCliente, carnetIdentidad.' });
    return;
  }

  if (isNaN(Number(turnoId))) {
    res.status(400).json({ error: 'turnoId debe ser un número.' });
    return;
  }

  if (typeof nombreCliente !== 'string' || nombreCliente.trim().length < 2) {
    res.status(400).json({ error: 'nombreCliente debe tener al menos 2 caracteres.' });
    return;
  }

  if (!/^\d{11}$/.test(String(carnetIdentidad))) {
    res.status(400).json({ error: 'El carnet de identidad debe tener exactamente 11 dígitos numéricos.' });
    return;
  }

  next();
};

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const validarLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'El email no tiene un formato válido.' });
    return;
  }

  next();
};
