// routes/usersRoutes.js
import express from 'express';
import { 
    getUserById, 
    getAllUsers, 
    getAllUsersWithRoles,
    getAllRoles,
    assignRoleToUser,
    removeRoleFromUser,
    searchUsers,
    updateUser 
} from '../controllers/usersController.js';

const router = express.Router();

// Get all users (with pagination and optional roles)
router.get('/', getAllUsers);

// Get all users with roles (for dropdowns, mentions, etc.)
router.get('/with-roles', getAllUsersWithRoles);

// Search users (for mentions/tagging)
router.get('/search', searchUsers);

// Get all available roles
router.get('/roles', getAllRoles);

// Get user by ID
router.get('/:id', getUserById);

// Update user profile
router.put('/:id', updateUser);

// Role management routes
router.post('/assign-role', assignRoleToUser);
router.delete('/remove-role', removeRoleFromUser);

export default router;