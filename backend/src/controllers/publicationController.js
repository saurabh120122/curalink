import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import axios from 'axios';

// --- Search External (PubMed) ---
const searchPublications = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    throw new ApiError(400, 'Query "q" is required.');
  }

  // Placeholder for PubMed API call
  // const pubMedUrl = `...`;
  // const response = await axios.get(pubMedUrl);
  
  return res.status(200).json(
    new ApiResponse(200, [], 'External search not implemented. (Placeholder)')
  );
});

// --- Get Recommended (AI Feature) ---
const getRecommendedPublications = asyncHandler(async (req, res) => {
  // TODO: AI Logic
  return res.status(200).json(
    new ApiResponse(200, [], 'Recommendations not implemented. (Placeholder)')
  );
});

// --- Import Publications ---
const importPublications = asyncHandler(async (req, res) => {
  const researcher_id = req.user.id;
  const { orcid_id } = req.body; // or ORCID_ID from profile

  // TODO:
  // 1. Call ORCID API with orcid_id
  // 2. Get list of publications
  // 3. Format them and save to our 'publications' table
  
  return res.status(200).json(
    new ApiResponse(200, [], 'Import not implemented. (Placeholder)')
  );
});

export  {
  searchPublications,
  getRecommendedPublications,
  importPublications
};