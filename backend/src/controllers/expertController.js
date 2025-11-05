import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Search for Experts ---
const searchExperts = asyncHandler(async (req, res) => {
  const { q } = req.query; // Search query
  
  let query = supabase
    .from('profiles')
    .select('id, full_name, location, specialties, research_interests')
    .eq('role', 'researcher'); // Only search researchers
    
  if (q) {
    // This is a basic search. A real app would use full-text search.
    // 'pl.full_name' means search on the 'full_name' column
    query = query.or(`full_name.ilike.%${q}%,specialties.cs.{${q}}`); 
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json(new ApiResponse(200, data, 'Experts fetched.'));
});

// --- Get Expert by ID ---
// This is the same as getProfileById, so we can re-use it.
// We'll just create a new file for 'experts' for clarity.
const getExpertById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, location, specialties, research_interests, availability')
    .eq('id', id)
    .eq('role', 'researcher')
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Expert profile not found.');
  }
  
  // TODO: In a real app, also fetch this expert's publications
  // const { data: publications } = await supabase.from('publications')...

  return res.status(200).json(new ApiResponse(200, data, 'Expert fetched.'));
});

// --- Request a Meeting ---
const requestMeeting = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { id: researcher_id } = req.params;
  const patient_id = req.user.id; // From authMiddleware (patientOnly)

  const { data, error } = await supabase
    .from('meeting_requests')
    .insert({
      patient_id,
      researcher_id,
      message,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(201).json(new ApiResponse(201, data, 'Meeting requested.'));
});


export {
  searchExperts,
  getExpertById,
  requestMeeting,
};