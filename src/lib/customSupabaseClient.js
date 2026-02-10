import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://whxtvtbhrrmqfnclqvxw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeHR2dGJocnJtcWZuY2xxdnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTU5MTcsImV4cCI6MjA4MzI5MTkxN30.ULNulds6TUoBvRZLN7CTWteRSBw7fY6y9jn6uBP3SOs';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
