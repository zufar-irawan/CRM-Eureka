//dealRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getAllDeals,
    getDealById,
    createDeal,
    createDealFromLead,
    updateDeal,
    updateDealStage,
    deleteDeal,
    getDealComments,
    addDealComment,
    getDealCommentThread,
    deleteDealComment
} from '../controllers/dealsController.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/', getAllDeals);
router.get('/:id', getDealById);
router.get('/:id/comments', getDealComments);
router.get('/:id/comments/:commentId/thread', getDealCommentThread);

// Protected routes (auth required)
router.post('/', authMiddleware, createDeal);
router.post('/from-lead/:leadId', authMiddleware, createDealFromLead);
router.put('/:id', authMiddleware, updateDeal);
router.put('/:id/updateStage', authMiddleware, updateDealStage);
router.delete('/:id', authMiddleware, deleteDeal);
router.post('/:id/comments', authMiddleware, addDealComment);
router.delete('/:id/comments/:commentId', authMiddleware, deleteDealComment);

export default router;