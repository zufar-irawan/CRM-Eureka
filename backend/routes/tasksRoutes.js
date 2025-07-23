import { Router } from "express";
import { getTasks, getTaskById, createTask } from "../controllers/tasksController.js";

const router = Router();
router.get("/", getTasks);
router.get("/:id", getTaskById);
export default router;