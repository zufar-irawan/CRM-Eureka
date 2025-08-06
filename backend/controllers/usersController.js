import User from "../models/usersModel.js";
import { Role, UserRole } from "../models/rolesModel.js";
import { Op } from "sequelize";

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'created_at', 'updated_at'],
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] } 
            }]
        });
        
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        
        res.status(200).json({
            message: "Detail user berhasil diambil",
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', include_roles = false } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = search ? {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ]
        } : {};

        let queryOptions = {
            where: whereClause,
            attributes: ['id', 'name', 'email', 'created_at'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        };

        // If include_roles is requested, add role information and remove pagination
        if (include_roles === 'true') {
            queryOptions = {
                where: whereClause,
                attributes: ['id', 'name', 'email', 'created_at'],
                include: [{
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }],
                order: [['created_at', 'DESC']]
            };
            delete queryOptions.limit;
            delete queryOptions.offset;
        }

        const { count, rows: users } = await User.findAndCountAll(queryOptions);
        
        const response = {
            message: "Daftar user berhasil diambil",
            data: users
        };

        if (include_roles !== 'true') {
            response.pagination = {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            };
        } else {
            response.total = users.length;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

// New endpoint specifically for getting all users with roles (for dropdowns)
export const getAllUsersWithRoles = async (req, res) => {
    try {
        const { search = '' } = req.query;
        
        const whereClause = search ? {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ]
        } : {};

        // Get all users without pagination
        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'created_at'],
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }],
            order: [['name', 'ASC']]
        });

        // Format the response to include role information in a more accessible way
        const usersWithRoles = users.map(user => ({
            ...user.dataValues,
            roleNames: user.roles ? user.roles.map(role => role.name) : [],
            primaryRole: user.roles && user.roles.length > 0 ? user.roles[0].name : null
        }));

        res.status(200).json({
            message: "Daftar user dengan roles berhasil diambil",
            data: usersWithRoles,
            total: usersWithRoles.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

// Get all available roles
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            message: "Daftar role berhasil diambil",
            data: roles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

// Assign role to user
export const assignRoleToUser = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Check if role exists
        const role = await Role.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ message: "Role tidak ditemukan" });
        }

        // Check if assignment already exists
        const existingAssignment = await UserRole.findOne({
            where: { user_id: userId, role_id: roleId }
        });

        if (existingAssignment) {
            return res.status(400).json({ message: "User sudah memiliki role ini" });
        }

        // Create the assignment
        await UserRole.create({
            user_id: userId,
            role_id: roleId
        });

        res.status(201).json({
            message: "Role berhasil di-assign ke user"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

// Remove role from user
export const removeRoleFromUser = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        const deleted = await UserRole.destroy({
            where: { user_id: userId, role_id: roleId }
        });

        if (!deleted) {
            return res.status(404).json({ message: "Assignment role tidak ditemukan" });
        }

        res.status(200).json({
            message: "Role berhasil dihapus dari user"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        
        if (req.userId !== parseInt(id)) {
            return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah profil ini" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        
        await user.update(updateData);
        
        const updatedUser = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'updated_at'],
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }]
        });

        res.status(200).json({
            message: "Profil berhasil diperbarui",
            data: updatedUser
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};