import express from 'express';
import { getProducts, createOrder } from '../controllers/productController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/orders', verifyToken, createOrder);

export default router;
