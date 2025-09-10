// routes/usersRoutes.js
import express from "express";
import {
    getUserById,
    getAllUsers,
    getAllUsersWithRoles,
    getAllRoles,
    assignRoleToUser,
    removeRoleFromUser,
    searchUsers,
    updateUser,
    getHierarchy,
    getUsersByRole
} from "../controllers/usersController.js";

import authMiddleware, {
    requireRole,
    requireAdmin,
    requireManagerLevel,
    requireAsmenLevel,
    requireGLLevel
} from "../middleware/authMiddleware.js";

import { addTeamAccess } from "../middleware/hierarchyMiddleware.js";

const router = express.Router();

router.get('/', 
    authMiddleware, 
    requireGLLevel, 
    getAllUsers
);

router.get('/with-roles', 
    authMiddleware, 
    requireAsmenLevel, // Asmen level and above can view user roles
    getAllUsersWithRoles
);

// Get organizational hierarchy
router.get('/hierarchy', 
    authMiddleware, 
    requireGLLevel, 
    getHierarchy
);

// Get users by specific role
router.get('/role/:role', 
    authMiddleware, 
    requireAsmenLevel, // Asmen level and above can filter by role
    getUsersByRole
);

// Search users
router.get('/search', 
    authMiddleware, 
    addTeamAccess, // Add team access for filtered search
    searchUsers
);

// Get all roles (for dropdown/selection)
router.get('/roles', 
    authMiddleware, 
    requireGLLevel, // GL level and above can view available roles
    getAllRoles
);

// Get specific user by ID
router.get('/:id', 
    authMiddleware, 
    addTeamAccess, // Check if user can access this specific user
    getUserById
);

// Update user profile
router.put('/:id', 
    authMiddleware, 
    updateUser // This includes self-access check in the controller
);

// Assign role to user (Admin only)
router.post('/assign-role', 
    authMiddleware, 
    requireAdmin,
    assignRoleToUser
);

// Remove role from user (Admin only)
router.delete('/remove-role', 
    authMiddleware, 
    requireAdmin,
    removeRoleFromUser
);

export default router;