// Updated routes untuk leadsRoutes.js
import express from 'express';
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
    getCommentThread, // NEW
    getUnconvertedLeads,
    getConvertedLeads
} from '../controllers/leadsController.js';

const router = express.Router();

// Lead routes
router.get('/', getLeads);
router.get('/unconverted', getUnconvertedLeads);
router.get('/converted', getConvertedLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

// Lead conversion
router.post('/:id/convert', convertLead);
router.patch('/:id/stage', updateLeadStage);

// Comment routes with nested support
router.get('/:id/comments', getLeadComments);
router.post('/:id/comments', addLeadComment);                    // Now supports parent_id for replies
router.get('/:id/comments/:commentId/thread', getCommentThread); // NEW: Get comment thread
router.delete('/comments/:commentId', deleteLeadComment);        // Handles nested deletion

export default router;