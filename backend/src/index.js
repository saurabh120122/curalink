// Load .env variables
import 'dotenv/config'; // Use this instead of require('dotenv').config()

import express from 'express';
import cors from 'cors';

// Import all our utility classes
import { ApiError } from './utils/ApiError.js';

// Import all our routes
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profiles.routes.js';
import trialRoutes from './routes/trials.routes.js';
import expertRoutes from './routes/experts.routes.js';
import publicationRoutes from './routes/publications.routes.js';
import favoriteRoutes from './routes/favorites.routes.js';
import forumRoutes from './routes/forums.routes.js';
import connectionRoutes from './routes/connections.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// --- 1. Middleware ---
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(express.json());

// --- 2. Routes ---

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'CuraLink Backend is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/connections', connectionRoutes);

// --- 3. Global Error Handler ---
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      data: null,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    errors: [err.message],
    data: null,
  });
});

// --- 4. Start the Server ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});