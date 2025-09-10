import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Akses ditolak, token tidak ditemukan' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        req.userName = decoded.name;
        req.userRoles = decoded.roles || [];
        req.primaryRole = decoded.primaryRole || 'user';
        req.managerId = decoded.manager_id;
        req.asmenId = decoded.asmen_id;
        req.glId = decoded.gl_id;
        req.token = token;

        next();
    } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token telah kedaluwarsa' 
            });
        }
        res.status(401).json({ 
            success: false,
            message: 'Token tidak valid' 
        });
    }
}

// Role-based middleware
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.userRoles || req.userRoles.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak: Tidak ada role yang ditemukan'
            });
        }

        const hasRequiredRole = roles.some(role => req.userRoles.includes(role));
        
        if (!hasRequiredRole) {
            return res.status(403).json({
                success: false,
                message: `Akses ditolak: Memerlukan role ${roles.join(' atau ')}`,
                userRoles: req.userRoles
            });
        }

        next();
    };
};

// Admin-only middleware
export const requireAdmin = (req, res, next) => {
    if (!req.userRoles || !req.userRoles.includes('admin')) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Memerlukan role admin'
        });
    }
    next();
};

// Manager level and above (manager, admin)
export const requireManagerLevel = (req, res, next) => {
    const managerLevelRoles = ['admin', 'manager'];
    const hasAccess = req.userRoles && req.userRoles.some(role => managerLevelRoles.includes(role));
    
    if (!hasAccess) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Memerlukan role manager atau lebih tinggi'
        });
    }
    next();
};

// Asmen level and above (asmen, manager, admin)
export const requireAsmenLevel = (req, res, next) => {
    const asmenLevelRoles = ['admin', 'manager', 'asmen'];
    const hasAccess = req.userRoles && req.userRoles.some(role => asmenLevelRoles.includes(role));
    
    if (!hasAccess) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Memerlukan role asmen atau lebih tinggi'
        });
    }
    next();
};

// GL level and above (gl, asmen, manager, admin)
export const requireGLLevel = (req, res, next) => {
    const glLevelRoles = ['admin', 'manager', 'asmen', 'gl'];
    const hasAccess = req.userRoles && req.userRoles.some(role => glLevelRoles.includes(role));
    
    if (!hasAccess) {
        return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Memerlukan role GL atau lebih tinggi'
        });
    }
    next();
};

// Check if user can access another user's data based on hierarchy
export const canAccessUser = (targetUserId) => {
    return (req, res, next) => {
        // Admin can access everyone
        if (req.userRoles && req.userRoles.includes('admin')) {
            return next();
        }

        // Users can access themselves
        if (req.userId === parseInt(targetUserId)) {
            return next();
        }

        // TODO: Add more complex hierarchy-based access logic here
        // For now, allow access if user has manager, asmen, or gl role
        const supervisoryRoles = ['manager', 'asmen', 'gl'];
        const hasSupervisoryRole = req.userRoles && req.userRoles.some(role => supervisoryRoles.includes(role));
        
        if (!hasSupervisoryRole) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak: Tidak dapat mengakses data user lain'
            });
        }

        next();
    };
};

// Check hierarchy-based data access
export const canAccessHierarchyData = (req, res, next) => {
    // Admin can access all data
    if (req.userRoles && req.userRoles.includes('admin')) {
        req.canAccessAll = true;
        req.hierarchyFilter = null;
        return next();
    }
    if (req.userRoles && req.userRoles.includes('manager')) {
        req.hierarchyFilter = { manager_id: req.userId };
        req.canAccessTeamData = true;
    } else if (req.userRoles && req.userRoles.includes('asmen')) {
        req.hierarchyFilter = { asmen_id: req.userId };
        req.canAccessTeamData = true;
    } else if (req.userRoles && req.userRoles.includes('gl')) {
        req.hierarchyFilter = { gl_id: req.userId };
        req.canAccessTeamData = true;
    } else {
        req.hierarchyFilter = { id: req.userId };
        req.canAccessTeamData = false;
    }

    next();
};

export default authMiddleware;