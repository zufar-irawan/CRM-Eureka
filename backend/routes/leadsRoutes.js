//leadsRoutes.js
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,
    convertLead,
    updateLeadStage,
    getLeadComments,
    addLeadComment,
    deleteLeadComment,
    getCommentThread,
    getUnconvertedLeads,
    getConvertedLeads
} from '../controllers/leadsController.js';

const router = express.Router();

// Public routes
router.get('/', getLeads);
router.get('/unconverted', getUnconvertedLeads);
router.get('/converted', getConvertedLeads);
router.get('/:id', getLeadById);
router.get('/:id/comments', getLeadComments);
router.get('/:id/comments/:commentId/thread', getCommentThread);

// Protected routes
router.post('/', authMiddleware, createLead);
router.put('/:id', authMiddleware, updateLead);
router.delete('/:id', authMiddleware, deleteLead);
router.post('/:id/convert', authMiddleware, convertLead);
router.patch('/:id/stage', authMiddleware, updateLeadStage);
router.post('/:id/comments', authMiddleware, addLeadComment);
router.delete('/comments/:commentId', authMiddleware, deleteLeadComment);

export default router;