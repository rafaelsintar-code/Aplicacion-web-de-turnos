import { Router } from 'express';

import { validarCrearTurno, validarEditarTurno, validarCrearReserva, validarLogin } from '../middlewares/validaciones';
import { getTurnos, getTurnoById, crearTurno, editarTurno, eliminarTurno } from '../controllers/turnos.controller';
import { getReservas, getReservaById, crearReserva, cancelarReserva, eliminarReserva } from '../controllers/reservas.controller';
import { login, getUsuarios } from '../controllers/auth.controller';
import { getHealth, getHealthReport } from '../controllers/health.controller';

const router = Router();

// ─── SALUD ───────────────────────────────────────────────────────────────────

router.get('/health',        getHealth);
router.get('/health/report', getHealthReport);

// ─── AUTH ─────────────────────────────────────────────────────────────────────

router.post('/auth/login', validarLogin, login);

// ─── USUARIOS ────────────────────────────────────────────────────────────────

router.get('/usuarios', getUsuarios);

// ─── TURNOS ──────────────────────────────────────────────────────────────────

router.get   ('/turnos',     getTurnos);
router.get   ('/turnos/:id', getTurnoById);
router.post  ('/turnos',     validarCrearTurno, crearTurno);
router.put   ('/turnos/:id', validarEditarTurno, editarTurno);
router.delete('/turnos/:id', eliminarTurno);

// ─── RESERVAS ────────────────────────────────────────────────────────────────

router.get   ('/reservas',             getReservas);
router.get   ('/reservas/:id',         getReservaById);
router.post  ('/reservas',             validarCrearReserva, crearReserva);
router.patch ('/reservas/:id/cancelar', cancelarReserva);
router.delete('/reservas/:id',         eliminarReserva);

export default router;
