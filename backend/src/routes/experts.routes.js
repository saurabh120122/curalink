import express from 'express';
const router = express.Router();
import {
  searchExperts,
  getExpertById,
  requestMeeting
} from '../controllers/expertController.js';
import {
  authMiddleware,
  patientOnly,
} from '../middleware/authMiddleware.js';

// All routes are protected
router.use(authMiddleware);

// GET /api/experts - Search for experts
router.get('/', searchExperts);

// GET /api/experts/:id - Get a single expert's profile
router.get('/:id', getExpertById);

// POST /api/experts/:id/request-meeting - (Patient Only)
router.post('/:id/request-meeting', patientOnly, requestMeeting);

export default router;