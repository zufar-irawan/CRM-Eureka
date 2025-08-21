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
router.get("/", getTasks);                           // GET /api/tasks - List tasks (dengan filter lead_id, assigned_to, dll)
router.post("/", createTask);                        // POST /api/tasks - Tambah task
router.get("/:id", getTaskById);                     // GET /api/tasks/:id - Detail task
router.put("/:id", updateTask);                      // PUT /api/tasks/:id - Update task
router.delete("/:id", deleteTask);                   // DELETE /api/tasks/:id - Delete task
router.put('/:id/updateStatus', updateTaskStatus);   // PUT /api/tasks/:id/updateStatus - Update status task
router.get("/:id/comments", getTaskComments);        // GET /api/tasks/:id/comments - Ambil semua komentar pada task tertentu
router.post("/:id/comments", addTaskComment);        // POST /api/tasks/:id/comments - Tambahkan komentar ke task
router.put("/task-comments/:commentId", updateTaskComment);    // PUT /api/tasks/task-comments/:commentId - Edit komentar tertentu
router.delete("/task-comments/:commentId", deleteTaskComment); // DELETE /api/tasks/task-comments/:commentId - Hapus komentar tertentu
router.get("/:id/results", getTaskResults);          // GET /api/tasks/:id/results - Ambil semua hasil pada task tertentu
router.post("/:id/results", addTaskResult);
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