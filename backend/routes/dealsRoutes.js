import express from 'express';
import { getAllDeals, getDealById, createDeal, updateDeal, updateDealStage, deleteDeal, getDealComments, addDealComment, deleteDealComment } from '../controllers/dealsController.js';

const router = express.Router();
router.get('/', getAllDeals);                    // GET /api/deals
router.get('/:id', getDealById);                 // GET /api/deals/:id
router.post('/', createDeal);                    // POST /api/deals
router.put('/:id', updateDeal);                  // PUT /api/deals/:id
router.delete('/:id', deleteDeal);                 // DELETE /api/deals/:id
router.put('/:id/updateStage', updateDealStage); // PUT /api/deals/:id/updateStage
router.get('/:id/comments', getDealComments);           // GET /api/deals/:id/comments
router.post('/:id/comments', addDealComment);           // POST /api/deals/:id/comments
router.delete('/:id/comments/:commentId', deleteDealComment); // DELETE /api/deals/:id/comments/:commentId

export default router;