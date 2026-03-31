import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZnVvbHl1ZHFzeWV6anV3dWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk0NzE3MywiZXhwIjoyMDkwNTIzMTczfQ.0iFbD0mA3nvhiRUYpZQcLCV2Nl1b7SrEFj7X1nCU5z4';

// Admin client bypasses RLS — use only for operations that need cross-user access (groups)
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
