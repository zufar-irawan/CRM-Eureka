import { Leads } from "../models/leads/leadsModel.js";
import { LeadComments } from "../models/leads/leadsCommentModel.js";
import { Tasks } from "../models/tasks/tasksModel.js";
import { User } from "../models/usersModel.js";
import { Deals } from "../models/deals/dealsModel.js";
import { Companies } from "../models/companies/companiesModel.js";
import { Contacts } from "../models/contacts/contactsModel.js";
import { Op, where } from 'sequelize';
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

// Fungsi untuk generate kode leads otomatis
const generateLeadCode = async (transaction) => {
    const lastLead = await Leads.findOne({
        where: {
            code: {
                [Op.like]: 'LD-%'
            }
        },
        order: [['id', 'DESC']],
        transaction
    });

    let nextNumber = 1;
    if (lastLead && lastLead.code) {
        const lastNumber = parseInt(lastLead.code.split('-')[1]);
        nextNumber = lastNumber + 1;
    }

    return `LD-${nextNumber.toString().padStart(3, '0')}`;
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

export const getLeads = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            stage,
            id,
            rating,
            owner,
            search,
            sortBy,
            sortOrder,
            status = 0
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = {};

        if (id) {
            whereClause.id = id
        }
        if (req.teamMemberIds && !req.userRoles.includes('admin')) {
            whereClause.owner = { [Op.in]: req.teamMemberIds };
        }
        if (status !== undefined && status !== '') {
            whereClause.status = status === '1' || status === 'true' || status === true;
        }
        if (stage) {    
            whereClause.stage = stage;
        }
        if (rating) {
            whereClause.rating = rating;
        }
        if (owner) {
            if (req.userRoles.includes('admin')) {
                whereClause.owner = owner;
            } else if (req.teamMemberIds && req.teamMemberIds.includes(parseInt(owner, 10))) {
                whereClause.owner = owner;
            } else {
                whereClause.id = -1;
            }
        }
        if (search) {
            whereClause[Op.or] = [
                { company: { [Op.like]: `%${search}%` } },
                { fullname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } }
            ];
        }
        const order = []
        if (sortBy) {
            order.push([sortBy, sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC"])
        }

        const { count, rows } = await Leads.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: order.length ? order : [['created_at', 'DESC']]
        });

        res.status(200).json({
            leads: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getLeadById = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah id adalah kode atau ID numerik
        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const response = await Leads.findOne({
            where: whereCondition
        });

        if (!response) {
            return res.status(404).json({ message: "Lead not found" });
        }

        if (req.teamMemberIds && !req.userRoles.includes('admin') && !req.teamMemberIds.includes(response.owner)) {
            return res.status(403).json({ message: "Akses ditolak" });
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching lead by ID:', error);
        res.status(500).json({ message: error.message });
    }
};

export const createLead = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            owner,
            company,
            title,
            first_name,
            last_name,
            job_position,
            email,
            work_email,
            phone,
            mobile,
            fax,
            website,
            industry,
            number_of_employees,
            lead_source,
            stage,
            rating,
            street,
            city,
            state,
            postal_code,
            country,
            description
        } = req.body;

        if (!first_name && !last_name) {
            await transaction.rollback();
            return res.status(400).json({
                message: "At least a name is required"
            });
        }

        // Generate kode otomatis
        const leadCode = await generateLeadCode(transaction);

        const newLead = await Leads.create({
            code: leadCode, // Tambah kode otomatis
            owner: req.body.assigned_to || owner,
            company,
            title: title || 'Mr',
            first_name,
            last_name,
            job_position,
            email,
            work_email,
            phone,
            mobile,
            fax,
            website,
            industry,
            number_of_employees,
            lead_source,
            stage: stage || 'New',
            rating,
            street,
            city,
            state,
            postal_code,
            country,
            description,
            status: false
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: "Lead created successfully",
            lead: newLead
        });
    } catch (error) {
        await transaction.rollback();

        console.error('Error creating lead:', error);

        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                message: "Validation error",
                errors: validationErrors
            });
        }
        res.status(500).json({ message: error.message });
    }
}

