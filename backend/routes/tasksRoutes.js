import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskComments,
  addTaskComment,
  updateTaskComment,
  deleteTaskComment,
  updateTaskStatus,
  getTaskResults,
  addTaskResult,
  updateTaskResult,
  deleteTaskResult,
  addTaskResultWithAttachments,
  downloadAttachment,
  viewAttachment,
  deleteAttachment,
  getTaskAttachments,
  uploadMiddleware,
  handleUploadError
} from "../controllers/tasksController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { addTeamAccess } from "../middleware/hierarchyMiddleware.js";

const router = Router();
router.get("/", authMiddleware, addTeamAccess, getTasks);
router.post("/", authMiddleware, createTask);
router.get("/:id", authMiddleware, addTeamAccess, getTaskById);
router.put("/:id", authMiddleware, addTeamAccess, updateTask);
router.delete("/:id", authMiddleware, addTeamAccess, deleteTask);
router.put('/:id/updateStatus', authMiddleware, addTeamAccess, updateTaskStatus);
router.get("/:id/comments", authMiddleware, getTaskComments);
router.post("/:id/comments", authMiddleware, addTaskComment);
router.put("/task-comments/:commentId", authMiddleware, updateTaskComment);
router.delete("/task-comments/:commentId", authMiddleware, deleteTaskComment);
router.get("/:id/results", authMiddleware, getTaskResults);
router.put("/task-results/:resultId", authMiddleware, updateTaskResult);
router.delete("/task-results/:resultId", authMiddleware, deleteTaskResult);
router.post(
  "/:id/results/with-attachments",
  authMiddleware,
  uploadMiddleware,
  handleUploadError,
  addTaskResultWithAttachments
);
router.get("/:id/attachments", authMiddleware, getTaskAttachments);
router.get("/attachments/:attachmentId/download", downloadAttachment);
router.get("/attachments/:attachmentId/view", viewAttachment);
router.delete("/attachments/:attachmentId", authMiddleware, deleteAttachment);

export default router;