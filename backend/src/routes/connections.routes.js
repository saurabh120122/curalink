import express from 'express';
const router = express.Router();
import {
  getConnections,
  requestConnection,
  acceptConnection,
  getChatMessages,
  sendChatMessage
} from '../controllers/connectionController.js';
import {
  authMiddleware,
  researcherOnly,
} from '../middleware/authMiddleware.js';

// All routes are protected and for Researchers only
router.use(authMiddleware);
router.use(researcherOnly);

// GET /api/connections - Get my connections
router.get('/', getConnections);

// POST /api/connections/request/:userId - Send connection request
router.post('/request/:userId', requestConnection);

// POST /api/connections/accept/:requestId - Accept connection request
router.post('/accept/:requestId', acceptConnection);

// GET /api/connections/chat/:connectionId/messages - Get chat messages
router.get('/chat/:connectionId/messages', getChatMessages);

// POST /api/connections/chat/:connectionId/messages - Send a chat message
router.post('/chat/:connectionId/messages', sendChatMessage);
export default router;