export const updateLead = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        // Cek apakah id adalah kode atau ID numerik
        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const lead = await Leads.findOne({
            where: whereCondition,
            transaction
        });

        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }

        if (req.teamMemberIds && !req.userRoles.includes('admin') && !req.teamMemberIds.includes(lead.owner)) {
            await transaction.rollback();
            return res.status(403).json({ message: "Akses ditolak" });
        }

        const {
            owner,
            company,
            title,
            first_name,
            last_name,
            job_position,
            email,
            work_email,
            phone,
            mobile,
            fax,
            website,
            industry,
            number_of_employees,
            lead_source,
            stage,
            rating,
            street,
            city,
            state,
            postal_code,
            country,
            description
        } = req.body;

        const changes = [];
        const updatedFields = {
            owner: owner !== undefined ? owner : lead.owner,
            company: company !== undefined ? company : lead.company,
            title: title !== undefined ? title : lead.title,
            first_name: first_name !== undefined ? first_name : lead.first_name,
            last_name: last_name !== undefined ? last_name : lead.last_name,
            job_position: job_position !== undefined ? job_position : lead.job_position,
            email: email !== undefined ? email : lead.email,
            work_email: work_email !== undefined ? work_email : lead.work_email,
            phone: phone !== undefined ? phone : lead.phone,
            mobile: mobile !== undefined ? mobile : lead.mobile,
            fax: fax !== undefined ? fax : lead.fax,
            website: website !== undefined ? website : lead.website,
            industry: industry !== undefined ? industry : lead.industry,
            number_of_employees: number_of_employees !== undefined ? number_of_employees : lead.number_of_employees,
            lead_source: lead_source !== undefined ? lead_source : lead.lead_source,
            stage: stage !== undefined ? stage : lead.stage,
            rating: rating !== undefined ? rating : lead.rating,
            street: street !== undefined ? street : lead.street,
            city: city !== undefined ? city : lead.city,
            state: state !== undefined ? state : lead.state,
            postal_code: postal_code !== undefined ? postal_code : lead.postal_code,
            country: country !== undefined ? country : lead.country,
            description: description !== undefined ? description : lead.description
        };

        for (const key in updatedFields) {
            if (lead[key] !== updatedFields[key] && key !== 'stage' && key !== 'updated_at') {
                changes.push(`- ${key} has been updated`);
            }
        }

        if (lead.stage !== updatedFields.stage) {
            changes.push(`Stage changed from ${lead.stage} to ${updatedFields.stage}`);
        }

        await lead.update(updatedFields, { transaction });

        if (changes.length > 0) {
            await LeadComments.create({
                lead_id: lead.id,
                user_id: req.userId,
                user_name: req.userName,
                message: `Lead details updated:\n${changes.join('\n')}`,
            }, { transaction });
        }
        await transaction.commit();

        const updatedLead = await Leads.findOne({ where: whereCondition });
        res.status(200).json({
            message: "Lead updated successfully",
            lead: updatedLead
        });
    } catch (error) {
        await transaction.rollback();

        console.error('Error updating lead:', error);

        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                message: "Validation error",
                errors: validationErrors
            });
        }

        res.status(500).json({ message: error.message });
    }
};

export const deleteLead = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };
        const lead = await Leads.findOne({
            where: whereCondition,
            transaction
        });

        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }
        
        if (req.teamMemberIds && !req.userRoles.includes('admin') && !req.teamMemberIds.includes(lead.owner)) {
            await transaction.rollback();
            return res.status(403).json({ message: "Akses ditolak" });
        }

        await lead.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({
            message: "Lead deleted successfully"
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting lead:', error);
        res.status(500).json({ message: error.message });
    }
};

