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
    getCommentThread, 
    getUnconvertedLeads,
    getConvertedLeads
} from '../controllers/leadsController.js';

const router = express.Router();
router.get('/', getLeads);
router.get('/unconverted', getUnconvertedLeads);
router.get('/converted', getConvertedLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/convert', convertLead);
router.patch('/:id/stage', updateLeadStage);
router.get('/:id/comments', getLeadComments);
router.post('/:id/comments', addLeadComment);                   
router.get('/:id/comments/:commentId/thread', getCommentThread); 
router.delete('/comments/:commentId', deleteLeadComment);       

export default router;