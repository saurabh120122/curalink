import express  from 'express';
const router = express.Router();
import { signUp, signIn, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // Import middleware

// --- Define the routes ---

// Public route for signing up
router.post('/signup', signUp);

// Public route for signing in
router.post('/signin', signIn);

// Protected route to get current user
// The 'authMiddleware' will run FIRST.
// If the user is authenticated, it will call 'getMe'.
// If not, it will send a 401 error.
router.get('/me', authMiddleware, getMe);

export default  router;