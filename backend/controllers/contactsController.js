import { Contacts } from "../models/contacts/contactsModel.js";
import { Companies } from "../models/companies/companiesModel.js";
import { Deals } from "../models/deals/dealsModel.js";
import { Tasks } from "../models/tasks/tasksModel.js";
import { Leads } from "../models/leads/leadsModel.js";
import { User } from "../models/usersModel.js";
import { Op, Transaction } from "sequelize";
import { sequelize } from '../config/db.js';

export const getAllContacts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            company_id,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { position: { [Op.like]: `%${search}%` } }
            ];
        }
        if (company_id) {
            whereClause.company_id = company_id;
        }
        const order = [];
        if (sortBy) {
            order.push([sortBy, sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
        }
        const { count, rows } = await Contacts.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'address', 'phone', 'email'],
                    required: false
                },
                {
                    model: Deals,
                    as: 'deals',
                    attributes: ['id', 'title', 'value', 'stage'],
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: order.length ? order : [['created_at', 'DESC']],
            distinct: true
        });
        res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching contacts",
            error: error.message
        });
    }
}

export const getContactById = async (req, res) => {
    try {
        const contactId = parseInt(req.params.id);
        if (isNaN(contactId)) {
            return res.status(400).json({
                success: false,
                message: "invalid contact id"
            });
        }
        const contact = await Contacts.findOne({
            where: { id: contactId },
            include: [
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'address', 'phone', 'email'],
                    required: false
                },
                {
                    model: Deals,
                    as: 'deals',
                    attributes: ['id', 'title', 'value', 'stage', 'created_at', 'updated_at'],
                    required: false,
                    order: [['created_at', 'DESC']]
                }
            ]
        });
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "contact not found"
            })
        }
        res.status(200).json({
            success: true,
            data: contact
        })
    } catch (error) {
        console.error('Error fetching contact by ID:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching contact",
            error: error.message
        });
    }
}

export const createContact = async (req, res) => {
    const transaction = await sequelize.transaction(); 
    try {
        const {
            company_id,
            name,
            email,
            phone,
            position
        } = req.body;
        
        if (!name || !name.trim()) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "contact name is required"
            })
        }

        if (company_id) {
            const company = await Companies.findByPk(company_id, { transaction });
            if (!company) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "company not found"
                })
            }
        }

        if (email && email.trim()) {
            const existingContact = await Contacts.findOne({
                where: { email: email.trim() },
                transaction
            });

            if (existingContact) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Contact with this email already exists"
                });
            }
        }

        const newContact = await Contacts.create({
            company_id: company_id || null,
            name: name.trim(),
            email: email ? email.trim() : null,
            phone: phone ? phone.trim() : null,
            position: position ? position.trim() : null,
            created_at: new Date()
        }, { transaction });
        
        await transaction.commit();

        const createdContact = await Contacts.findByPk(newContact.id, {
            include: [
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'address', 'phone', 'email'],
                    required: false
                }
            ]
        });
        
        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: createdContact
        });
    } catch (error) {
        await transaction.rollback();
        
        console.error('Error creating contact:', error);
        
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error creating contact",
            error: error.message
        });
    }
}

export const updateContact = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const contactId = parseInt(req.params.id);
        
        if (isNaN(contactId)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID"
            });
        }

        const contact = await Contacts.findByPk(contactId, { transaction });
        if (!contact) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        const {
            company_id,
            name,
            email,
            phone,
            position
        } = req.body;

        if (company_id !== undefined && company_id !== null) {
            const company = await Companies.findByPk(company_id, { transaction });
            if (!company) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Company not found"
                });
            }
        }

        if (email && email.trim() && email.trim() !== contact.email) {
            const existingContact = await Contacts.findOne({
                where: { 
                    email: email.trim(),
                    id: { [Op.ne]: contactId }
                },
                transaction
            });

            if (existingContact) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Contact with this email already exists"
                });
            }
        }

        await contact.update({
            company_id: company_id !== undefined ? company_id : contact.company_id,
            name: name !== undefined ? name.trim() : contact.name,
            email: email !== undefined ? (email ? email.trim() : null) : contact.email,
            phone: phone !== undefined ? (phone ? phone.trim() : null) : contact.phone,
            position: position !== undefined ? (position ? position.trim() : null) : contact.position
        }, { transaction });

        await transaction.commit();

        const updatedContact = await Contacts.findByPk(contactId, {
            include: [
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'address', 'phone', 'email'],
                    required: false
                }
            ]
        });
        
        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: updatedContact
        });
    } catch (error) {
        await transaction.rollback();
        
        console.error('Error updating contact:', error);
        
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating contact",
            error: error.message
        });
    }
};

export const deleteContact = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const contactId = parseInt(req.params.id);
        
        if (isNaN(contactId)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID"
            });
        }

        const contact = await Contacts.findByPk(contactId, { transaction });
        if (!contact) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        const dealCount = await Deals.count({
            where: { id_contact: contactId },
            transaction
        });
        if (dealCount > 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot delete contact. It has ${dealCount} deal(s) associated with it.`
            })
        }

        await contact.destroy({ transaction });
        await transaction.commit();
        res.status(200).json({
            success: true,
            message: "contact deleted successfully"
        })
    } catch (error) {
        await transaction.rollback();
        console.error('error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: "error deleting contact",
            error: error.message
        });
    }
}

export const getContactsByCompany = async (req, res) => {
    try {
        const companyId = parseInt(req.params.companyId);
        
        if (isNaN(companyId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid company ID"
            });
        }

        const company = await Companies.findByPk(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        const contacts = await Contacts.findAll({
            where: { company_id: companyId },
            include: [
                {
                    model: Companies,
                    as: 'company',
                    attributes: ['id', 'name', 'address', 'phone', 'email'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: contacts,
            company: {
                id: company.id,
                name: company.name
            }
        });
    } catch (error) {
        console.error('Error fetching contacts by company:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching contacts",
            error: error.message
        });
    }
};

export const getTasksByContact = async (req, res) => {
    try {
        const contactId = parseInt(req.params.id, 10);
        if (isNaN(contactId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID"
            });
        }

        const contact = await Contacts.findByPk(contactId, {
            attributes: ['id', 'lead_id']
        });

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        if (!contact.lead_id) {
            return res.status(200).json({
                success: true,
                message: "Contact is not associated with a lead, no tasks found.",
                data: []
            });
        }

        const tasks = await Tasks.findAll({
            where: { lead_id: contact.lead_id },
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
                }
            ],
            order: [['created_at', 'DESC']]
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
            data: transformedTasks
        });

    } catch (error) {
        console.error('Error fetching tasks by contact:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching tasks",
            error: error.message
        });
    }
};