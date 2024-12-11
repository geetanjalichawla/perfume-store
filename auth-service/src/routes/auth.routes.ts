import express from 'express';
import authController from '../controllers/auth.controller';

const router = express.Router();

// Route for registering a new user
router.post('/register', authController.register);

// Route for logging in an existing user
router.post('/login', authController.login);

// Route for refreshing the authentication token
router.post('/refresh-token', authController.refreshToken);

export default router;