export const convertLead = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        // Check if id is code or numeric ID
        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const { dealTitle, dealValue, dealStage } = req.body;

        console.log('[DEBUG] Received convert request:', {
            id,
            dealTitle,
            dealValue,
            dealStage,
            valueType: typeof dealValue
        });

        const lead = await Leads.findOne({
            where: whereCondition,
            transaction,
            lock: true
        });

        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        if (lead.status === true) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Lead has already been converted to deal"
            });
        }

        let companyId = null;
        let contactId = null;

        // Create company if exists
        if (lead.company && lead.company.trim()) {
            let existingCompany = await Companies.findOne({
                where: {
                    name: lead.company.trim()
                },
                transaction
            });

            if (existingCompany) {
                companyId = existingCompany.id;
                console.log('[DEBUG] Using existing company:', companyId);

                // Update existing company with lead data if needed
                const updateData = {};
                if (lead.phone && !existingCompany.phone) updateData.phone = lead.phone;
                if (lead.work_email && !existingCompany.email) updateData.email = lead.work_email;

                if (lead.street || lead.city || lead.state || lead.postal_code) {
                    const addressParts = [lead.street, lead.city, lead.state, lead.postal_code].filter(Boolean);
                    if (addressParts.length > 0 && !existingCompany.address) {
                        updateData.address = addressParts.join(', ');
                    }
                }

                if (Object.keys(updateData).length > 0) {
                    await existingCompany.update(updateData, { transaction });
                }
            } else { 
                // Create new company
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
                console.log('[DEBUG] Created new company:', companyId);
            }
        }

        // Create contact if exists
        if (lead.fullname || lead.first_name || lead.last_name || lead.email) {
            const contactName = lead.fullname || `${lead.first_name || ''} ${lead.last_name || ''}`.trim();

            if (contactName) {
                let existingContact = null;

                // Check for existing contact by email or name+company
                if (lead.email) {
                    existingContact = await Contacts.findOne({
                        where: {
                            [Op.or]: [
                                { email: lead.email },
                                {
                                    name: contactName,
                                    company_id: companyId
                                }
                            ]
                        },
                        transaction
                    });
                } else {
                    existingContact = await Contacts.findOne({
                        where: {
                            name: contactName,
                            company_id: companyId
                        },
                        transaction
                    });
                }

                if (existingContact) {
                    contactId = existingContact.id;
                    console.log('[DEBUG] Using existing contact:', contactId);

                    // Update existing contact with lead data if needed
                    const updateData = {};
                    if (lead.email && !existingContact.email) updateData.email = lead.email;
                    if (lead.mobile && !existingContact.phone) updateData.phone = lead.mobile;
                    if (lead.job_position && !existingContact.position) updateData.position = lead.job_position;
                    if (companyId && !existingContact.company_id) updateData.company_id = companyId;

                    if (Object.keys(updateData).length > 0) {
                        await existingContact.update(updateData, { transaction });
                    }
                } else {
                    // Create new contact
                    const newContact = await Contacts.create({
                        lead_id: lead.id,
                        company_id: companyId,
                        name: contactName,
                        email: lead.email,
                        phone: lead.mobile || lead.phone,
                        position: lead.job_position,
                        created_at: new Date()
                    }, { transaction });

                    contactId = newContact.id;
                    console.log('[DEBUG] Created new contact:', contactId);
                }
            }
        }

        // Update lead status
        await lead.update({
            stage: 'Converted',
            status: true,
            updated_at: new Date()
        }, { transaction });

        // Process deal value safely
        let numericValue = 0;
        if (dealValue !== undefined && dealValue !== null && dealValue !== '') {
            const parsedValue = parseFloat(dealValue.toString());
            if (!isNaN(parsedValue) && parsedValue >= 0) {
                numericValue = parsedValue;
            }
        }

        console.log('[DEBUG] Creating deal with:', {
            originalValue: dealValue,
            numericValue,
            companyId,
            contactId,
            isNaN: isNaN(numericValue)
        });

        // Generate deal code automatically
        const dealCode = await generateDealCode(transaction);

        // Create new deal
        const newDeal = await Deals.create({
            code: dealCode,
            lead_id: lead.id,
            title: dealTitle || `Deal from Lead Conversion - ${lead.fullname || lead.company}`,
            value: numericValue,
            stage: dealStage || 'proposal',
            owner: lead.owner || 0,
            id_contact: contactId,
            id_company: companyId,
            created_by: lead.owner || req.user?.id || 1,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction });

        await transaction.commit();


        console.log('[DEBUG] Conversion completed successfully:', {
            dealId: newDeal.id,
            dealCode: newDeal.code,
            companyId,
            contactId,
            value: newDeal.value
        });

        // Fetch created entities for response
        const createdCompany = companyId ? await Companies.findByPk(companyId) : null;
        const createdContact = contactId ? await Contacts.findByPk(contactId, {
            include: [{
                model: Companies,
                as: 'company',
                attributes: ['id', 'name'],
                required: false
            }]
        }) : null;

        res.status(200).json({
            success: true,
            message: "Lead converted successfully",
            data: {
                lead: {
                    id: lead.id,
                    code: lead.code,
                    stage: lead.stage,
                    status: lead.status
                },
                company: createdCompany ? {
                    id: createdCompany.id,
                    name: createdCompany.name,
                    address: createdCompany.address,
                    email: createdCompany.email,
                    phone: createdCompany.phone
                } : null,
                contact: createdContact ? {
                    id: createdContact.id,
                    name: createdContact.name,
                    email: createdContact.email,
                    phone: createdContact.phone,
                    position: createdContact.position,
                    company: createdContact.company
                } : null,
                deal: {
                    id: newDeal.id,
                    code: newDeal.code,
                    lead_id: newDeal.lead_id,
                    title: newDeal.title,
                    value: newDeal.value,
                    stage: newDeal.stage,
                    owner: newDeal.owner,
                    id_company: newDeal.id_company,
                    id_contact: newDeal.id_contact,
                    created_by: newDeal.created_by
                }
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error converting lead:', {
            id: req.params.id,
            error: error.message,
            stack: error.stack
        });

        res.status(500).json({
            success: false,
            message: `Failed to convert lead: ${error.message}`,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const updateLeadStage = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        // Cek apakah id adalah kode atau ID numerik
        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const { stage } = req.body;
        const validStages = ['New', 'Contacted', 'Qualification', 'Converted', 'Unqualified'];
        if (!stage || !validStages.includes(stage)) {
            await transaction.rollback();
            return res.status(400).json({
                message: "Invalid stage. Valid stages are: " + validStages.join(', ')
            });
        }

        const lead = await Leads.findOne({
            where: whereCondition,
            transaction,
            lock: true
        });

        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }

        if (stage === 'Converted') {
            await transaction.rollback();
            return res.status(400).json({
                message: "Cannot update stage to 'Converted' directly. Use convert endpoint instead."
            });
        }

        if (lead.status === true) {
            await transaction.rollback();
            return res.status(400).json({
                message: "Cannot update stage of converted lead"
            });
        }

        const oldStage = lead.stage;

        if (oldStage === stage) {
            await transaction.rollback();
            return res.status(200).json({
                message: "No stage change detected",
                data: {
                    lead_id: lead.id,
                    lead_code: lead.code,
                    stage: stage,
                    updated_at: lead.updated_at
                }
            });
        }

        await lead.update({ stage }, { transaction });

        // Add a comment for the stage change
        await LeadComments.create({
            lead_id: lead.id,
            user_id: req.userId,
            user_name: req.userName,
            message: `Stage changed from ${oldStage} to ${stage}`,
        }, { transaction });

        await transaction.commit();

        console.log(`Lead ${lead.code} (ID: ${lead.id}) stage updated from "${oldStage}" to "${stage}"`);

        res.status(200).json({
            success: true,
            message: "Lead stage updated successfully",
            data: {
                lead_id: lead.id,
                lead_code: lead.code,
                old_stage: oldStage,
                new_stage: stage,
                updated_at: new Date()
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating lead stage:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getLeadComments = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah id adalah kode atau ID numerik
        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const lead = await Leads.findOne({ where: whereCondition });
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        const comments = await LeadComments.findAll({
            where: { lead_id: lead.id },
            order: [['created_at', 'DESC']]
        });

        const nestedComments = buildCommentTree(comments);

        const stats = {
            total_comments: comments.length,
            top_level_comments: comments.filter(c => c.parent_id === null).length,
            total_replies: comments.filter(c => c.parent_id !== null).length
        };

        res.status(200).json({
            comments: nestedComments,
            stats
        });
    } catch (error) {
        console.error('Error fetching lead comments:', error);
        res.status(500).json({ message: error.message });
    }
};

export const addLeadComment = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        // Cek apakah id adalah kode atau ID numerik
        const whereCondition = isNaN(id) ? { code: id } : { id: parseInt(id) };

        const { message, parent_id } = req.body;

        if (!message || !message.trim()) {
            await transaction.rollback();
            return res.status(400).json({ message: "Comment message is required" });
        }

        const lead = await Leads.findOne({
            where: whereCondition,
            transaction
        });

        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }

        let reply_level = 0;
        let parentComment = null;

        if (parent_id) {
            parentComment = await LeadComments.findOne({
                where: {
                    id: parent_id,
                    lead_id: lead.id
                },
                transaction
            });

            if (!parentComment) {
                await transaction.rollback();
                return res.status(400).json({ message: "Parent comment not found" });
            }

            reply_level = parentComment.reply_level + 1;

            if (reply_level > 3) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "Maximum reply depth exceeded. Please reply to a higher level comment."
                });
            }
        }

        const comment = await LeadComments.create({
            lead_id: lead.id,
            parent_id: parent_id || null,
            reply_level,
            user_id: req.userId,
            user_name: req.userName,
            message: message.trim()
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: parent_id ? "Reply added successfully" : "Comment added successfully",
            comment: {
                ...comment.toJSON(),
                replies: [],
                is_reply: !!parent_id,
                parent_user: parentComment ? parentComment.user_name : null
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding lead comment:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getCommentThread = async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);

        if (isNaN(commentId)) {
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        const comment = await LeadComments.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        let rootComment = comment;
        if (comment.parent_id) {
            rootComment = await LeadComments.findOne({
                where: {
                    id: comment.parent_id,
                    lead_id: comment.lead_id,
                    parent_id: null
                }
            });
        }

        const threadComments = await LeadComments.findAll({
            where: {
                lead_id: comment.lead_id,
                [Op.or]: [
                    { id: rootComment.id },
                    { parent_id: rootComment.id }
                ]
            },
            order: [['created_at', 'ASC']]
        });

        const thread = buildCommentTree(threadComments);

        res.status(200).json({
            thread: thread[0],
            stats: {
                total_comments: threadComments.length,
                replies_count: threadComments.length - 1
            }
        });
    } catch (error) {
        console.error('Error fetching comment thread:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteLeadComment = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const commentId = parseInt(req.params.commentId);

        if (isNaN(commentId)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid comment ID" });
        }

        const comment = await LeadComments.findByPk(commentId, { transaction });
        if (!comment) {
            await transaction.rollback();
            return res.status(404).json({ message: "Comment not found" });
        }

        await comment.destroy({ transaction });
        await transaction.commit();

        res.status(200).json({
            message: "Comment deleted successfully"
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting lead comment:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getUnconvertedLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, stage, rating, owner, search } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = {
            status: false
        };

        if (req.teamMemberIds && !req.userRoles.includes('admin')) {
            whereClause.owner = { [Op.in]: req.teamMemberIds };
        }

        if (stage) {
            whereClause.stage = stage;
        }

        if (rating) {
            whereClause.rating = rating;
        }
        if (owner) {
            whereClause.owner = owner;
        }
        if (search) {
            whereClause[Op.or] = [
                { company: { [Op.like]: `%${search}%` } },
                { fullname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } } // Tambah pencarian berdasarkan kode
            ];
        }

        const { count, rows } = await Leads.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            leads: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching unconverted leads:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getConvertedLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, stage, rating, owner, search } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = {
            status: true
        };

        if (req.teamMemberIds && !req.userRoles.includes('admin')) {
            whereClause.owner = { [Op.in]: req.teamMemberIds };
        }

        if (stage) {
            whereClause.stage = stage;
        }

        if (rating) {
            whereClause.rating = rating;
        }
        if (owner) {
            whereClause.owner = owner;
        }
        if (search) {
            whereClause[Op.or] = [
                { company: { [Op.like]: `%${search}%` } },
                { fullname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Leads.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            leads: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching converted leads:', error);
        res.status(500).json({ message: error.message });
    }
};