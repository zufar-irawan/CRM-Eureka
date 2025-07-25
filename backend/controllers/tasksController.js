import { Tasks } from "../models/tasks/tasksModel.js";
import { TaskComments } from "../models/tasks/tasksCommentModel.js";
import { TaskResults } from "../models/tasks/tasksResultModel.js";
import { Op } from "sequelize";

// GET /api/tasks - List task berdasarkan user
export const getTasks = async (req, res) => {
  try {
    const { status, priority, category, assigned_to } = req.query;
    
    // Build where clause
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (priority) {
      whereClause.priority = priority;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (assigned_to) {
      whereClause.assigned_to = assigned_to;
    }

    const tasks = await Tasks.findAll({
      where: whereClause,
      include: [
        {
          model: TaskComments,
          as: 'comments',
          required: false
        },
        {
          model: TaskResults,
          as: 'results',
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching tasks", 
      error: error.message 
    });
  }
};

// POST /api/tasks - Tambah task
export const createTask = async (req, res) => {
  try {
    const {
      lead_id,
      assigned_to,
      title,
      description,
      category,
      due_date,
      priority
    } = req.body;

    // Validation
    if (!lead_id || !assigned_to || !title) {
      return res.status(400).json({
        success: false,
        message: "lead_id, assigned_to, dan title wajib diisi"
      });
    }

    const newTask = await Tasks.create({
      lead_id,
      assigned_to,
      title,
      description,
      category: category || 'Kanvasing',
      due_date,
      priority: priority || 'low',
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: "Task berhasil dibuat",
      data: newTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message
    });
  }
};

// PUT /api/tasks/:id - Update status & hasil kerja
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await Tasks.findByPk(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    await task.update(updateData);

    res.status(200).json({
      success: true,
      message: "Task berhasil diupdate",
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message
    });
  }
};

// GET /api/tasks/:id - Detail task
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Tasks.findOne({
      where: { id },
      include: [
        {
          model: TaskComments,
          as: 'comments',
          required: false,
          order: [['commented_at', 'ASC']]
        },
        {
          model: TaskResults,
          as: 'results',
          required: false,
          order: [['result_date', 'ASC']]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message
    });
  }
};

// GET /api/tasks/:id/comments - Ambil semua komentar pada task tertentu
export const getTaskComments = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comments = await TaskComments.findAll({
      where: { task_id: id },
      order: [['commented_at', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching task comments",
      error: error.message
    });
  }
};

// POST /api/tasks/:id/comments - Tambahkan komentar ke task
export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment_text, commented_by } = req.body;

    if (!comment_text) {
      return res.status(400).json({
        success: false,
        message: "comment_text wajib diisi"
      });
    }

    // Check if task exists
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    const newComment = await TaskComments.create({
      task_id: id,
      comment_text,
      commented_by
    });

    res.status(201).json({
      success: true,
      message: "Komentar berhasil ditambahkan",
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message
    });
  }
};

// PUT /api/tasks/task-comments/:commentId - Edit komentar tertentu
export const updateTaskComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment_text } = req.body;

    if (!comment_text) {
      return res.status(400).json({
        success: false,
        message: "comment_text wajib diisi"
      });
    }

    const comment = await TaskComments.findByPk(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Komentar tidak ditemukan"
      });
    }

    await comment.update({ comment_text });

    res.status(200).json({
      success: true,
      message: "Komentar berhasil diupdate",
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message
    });
  }
};

// DELETE /api/tasks/task-comments/:commentId - Hapus komentar tertentu
export const deleteTaskComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await TaskComments.findByPk(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Komentar tidak ditemukan"
      });
    }

    await comment.destroy();

    res.status(200).json({
      success: true,
      message: "Komentar berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message
    });
  }
};