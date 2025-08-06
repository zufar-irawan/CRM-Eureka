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
  updateTaskStatus 
} from "../controllers/tasksController.js";

const router = Router();

// Task CRUD routes
router.get("/", getTasks);                           // GET /api/tasks - List tasks (dengan filter lead_id, assigned_to, dll)
router.post("/", createTask);                        // POST /api/tasks - Tambah task  
router.get("/:id", getTaskById);                     // GET /api/tasks/:id - Detail task
router.put("/:id", updateTask);                      // PUT /api/tasks/:id - Update task
router.delete("/:id", deleteTask);                   // DELETE /api/tasks/:id - Delete task

// Task status update
router.put('/:id/updateStatus', updateTaskStatus);   // PUT /api/tasks/:id/updateStatus - Update status task

// Task comments routes
router.get("/:id/comments", getTaskComments);        // GET /api/tasks/:id/comments - Ambil semua komentar pada task tertentu
router.post("/:id/comments", addTaskComment);        // POST /api/tasks/:id/comments - Tambahkan komentar ke task
router.put("/task-comments/:commentId", updateTaskComment);    // PUT /api/tasks/task-comments/:commentId - Edit komentar tertentu
router.delete("/task-comments/:commentId", deleteTaskComment); // DELETE /api/tasks/task-comments/:commentId - Hapus komentar tertentu

export default router;