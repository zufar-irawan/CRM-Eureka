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

// Basic CRUD routes
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.post("/", createLead);
router.put("/:id", updateLead); 
router.delete("/:id", deleteLead);

// Lead conversion and stage management
router.post("/:id/convert", convertLead);
router.put("/:id/stage", updateLeadStage);

// Lead comments management
router.get("/:id/comments", getLeadComments);
router.post("/:id/comments", addLeadComment);
router.delete("/:id/comments/:commentId", deleteLeadComment);

// Status-based filtering routes
router.get("/status/unconverted", getUnconvertedLeads); 
router.get("/status/converted", getConvertedLeads);    

export default router;