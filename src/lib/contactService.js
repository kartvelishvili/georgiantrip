import { supabase } from '@/lib/customSupabaseClient';

export const submitContactForm = async (formData) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([formData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const submitDriverApplication = async (formData) => {
  const { data, error } = await supabase
    .from('driver_applications')
    .insert([formData])
    .select()
    .single();

  if (error) throw error;
  return data;
};