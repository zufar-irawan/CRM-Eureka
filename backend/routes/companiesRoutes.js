import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addTeamAccess } from '../middleware/hierarchyMiddleware.js';
import { getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompany,
    deleteCompany
} from '../controllers/companiesController.js';

const router = express.Router();
router.get('/', authMiddleware, getAllCompanies);
router.get('/:id', authMiddleware, getCompanyById);
router.post('/', authMiddleware, createCompany);
router.put('/:id', authMiddleware, updateCompany);
router.delete('/:id', authMiddleware, deleteCompany);
export default router;