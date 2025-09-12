// middleware/hierarchyMiddleware.js
import { User } from "../models/usersModel.js";

export const getTeamMemberIds = async (userId, userRoles) => {
    try {
        const teamIds = [userId]; 
        const user = await User.findByPk(userId);
        if (user) {
            if (user.gl_id) teamIds.push(user.gl_id);
            if (user.asmen_id) teamIds.push(user.asmen_id);
            if (user.manager_id) teamIds.push(user.manager_id);
        }

        if (userRoles.includes('admin')) {
            const allUsers = await User.findAll({ attributes: ['id'] });
            return allUsers.map(user => user.id);
        }

        if (userRoles.includes('manager')) {
            const subordinates = await User.findAll({
                where: { manager_id: userId },
                attributes: ['id']
            });
            teamIds.push(...subordinates.map(user => user.id));
        }

        if (userRoles.includes('asmen')) {
            const gls = await User.findAll({
                where: { asmen_id: userId },
                attributes: ['id']
            });
            teamIds.push(...gls.map(user => user.id));
            if (gls.length > 0) {
                const sales = await User.findAll({
                    where: { gl_id: gls.map(gl => gl.id) },
                    attributes: ['id']
                });
                teamIds.push(...sales.map(user => user.id));
            }
        }

        if (userRoles.includes('gl')) {
            const sales = await User.findAll({
                where: { gl_id: userId },
                attributes: ['id']
            });
            teamIds.push(...sales.map(user => user.id));
        }

        return [...new Set(teamIds)]; 
    } catch (error) {
        console.error('Error getting team member IDs:', error);
        return [userId]; 
    }
};

export const addTeamAccess = async (req, res, next) => {
    try {
        if (!req.userId || !req.userRoles) {
            return res.status(401).json({ message: "Authentication required" });
        }

        req.teamMemberIds = await getTeamMemberIds(req.userId, req.userRoles);
        
        req.permissions = {
            isAdmin: req.userRoles.includes('admin'),
            isManager: req.userRoles.includes('manager'),
            isAsmen: req.userRoles.includes('asmen'),
            isGL: req.userRoles.includes('gl'),
            isSales: req.userRoles.includes('sales'),
            canViewAllData: req.userRoles.includes('admin') || req.userRoles.includes('manager'),
            canViewTeamData: ['admin', 'manager', 'asmen', 'gl'].some(role => req.userRoles.includes(role)),
            canManageUsers: req.userRoles.includes('admin'),
            canApproveContracts: ['admin', 'manager', 'asmen'].some(role => req.userRoles.includes(role))
        };

        next();
    } catch (error) {
        console.error('Error in addTeamAccess middleware:', error);
        res.status(500).json({ message: "Server error in permission check" });
    }
};

export const canAccessResourceOwner = (resourceOwnerId) => {
    return (req, res, next) => {
        if (req.permissions && req.permissions.isAdmin) {
            return next();
        }

        if (req.teamMemberIds && req.teamMemberIds.includes(parseInt(resourceOwnerId))) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Tidak dapat mengakses resource ini'
        });
    };
};

export const applyHierarchyFilter = (req, res, next) => {
    if (!req.permissions) {
        return res.status(401).json({ message: "Permission check required" });
    }

    if (req.permissions.isAdmin) {
        req.dataFilter = {};
        return next();
    }

    if (req.teamMemberIds && req.teamMemberIds.length > 0) {
        req.dataFilter = {
            owner: req.teamMemberIds 
        };
    } else {
        req.dataFilter = {
            owner: req.userId 
        };
    }

    next();
};

export default {
    addTeamAccess,
    canAccessResourceOwner,
    applyHierarchyFilter,
    getTeamMemberIds
}; 