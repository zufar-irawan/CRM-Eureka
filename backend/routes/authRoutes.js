// routes/authRoutes.js
import express from 'express';
import { login, me, refreshUser } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();
// Public routes
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/refresh', authMiddleware, refreshUser);

export default router;