import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const usuario = await prisma.usuario.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      password,
    },
  });

  if (!usuario) {
    res.status(401).json({ error: 'Email o contraseña incorrectos.' });
    return;
  }

  const { password: _, ...data } = usuario;
  res.json({ mensaje: 'Login exitoso.', usuario: data });
};

export const getUsuarios = async (req: Request, res: Response): Promise<void> => {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, email: true, nombre: true, rol: true },
  });
  res.json(usuarios);
};
