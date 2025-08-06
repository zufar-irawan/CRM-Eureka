import { Router } from "express";
import { getAllUsers, getAllUsersWithRoles, getAllRoles, getUserById, assignRoleToUser, removeRoleFromUser, updateUser } from "../controllers/usersController.js";

const router = Router();
router.get("/", getAllUsers);    
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.get("/with-roles", getAllUsersWithRoles);
router.get("/roles/all", getAllRoles);
router.post("/roles/assign", assignRoleToUser);
router.delete("/roles/remove", removeRoleFromUser);
export default router;