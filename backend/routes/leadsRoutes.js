import { Router } from "express";
import { getLeads, getLeadById } from "../controllers/leadsController.js";

const router = Router();
router.get("/", getLeads);
router.get("/:id", getLeadById);
export default router;