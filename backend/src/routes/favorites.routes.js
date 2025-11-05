import express from 'express';
const router = express.Router();
import {
  createFavorite,
  getFavorites,
  deleteFavorite
} from '../controllers/favoriteController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

// --- Define the routes ---

// All routes in this file are protected by the authMiddleware

// POST /api/favorites
// Create a new favorite
router.post('/', authMiddleware, createFavorite);

// GET /api/favorites
// Get all of the current user's favorites
router.get('/', authMiddleware, getFavorites);

// DELETE /api/favorites/:id
// Delete a specific favorite by its ID
router.delete('/:id', authMiddleware, deleteFavorite);

export default router