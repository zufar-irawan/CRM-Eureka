// controllers/tasksController.js - Updated to support new task categories
import { Tasks } from "../models/tasks/tasksModel.js";
import { TaskComments } from "../models/tasks/tasksCommentModel.js";
import { TaskResults } from "../models/tasks/tasksResultModel.js";
import { TaskAttachments } from "../models/tasks/tasksAttachmentModel.js";
import { User } from "../models/usersModel.js";
import { Leads } from "../models/leads/leadsModel.js";
import { Op } from "sequelize";
import { sequelize } from '../config/db.js';
import { autoUpdateKPI } from "./kpiContoller.js";
import path from 'path';
import fs from 'fs';
import {
  upload,
  handleUploadError,
  getFileType,
  calculateCompressionRatio,
  deleteFile,
  UPLOAD_CONFIG
} from '../utils/uploadUtils.js';

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
    const { status, priority, category, assigned_to, created_by, lead_id, search } = req.query;
    let whereClause = {}
    const whereConditions = {}

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

    if (req.query.status_ne) {
      whereConditions.status = { [Op.ne]: req.query.status_ne };
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (category) {
      whereClause.category = category;
    }

    if (assigned_to) {
        if (req.userRoles.includes('admin')) {
            whereClause.assigned_to = assigned_to;
        } else if (req.teamMemberIds && req.teamMemberIds.includes(parseInt(assigned_to, 10))) {
            whereClause.assigned_to = assigned_to;
        } else {
            whereClause.id = -1;
        }
    } else if (req.teamMemberIds && !req.userRoles.includes('admin')) {
      whereClause.assigned_to = { [Op.in]: req.teamMemberIds };
    }

    if (created_by) {
      whereClause.created_by = created_by;
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
        },
      ];
    }

    const tasks = await Tasks.findAll({
      where: search
        ? {
          [Op.or]: [
            { title: { [Op.like]: `%${search}%` } },
            { category: { [Op.like]: `%${search}%` } },
            { code: { [Op.like]: `%${search}%` } },
            sequelize.where(sequelize.col('assignee.name'), {
              [Op.like]: `%${search}%`
            })
          ]
        }
        : whereClause,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'creator',
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
      order: [['created_at', 'DESC']],
      subQuery: false,
    });

    const transformedTasks = tasks.map(task => {
      const taskData = task.toJSON();
      return {
        ...taskData,
        assigned_user_name: taskData.assignee ? taskData.assignee.name : 'Unassigned',
        created_by_name: taskData.creator ? taskData.creator.name : 'Unknown',
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

    const created_by = req.userId || req.body.created_by;
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
      status: 'new',
      created_by: created_by || null
    }, { transaction });

    const lead = await Leads.findByPk(finalLeadId, { transaction });
    if (lead) {
        await lead.update({ owner: Number(assigned_to) }, { transaction });
    }

    await transaction.commit();

    const taskWithUser = await Tasks.findOne({
      where: { id: newTask.id },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
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
    responseData.created_by_name = responseData.creator ? responseData.creator.name : 'Unknown';

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
    const updateData = { ...req.body };
    const userId = req.userId;

    if (updateData.category) {
      const validCategories = ['Kanvasing', 'Followup', 'Penawaran', 'Kesepakatan Tarif', 'Deal DO', 'Lainnya'];
      if (!validCategories.includes(updateData.category)) {
        return res.status(400).json({
          success: false,
          message: `Category tidak valid. Valid categories: ${validCategories.join(', ')}`
        });
      }
    }

    const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };
    const task = await Tasks.findOne({ where: whereCondition });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    if (req.teamMemberIds && !req.userRoles.includes('admin') && !req.teamMemberIds.includes(task.assigned_to) && !req.teamMemberIds.includes(task.created_by)) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const oldTaskData = task.toJSON();

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

    const changes = [];
    for (const key in updateData) {
      if (oldTaskData[key] !== updateData[key] && key !== 'updated_at') {
        let oldValue = oldTaskData[key];
        let newValue = updateData[key];

        if (key === 'assigned_to') {
          const oldAssignee = await User.findByPk(oldValue);
          const newAssignee = await User.findByPk(newValue);
          oldValue = oldAssignee ? oldAssignee.name : 'Unassigned';
          newValue = newAssignee ? newAssignee.name : 'Unassigned';
        } else if (key === 'lead_id') {
          const oldLead = await Leads.findByPk(oldValue);
          const newLead = await Leads.findByPk(newValue);
          oldValue = oldLead ? oldLead.fullname || oldLead.company : 'N/A';
          newValue = newLead ? newLead.fullname || newLead.company : 'N/A';
        }

        changes.push(`- ${key} changed from "${oldValue}" to "${newValue}"`);
      }
    }

    if (changes.length > 0) {
      await TaskComments.create({
        task_id: task.id,
        comment_text: `Task details updated by ${req.userName || 'Unknown User'}:\n${changes.join('\n')}`,
        commented_by: req.userId || null
      });
    }

    if (oldTaskData.status !== 'completed' && updateData.status === 'completed') {
      await autoUpdateKPI(task.id, task.assigned_to);
      console.log(`KPI auto-updated for task ${task.code} completion`);
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

// GET /api/tasks/categories 
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
          model: User,
          as: 'creator',
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
    responseData.created_by_name = responseData.creator ? responseData.creator.name : 'Unknown';

    if (req.teamMemberIds && !req.userRoles.includes('admin') && !req.teamMemberIds.includes(task.assigned_to) && !req.teamMemberIds.includes(task.created_by)) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

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

    if (oldStatus !== status) {
      await TaskComments.create({
        task_id: task.id,
        comment_text: `Task status changed from "${oldStatus}" to "${status}" by ${req.userName || 'Unknown User'}`,
        commented_by: req.userId || null
      });
    }

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
    const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };
    const task = await Tasks.findOne({ where: whereCondition });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task tidak ditemukan"
      });
    }

    if (req.teamMemberIds && !req.userRoles.includes('admin') && !req.teamMemberIds.includes(task.assigned_to) && !req.teamMemberIds.includes(task.created_by)) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
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

