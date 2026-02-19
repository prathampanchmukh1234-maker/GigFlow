import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://egwjteknrmfbkgikijha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnd2p0ZWtucm1mYmtnaWtpamhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzE3NDgsImV4cCI6MjA4NjU0Nzc0OH0.H4AmcgWYX6PW822ijEqU-7ldNHtuIsFK-KH6neA-jxo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
