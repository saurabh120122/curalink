import { supabase } from '../lib/supabase.js';

const authMiddleware = async (req, res, next) => {
  // 1. Get the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided or invalid format.' });
  }

  // 2. Extract the token
  const token = authHeader.split(' ')[1];

  // 3. Verify the token with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // 4. Token is valid! Attach the user object to the request.
  // We also need to get the user's *role* from our 'profiles' table.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(500).json({ error: 'Failed to find user profile.' });
  }

  // 5. Now 'req.user' is available in all protected routes
  req.user = profile;
  
  next(); // Move on to the next function (the controller)
}

const researcherOnly = (req, res, next) => {
  if (req.user.role !== 'researcher') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Researcher role required.',
    });
  }
  next();
};

// New middleware to check if the user is a patient
const patientOnly = (req, res, next) => {
  if (req.user.role !== 'patient') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Patient role required.',
    });
  }
  next();
};

export {
  authMiddleware,
  researcherOnly,
  patientOnly,
};