// controllers/tasksController.js - Updated to support new task categories
import { Tasks } from "../models/tasks/tasksModel.js";
import { TaskComments } from "../models/tasks/tasksCommentModel.js";
import { TaskResults } from "../models/tasks/tasksResultModel.js";
import { User } from "../models/usersModel.js";
import { Leads } from "../models/leads/leadsModel.js";
import { Op } from "sequelize";
import { sequelize } from '../config/db.js';
import { autoUpdateKPI } from "./kpiContoller.js";

const generateTaskCode = async (transaction) => {
    const lastTask = await Tasks.findOne({
        where: {
            code: {
                [Op.like]: 'TK-%'
            }
        },
        order: [['id', 'DESC']],
        transaction
    });

    let nextNumber = 1;
    if (lastTask && lastTask.code) {
        const lastNumber = parseInt(lastTask.code.split('-')[1]);
        nextNumber = lastNumber + 1;
    }

    return `TK-${nextNumber.toString().padStart(3, '0')}`;
};

export const getTasks = async (req, res) => {
  try {
    const { status, priority, category, assigned_to, lead_id, search, } = req.query;
    let whereClause = {};

    // Filter berdasarkan lead_id (PENTING untuk detail lead)
    if (lead_id) {
      if (isNaN(lead_id)) {
        const lead = await Leads.findOne({ where: { code: lead_id } });
        if (lead) {
          whereClause.lead_id = lead.id;
        } else {
          return res.status(404).json({
            success: false,
            message: "Lead not found"
          });
        }
      } else {
        whereClause.lead_id = parseInt(lead_id);
      }
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
        },
        {
          code: {
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
          model: Leads,
          as: 'lead',
          attributes: ['id', 'code', 'company', 'fullname'],
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

// POST /api/tasks - Create task
export const createTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  
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
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "lead_id, assigned_to, dan title wajib diisi"
      });
    }

    // 📝 UPDATED: Validasi kategori yang diizinkan
    const validCategories = ['Kanvasing', 'Followup', 'Penawaran', 'Kesepakatan Tarif', 'Deal DO', 'Lainnya'];
    if (category && !validCategories.includes(category)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Category tidak valid. Valid categories: ${validCategories.join(', ')}`
      });
    }

    let finalLeadId;
    if (isNaN(lead_id)) {
      const lead = await Leads.findOne({ where: { code: lead_id }, transaction });
      if (!lead) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Lead not found"
        });
      }
      finalLeadId = lead.id;
    } else {
      finalLeadId = parseInt(lead_id);
      const lead = await Leads.findByPk(finalLeadId, { transaction });
      if (!lead) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Lead not found"
        });
      }
    }

    // Generate kode task otomatis
    const taskCode = await generateTaskCode(transaction);

    const newTask = await Tasks.create({
      code: taskCode,
      lead_id: finalLeadId,
      assigned_to: Number(assigned_to),
      title,
      description,
      category: category || 'Lainnya',
      due_date,
      priority: priority || 'medium',
      status: 'new'
    }, { transaction });

    await transaction.commit();

    // Ambil data task dengan include user untuk response
    const taskWithUser = await Tasks.findOne({
      where: { id: newTask.id },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Leads,
          as: 'lead',
          attributes: ['id', 'code', 'company', 'fullname']
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
    await transaction.rollback();
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

    // 📝 UPDATED: Validasi kategori jika diupdate
    if (updateData.category) {
      const validCategories = ['Kanvasing', 'Followup', 'Penawaran', 'Kesepakatan Tarif', 'Deal DO', 'Lainnya'];
      if (!validCategories.includes(updateData.category)) {
        return res.status(400).json({
          success: false,
          message: `Category tidak valid. Valid categories: ${validCategories.join(', ')}`
        });
      }
    }

    // Cek apakah id adalah kode atau ID numerik
    const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

    const task = await Tasks.findOne({ where: whereCondition });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    // Simpan status lama untuk pengecekan perubahan
    const oldStatus = task.status;

    // Jika ada lead_id yang akan diupdate, validasi dulu
    if (updateData.lead_id) {
      if (isNaN(updateData.lead_id)) {
        const lead = await Leads.findOne({ where: { code: updateData.lead_id } });
        if (!lead) {
          return res.status(404).json({
            success: false,
            message: "Lead not found"
          });
        }
        updateData.lead_id = lead.id;
      } else {
        const lead = await Leads.findByPk(parseInt(updateData.lead_id));
        if (!lead) {
          return res.status(404).json({
            success: false,
            message: "Lead not found"
          });
        }
        updateData.lead_id = parseInt(updateData.lead_id);
      }
    }

    await task.update(updateData);

    // 🔥 INTEGRASI KPI: Auto-update KPI jika task status berubah menjadi completed
    if (oldStatus !== 'completed' && updateData.status === 'completed') {
      await autoUpdateKPI(task.id, task.assigned_to);
      console.log(`📊 KPI auto-updated for task ${task.code} completion`);
    }

    // Ambil data terbaru dengan include
    const updatedTask = await Tasks.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Leads,
          as: 'lead',
          attributes: ['id', 'code', 'company', 'fullname']
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

// 📝 GET /api/tasks/categories - Mendapatkan daftar kategori yang valid
export const getTaskCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'Kanvasing', label: 'Kanvasing' },
      { value: 'Followup', label: 'Follow Up' },
      { value: 'Penawaran', label: 'Penawaran' },
      { value: 'Kesepakatan Tarif', label: 'Kesepakatan Tarif' },
      { value: 'Deal DO', label: 'Deal DO' },
      { value: 'Lainnya', label: 'Lainnya' }
    ];

    res.status(200).json({
      success: true,
      data: categories,
      message: `Found ${categories.length} task categories`
    });
  } catch (error) {
    console.error('Error fetching task categories:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching task categories",
      error: error.message
    });
  }
};

// GET /api/tasks/:id - Detail task
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah id adalah kode atau ID numerik
    const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

    const task = await Tasks.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Leads,
          as: 'lead',
          attributes: ['id', 'code', 'company', 'fullname']
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

    const validStatuses = ['new', 'pending', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid. Valid statuses: " + validStatuses.join(', ')
      });
    }
    const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

    const task = await Tasks.findOne({ where: whereCondition });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    const oldStatus = task.status;
    await task.update({ status });

    if (oldStatus !== 'completed' && status === 'completed') {
      await autoUpdateKPI(task.id, task.assigned_to);
      console.log(`📊 KPI auto-updated for task ${task.code} status change to completed`);
    }

    const updatedTask = await Tasks.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Leads,
          as: 'lead',
          attributes: ['id', 'code', 'company', 'fullname']
        }
      ]
    });

    const responseData = updatedTask.toJSON();
    responseData.assigned_user_name = responseData.assignee ? responseData.assignee.name : 'Unassigned';

    console.log(`✅ Task ${task.code} (ID: ${task.id}) status updated from "${oldStatus}" to "${status}"`);

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

    // Cek apakah id adalah kode atau ID numerik
    const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

    const task = await Tasks.findOne({ where: whereCondition });
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

// GET /api/tasks/:id/comments - Ambil semua komentar pada task tertentu
export const getTaskComments = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah id adalah kode atau ID numerik
    let taskId;
    if (isNaN(id)) {
      const task = await Tasks.findOne({ where: { code: id } });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
      taskId = task.id;
    } else {
      taskId = parseInt(id);
      const task = await Tasks.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
    }

    const comments = await TaskComments.findAll({
      where: { task_id: taskId },
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

    // Cek apakah id adalah kode atau ID numerik
    let taskId;
    if (isNaN(id)) {
      const task = await Tasks.findOne({ where: { code: id } });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
      taskId = task.id;
    } else {
      taskId = parseInt(id);
      const task = await Tasks.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
    }

    const newComment = await TaskComments.create({
      task_id: taskId,
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

    // Cek apakah id adalah kode atau ID numerik
    let taskId;
    if (isNaN(id)) {
      const task = await Tasks.findOne({ where: { code: id } });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
      taskId = task.id;
    } else {
      taskId = parseInt(id);
      const task = await Tasks.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
    }

    const results = await TaskResults.findAll({
      where: { task_id: taskId },
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

    // Cek apakah id adalah kode atau ID numerik
    let taskId;
    if (isNaN(id)) {
      const task = await Tasks.findOne({ where: { code: id } });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
      taskId = task.id;
    } else {
      taskId = parseInt(id);
      const task = await Tasks.findByPk(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
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
      task_id: taskId,
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

// PUT /api/tasks/task-results/:resultId
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

// DELETE /api/tasks/task-results/:resultId 
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