import { Deals, DealComments, Leads, User, Companies, Contacts } from '../models/associations.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

const generateDealCode = async (transaction) => {
    const lastDeal = await Deals.findOne({
        where: {
            code: {
                [Op.like]: 'DL-%'
            }
        },
        order: [['id', 'DESC']],
        transaction
    });

    let nextNumber = 1;
    if (lastDeal && lastDeal.code) {
        const lastNumber = parseInt(lastDeal.code.split('-')[1]);
        nextNumber = lastNumber + 1;
    }

    return `DL-${nextNumber.toString().padStart(3, '0')}`;
};

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
        if (req.query.stage_ne) {
            whereConditions.stage = { [Op.ne]: req.query.stage_ne };
        }
        if (owner) {
            whereConditions.owner = owner;
        }
        if (search) {
            whereConditions[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { stage: { [Op.like]: `%${search}%` } },
                { fullname: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } }
            ];
        }

        const deals = await Deals.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'code', 'company', 'fullname', 'email', 'phone'],
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
                    where: { parent_id: null },
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

        // Cek apakah id adalah kode atau ID numerik
        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const deal = await Deals.findOne({
            where: whereCondition,
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'code', 'company', 'fullname', 'email', 'phone', 'industry'],
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
                    where: { parent_id: null },
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
            lead_id = null,
            id_contact = null,
            id_company = null,
            company_name,
            company_email,
            company_phone,
            company_address,
            contact_name,
            contact_email,
            contact_phone,
            contact_position,
            owner = 0,
            created_by = null
        } = req.body;

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
        let finalCreatedBy = created_by || req.user?.id || 1;

        if (lead_id) {
            const leadWhereCondition = isNaN(lead_id) ? { code: lead_id } : { id: parseInt(lead_id) };
            const lead = await Leads.findOne({ 
                where: leadWhereCondition,
                transaction 
            });
            
            if (!lead) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found'
                });
            }

            if (!finalOwnerId) {
                finalOwnerId = lead.owner || 0;
            }
        }

        if (finalCompanyId === 0) finalCompanyId = null;
        if (finalContactId === 0) finalContactId = null;

        if (company_name && company_name.trim() && !finalCompanyId) {
            let existingCompany = await Companies.findOne({
                where: { name: company_name.trim() },
                transaction
            });

            if (existingCompany) {
                finalCompanyId = existingCompany.id;
            } else {
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

        if (contact_name && contact_name.trim() && !finalContactId) {
            const newContact = await Contacts.create({
                company_id: finalCompanyId,
                name: contact_name.trim(),
                email: contact_email || null,
                phone: contact_phone || null,
                position: contact_position || null,
                created_at: new Date()
            }, { transaction });

            finalContactId = newContact.id;
        }

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

        const dealCode = await generateDealCode(transaction);

        const deal = await Deals.create({
            code: dealCode,
            lead_id: lead_id || null,
            title: title.trim(),
            value: parseFloat(value) || 0,
            stage,
            owner: finalOwnerId,
            id_contact: finalContactId,
            id_company: finalCompanyId,
            created_by: finalCreatedBy,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction });

        await transaction.commit();


        const createdDeal = await Deals.findByPk(deal.id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'code', 'company', 'fullname', 'email'],
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

// PUT /api/deals/:id - Update deal with KPI integration
export const updateDeal = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        updateData.updated_at = new Date();

        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const deal = await Deals.findOne({ 
            where: whereCondition,
            transaction,
            lock: true
        });
        
        if (!deal) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        const oldStage = deal.stage;
        if (updateData.lead_id && updateData.lead_id !== deal.lead_id) {
            const leadWhereCondition = isNaN(updateData.lead_id) ? { code: updateData.lead_id } : { id: parseInt(updateData.lead_id) };
            const lead = await Leads.findOne({ where: leadWhereCondition, transaction });
            if (!lead) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Lead not found'
                });
            }
            updateData.lead_id = lead.id;
        }

        if (updateData.id_company !== undefined) {
            if (updateData.id_company !== null && updateData.id_company !== 0) {
                const company = await Companies.findByPk(updateData.id_company, { transaction });
                if (!company) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false,
                        message: 'Company not found'
                    });
                }
            } else {
                updateData.id_company = null;
            }
        }

        if (updateData.id_contact !== undefined) {
            if (updateData.id_contact !== null && updateData.id_contact !== 0) {
                const contact = await Contacts.findByPk(updateData.id_contact, { transaction });
                if (!contact) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false,
                        message: 'Contact not found'
                    });
                }
            } else {
                updateData.id_contact = null;
            }
        }

        await deal.update(updateData, { transaction });
        await transaction.commit();


        const updatedDeal = await Deals.findOne({
            where: whereCondition,
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'code', 'company', 'fullname', 'email'],
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
        await transaction.rollback();
        console.error('Error updating deal:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating deal',
            error: error.message
        });
    }
};

