// middleware/hierarchyMiddleware.js
import { User } from "../models/usersModel.js";

// Helper function to get user's team members based on hierarchy
export const getTeamMemberIds = async (userId, userRoles) => {
    try {
        const teamIds = [userId]; // Always include self

        // Admin can access everyone
        if (userRoles.includes('admin')) {
            const allUsers = await User.findAll({ attributes: ['id'] });
            return allUsers.map(user => user.id);
        }

        // Manager can access all users under them
        if (userRoles.includes('manager')) {
            const subordinates = await User.findAll({
                where: { manager_id: userId },
                attributes: ['id']
            });
            teamIds.push(...subordinates.map(user => user.id));
        }

        // Asmen can access GLs and Sales under them
        if (userRoles.includes('asmen')) {
            const gls = await User.findAll({
                where: { asmen_id: userId },
                attributes: ['id']
            });
            teamIds.push(...gls.map(user => user.id));

            // Also get sales under these GLs
            if (gls.length > 0) {
                const sales = await User.findAll({
                    where: { gl_id: gls.map(gl => gl.id) },
                    attributes: ['id']
                });
                teamIds.push(...sales.map(user => user.id));
            }
        }

        // GL can access Sales under them
        if (userRoles.includes('gl')) {
            const sales = await User.findAll({
                where: { gl_id: userId },
                attributes: ['id']
            });
            teamIds.push(...sales.map(user => user.id));
        }

        return [...new Set(teamIds)]; // Remove duplicates
    } catch (error) {
        console.error('Error getting team member IDs:', error);
        return [userId]; // Fallback to only self
    }
};

// Middleware to add team member access to request
export const addTeamAccess = async (req, res, next) => {
    try {
        if (!req.userId || !req.userRoles) {
            return res.status(401).json({ message: "Authentication required" });
        }

        req.teamMemberIds = await getTeamMemberIds(req.userId, req.userRoles);
        
        // Add permission flags
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

// Check if user can access specific resource owner
export const canAccessResourceOwner = (resourceOwnerId) => {
    return (req, res, next) => {
        // Admin can access everything
        if (req.permissions && req.permissions.isAdmin) {
            return next();
        }

        // Check if resource owner is in user's team
        if (req.teamMemberIds && req.teamMemberIds.includes(parseInt(resourceOwnerId))) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Tidak dapat mengakses resource ini'
        });
    };
};

// Middleware to filter data based on hierarchy
export const applyHierarchyFilter = (req, res, next) => {
    if (!req.permissions) {
        return res.status(401).json({ message: "Permission check required" });
    }

    // Admin sees everything
    if (req.permissions.isAdmin) {
        req.dataFilter = {};
        return next();
    }

    // Others see based on their team
    if (req.teamMemberIds && req.teamMemberIds.length > 0) {
        req.dataFilter = {
            owner: req.teamMemberIds // This should be adapted based on your data structure
        };
    } else {
        req.dataFilter = {
            owner: req.userId // Fallback to only own data
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