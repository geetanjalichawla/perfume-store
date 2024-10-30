import express from 'express';
import userController from '../controllers/user.controller';

const router = express.Router();

// Route to get user by ID
router.get('/:id', userController.getUserById);

// Route to get user by username
router.get('/username/:username', userController.getUserByUsername);

// Route to get user by email (as a query parameter)
router.get('/by-email', userController.getUserByEmail);

// Route to get all users with pagination, sorting, and filtering
router.get('/', userController.getAllUsers);

// Route to create a new user
router.post('/', userController.createUser);

export default router;
