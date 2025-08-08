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
        const userData = {
            ...user.dataValues,
            roleNames: user.roles ? user.roles.map(role => role.name) : [],
            primaryRole: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user',
            role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user'
        };
        
        res.status(200).json({
            message: "Detail user berhasil diambil",
            data: userData
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
        const formattedUsers = users.map(user => ({
            ...user.dataValues,
            roleNames: user.roles ? user.roles.map(role => role.name) : [],
            primaryRole: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user',
            role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user'
        }));
        
        const response = {
            message: "Daftar user berhasil diambil",
            data: formattedUsers
        };

        if (include_roles !== 'true') {
            response.pagination = {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            };
        } else {
            response.total = formattedUsers.length;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getAllUsersWithRoles = async (req, res) => {
    try {
        const { search = '' } = req.query;
        const whereClause = search ? {
            [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ]
        } : {};

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

        const usersWithRoles = users.map(user => {
            const roles = user.roles || [];
            const primaryRole = roles.length > 0 ? roles[0].name : 'user';
            
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
                roles: roles,
                roleNames: roles.map(role => role.name),
                primaryRole: primaryRole,
                role: primaryRole, // For backward compatibility
                // Additional computed fields
                isAdmin: roles.some(role => role.name === 'admin'),
                isSales: roles.some(role => role.name === 'sales'),
                isPartnership: roles.some(role => role.name === 'partnership'),
                isAkunting: roles.some(role => role.name === 'akunting')
            };
        });

        res.status(200).json({
            message: "Daftar user dengan roles berhasil diambil",
            data: usersWithRoles,
            total: usersWithRoles.length,
            stats: {
                totalUsers: usersWithRoles.length,
                admins: usersWithRoles.filter(u => u.isAdmin).length,
                sales: usersWithRoles.filter(u => u.isSales).length,
                partnerships: usersWithRoles.filter(u => u.isPartnership).length,
                akuntings: usersWithRoles.filter(u => u.isAkunting).length,
                regularUsers: usersWithRoles.filter(u => u.primaryRole === 'user').length
            }
        });
    } catch (error) {
        console.error('Error in getAllUsersWithRoles:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            message: "Daftar role berhasil diambil",
            data: roles,
            total: roles.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const assignRoleToUser = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const role = await Role.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ message: "Role tidak ditemukan" });
        }

        const existingAssignment = await UserRole.findOne({
            where: { user_id: userId, role_id: roleId }
        });

        if (existingAssignment) {
            return res.status(400).json({ message: "User sudah memiliki role ini" });
        }

        await UserRole.create({
            user_id: userId,
            role_id: roleId
        });

        res.status(201).json({
            message: "Role berhasil di-assign ke user",
            data: {
                userId: userId,
                roleId: roleId,
                roleName: role.name,
                userName: user.name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

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
            message: "Role berhasil dihapus dari user",
            data: { userId, roleId }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { q = '', limit = 10 } = req.query;
        
        if (!q.trim()) {
            return res.status(400).json({ 
                message: "Query pencarian tidak boleh kosong" 
            });
        }

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { email: { [Op.iLike]: `%${q}%` } }
                ]
            },
            attributes: ['id', 'name', 'email'],
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }],
            limit: parseInt(limit),
            order: [['name', 'ASC']]
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles || [],
            roleNames: user.roles ? user.roles.map(role => role.name) : [],
            primaryRole: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user',
            role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'user'
        }));

        res.status(200).json({
            message: "Pencarian user berhasil",
            data: formattedUsers,
            total: formattedUsers.length,
            query: q
        });
    } catch (error) {
        console.error('Error in searchUsers:', error);
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

        const userData = {
            ...updatedUser.dataValues,
            roleNames: updatedUser.roles ? updatedUser.roles.map(role => role.name) : [],
            primaryRole: updatedUser.roles && updatedUser.roles.length > 0 ? updatedUser.roles[0].name : 'user',
            role: updatedUser.roles && updatedUser.roles.length > 0 ? updatedUser.roles[0].name : 'user'
        };

        res.status(200).json({
            message: "Profil berhasil diperbarui",
            data: userData
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};