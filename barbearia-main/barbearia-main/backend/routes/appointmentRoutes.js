import express from 'express';
import { getAppointments, createAppointment, cancelAppointment, deleteAppointment, getAvailability } from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/availability', getAvailability);
router.get('/', verifyToken, getAppointments);
router.post('/', verifyToken, createAppointment);
router.put('/:id/cancel', verifyToken, cancelAppointment);
router.delete('/:id', verifyToken, deleteAppointment);

export default router;
