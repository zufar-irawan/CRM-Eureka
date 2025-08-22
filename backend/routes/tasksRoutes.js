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

const router = Router();
router.get("/", getTasks);                          
router.post("/", authMiddleware, createTask);     
router.get("/:id", getTaskById);                   
router.put("/:id", updateTask);                     
router.delete("/:id", deleteTask);                   
router.put('/:id/updateStatus', updateTaskStatus);  
router.get("/:id/comments", getTaskComments);       
router.post("/:id/comments", addTaskComment);      
router.put("/task-comments/:commentId", updateTaskComment);   
router.delete("/task-comments/:commentId", deleteTaskComment);
router.get("/:id/results", getTaskResults);         
router.put("/task-results/:resultId", updateTaskResult);
router.delete("/task-results/:resultId", deleteTaskResult);
router.post(
  "/:id/results/with-attachments",
  authMiddleware,
  uploadMiddleware,
  handleUploadError,
  addTaskResultWithAttachments
);
router.get("/:id/attachments", getTaskAttachments);
router.get("/attachments/:attachmentId/download", downloadAttachment);
router.get("/attachments/:attachmentId/view", viewAttachment);
router.delete("/attachments/:attachmentId", deleteAttachment);

export default router;