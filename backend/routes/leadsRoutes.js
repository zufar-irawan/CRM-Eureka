//leadsRoutes.js
import express from 'express';
import authMiddleware, {
    requireRole,
    requireAdmin,
    requireManagerLevel,
    requireAsmenLevel,
    requireGLLevel
} from '../middleware/authMiddleware.js';
import { addTeamAccess } from '../middleware/hierarchyMiddleware.js';
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

// Protected routes
router.get('/', authMiddleware, addTeamAccess, getLeads);
router.get('/unconverted', authMiddleware, addTeamAccess, getUnconvertedLeads);
router.get('/converted', authMiddleware, addTeamAccess, getConvertedLeads);
router.get('/:id', authMiddleware, addTeamAccess, getLeadById);
router.get('/:id/comments', authMiddleware, getLeadComments);
router.get('/:id/comments/:commentId/thread', authMiddleware, getCommentThread);

router.post('/', authMiddleware, createLead);
router.put('/:id', authMiddleware, addTeamAccess, updateLead);
router.delete('/:id', authMiddleware, addTeamAccess, deleteLead);
router.post('/:id/convert', authMiddleware, addTeamAccess, convertLead);
router.patch('/:id/stage', authMiddleware, addTeamAccess, updateLeadStage);
router.post('/:id/comments', authMiddleware, addTeamAccess, addLeadComment);
router.delete('/comments/:commentId', authMiddleware, addTeamAccess, deleteLeadComment);

export default router;