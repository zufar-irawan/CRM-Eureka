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
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.post('/', createCompany);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);
export default router;