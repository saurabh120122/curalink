// Load environment variables
import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase URL or Service Key is missing. Check your .env file in the /backend folder.'
  );
}

// Use 'export const' instead of 'module.exports'
export const supabase = createClient(supabaseUrl, supabaseKey);