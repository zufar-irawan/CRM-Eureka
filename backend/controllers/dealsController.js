// File: controllers/dealsController.js - Complete version with proper imports
import { Deals, DealComments, Leads, User, Companies, Contacts } from '../models/associations.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

const buildCommentTree = (comments) => {
  const commentMap = {};
  const rootComments = [];
  comments.forEach(comment => {
    commentMap[comment.id] = {
      ...comment.toJSON(),
      replies: []
    };
  });

  comments.forEach(comment => {
    if (comment.parent_id === null) {
      rootComments.push(commentMap[comment.id]);
    } else if (commentMap[comment.parent_id]) {
      commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
    }
  });

  const sortReplies = (comments) => {
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        sortReplies(comment.replies);
      }
    });
  };

  sortReplies(rootComments);
  return rootComments;
};

// GET /api/deals - Get all deals with company and contact info
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

        if (stage) {
            whereConditions.stage = stage;
        }

        if (owner) {
            whereConditions.owner = owner;
        }

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
                    attributes: ['id', 'company', 'fullname', 'email', 'phone'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'address', 'phone', 'email'],
                    required: false
                },
                {
                    model: Contacts,
                    as: 'contact',
                    attributes: ['id', 'name', 'email', 'phone', 'position'],
                    required: false,
                    include: [{
                        model: Companies,
                        as: 'company',
                        attributes: ['id', 'name'],
                        required: false
                    }]
                },
                {
                    model: DealComments,
                    as: 'comments',
                    where: { parent_id: null }, // Only get top-level comments for listing
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name']
                    }],
                    order: [['created_at', 'DESC']],
                    limit: 3,
                    required: false
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

// GET /api/deals/:id - Get single deal with full company and contact details
export const getDealById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deal = await Deals.findByPk(id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'company', 'fullname', 'email', 'phone', 'industry'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'address', 'phone', 'email', 'created_at'],
                    required: false
                },
                {
                    model: Contacts,
                    as: 'contact',
                    attributes: ['id', 'name', 'email', 'phone', 'position', 'created_at'],
                    required: false,
                    include: [{
                        model: Companies,
                        as: 'company',
                        attributes: ['id', 'name'],
                        required: false
                    }]
                },
                {
                    model: DealComments,
                    as: 'comments',
                    where: { parent_id: null }, // Only top-level comments for deal details
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name']
                        },
                        {
                            model: DealComments,
                            as: 'replies',
                            include: [{
                                model: User,
                                as: 'user',
                                attributes: ['id', 'name']
                            }],
                            order: [['created_at', 'ASC']]
                        }
                    ],
                    order: [['created_at', 'DESC']],
                    required: false
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

// POST /api/deals - Create new deal (flexible version)
export const createDeal = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { 
            title,
            value = 0,
            stage = 'proposal',
            
            // Optional lead reference (for converted deals)
            lead_id = null,
            
            // Optional direct company/contact references (backward compatibility)
            id_contact = null,
            id_company = null,
            
            // Manual company/contact creation data
            company_name,
            company_email,
            company_phone,
            company_address,
            
            contact_name,
            contact_email,
            contact_phone,
            contact_position,
            
            // Owner/creator info
            owner = 0,
            created_by = null
        } = req.body;

        // Validate required fields
        if (!title || title.trim() === '') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        let finalCompanyId = id_company;
        let finalContactId = id_contact;
        let finalOwnerId = owner;

        // SCENARIO 1: Deal from lead reference
        if (lead_id) {
            const lead = await Leads.findByPk(lead_id, { transaction });
            if (!lead) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found'
                });
            }
            
            // Use lead owner if no owner specified
            if (!finalOwnerId) {
                finalOwnerId = lead.owner || 0;
            }
        }

        // SCENARIO 2: Handle backward compatibility for id_company = 0 or id_contact = 0
        if (finalCompanyId === 0) finalCompanyId = null;
        if (finalContactId === 0) finalContactId = null;

        // SCENARIO 3: Manual company creation (if company_name provided but no id_company)
        if (company_name && company_name.trim() && !finalCompanyId) {
            // Check if company already exists
            let existingCompany = await Companies.findOne({
                where: { name: company_name.trim() },
                transaction
            });

            if (existingCompany) {
                finalCompanyId = existingCompany.id;
            } else {
                // Create new company
                const newCompany = await Companies.create({
                    name: company_name.trim(),
                    email: company_email || null,
                    phone: company_phone || null,
                    address: company_address || null,
                    created_at: new Date()
                }, { transaction });
                
                finalCompanyId = newCompany.id;
            }
        }

        // SCENARIO 4: Manual contact creation (if contact_name provided but no id_contact)
        if (contact_name && contact_name.trim() && !finalContactId) {
            // Create new contact
            const newContact = await Contacts.create({
                company_id: finalCompanyId, // Link to company if exists
                name: contact_name.trim(),
                email: contact_email || null,
                phone: contact_phone || null,
                position: contact_position || null,
                created_at: new Date()
            }, { transaction });
            
            finalContactId = newContact.id;
        }

        // Validate existing company/contact if IDs provided
        if (finalCompanyId) {
            const company = await Companies.findByPk(finalCompanyId, { transaction });
            if (!company) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }
        }

        if (finalContactId) {
            const contact = await Contacts.findByPk(finalContactId, { transaction });
            if (!contact) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Contact not found'
                });
            }
        }

        // Create the deal
        const deal = await Deals.create({
            lead_id: lead_id || null,
            title: title.trim(),
            value: parseFloat(value) || 0,
            stage,
            owner: finalOwnerId,
            id_contact: finalContactId,
            id_company: finalCompanyId,
            created_by: created_by || req.user?.id || 1,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction });

        await transaction.commit();

        // Fetch created deal with associations
        const createdDeal = await Deals.findByPk(deal.id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'company', 'fullname', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'email', 'phone', 'address'],
                    required: false
                },
                {
                    model: Contacts,
                    as: 'contact',
                    attributes: ['id', 'name', 'email', 'phone', 'position'],
                    required: false,
                    include: [{
                        model: Companies,
                        as: 'company',
                        attributes: ['id', 'name'],
                        required: false
                    }]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Deal created successfully',
            data: createdDeal
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating deal:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating deal',
            error: error.message
        });
    }
};

