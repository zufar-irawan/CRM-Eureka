import { Companies } from "../models/companies/companiesModel.js";
import { Contacts } from "../models/contacts/contactsModel.js";
import { Deals } from "../models/deals/dealsModel.js";
import { Op } from "sequelize";
import { sequelize } from '../config/db.js';

export const getAllCompanies = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        let whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        const order = [];
        if (sortBy) {
            order.push([sortBy, sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
        }

        const { count, rows } = await Companies.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Contacts,
                    as: 'contacts',
                    attributes: ['id', 'name', 'email', 'phone', 'position'],
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
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching companies",
            error: error.message
        });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const companyId = parseInt(req.params.id);
        
        if (isNaN(companyId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid company ID"
            });
        }

        const company = await Companies.findOne({
            where: { id: companyId },
            include: [
                {
                    model: Contacts,
                    as: 'contacts',
                    attributes: ['id', 'name', 'email', 'phone', 'position', 'created_at'],
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
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: company
        });
    } catch (error) {
        console.error('Error fetching company by ID:', error);
        res.status(500).json({
            success: false,
            message: "Error fetching company",
            error: error.message
        });
    }
};

export const createCompany = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const {
            name,
            address,
            phone,
            email
        } = req.body;

        if (!name || !name.trim()) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Company name is required"
            });
        }

        const existingCompany = await Companies.findOne({
            where: { name: name.trim() },
            transaction
        });

        if (existingCompany) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Company with this name already exists"
            });
        }

        const newCompany = await Companies.create({
            name: name.trim(),
            address: address ? address.trim() : null,
            phone: phone ? phone.trim() : null,
            email: email ? email.trim() : null,
            created_at: new Date()
        }, { transaction });
        
        await transaction.commit();
        
        res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: newCompany
        });
    } catch (error) {
        await transaction.rollback();
        
        console.error('Error creating company:', error);
        
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
            message: "Error creating company",
            error: error.message
        });
    }
};

export const updateCompany = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const companyId = parseInt(req.params.id);
        
        if (isNaN(companyId)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Invalid company ID"
            });
        }

        const company = await Companies.findByPk(companyId, { transaction });
        if (!company) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        const {
            name,
            address,
            phone,
            email
        } = req.body;

        // Check if another company with same name exists (excluding current company)
        if (name && name.trim() !== company.name) {
            const existingCompany = await Companies.findOne({
                where: { 
                    name: name.trim(),
                    id: { [Op.ne]: companyId }
                },
                transaction
            });

            if (existingCompany) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Company with this name already exists"
                });
            }
        }

        await company.update({
            name: name !== undefined ? name.trim() : company.name,
            address: address !== undefined ? (address ? address.trim() : null) : company.address,
            phone: phone !== undefined ? (phone ? phone.trim() : null) : company.phone,
            email: email !== undefined ? (email ? email.trim() : null) : company.email
        }, { transaction });

        await transaction.commit();

        // Fetch updated company with relations
        const updatedCompany = await Companies.findByPk(companyId, {
            include: [
                {
                    model: Contacts,
                    as: 'contacts',
                    attributes: ['id', 'name', 'email', 'phone', 'position'],
                    required: false
                }
            ]
        });
        
        res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: updatedCompany
        });
    } catch (error) {
        await transaction.rollback();
        
        console.error('Error updating company:', error);
        
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
            message: "Error updating company",
            error: error.message
        });
    }
};

export const deleteCompany = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const companyId = parseInt(req.params.id);
        
        if (isNaN(companyId)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Invalid company ID"
            });
        }

        const company = await Companies.findByPk(companyId, { transaction });
        if (!company) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        const contactCount = await Contacts.count({
            where: { company_id: companyId },
            transaction
        });

        const dealCount = await Deals.count({
            where: { id_company: companyId },
            transaction
        });

        if (contactCount > 0 || dealCount > 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Cannot delete company. It has ${contactCount} contact(s) and ${dealCount} deal(s) associated with it.`
            });
        }
        
        await company.destroy({ transaction });
        await transaction.commit();
        
        res.status(200).json({
            success: true,
            message: "Company deleted successfully"
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting company:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting company",
            error: error.message
        });
    }
};