import { supabase } from '../lib/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Sign Up ---
const signUp = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // 1. Validate input
  if (!email || !password || !role) {
    // Use ApiError for validation errors
    throw new ApiError(400, 'Email, password, and role are required.');
  }

  // 2. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (authError) {
    throw new ApiError(400, authError.message);
  }

  if (!authData.user) {
    throw new ApiError(500, 'User not created in auth.');
  }

  // 3. Add the user's role to the public 'profiles' table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: authData.user.id, role: role }]);

  if (profileError) {
    // If this fails, we throw a server error
    throw new ApiError(500, 'User created in auth, but failed to create profile.');
  }

  // 4. Send back a standardized success response
  const responseData = {
    user: authData.user,
    session: authData.session,
  };

  return res.status(201).json(
    new ApiResponse(201, responseData, 'User created successfully')
  );
});


// --- Sign In ---
const signIn = asyncHandler(async (req, res) => {
  const { email, password }= req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    throw new ApiError(401, error.message); // 401 Unauthorized
  }

  // Get the user's role from our profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    throw new ApiError(404, 'User profile not found.');
  }

  // Combine auth data and profile data
  const responseData = {
    user: { ...data.user, role: profile.role },
    session: data.session,
  };

  return res.status(200).json(
    new ApiResponse(200, responseData, 'User signed in successfully')
  );
});


// --- Get Current User (me) ---
// We need to import the auth middleware
import { authMiddleware } from '../middleware/authMiddleware.js';

const getMe = asyncHandler(async (req, res) => {
  // The 'authMiddleware' has already run and attached 'req.user'
  // 'req.user' here is the profile { id, role }
  
  if (!req.user) {
    throw new ApiError(404, "User not found.");
  }
  
  // We can just return the user profile we got from the middleware
  return res.status(200).json(
    new ApiResponse(200, req.user, "User profile fetched successfully")
  );
});


export {
  signUp,
  signIn,
  getMe,
};