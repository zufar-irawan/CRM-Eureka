import { Leads } from "../models/leads/leadsModel.js";
import { LeadComments } from "../models/leads/leadsCommentModel.js";
import { Tasks } from "../models/tasks/tasksModel.js";
import { Deals } from "../models/deals/dealsModel.js";
import { Op } from 'sequelize';

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
        res.status(500).json({ message: error.message });
    }
};

export const getLeadById = async (req, res) => {
    try {
        const response = await Leads.findOne({
            where: {
                id: parseInt(req.params.id)
            }
        });
        if (!response) {
            return res.status(404).json({ message: "Lead not found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createLead = async (req, res) => {
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
        });

        res.status(201).json({
            message: "Lead created successfully",
            lead: newLead
        });
    } catch (error) {
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
    try {
        const leadId = parseInt(req.params.id);
        const lead = await Leads.findByPk(leadId);
        if (!lead) {
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
        });

        const updatedLead = await Leads.findByPk(leadId);
        res.status(200).json({
            message: "Lead updated successfully",
            lead: updatedLead
        });
    } catch (error) {
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
    try {
        const leadId = parseInt(req.params.id);
        const lead = await Leads.findByPk(leadId);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }
        await lead.destroy();
        res.status(200).json({
            message: "Lead deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const convertLead = async (req, res) => {
    try {
        const leadId = parseInt(req.params.id);
        const { deal_title, deal_value, deal_stage = 'negotiation', owner } = req.body;

        const lead = await Leads.findByPk(leadId);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        if (lead.status === true) {
            return res.status(400).json({
                message: "Lead has already been converted to deal"
            });
        }

        await lead.update({
            stage: 'Converted',
            status: true
        });

        const newDeal = await Deals.create({
            lead_id: leadId,
            title: deal_title || `Deal from ${lead.fullname || 'Lead Conversion'}`,
            value: deal_value || 0,
            stage: deal_stage, // Will be 'negotiation' by default
            owner: owner || lead.owner || 0,
            id_contact: 0,
            id_company: 0,
            created_by: req.user?.id || 1,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(200).json({
            success: true,
            message: "Lead converted successfully",
            data: {
                lead: lead,
                deal_data: {
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
        res.status(500).json({ message: error.message });
    }
}

export const updateLeadStage = async (req, res) => {
    try {
        const leadId = parseInt(req.params.id);
        const { stage } = req.body;

        const lead = await Leads.findByPk(leadId);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        // Cek apakah lead sudah diconvert, jika sudah tidak bisa diubah stagenya
        if (lead.status === true) {
            return res.status(400).json({
                message: "Cannot update stage of converted lead"
            });
        }

        await lead.update({ stage });

        res.status(200).json({
            message: "Lead stage updated successfully",
            lead: lead
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLeadComments = async (req, res) => {
    try {
        const leadId = parseInt(req.params.id);

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
        res.status(500).json({ message: error.message });
    }
};

export const addLeadComment = async (req, res) => {
    try {
        const leadId = parseInt(req.params.id);
        const { message, user_id, user_name } = req.body;
        const lead = await Leads.findByPk(leadId);
        if (!lead) {
            return res.status(404).json({ message: "Lead not found" });
        }

        const comment = await LeadComments.create({
            lead_id: leadId,
            user_id,
            user_name,
            message,
            created_at: new Date()
        });
        res.status(201).json({
            message: "comment added successfully",
            comment: comment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteLeadComment = async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);
        const comment = await LeadComments.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        await comment.destroy();
        res.status(200).json({
            message: "Comment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADDED: Get leads yang belum diconvert (status = 0)
export const getUnconvertedLeads = async (req, res) => {
    try {
        const { page = 1, limit = 10, stage, rating, owner, search } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = {
            status: false // Filter hanya leads yang belum diconvert
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
        res.status(500).json({ message: error.message });
    }
};

// ADDED: Get leads yang sudah diconvert (status = 1)
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
        res.status(500).json({ message: error.message });
    }
};