// GET /api/tasks/:id/comments
export const getTaskComments = async (req, res) => {
  try {
    const { id } = req.params;

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
      include: [{
        model: User,
        as: 'commentedByUser',
        attributes: ['id', 'name']
      }],
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

// POST /api/tasks/:id/comments
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

// PUT /api/tasks/task-comments/:commentId 
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
      include: [
        {
          model: TaskAttachments,
          as: 'attachments',
          required: false,
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'email'],
              required: false
            }
          ]
        }
      ],
      order: [['result_date', 'DESC']]
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const resultsWithAttachmentUrls = results.map(result => {
      const resultJSON = result.toJSON();
      if (resultJSON.attachments && resultJSON.attachments.length > 0) {
        resultJSON.attachments = resultJSON.attachments.map(attachment => {
          return {
            ...attachment,
            download_url: `${baseUrl}/api/tasks/attachments/${attachment.id}/download`,
            view_url: attachment.file_type === 'image' ? `${baseUrl}/api/tasks/attachments/${attachment.id}/view` : null
          };
        });
      }
      return resultJSON;
    });

    res.status(200).json({
      success: true,
      data: resultsWithAttachmentUrls,
      message: `Found ${resultsWithAttachmentUrls.length} task results`
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

    await TaskComments.create({
      task_id: taskId,
      comment_text: `Task result added by ${req.userName || 'Unknown User'}: ${result_text}`,
      commented_by: req.userId || null
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

export const addTaskResultWithAttachments = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { result_text, result_type } = req.body;
    const files = req.files;
    const created_by = req.userId;

    // ✅ DEBUG: Log received data
    console.log('📥 Received request:', {
      taskId: id,
      result_text,
      result_type,
      created_by,
      filesCount: files ? files.length : 0
    });

    if (files && files.length > 0) {
      console.log('📎 Received files:');
      files.forEach((file, index) => {
        console.log(`  File ${index + 1}:`, {
          fieldname: file.fieldname,
          originalname: file.originalname, // ✅ This should show the real filename
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        });
      });
    }

    if (!result_text) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "result_text wajib diisi"
      });
    }

    let taskId;
    if (isNaN(id)) {
      const task = await Tasks.findOne({ where: { code: id }, transaction });
      if (!task) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
      taskId = task.id;
    } else {
      taskId = parseInt(id);
      const task = await Tasks.findByPk(taskId, { transaction });
      if (!task) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Task tidak ditemukan"
        });
      }
    }

    const validResultTypes = ['meeting', 'call', 'email', 'visit', 'note'];
    if (result_type && !validResultTypes.includes(result_type)) {
      await transaction.rollback();
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
    }, { transaction });

    const attachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const fileType = getFileType(file.mimetype);
        const originalSize = file.size;

        if (originalSize <= 0) {
          console.warn(`⚠️ Invalid file size for ${file.originalname}: ${originalSize}`);
          continue;
        }

        const compressedSize = originalSize;
        let compressionRatio;
        if (compressedSize >= originalSize) {
          compressionRatio = 1.0;
        } else {
          compressionRatio = compressedSize / originalSize;
        }

        const finalCompressedSize = Math.max(compressedSize, 1);
        const finalCompressionRatio = Math.max(compressionRatio, 0.01);

        console.log(`💾 Storing attachment:`, {
          original_filename: file.originalname,
          stored_filename: file.filename,
          file_path: file.path,
          file_size: originalSize,
          file_type: fileType,
          mime_type: file.mimetype,
          compressed_size: finalCompressedSize,
          compression_ratio: finalCompressionRatio.toFixed(2)
        });

        const attachment = await TaskAttachments.create({
          task_result_id: newResult.id,
          original_filename: file.originalname, 
          stored_filename: file.filename,
          file_path: file.path,
          file_size: originalSize,
          file_type: fileType,
          mime_type: file.mimetype,
          compressed_size: finalCompressedSize,
          compression_ratio: finalCompressionRatio.toFixed(2),
          upload_by: created_by
        }, { transaction });

        attachments.push(attachment);
      }
    }

    await TaskComments.create({
      task_id: taskId,
      comment_text: `Task result added with attachments by ${req.userName || 'Unknown User'}: ${result_text}`,
      commented_by: req.userId || null
    }, { transaction });

    await transaction.commit();

    const resultWithAttachments = await TaskResults.findByPk(newResult.id, {
      include: [
        {
          model: TaskAttachments,
          as: 'attachments',
          include: [
            {
              model: User,
              as: 'uploader',
              attributes: ['id', 'name', 'email'],
              required: false
            }
          ]
        }
      ]
    });

    console.log('✅ Task result created with attachments:', {
      resultId: newResult.id,
      attachmentsCount: attachments.length,
      attachmentNames: attachments.map(a => a.original_filename)
    });

    res.status(201).json({
      success: true,
      message: `Task result berhasil ditambahkan${attachments.length > 0 ? ` dengan ${attachments.length} attachment(s)` : ''}`,
      data: resultWithAttachments
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error adding task result with attachments:', error);

    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding task result with attachments",
      error: error.message
    });
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await TaskAttachments.findByPk(attachmentId, {
      include: [
        {
          model: TaskResults,
          as: 'task_result',
          include: [
            {
              model: Tasks,
              as: 'task',
              include: [
                {
                  model: Leads,
                  as: 'lead',
                  attributes: ['code', 'company']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment tidak ditemukan"
      });
    }

    const filePath = path.resolve(attachment.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan di server"
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_filename}"`);
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Length', attachment.file_size);

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error reading file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error reading file"
        });
      }
    });

  } catch (error) {
    console.error('Error downloading attachment:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error downloading attachment",
        error: error.message
      });
    }
  }
};