// PUT /api/deals/:id/updateStage - Update deal stage/status with KPI integration
export const updateDealStage = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { stage } = req.body;

        const validStages = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
        if (!stage || !validStages.includes(stage)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Stage tidak valid. Valid stages: ' + validStages.join(', ')
            });
        }

        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const deal = await Deals.findOne({ 
            where: whereCondition,
            transaction,
            lock: true
        });
        
        if (!deal) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Deal not found'
            });
        }

        const oldStage = deal.stage;
        
        if (oldStage === stage) {
            await transaction.rollback();
            return res.status(200).json({
                success: true,
                message: 'No stage change detected',
                data: {
                    deal_id: deal.id,
                    deal_code: deal.code,
                    stage: stage,
                    updated_at: deal.updated_at
                }
            });
        }

        await deal.update({
            stage,
            updated_at: new Date()
        }, { transaction });

        await transaction.commit();


        console.log(`Deal ${deal.code} (ID: ${deal.id}) stage updated from "${oldStage}" to "${stage}"`);

        res.json({
            success: true,
            message: 'Deal stage updated successfully',
            data: { 
                id: deal.id, 
                code: deal.code, 
                stage: deal.stage,
                old_stage: oldStage,
                updated_at: new Date()
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating deal stage:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating deal stage',
            error: error.message
        });
    }
};

// Sisa fungsi lainnya tetap sama...
// POST /api/deals/from-lead/:leadId, deleteDeal, getDealComments, addDealComment, etc.

export const createDealFromLead = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { leadId } = req.params;
        const {
            title,
            value = 0,
            stage = 'proposal'
        } = req.body;

        const leadWhereCondition = isNaN(leadId) ? { code: leadId } : { id: parseInt(leadId) };

        const lead = await Leads.findOne({
            where: leadWhereCondition,
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

        let companyId = null;
        let contactId = null;

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

        await lead.update({
            stage: 'Converted',
            status: true
        }, { transaction });

        const dealCode = await generateDealCode(transaction);
        const createdBy = req.user?.id || 1;

        const deal = await Deals.create({
            code: dealCode,
            lead_id: lead.id,
            title: title || `Deal from Lead - ${lead.fullname || lead.company}`,
            value: parseFloat(value) || 0,
            stage,
            owner: lead.owner || 0,
            id_contact: contactId,
            id_company: companyId,
            created_by: createdBy,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction });

        await transaction.commit();
        
        const completeDeal = await Deals.findByPk(deal.id, {
            include: [
                {
                    model: Leads,
                    as: 'lead',
                    attributes: ['id', 'code', 'company', 'fullname', 'email']
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

// DELETE /api/deals/:id - Delete deal
export const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;

        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const deal = await Deals.findOne({ where: whereCondition });
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
        
        let dealId;
        if (isNaN(id)) {
            const deal = await Deals.findOne({ where: { code: id } });
            if (!deal) {
                return res.status(404).json({
                    success: false,
                    message: "Deal not found"
                });
            }
            dealId = deal.id;
        } else {
            dealId = parseInt(id);
            const deal = await Deals.findByPk(dealId);
            if (!deal) {
                return res.status(404).json({
                    success: false,
                    message: "Deal not found"
                });
            }
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
        
        let dealId;
        if (isNaN(id)) {
            const deal = await Deals.findOne({ where: { code: id }, transaction });
            if (!deal) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Deal not found"
                });
            }
            dealId = deal.id;
        } else {
            dealId = parseInt(id);
            const deal = await Deals.findByPk(dealId, { transaction });
            if (!deal) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Deal not found"
                });
            }
        }

        const { message, user_id, user_name, parent_id } = req.body;

        if (!message || !message.trim()) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Comment message is required"
            });
        }

        let reply_level = 0;
        let parentComment = null;

        if (parent_id) {
            parentComment = await DealComments.findOne({
                where: {
                    id: parent_id,
                    deal_id: dealId
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
        
        let dealId;
        if (isNaN(id)) {
            const deal = await Deals.findOne({ where: { code: id } });
            if (!deal) {
                return res.status(404).json({
                    success: false,
                    message: "Deal not found"
                });
            }
            dealId = deal.id;
        } else {
            dealId = parseInt(id);
        }
        
        const commentIdInt = parseInt(commentId);

        if (isNaN(commentIdInt)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID"
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

        let rootComment = comment;
        if (comment.parent_id) {
            rootComment = await DealComments.findOne({
                where: {
                    id: comment.parent_id,
                    deal_id: dealId,
                    parent_id: null
                }
            });
        }

        const threadComments = await DealComments.findAll({
            where: {
                deal_id: dealId,
                [Op.or]: [
                    { id: rootComment.id },
                    { parent_id: rootComment.id }
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
                thread: thread[0],
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
        
        let dealId;
        if (isNaN(id)) {
            const deal = await Deals.findOne({ where: { code: id }, transaction });
            if (!deal) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Deal not found"
                });
            }
            dealId = deal.id;
        } else {
            dealId = parseInt(id);
        }
        
        const commentIdInt = parseInt(commentId);

        if (isNaN(commentIdInt)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID"
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