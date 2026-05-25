import express from 'express';
import { register, login, subscribe, getBarbers } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/subscribe', verifyToken, subscribe);
router.get('/barbers', getBarbers);

export default router;
