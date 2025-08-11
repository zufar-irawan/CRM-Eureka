import { Tasks } from "../models/tasks/tasksModel.js";
import { TaskComments } from "../models/tasks/tasksCommentModel.js";
import { TaskResults } from "../models/tasks/tasksResultModel.js";
import { User } from "../models/usersModel.js";
import { Op } from "sequelize";

// GET /api/tasks - List task berdasarkan filter
export const getTasks = async (req, res) => {
  try {
    const { status, priority, category, assigned_to, lead_id, search, } = req.query;

    let whereClause = {};

    // Filter berdasarkan lead_id (PENTING untuk detail lead)
    if (lead_id) {
      whereClause.lead_id = lead_id;
    }

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

    if (search) {
      whereClause[Op.or] = [
        {
          title: {
            [Op.like]: `%${search}%`
          }
        },
        {
          category: {
            [Op.like]: `%${search}%`
          }
        }
      ];
    }

    const tasks = await Tasks.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
          required: false
        },
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

    // Transform data untuk menambahkan assigned_user_name
    const transformedTasks = tasks.map(task => {
      const taskData = task.toJSON();
      return {
        ...taskData,
        assigned_user_name: taskData.assignee ? taskData.assignee.name : 'Unassigned'
      };
    });

    res.status(200).json({
      success: true,
      data: transformedTasks,
      message: `Found ${transformedTasks.length} tasks`
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message
    });
  }
};

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

    if (!lead_id || !assigned_to || !title) {
      return res.status(400).json({
        success: false,
        message: "lead_id, assigned_to, dan title wajib diisi"
      });
    }

    const newTask = await Tasks.create({
      lead_id: parseInt(lead_id),
      assigned_to: parseInt(assigned_to),
      title,
      description,
      category: category || 'Lainnya',
      due_date,
      priority: priority || 'medium',
      status: 'pending'
    });

    // Ambil data task dengan include user untuk response
    const taskWithUser = await Tasks.findOne({
      where: { id: newTask.id },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const responseData = taskWithUser.toJSON();
    responseData.assigned_user_name = responseData.assignee ? responseData.assignee.name : 'Unassigned';

    res.status(201).json({
      success: true,
      message: "Task berhasil dibuat",
      data: responseData
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message
    });
  }
};

// PUT /api/tasks/:id - Update task
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

    // Ambil data terbaru dengan include
    const updatedTask = await Tasks.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const responseData = updatedTask.toJSON();
    responseData.assigned_user_name = responseData.assignee ? responseData.assignee.name : 'Unassigned';

    res.status(200).json({
      success: true,
      message: "Task berhasil diupdate",
      data: responseData
    });
  } catch (error) {
    console.error('Error updating task:', error);
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
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: TaskComments,
          as: 'comments',
          required: false,
          order: [['created_at', 'ASC']]
        },
        {
          model: TaskResults,
          as: 'results',
          required: false,
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    const responseData = task.toJSON();
    responseData.assigned_user_name = responseData.assignee ? responseData.assignee.name : 'Unassigned';

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message
    });
  }
};

// PUT /api/tasks/:id/updateStatus - Update status task
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid. Valid statuses: " + validStatuses.join(', ')
      });
    }

    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    const oldStatus = task.status;

    // Update status
    await task.update({ status });

    // Ambil data terbaru
    const updatedTask = await Tasks.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const responseData = updatedTask.toJSON();
    responseData.assigned_user_name = responseData.assignee ? responseData.assignee.name : 'Unassigned';

    console.log(`✅ Task ${id} status updated from "${oldStatus}" to "${status}"`);

    res.status(200).json({
      success: true,
      message: "Status task berhasil diupdate",
      data: responseData
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: "Error updating task status",
      error: error.message
    });
  }
};

// DELETE /api/tasks/:id - Delete task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    await task.destroy();

    res.status(200).json({
      success: true,
      message: "Task berhasil dihapus"
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message
    });
  }
};

// ===== TASK COMMENTS FUNCTIONS =====

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
    console.error('Error fetching task comments:', error);
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
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message
    });
  }
};

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
    console.error('Error updating comment:', error);
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
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message
    });
  }
};

// ===== TASK RESULTS FUNCTIONS =====

// GET /api/tasks/:id/results - Ambil semua hasil pada task tertentu
export const getTaskResults = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah task ada
    const task = await Tasks.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    const results = await TaskResults.findAll({
      where: { task_id: id },
      order: [['result_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: results,
      message: `Found ${results.length} task results`
    });
  } catch (error) {
    console.error('Error fetching task results:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching task results",
      error: error.message
    });
  }
};

// POST /api/tasks/:id/results - Tambahkan hasil ke task
export const addTaskResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { result_text, result_type, created_by } = req.body;

    if (!result_text) {
      return res.status(400).json({
        success: false,
        message: "result_text wajib diisi"
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

    // Validasi result_type jika diberikan
    const validResultTypes = ['meeting', 'call', 'email', 'visit', 'note'];
    if (result_type && !validResultTypes.includes(result_type)) {
      return res.status(400).json({
        success: false,
        message: `result_type tidak valid. Valid types: ${validResultTypes.join(', ')}`
      });
    }

    const newResult = await TaskResults.create({
      task_id: id,
      result_text,
      result_type: result_type || 'note',
      created_by: created_by || null,
      result_date: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Task result berhasil ditambahkan",
      data: newResult
    });
  } catch (error) {
    console.error('Error adding task result:', error);
    res.status(500).json({
      success: false,
      message: "Error adding task result",
      error: error.message
    });
  }
};

// PUT /api/tasks/task-results/:resultId - Edit hasil tertentu
export const updateTaskResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { result_text, result_type } = req.body;

    if (!result_text) {
      return res.status(400).json({
        success: false,
        message: "result_text wajib diisi"
      });
    }

    const result = await TaskResults.findByPk(resultId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Task result tidak ditemukan"
      });
    }

    // Validasi result_type jika diberikan
    const validResultTypes = ['meeting', 'call', 'email', 'visit', 'note'];
    if (result_type && !validResultTypes.includes(result_type)) {
      return res.status(400).json({
        success: false,
        message: `result_type tidak valid. Valid types: ${validResultTypes.join(', ')}`
      });
    }

    const updateData = { result_text };
    if (result_type) {
      updateData.result_type = result_type;
    }

    await result.update(updateData);

    res.status(200).json({
      success: true,
      message: "Task result berhasil diupdate",
      data: result
    });
  } catch (error) {
    console.error('Error updating task result:', error);
    res.status(500).json({
      success: false,
      message: "Error updating task result",
      error: error.message
    });
  }
};

// DELETE /api/tasks/task-results/:resultId - Hapus hasil tertentu
export const deleteTaskResult = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await TaskResults.findByPk(resultId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Task result tidak ditemukan"
      });
    }

    await result.destroy();

    res.status(200).json({
      success: true,
      message: "Task result berhasil dihapus"
    });
  } catch (error) {
    console.error('Error deleting task result:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting task result",
      error: error.message
    });
  }
};