import { Router } from "express";
import { getTasks, getTaskById, createTask, updateTask, getTaskComments, addTaskComment, updateTaskComment, deleteTaskComment } from "../controllers/tasksController.js";

const router = Router();
router.get("/", getTasks);                           // GET /api/tasks - List task berdasarkan user
router.post("/", createTask);                        // POST /api/tasks - Tambah task  
router.put("/:id", updateTask);                      // PUT /api/tasks/:id - Update status & hasil kerja
router.get("/:id", getTaskById);                     // GET /api/tasks/:id - Detail task
router.get("/:id/comments", getTaskComments);        // GET /api/tasks/:id/comments - Ambil semua komentar pada task tertentu
router.post("/:id/comments", addTaskComment);        // POST /api/tasks/:id/comments - Tambahkan komentar ke task
router.put("/task-comments/:commentId", updateTaskComment);    // PUT /api/tasks/task-comments/:commentId - Edit komentar tertentu
router.delete("/task-comments/:commentId", deleteTaskComment); // DELETE /api/tasks/task-comments/:commentId - Hapus komentar tertentu
export default router;