// POST /api/deals/from-lead/:leadId - Specific endpoint for lead conversion
export const createDealFromLead = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { leadId } = req.params;
        const { 
            title,
            value = 0,
            stage = 'proposal'
        } = req.body;

        const lead = await Leads.findByPk(leadId, { 
            transaction,
            lock: true 
        });
        
        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        if (lead.status === true) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Lead has already been converted'
            });
        }

        // Use the conversion logic from leadsController
        let companyId = null;
        let contactId = null;

        // Create/find company if lead has company info
        if (lead.company && lead.company.trim()) {
            let existingCompany = await Companies.findOne({
                where: { name: lead.company.trim() },
                transaction
            });

            if (existingCompany) {
                companyId = existingCompany.id;
            } else {
                const addressParts = [lead.street, lead.city, lead.state, lead.postal_code].filter(Boolean);
                const companyAddress = addressParts.length > 0 ? addressParts.join(', ') : null;

                const newCompany = await Companies.create({
                    name: lead.company.trim(),
                    address: companyAddress,
                    phone: lead.phone,
                    email: lead.work_email || null,
                    created_at: new Date()
                }, { transaction });

                companyId = newCompany.id;
            }
        }

        // Create contact if lead has personal info
        if (lead.fullname || lead.first_name || lead.last_name || lead.email) {
            const contactName = lead.fullname || `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
            
            if (contactName) {
                const newContact = await Contacts.create({
                    company_id: companyId,
                    name: contactName,
                    email: lead.email,
                    phone: lead.mobile || lead.phone,
                    position: lead.job_position,
                    created_at: new Date()
                }, { transaction });

                contactId = newContact.id;
            }
        }

        // Create deal
        const deal = await Deals.create({
            lead_id: leadId,
            title: title || `Deal from Lead - ${lead.fullname || lead.company}`,
            value: parseFloat(value) || 0,
            stage,
            owner: lead.owner || 0,
            id_contact: contactId,
            id_company: companyId,
            created_by: req.user?.id || 1,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction });

        // Update lead status
        await lead.update({
            stage: 'Converted',
            status: true
        }, { transaction });

        await transaction.commit();

        // Fetch complete deal data
        const completeDeal = await Deals.findByPk(deal.id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'company', 'fullname', 'email']
                },
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'email', 'phone', 'address'],
                    required: false
                },
                {
                    model: Contacts,
                    as: 'contact',
                    attributes: ['id', 'name', 'email', 'phone', 'position'],
                    required: false
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Deal created from lead successfully',
            data: completeDeal
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating deal from lead:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating deal from lead',
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

        // Validate company if provided
        if (updateData.id_company !== undefined) {
            if (updateData.id_company !== null && updateData.id_company !== 0) {
                const company = await Companies.findByPk(updateData.id_company);
                if (!company) {
                    return res.status(404).json({
                        success: false,
                        message: 'Company not found'
                    });
                }
            } else {
                updateData.id_company = null; // Convert 0 to null
            }
        }

        // Validate contact if provided
        if (updateData.id_contact !== undefined) {
            if (updateData.id_contact !== null && updateData.id_contact !== 0) {
                const contact = await Contacts.findByPk(updateData.id_contact);
                if (!contact) {
                    return res.status(404).json({
                        success: false,
                        message: 'Contact not found'
                    });
                }
            } else {
                updateData.id_contact = null; // Convert 0 to null
            }
        }

        await deal.update(updateData);

        // Fetch updated deal with associations
        const updatedDeal = await Deals.findByPk(id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'company', 'fullname', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Contacts,
                    as: 'contact',
                    attributes: ['id', 'name', 'email', 'position'],
                    required: false
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
        
        const dealId = parseInt(id);
        if (isNaN(dealId)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid deal ID" 
            });
        }

        const deal = await Deals.findByPk(dealId);
        if (!deal) {
            return res.status(404).json({ 
                success: false,
                message: "Deal not found" 
            });
        }

        const comments = await DealComments.findAll({
            where: { deal_id: dealId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }],
            order: [['created_at', 'DESC']] 
        });

        const nestedComments = buildCommentTree(comments);
        const stats = {
            total_comments: comments.length,
            top_level_comments: comments.filter(c => c.parent_id === null).length,
            total_replies: comments.filter(c => c.parent_id !== null).length
        };

        res.json({
            success: true,
            data: nestedComments,
            stats
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
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const dealId = parseInt(id);
        
        if (isNaN(dealId)) {
            await transaction.rollback();
            return res.status(400).json({ 
                success: false,
                message: "Invalid deal ID" 
            });
        }

        const { message, user_id, user_name, parent_id } = req.body;
        
        if (!message || !message.trim()) {
            await transaction.rollback();
            return res.status(400).json({ 
                success: false,
                message: "Comment message is required" 
            });
        }

        const deal = await Deals.findByPk(dealId, { transaction });
        if (!deal) {
            await transaction.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Deal not found" 
            });
        }

        let reply_level = 0;
        let parentComment = null;

        // If this is a reply to another comment
        if (parent_id) {
            parentComment = await DealComments.findOne({
                where: { 
                    id: parent_id,
                    deal_id: dealId // Ensure parent belongs to same deal
                },
                transaction
            });

            if (!parentComment) {
                await transaction.rollback();
                return res.status(400).json({ 
                    success: false,
                    message: "Parent comment not found" 
                });
            }

            reply_level = parentComment.reply_level + 1;

            if (reply_level > 3) {
                await transaction.rollback();
                return res.status(400).json({ 
                    success: false,
                    message: "Maximum reply depth exceeded. Please reply to a higher level comment." 
                });
            }
        }

        const comment = await DealComments.create({
            deal_id: dealId,
            parent_id: parent_id || null,
            reply_level,
            user_id: user_id || 1,
            user_name: user_name || 'Test User',
            message: message.trim()
        }, { transaction });

        await transaction.commit();

        const createdComment = await DealComments.findByPk(comment.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });
        
        res.status(201).json({
            success: true,
            message: parent_id ? "Reply added successfully" : "Comment added successfully",
            data: {
                ...createdComment.toJSON(),
                replies: [],
                is_reply: !!parent_id,
                parent_user: parentComment ? parentComment.user_name : null
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding deal comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding deal comment',
            error: error.message
        });
    }
};

export const getDealCommentThread = async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const dealId = parseInt(id);
        const commentIdInt = parseInt(commentId);
        
        if (isNaN(dealId) || isNaN(commentIdInt)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid deal ID or comment ID" 
            });
        }

        const comment = await DealComments.findOne({
            where: {
                id: commentIdInt,
                deal_id: dealId
            }
        });
        
        if (!comment) {
            return res.status(404).json({ 
                success: false,
                message: "Comment not found" 
            });
        }

        // Get the root comment if this is a reply
        let rootComment = comment;
        if (comment.parent_id) {
            rootComment = await DealComments.findOne({
                where: { 
                    id: comment.parent_id,
                    deal_id: dealId,
                    parent_id: null // Ensure we get the root
                }
            });
        }

        // Get all comments in this thread
        const threadComments = await DealComments.findAll({
            where: {
                deal_id: dealId,
                [Op.or]: [
                    { id: rootComment.id }, // Root comment
                    { parent_id: rootComment.id } // Direct replies
                ]
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }],
            order: [['created_at', 'ASC']]
        });

        const thread = buildCommentTree(threadComments);

        res.json({
            success: true,
            data: {
                thread: thread[0], // Should be single root comment with nested replies
                stats: {
                    total_comments: threadComments.length,
                    replies_count: threadComments.length - 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching deal comment thread:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comment thread',
            error: error.message
        });
    }
};

// DELETE /api/deals/:id/comments/:commentId - Delete deal comment
export const deleteDealComment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id, commentId } = req.params;
        const dealId = parseInt(id);
        const commentIdInt = parseInt(commentId);
        
        if (isNaN(dealId) || isNaN(commentIdInt)) {
            await transaction.rollback();
            return res.status(400).json({ 
                success: false,
                message: "Invalid deal ID or comment ID" 
            });
        }
        
        const comment = await DealComments.findOne({
            where: { 
                id: commentIdInt, 
                deal_id: dealId 
            },
            transaction
        });

        if (!comment) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        await comment.destroy({ transaction });
        await transaction.commit();

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting deal comment:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting deal comment',
            error: error.message
        });
    }
};

/*
export {
    createDeal,
    createDealFromLead,
    updateDeal,
    updateDealStage,
    deleteDeal,
    getDealComments,
    addDealComment,
    getDealCommentThread,
    deleteDealComment
};*/