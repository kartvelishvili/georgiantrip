import { supabase } from '@/lib/customSupabaseClient';

// Get the single hero settings row (or first one)
export const getHeroSettings = async () => {
  const { data, error } = await supabase
    .from('hero_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching hero settings:', error);
    return null;
  }
  return data;
};

// Update hero settings (assumes only one row exists or updates by ID)
export const updateHeroSettings = async (id, data) => {
  const { data: updatedData, error } = await supabase
    .from('hero_settings')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updatedData;
};

// Upload hero image to 'public' or 'images' bucket (using 'car-photos' or general bucket)
// We will reuse 'car-photos' bucket for simplicity as defined in policies, but preferably a generic one if available.
// Let's use 'car-photos' and put it in a 'hero' folder since we know policies exist for it.
export const uploadHeroImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `hero/hero-${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('car-photos') 
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('car-photos')
    .getPublicUrl(fileName);

  return publicUrl;
};