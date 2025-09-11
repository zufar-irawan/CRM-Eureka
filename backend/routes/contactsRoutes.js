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
router.get('/', authMiddleware, getAllContacts);
router.get('/:id', authMiddleware, getContactById);
router.post('/', authMiddleware, createContact);
router.put('/:id', authMiddleware, updateContact);
router.delete('/:id', authMiddleware, deleteContact);
router.get('/company/:companyId', authMiddleware, getContactsByCompany);
router.get('/:id/tasks', authMiddleware, getTasksByContact);
export default router;