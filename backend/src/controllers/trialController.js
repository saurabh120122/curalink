import axios from 'axios';
import { asyncHandler } from '../utils/asyncHandler.js';
// This is the official API for ClinicalTrials.gov
const CLINICAL_TRIALS_API_URL = 'https://clinicaltrials.gov/api/v2/studies';

const searchTrials = async (req, res) => {
  // Get the search query from the URL (e.g., /api/trials/search?q=brain+cancer)
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query "q" is required.' });
  }

  try {
    // 1. Call the external ClinicalTrials.gov API
    const response = await axios.get(CLINICAL_TRIALS_API_URL, {
      params: {
        'query.term': q,
        'pageSize': 20, // Get 20 results
        'fields': 'nctId,briefTitle,briefSummary,overallStatus' // Get only the fields we need
      },
    });

    // 2. Format the data to match our frontend 'Trial' type
    const trials = response.data.studies.map((study) => ({
      nct_id: study.protocolSection.identificationModule.nctId,
      title: study.protocolSection.identificationModule.briefTitle,
      brief_summary: study.protocolSection.summaryModule.briefSummary,
      status: study.protocolSection.statusModule.overallStatus,
    }));

    // 3. Send the formatted trials back to our frontend
    res.status(200).json(trials);

  } catch (error) {
    console.error('Error fetching from ClinicalTrials.gov:', error.message);
    res.status(500).json({ error: 'Failed to fetch clinical trials.' });
  }
};

// ... (keep all existing imports: supabase, utils, axios, etc.)

// --- Search External API (Public) ---
// We already built this. We'll just make one change:
// Let's use our utils and protect it.
/*const searchTrials = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    throw new ApiError(400, 'Search query "q" is required.');
  }
  // ... (rest of the axios logic from before) ...
  // ...
  // At the end, send an ApiResponse
  return res.status(200).json(new ApiResponse(200, trials, 'External trials fetched'));
});*/

// --- Get Recommended Trials (AI Feature) ---
const getRecommendedTrials = asyncHandler(async (req, res) => {
  const user = req.user; // Patient from authMiddleware
  // TODO: AI LOGIC
  // 1. Get user.conditions from 'profiles' table (we need to fetch profile first)
  // 2. Create a complex query based on those conditions
  // 3. Call ClinicalTrials.gov API
  
  // For now, return a placeholder
  return res.status(200).json(
    new ApiResponse(200, [], 'Trial recommendations feature not yet implemented.')
  );
});

// --- Create a New Trial (Researcher Only) ---
const createTrial = asyncHandler(async (req, res) => {
  const { title, description, status, ai_summary } = req.body;
  const researcher_id = req.user.id; // From authMiddleware

  if (!title || !description || !status) {
    throw new ApiError(400, 'Title, description, and status are required.');
  }

  const { data, error } = await supabase
    .from('clinical_trials')
    .insert({
      title,
      description,
      status,
      ai_summary,
      researcher_id,
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message || 'Failed to create trial.');
  }

  return res.status(201).json(new ApiResponse(201, data, 'Trial created.'));
});

// --- Get My Trials (Researcher Only) ---
const getMyTrials = asyncHandler(async (req, res) => {
  const researcher_id = req.user.id;

  const { data, error } = await supabase
    .from('clinical_trials')
    .select('*')
    .eq('researcher_id', researcher_id);

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json(new ApiResponse(200, data, 'Your trials fetched.'));
});

// --- Get Single Trial (from our DB) ---
const getTrialById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('clinical_trials')
    .select('*') // In a real app, join with profile: `*, researcher:profiles(full_name, specialties)`
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Trial not found.');
  }

  return res.status(200).json(new ApiResponse(200, data, 'Trial fetched.'));
});

// --- Update a Trial (Researcher Only) ---
const updateTrial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const researcher_id = req.user.id;
  const { title, description, status, ai_summary } = req.body;

  const { data, error } = await supabase
    .from('clinical_trials')
    .update({ title, description, status, ai_summary })
    .eq('id', id)
    .eq('researcher_id', researcher_id) // Security check
    .select()
    .single();
    
  if (error) {
    throw new ApiError(500, error.message);
  }
  if (!data) {
    throw new ApiError(404, 'Trial not found or you do not have permission.');
  }

  return res.status(200).json(new ApiResponse(200, data, 'Trial updated.'));
});

// --- Delete a Trial (Researcher Only) ---
const deleteTrial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const researcher_id = req.user.id;

  const { error } = await supabase
    .from('clinical_trials')
    .delete()
    .eq('id', id)
    .eq('researcher_id', researcher_id); // Security check

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json(new ApiResponse(200, null, 'Trial deleted.'));
});


export {
  searchTrials,
  getRecommendedTrials,
  createTrial,
  getMyTrials,
  getTrialById,
  updateTrial,
  deleteTrial,
};