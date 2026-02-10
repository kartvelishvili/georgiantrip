import { supabase } from '@/lib/customSupabaseClient';

export const getTourDetails = async (tourId) => {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('id', tourId)
    .single();

  if (error) throw error;
  return data;
};

export const updateTourDetails = async (tourId, data) => {
  const { data: updatedData, error } = await supabase
    .from('tours')
    .update(data)
    .eq('id', tourId)
    .select()
    .single();

  if (error) throw error;
  return updatedData;
};

export const uploadTourGalleryImage = async (tourId, file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `tours/${tourId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Using 'car-photos' bucket as per existing policies, but ideally should be 'tour-photos' or general 'images'
  const { error: uploadError } = await supabase.storage
    .from('car-photos') 
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('car-photos')
    .getPublicUrl(fileName);

  return publicUrl;
};