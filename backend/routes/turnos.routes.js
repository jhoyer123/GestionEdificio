import { Router } from 'express';
import { getTurnos, getTurnoById, createTurno, updateTurno, deleteTurno } from '../controllers/turno.controller.js';

const router = Router();

router.get('/api/turnos', getTurnos);
router.get('/api/turnos/:id', getTurnoById);
router.post('/api/turnos', createTurno);
router.put('/api/turnos/:id', updateTurno);
router.delete('/api/turnos/:id', deleteTurno);

export default router;
