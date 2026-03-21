/**
 * API Client — drop-in replacement for Supabase JS SDK
 * Redirects all queries to our Express backend at localhost:3001
 */
export { default, customSupabaseClient, supabase } from './apiClient.js';
