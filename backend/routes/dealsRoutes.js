// File: routes/dealRoutes.js - Updated with enhanced comment system
import express from 'express';
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
router.get('/', getAllDeals);
router.get('/:id', getDealById);
router.post('/', createDeal);
router.post('/from-lead/:leadId', createDealFromLead);
router.put('/:id', updateDeal);
router.put('/:id/updateStage', updateDealStage);
router.delete('/:id', deleteDeal);
router.get('/:id/comments', getDealComments);         
router.post('/:id/comments', addDealComment);              
router.get('/:id/comments/:commentId/thread', getDealCommentThread);  
router.delete('/:id/comments/:commentId', deleteDealComment);        

export default router;