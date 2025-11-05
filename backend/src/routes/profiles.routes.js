import express from'express';
const router = express.Router();
import {
  getMyProfile,
  updateMyProfile,
  getProfileById
} from'../controllers/profileController.js';
import { authMiddleware } from'../middleware/authMiddleware.js';

// All routes are protected
router.use(authMiddleware);

// GET /api/profiles/me - Get my own detailed profile
router.get('/me', getMyProfile);

// PUT /api/profiles/me - Update my own profile
router.put('/me', updateMyProfile);

// GET /api/profiles/:id - Get another user's public profile
router.get('/:id', getProfileById);

export default router;