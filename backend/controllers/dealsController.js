// File: controllers/dealsController.js
import { Deals, DealComments, Leads, User } from '../models/associations.js';
import { Op } from 'sequelize';

// GET /api/deals - Get all deals
export const getAllDeals = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            stage, 
            owner, 
            search,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = {};

        // Filter by stage
        if (stage) {
            whereConditions.stage = stage;
        }

        // Filter by owner
        if (owner) {
            whereConditions.owner = owner;
        }

        // Search functionality
        if (search) {
            whereConditions[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { stage: { [Op.like]: `%${search}%` } }
            ];
        }

        const deals = await Deals.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'company', 'fullname', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: DealComments,
                    as: 'comments',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name']
                    }],
                    order: [['created_at', 'DESC']],
                    limit: 3 // Latest 3 comments only
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]],
            distinct: true
        });

        res.json({
            success: true,
            data: deals.rows,
            pagination: {
                total: deals.count,
                totalPages: Math.ceil(deals.count / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching deals',
            error: error.message
        });
    }
};

// GET /api/deals/:id - Get single deal
export const getDealById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deal = await Deals.findByPk(id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'company', 'fullname', 'email', 'phone', 'industry']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: DealComments,
                    as: 'comments',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name']
                    }],
                    order: [['created_at', 'DESC']]
                }
            ]
        });

        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        res.json({
            success: true,
            data: deal
        });
    } catch (error) {
        console.error('Error fetching deal:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching deal',
            error: error.message
        });
    }
};

// POST /api/deals - Create new deal
export const createDeal = async (req, res) => {
    try {
        const { 
            lead_id, 
            title, 
            value, 
            stage = 'proposal_sent', 
            owner = 0,
            id_contact = 0,
            id_company = 0
        } = req.body;

        // Validate required fields
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Check if lead exists (if lead_id provided)
        if (lead_id) {
            const lead = await Leads.findByPk(lead_id);
            if (!lead) {
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found'
                });
            }
        }

        const deal = await Deals.create({
            lead_id,
            title,
            value,
            stage,
            owner,
            id_contact,
            id_company,
            created_by: req.user?.id || 1, // Assuming auth middleware provides user
            created_at: new Date(),
            updated_at: new Date()
        });

        // Fetch created deal with associations
        const createdDeal = await Deals.findByPk(deal.id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'company', 'fullname', 'email']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Deal created successfully',
            data: createdDeal
        });
    } catch (error) {
        console.error('Error creating deal:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating deal',
            error: error.message
        });
    }
};

// PUT /api/deals/:id - Update deal
export const updateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        // Add updated_at timestamp
        updateData.updated_at = new Date();

        const deal = await Deals.findByPk(id);
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        // Validate lead_id if provided
        if (updateData.lead_id && updateData.lead_id !== deal.lead_id) {
            const lead = await Leads.findByPk(updateData.lead_id);
            if (!lead) {
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found'
                });
            }
        }

        await deal.update(updateData);

        // Fetch updated deal with associations
        const updatedDeal = await Deals.findByPk(id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'company', 'fullname', 'email']
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Deal updated successfully',
            data: updatedDeal
        });
    } catch (error) {
        console.error('Error updating deal:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating deal',
            error: error.message
        });
    }
};

// PUT /api/deals/:id/updateStage - Update deal stage/status
export const updateDealStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;

        if (!stage) {
            return res.status(400).json({
                success: false,
                message: 'Stage is required'
            });
        }

        const deal = await Deals.findByPk(id);
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        await deal.update({ 
            stage, 
            updated_at: new Date() 
        });

        res.json({
            success: true,
            message: 'Deal stage updated successfully',
            data: { id: deal.id, stage: deal.stage }
        });
    } catch (error) {
        console.error('Error updating deal stage:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating deal stage',
            error: error.message
        });
    }
};

// DELETE /api/deals/:id - Delete deal
export const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deal = await Deals.findByPk(id);
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        await deal.destroy();

        res.json({
            success: true,
            message: 'Deal deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting deal:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting deal',
            error: error.message
        });
    }
};

// GET /api/deals/:id/comments - Get all comments for a deal
export const getDealComments = async (req, res) => {
    try {
        const { id } = req.params;
        
        const comments = await DealComments.findAll({
            where: { deal_id: id },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching deal comments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching deal comments',
            error: error.message
        });
    }
};

// POST /api/deals/:id/comments - Add comment to deal
export const addDealComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Check if deal exists
        const deal = await Deals.findByPk(id);
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        // Get user info (assuming from auth middleware)
        const userId = req.user?.id || 1;
        const userName = req.user?.name || 'Unknown User';

        const comment = await DealComments.create({
            deal_id: id,
            user_id: userId,
            user_name: userName,
            message,
            created_at: new Date()
        });

        // Fetch created comment with user info
        const createdComment = await DealComments.findByPk(comment.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: createdComment
        });
    } catch (error) {
        console.error('Error adding deal comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding deal comment',
            error: error.message
        });
    }
};

// DELETE /api/deals/:id/comments/:commentId - Delete deal comment
export const deleteDealComment = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        
        const comment = await DealComments.findOne({
            where: { 
                id: commentId, 
                deal_id: id 
            }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        await comment.destroy();

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting deal comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting deal comment',
            error: error.message
        });
    }
};