import { supabase } from '@/lib/customSupabaseClient';

export const getPopularTours = async () => {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(4);

  if (error) {
    console.error('Error fetching popular tours:', error);
    return [];
  }
  return data;
};

export const getTourById = async (id) => {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};