import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Create a new Favorite ---
const createFavorite = asyncHandler(async (req, res) => {
  const { item_type, item_data } = req.body;
  const user_id = req.user.id; // From authMiddleware

  // 1. Validate
  if (!item_type || !item_data) {
    throw new ApiError(400, 'item_type and item_data are required.');
  }

  // 2. Insert into the database
  const { data: newFavorite, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user_id,
      item_type: item_type,
      item_data: item_data,
    })
    .select() // Return the newly created row
    .single(); // We expect a single object back

  if (error) {
    throw new ApiError(500, error.message || 'Failed to create favorite.');
  }

  // 3. Send response
  return res.status(201).json(
    new ApiResponse(201, newFavorite, 'Favorite added successfully')
  );
});

// --- Get all of the user's Favorites ---
const getFavorites = asyncHandler(async (req, res) => {
  const user_id = req.user.id; // From authMiddleware

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    throw new ApiError(500, error.message || 'Failed to retrieve favorites.');
  }

  return res.status(200).json(
    new ApiResponse(200, favorites, 'Favorites retrieved successfully')
  );
});

// --- Delete a Favorite ---
const deleteFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params; // The ID of the favorite *entry*
  const user_id = req.user.id; // From authMiddleware

  // 1. Delete from database
  // We MUST match on BOTH id and user_id.
  // This is a critical security check to ensure users can only delete their *own* favorites.
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);

  if (error) {
    throw new ApiError(500, error.message || 'Failed to delete favorite.');
  }

  // 2. Send response
  return res.status(200).json(
    new ApiResponse(200, null, 'Favorite deleted successfully')
  );
});

export {
  createFavorite,
  getFavorites,
  deleteFavorite,
};