import express from 'express';
import { getServices, createService } from '../controllers/serviceController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getServices);
router.post('/', verifyToken, isAdmin, createService);

export default router;
