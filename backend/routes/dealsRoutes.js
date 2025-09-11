//dealRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addTeamAccess } from '../middleware/hierarchyMiddleware.js';
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

// Protected routes (auth required)
router.get('/', authMiddleware, addTeamAccess, getAllDeals);
router.get('/:id', authMiddleware, addTeamAccess, getDealById);
router.get('/:id/comments', authMiddleware, getDealComments);
router.get('/:id/comments/:commentId/thread', authMiddleware, getDealCommentThread);

router.post('/', authMiddleware, createDeal);
router.post('/from-lead/:leadId', authMiddleware, addTeamAccess, createDealFromLead);
router.put('/:id', authMiddleware, addTeamAccess, updateDeal);
router.put('/:id/updateStage', authMiddleware, addTeamAccess, updateDealStage);
router.delete('/:id', authMiddleware, addTeamAccess, deleteDeal);
router.post('/:id/comments', authMiddleware, addTeamAccess, addDealComment);
router.delete('/:id/comments/:commentId', authMiddleware, addTeamAccess, deleteDealComment);

export default router;