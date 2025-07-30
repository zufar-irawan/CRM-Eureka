import { Leads } from "../models/leads/leadsModel.js";
import { LeadComments } from "../models/leads/leadsCommentModel.js";
import { Tasks } from "../models/tasks/tasksModel.js";
import { Deals } from "../models/deals/dealsModel.js";
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js'; 

export const getLeads = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            stage,
            rating,
            owner,
            search,
            sortBy,
            sortOrder,
            status = 0
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = {};
        
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
            whereClause.owner = owner;
        }
        if (search) {
            whereClause[Op.or] = [
                { company: { [Op.like]: `%${search}%` } },
                { fullname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
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
        const leadId = parseInt(req.params.id);
        
        if (isNaN(leadId)) {
            return res.status(400).json({ message: "Invalid lead ID" });
        }

        const response = await Leads.findOne({
            where: {
                id: leadId
            }
        });
        
        if (!response) {
            return res.status(404).json({ message: "Lead not found" });
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

        const newLead = await Leads.create({
            owner,
            company,
            title: title || 'Mr',
            first_name,
            last_name,
            job_position,
            email,
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
        
        if (error.name === 'SequelizeValidationError'){
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
        const leadId = parseInt(req.params.id);
        
        if (isNaN(leadId)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid lead ID" });
        }

        const lead = await Leads.findByPk(leadId, { transaction });
        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }

        const {
            owner,
            company,
            title,
            first_name,
            last_name,
            job_position,
            email,
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

        await lead.update({
            owner: owner !== undefined ? owner : lead.owner,
            company: company !== undefined ? company : lead.company,
            title: title !== undefined ? title : lead.title,
            first_name: first_name !== undefined ? first_name : lead.first_name,
            last_name: last_name !== undefined ? last_name : lead.last_name,
            job_position: job_position !== undefined ? job_position : lead.job_position,
            email: email !== undefined ? email : lead.email,
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
        }, { transaction });

        await transaction.commit();

        const updatedLead = await Leads.findByPk(leadId);
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
        const leadId = parseInt(req.params.id);
        
        if (isNaN(leadId)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid lead ID" });
        }

        const lead = await Leads.findByPk(leadId, { transaction });
        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
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

// FIXED: Convert Lead function di leadsController.js
export const convertLead = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const leadId = parseInt(req.params.id);
        
        if (isNaN(leadId)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid lead ID" });
        }

        // FIX: Gunakan parameter yang sesuai dengan frontend
        const { dealTitle, dealValue, dealStage, leadData } = req.body;
        
        console.log('[DEBUG] Received convert request:', {
            leadId,
            dealTitle,
            dealValue,
            dealStage,
            valueType: typeof dealValue
        });

        const lead = await Leads.findByPk(leadId, { 
            transaction,
            lock: true
        });
        
        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }

        // Check if lead is already converted
        if (lead.status === true) {
            await transaction.rollback();
            return res.status(400).json({ 
                message: "Lead has already been converted to deal" 
            });
        }

        // Update lead stage to Converted and status to true
        await lead.update({ 
            stage: 'Converted',
            status: true
        }, { transaction });

        // FIX: Pastikan value dikonversi dengan benar
        const numericValue = dealValue ? parseFloat(dealValue.toString()) : 0;
        
        console.log('[DEBUG] Creating deal with value:', {
            originalValue: dealValue,
            numericValue,
            isNaN: isNaN(numericValue)
        });

        // Create deal in database
        const newDeal = await Deals.create({
            lead_id: leadId,
            title: dealTitle || `Deal from Lead Conversion - ${lead.fullname || lead.company}`,
            value: numericValue, // FIX: Gunakan numeric value
            stage: dealStage || 'proposal',
            owner: lead.owner || 0,
            id_contact: 0,
            id_company: 0,
            created_by: req.user?.id || 1,
            status: 'active'
        }, { transaction });

        await transaction.commit();

        console.log('[DEBUG] Deal created successfully:', {
            dealId: newDeal.id,
            value: newDeal.value,
            valueInDb: await Deals.findByPk(newDeal.id, { attributes: ['value'] })
        });

        res.status(200).json({
            success: true,
            message: "Lead converted successfully",
            data: {
                lead: lead,
                deal: {
                    id: newDeal.id,
                    lead_id: newDeal.lead_id,
                    title: newDeal.title,
                    value: newDeal.value,
                    stage: newDeal.stage,
                    owner: newDeal.owner,
                    created_by: newDeal.created_by,
                    status: newDeal.status
                }
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error converting lead:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

// IMPROVED: Update Lead Stage with better validation and locking
export const updateLeadStage = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const leadId = parseInt(req.params.id);
        
        if (isNaN(leadId)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid lead ID" });
        }

        const { stage } = req.body;
        
        // Validate stage
        const validStages = ['New', 'Contacted', 'Qualification', 'Converted', 'Unqualified'];
        if (!stage || !validStages.includes(stage)) {
            await transaction.rollback();
            return res.status(400).json({ 
                message: "Invalid stage. Valid stages are: " + validStages.join(', ')
            });
        }
        
        // Find lead with row-level locking
        const lead = await Leads.findByPk(leadId, { 
            transaction,
            lock: true
        });
        
        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }

        // Prevent direct conversion through stage update
        if (stage === 'Converted') {
            await transaction.rollback();
            return res.status(400).json({ 
                message: "Cannot update stage to 'Converted' directly. Use convert endpoint instead." 
            });
        }

        // Prevent updating already converted leads
        if (lead.status === true) {
            await transaction.rollback();
            return res.status(400).json({ 
                message: "Cannot update stage of converted lead" 
            });
        }

        const oldStage = lead.stage;
        
        // Only update if stage actually changed
        if (oldStage === stage) {
            await transaction.rollback();
            return res.status(200).json({
                message: "No stage change detected",
                data: {
                    lead_id: leadId,
                    stage: stage,
                    updated_at: lead.updated_at
                }
            });
        }

        await lead.update({ stage }, { transaction });
        await transaction.commit();

        console.log(`✅ Lead ${leadId} stage updated from "${oldStage}" to "${stage}"`);
        
        res.status(200).json({
            success: true,
            message: "Lead stage updated successfully",
            data: {
                lead_id: leadId,
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
        const leadId = parseInt(req.params.id);
        
        if (isNaN(leadId)) {
            return res.status(400).json({ message: "Invalid lead ID" });
        }

        const lead = await Leads.findByPk(leadId);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        const comments = await LeadComments.findAll({
            where: { lead_id: leadId },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching lead comments:', error);
        res.status(500).json({ message: error.message });
    }
};

export const addLeadComment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const leadId = parseInt(req.params.id);
        
        if (isNaN(leadId)) {
            await transaction.rollback();
            return res.status(400).json({ message: "Invalid lead ID" });
        }

        const { message, user_id, user_name } = req.body;
        
        if (!message || !message.trim()) {
            await transaction.rollback();
            return res.status(400).json({ message: "Comment message is required" });
        }

        const lead = await Leads.findByPk(leadId, { transaction });
        if (!lead) {
            await transaction.rollback();
            return res.status(404).json({ message: "Lead not found" });
        }

        const comment = await LeadComments.create({
            lead_id: leadId,
            user_id,
            user_name,
            message: message.trim()
        }, { transaction });
        
        await transaction.commit();
        
        res.status(201).json({
            message: "Comment added successfully",
            comment: comment
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error adding lead comment:', error);
        res.status(500).json({ message: error.message });
    }
}

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
                { email: { [Op.like]: `%${search}%` } }
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
                { email: { [Op.like]: `%${search}%` } }
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