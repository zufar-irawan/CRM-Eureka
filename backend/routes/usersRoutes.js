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
router.get('/with-roles', getAllUsersWithRoles);
router.get('/search', searchUsers);
router.get('/roles', getAllRoles);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.post('/assign-role', assignRoleToUser);
router.delete('/remove-role', removeRoleFromUser);

export default router;