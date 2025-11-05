import express from 'express';
const router = express.Router();
import {
  searchPublications,
  getRecommendedPublications,
  importPublications,
} from '../controllers/publicationController.js';
import {
  authMiddleware,
  researcherOnly,
  patientOnly,
} from '../middleware/authMiddleware.js';

// All routes are protected
router.use(authMiddleware);

// GET /api/publications/search - Search external APIs
router.get('/search', searchPublications);

// GET /api/publications/recommended - (Patient Only)
router.get('/recommended', patientOnly, getRecommendedPublications);

// POST /api/publications/import - (Researcher Only)
router.post('/import', researcherOnly, importPublications);

export default router;