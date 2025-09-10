import User from "../models/usersModel.js";
import { Role, UserRole } from "../models/rolesModel.js";
import { Op } from "sequelize";

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'created_at', 'updated_at', 'manager_id', 'asmen_id', 'gl_id'],
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name'],
                    through: { attributes: [] } 
                },
                {
                    model: User,
                    as: 'Manager',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'Asmen',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'GL',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const roles = user.roles || [];
        const primaryRole = roles.length > 0 ? roles[0].name : 'user';

        const userData = {
            ...user.dataValues,
            roleNames: roles.map(role => role.name),
            primaryRole: primaryRole,
            role: primaryRole,
            hierarchyInfo: user.getHierarchyInfo(),
            // Role checks
            isAdmin: roles.some(role => role.name === 'admin'),
            isSales: roles.some(role => role.name === 'sales'),
            isManager: roles.some(role => role.name === 'manager'),
            isAsmen: roles.some(role => role.name === 'asmen'),
            isGl: roles.some(role => role.name === 'gl')
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
        const { page = 1, limit = 10, search = '', include_roles = false, role_filter = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ];
        }

        let queryOptions = {
            where: whereClause,
            attributes: ['id', 'name', 'email', 'created_at', 'manager_id', 'asmen_id', 'gl_id'],
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: User,
                    as: 'Manager',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: User,
                    as: 'Asmen',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: User,
                    as: 'GL',
                    attributes: ['id', 'name'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        };

        // Add role filter if specified
        if (role_filter) {
            queryOptions.include[0].where = { name: role_filter };
            queryOptions.include[0].required = true;
        }

        if (include_roles !== 'true') {
            queryOptions.limit = parseInt(limit);
            queryOptions.offset = parseInt(offset);
        }

        const { count, rows: users } = await User.findAndCountAll(queryOptions);
        
        const formattedUsers = users.map(user => {
            const roles = user.roles || [];
            const primaryRole = roles.length > 0 ? roles[0].name : 'user';

            return {
                ...user.dataValues,
                roleNames: roles.map(role => role.name),
                primaryRole: primaryRole,
                role: primaryRole,
                hierarchyInfo: user.getHierarchyInfo(),
                // Role checks
                isAdmin: roles.some(role => role.name === 'admin'),
                isSales: roles.some(role => role.name === 'sales'),
                isManager: roles.some(role => role.name === 'manager'),
                isAsmen: roles.some(role => role.name === 'asmen'),
                isGl: roles.some(role => role.name === 'gl')
            };
        });

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
        const { search = '', role_filter = '' } = req.query;
        
        let whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ];
        }

        let includeOptions = [
            {
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            },
            {
                model: User,
                as: 'Manager',
                attributes: ['id', 'name', 'email'],
                required: false
            },
            {
                model: User,
                as: 'Asmen',
                attributes: ['id', 'name', 'email'],
                required: false
            },
            {
                model: User,
                as: 'GL',
                attributes: ['id', 'name', 'email'],
                required: false
            }
        ];

        // Add role filter if specified
        if (role_filter) {
            includeOptions[0].where = { name: role_filter };
            includeOptions[0].required = true;
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'created_at', 'manager_id', 'asmen_id', 'gl_id'],
            include: includeOptions,
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
                manager_id: user.manager_id,
                asmen_id: user.asmen_id,
                gl_id: user.gl_id,
                Manager: user.Manager,
                Asmen: user.Asmen,
                GL: user.GL,
                roles: roles,
                roleNames: roles.map(role => role.name),
                primaryRole: primaryRole,
                role: primaryRole,
                hierarchyInfo: user.getHierarchyInfo(),
                // Role flags
                isAdmin: roles.some(role => role.name === 'admin'),
                isSales: roles.some(role => role.name === 'sales'),
                isManager: roles.some(role => role.name === 'manager'),
                isAsmen: roles.some(role => role.name === 'asmen'),
                isGl: roles.some(role => role.name === 'gl')
            };
        });

        res.status(200).json({
            message: "Daftar user dengan roles berhasil diambil",
            data: usersWithRoles,
            total: usersWithRoles.length,
            stats: {
                totalUsers: usersWithRoles.length,
                admins: usersWithRoles.filter(u => u.isAdmin).length,
                managers: usersWithRoles.filter(u => u.isManager).length,
                asmens: usersWithRoles.filter(u => u.isAsmen).length,
                gls: usersWithRoles.filter(u => u.isGl).length,
                sales: usersWithRoles.filter(u => u.isSales).length
            }
        });
    } catch (error) {
        console.error('Error in getAllUsersWithRoles:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getHierarchy = async (req, res) => {
    try {
        const { userId } = req.query;
        
        // Get all users with their hierarchy information
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'manager_id', 'asmen_id', 'gl_id'],
            include: [
                {
                    model: Role,
                    as: 'roles',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: User,
                    as: 'DirectAsmen',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'DirectGLs',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'DirectSales',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ],
            order: [['name', 'ASC']]
        });

        // Build hierarchy tree
        const buildHierarchy = (users) => {
            const userMap = new Map();
            const hierarchy = [];

            // First pass: create user objects with role information
            users.forEach(user => {
                const roles = user.roles || [];
                const primaryRole = roles.length > 0 ? roles[0].name : 'user';
                
                userMap.set(user.id, {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    primaryRole: primaryRole,
                    manager_id: user.manager_id,
                    asmen_id: user.asmen_id,
                    gl_id: user.gl_id,
                    children: [],
                    isAdmin: roles.some(role => role.name === 'admin'),
                    isManager: roles.some(role => role.name === 'manager'),
                    isAsmen: roles.some(role => role.name === 'asmen'),
                    isGl: roles.some(role => role.name === 'gl'),
                    isSales: roles.some(role => role.name === 'sales')
                });
            });

            // Second pass: build tree structure
            userMap.forEach(user => {
                if (user.isAdmin || (user.isManager && !user.manager_id)) {
                    // Top level: Admins and Managers with no manager_id
                    hierarchy.push(user);
                } else if (user.isAsmen && user.manager_id) {
                    // Asmen under managers
                    const manager = userMap.get(user.manager_id);
                    if (manager) manager.children.push(user);
                } else if (user.isGl && user.asmen_id) {
                    // GLs under asmen
                    const asmen = userMap.get(user.asmen_id);
                    if (asmen) asmen.children.push(user);
                } else if (user.isSales && user.gl_id) {
                    // Sales under GLs
                    const gl = userMap.get(user.gl_id);
                    if (gl) gl.children.push(user);
                }
            });

            return hierarchy;
        };

        const hierarchy = buildHierarchy(users);

        res.status(200).json({
            message: "Hierarki organisasi berhasil diambil",
            data: hierarchy,
            total: users.length
        });
    } catch (error) {
        console.error('Error in getHierarchy:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const { include_hierarchy = false } = req.query;

        const validRoles = ['admin', 'manager', 'asmen', 'gl', 'sales'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                message: "Role tidak valid", 
                validRoles: validRoles 
            });
        }

        let includeOptions = [
            {
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] },
                where: { name: role },
                required: true
            }
        ];

        if (include_hierarchy === 'true') {
            includeOptions.push(
                {
                    model: User,
                    as: 'Manager',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'Asmen',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'GL',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            );
        }

        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'manager_id', 'asmen_id', 'gl_id'],
            include: includeOptions,
            order: [['name', 'ASC']]
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            manager_id: user.manager_id,
            asmen_id: user.asmen_id,
            gl_id: user.gl_id,
            role: role,
            ...(include_hierarchy === 'true' && {
                Manager: user.Manager,
                Asmen: user.Asmen,
                GL: user.GL
            })
        }));

        res.status(200).json({
            message: `Daftar ${role} berhasil diambil`,
            data: formattedUsers,
            total: formattedUsers.length,
            role: role
        });
    } catch (error) {
        console.error('Error in getUsersByRole:', error);
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
        const { userId, roleId, manager_id, asmen_id, gl_id } = req.body;

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

        // Update hierarchy fields based on role
        const hierarchyUpdate = {};
        if (manager_id !== undefined) hierarchyUpdate.manager_id = manager_id;
        if (asmen_id !== undefined) hierarchyUpdate.asmen_id = asmen_id;
        if (gl_id !== undefined) hierarchyUpdate.gl_id = gl_id;

        if (Object.keys(hierarchyUpdate).length > 0) {
            await user.update(hierarchyUpdate);
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
                userName: user.name,
                hierarchy: hierarchyUpdate
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
        const { q = '', limit = 10, role = '' } = req.query;

        if (!q.trim()) {
            return res.status(400).json({ 
                message: "Query pencarian tidak boleh kosong" 
            });
        }

        let includeOptions = [
            {
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }
        ];

        // Add role filter if specified
        if (role) {
            includeOptions[0].where = { name: role };
            includeOptions[0].required = true;
        }

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${q}%` } },
                    { email: { [Op.iLike]: `%${q}%` } }
                ]
            },
            attributes: ['id', 'name', 'email', 'manager_id', 'asmen_id', 'gl_id'],
            include: includeOptions,
            limit: parseInt(limit),
            order: [['name', 'ASC']]
        });

        const formattedUsers = users.map(user => {
            const roles = user.roles || [];
            const primaryRole = roles.length > 0 ? roles[0].name : 'user';

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                manager_id: user.manager_id,
                asmen_id: user.asmen_id,
                gl_id: user.gl_id,
                roles: roles,
                roleNames: roles.map(role => role.name),
                primaryRole: primaryRole,
                role: primaryRole
            };
        });

        res.status(200).json({
            message: "Pencarian user berhasil",
            data: formattedUsers,
            total: formattedUsers.length,
            query: q,
            roleFilter: role || null
        });
    } catch (error) {
        console.error('Error in searchUsers:', error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, manager_id, asmen_id, gl_id } = req.body;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Check access permissions
        if (req.userId !== parseInt(id)) {
            return res.status(403).json({ message: "Anda tidak memiliki akses untuk mengubah profil ini" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        if (manager_id !== undefined) updateData.manager_id = manager_id;
        if (asmen_id !== undefined) updateData.asmen_id = asmen_id;
        if (gl_id !== undefined) updateData.gl_id = gl_id;

        await user.update(updateData);

        const updatedUser = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'updated_at', 'manager_id', 'asmen_id', 'gl_id'],
            include: [{
                model: Role,
                as: 'roles',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }]
        });

        const roles = updatedUser.roles || [];
        const primaryRole = roles.length > 0 ? roles[0].name : 'user';

        const userData = {
            ...updatedUser.dataValues,
            roleNames: roles.map(role => role.name),
            primaryRole: primaryRole,
            role: primaryRole,
            hierarchyInfo: updatedUser.getHierarchyInfo()
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