// ===== NEW: GET /api/tasks/attachments/:attachmentId/view
export const viewAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await TaskAttachments.findByPk(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment tidak ditemukan"
      });
    }

    const filePath = path.resolve(attachment.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File tidak ditemukan di server"
      });
    }

    // Set proper headers for viewing
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Length', attachment.file_size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); 

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error reading file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error reading file"
        });
      }
    });

  } catch (error) {
    console.error('Error viewing attachment:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error viewing attachment",
        error: error.message
      });
    }
  }
};

//DELETE /api/tasks/attachments/:attachmentId
export const deleteAttachment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { attachmentId } = req.params;

    const attachment = await TaskAttachments.findByPk(attachmentId, { transaction });
    if (!attachment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Attachment tidak ditemukan"
      });
    }

    const filePath = attachment.file_path;

    // Delete from database
    await attachment.destroy({ transaction });

    await transaction.commit();

    // Delete physical file
    await deleteFile(filePath);

    res.status(200).json({
      success: true,
      message: "Attachment berhasil dihapus"
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting attachment",
      error: error.message
    });
  }
};

// ===== NEW: GET /api/tasks/:id/attachments - Get all attachments for a task =====
export const getTaskAttachments = async (req, res) => {
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

    const attachments = await TaskAttachments.findAll({
      include: [
        { 
          model: TaskResults,
          as: 'task_result',
          where: { task_id: taskId },
          attributes: ['id', 'result_text', 'result_type', 'result_date'],
          required: true
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ],
      order: [['uploaded_at', 'DESC']]
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const attachmentsWithUrls = attachments.map(attachment => {
      const attachmentData = attachment.toJSON();
      return {
        ...attachmentData,
        download_url: `${baseUrl}/api/tasks/attachments/${attachment.id}/download`,
        view_url: attachment.file_type === 'image' ? `${baseUrl}/api/tasks/attachments/${attachment.id}/view` : null
      };
    });

    res.status(200).json({
      success: true,
      data: attachmentsWithUrls,
      message: `Found ${attachments.length} attachments for this task`
    });
  } catch (error) {
    console.error('Error fetching task attachments:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching task attachments",
      error: error.message
    });
  }
};

export const uploadMiddleware = upload.array('attachments', 5);
export { handleUploadError };
