import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addTeamAccess } from '../middleware/hierarchyMiddleware.js';
import {
    getAllContacts,
    getContactById,
    getContactsByCompany,
    createContact,
    updateContact,
    deleteContact,
    getTasksByContact
} from '../controllers/contactsController.js';

const router = express.Router();
router.get('/',  getAllContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.get('/company/:companyId', getContactsByCompany);
router.get('/:id/tasks', getTasksByContact);
export default router;