import { Router } from "express";
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
    getUnconvertedLeads, 
    getConvertedLeads    
} from "../controllers/leadsController.js";

const router = Router();

// PENTING: Routes dengan path literal harus diletakkan SEBELUM routes dengan parameter!

// Status routes (letakkan di atas sebelum /:id routes)
router.get("/status/unconverted", getUnconvertedLeads); 
router.get("/status/converted", getConvertedLeads);    

// Basic CRUD routes
router.get("/", getLeads);
router.post("/", createLead);

// Routes dengan :id parameter (letakkan setelah routes literal)
router.get("/:id", getLeadById);
router.put("/:id", updateLead); 
router.delete("/:id", deleteLead);

// Conversion route
router.post("/:id/convert", convertLead);

// Stage update route
router.put("/:id/stage", updateLeadStage);

// Comments routes
router.get("/:id/comments", getLeadComments);
router.post("/:id/comments", addLeadComment);
router.delete("/:id/comments/:commentId", deleteLeadComment);

export default router 

// Basic CRUD untuk companies jika diperlukan di masa depan
// router.get('/', getAllCompanies);
// router.get('/:id', getCompanyById);
// router.post('/', createCompany);
// router.put('/:id', updateCompany);
// router.delete('/:id', deleteCompany);

// Basic CRUD untuk contacts jika diperlukan di masa depan
// router.get('/', getAllContacts);
// router.get('/:id', getContactById);
// router.post('/', createContact);
// router.put('/:id', updateContact);
// router.delete('/:id', deleteContact);
