import express from'express';
const router = express.Router();
import {
  searchTrials,
  getRecommendedTrials,
  createTrial,
  getMyTrials,
  getTrialById,
  updateTrial,
  deleteTrial
} from '../controllers/trialController.js';

import {
  authMiddleware,
  researcherOnly,
  patientOnly,
} from '../middleware/authMiddleware.js';

// --- Routes ---

// GET /api/trials/search - Search external API
router.get('/search', authMiddleware, searchTrials);

// GET /api/trials/recommended - AI recommendations
router.get('/recommended', authMiddleware, patientOnly, getRecommendedTrials);

// POST /api/trials - Create a new trial
router.post('/', authMiddleware, researcherOnly, createTrial);

// GET /api/trials/my-trials - Get researcher's own trials
router.get('/my-trials', authMiddleware, researcherOnly, getMyTrials);

// GET /api/trials/:id - Get a single trial from our DB
router.get('/:id', authMiddleware, getTrialById);

// PUT /api/trials/:id - Update researcher's own trial
router.put('/:id', authMiddleware, researcherOnly, updateTrial);

// DELETE /api/trials/:id - Delete researcher's own trial
router.delete('/:id', authMiddleware, researcherOnly, deleteTrial);

export default router;