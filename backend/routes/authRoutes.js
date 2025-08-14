// routes/authRoutes.js
import express from 'express';
import { login, me, refreshUser, logout } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/refresh', authMiddleware, refreshUser);
router.post('/logout', authMiddleware, logout);

export default router;