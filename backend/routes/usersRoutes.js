import { Router } from "express";
import { getAllUsers, getUserById, updateUser, } from "../controllers/usersController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", authMiddleware, getAllUsers);    
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
export default router;