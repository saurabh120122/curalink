import express from 'express';
const router = express.Router();
import {
  getCommunities,
  createCommunity,
  getPosts,
  createPost,
  getPostById,
  createReply,
} from '../controllers/forumController.js';
import {
  authMiddleware,
  researcherOnly,
  patientOnly,
} from '../middleware/authMiddleware.js';

// All forum routes are protected
router.use(authMiddleware);

// --- Community Routes ---
// GET /api/forums - Get all communities
router.get('/', getCommunities);
// POST /api/forums - Create a community (Researcher)
router.post('/', researcherOnly, createCommunity);

// --- Post Routes ---
// GET /api/forums/:communitySlug/posts - Get posts in a community
router.get('/:communitySlug/posts', getPosts);
// POST /api/forums/:communitySlug/posts - Create a post (Patient)
router.post('/:communitySlug/posts', patientOnly, createPost);

// --- Reply Routes ---
// GET /api/forums/posts/:postId - Get a single post and its replies
router.get('/posts/:postId', getPostById);
// POST /api/forums/posts/:postId/reply - Reply to a post (Researcher)
router.post('/posts/:postId/reply', researcherOnly, createReply);
export default router;