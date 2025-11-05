import { supabase }  from '../lib/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
// --- Get Logged-in User's Detailed Profile ---
const getMyProfile = asyncHandler(async (req, res) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('*') // Select all new fields
    .eq('id', user_id)
    .single();
    
  if (error || !data) {
    throw new ApiError(404, 'Profile not found.');
  }
  
  // We don't need to return the user's role from here
  // But we need to get their email from the auth table
  const { data: { user } } = await supabase.auth.admin.getUserById(user_id);
  
  const profileData = { ...data, email: user.email };

  return res.status(200).json(
    new ApiResponse(200, profileData, 'Profile fetched.')
  );
});

// --- Update Logged-in User's Profile ---
const updateMyProfile = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  // Get all possible fields from the body
  const {
    full_name,
    location,
    conditions, // Patient
    specialties, // Researcher
    research_interests,
    orcid_id,
    researchgate_link,
    availability,
  } = req.body;

  // Build the update object dynamically
  const profileData = {};
  if (full_name) profileData.full_name = full_name;
  if (location) profileData.location = location;
  if (conditions) profileData.conditions = conditions;
  if (specialties) profileData.specialties = specialties;
  if (research_interests) profileData.research_interests = research_interests;
  if (orcid_id) profileData.orcid_id = orcid_id;
  if (researchgate_link) profileData.researchgate_link = researchgate_link;
  if (availability !== undefined) profileData.availability = availability;
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', user_id)
    .select()
    .single();
    
  if (error) {
    throw new ApiError(500, error.message);
  }

  return res.status(200).json(new ApiResponse(200, data, 'Profile updated.'));
});

// --- Get Public Profile by ID ---
const getProfileById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('profiles')
    // Only select public-safe fields
    .select('id, full_name, location, specialties, research_interests, role')
    .eq('id', id)
    .single();
    
  if (error || !data) {
    throw new ApiError(404, 'User profile not found.');
  }

  return res.status(200).json(new ApiResponse(200, data, 'Profile fetched.'));
});

export {
  getMyProfile,
  updateMyProfile,
  getProfileById,
};