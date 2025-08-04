import express from 'express';
import { getAllContacts, getContactById, getContactsByCompany, createContact, updateContact, deleteContact } from '../controllers/contactsController.js';

const router = express.Router();
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.get('/company/:companyId', getContactsByCompany);
export default router;