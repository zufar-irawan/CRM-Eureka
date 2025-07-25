import { Router } from "express";
import { getLeads, getLeadById, createLead, updateLead, deleteLead, convertLead, updateLeadStage, getLeadComments, addLeadComment, deleteLeadComment } from "../controllers/leadsController.js";

const router = Router();
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.post("/", createLead);
router.put("/:id", updateLead); 
router.delete("/:id", deleteLead);
router.post("/:id/convert", convertLead);
router.put("/:id/stage", updateLeadStage);
router.get("/:id/comments", getLeadComments);
router.post("/:id/comments", addLeadComment);
router.delete("/:id/comments/:commentId", deleteLeadComment);
export default router;