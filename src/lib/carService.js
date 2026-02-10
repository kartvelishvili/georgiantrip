import { supabase } from '@/lib/customSupabaseClient';

export const getCarById = async (carId) => {
  const { data, error } = await supabase
    .from('cars')
    .select(`
      *,
      driver:drivers (
        id,
        first_name,
        last_name,
        phone,
        rating,
        reviews_count,
        avatar_url,
        bio,
        languages_spoken,
        verification_status
      ),
      transfer:transfers (
        id,
        from_location_id,
        to_location_id,
        distance_km,
        duration_minutes,
        base_price,
        from_location:locations!transfers_from_location_id_fkey(*),
        to_location:locations!transfers_to_location_id_fkey(*)
      ),
      images:car_images(*)
    `)
    .eq('id', carId)
    .single();

  if (error) throw error;
  
  // Sort images by order
  if (data.images && data.images.length > 0) {
      data.images.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }
  
  return data;
};

export const getCarReviews = async (carId) => {
  const { data, error } = await supabase
    .from('car_reviews')
    .select('*')
    .eq('car_id', carId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.warn("Could not fetch car reviews", error);
    return [];
  }
  return data;
};

// Also fetch driver reviews as backup/additional info
export const getDriverReviews = async (driverId) => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) return [];
    return data;
};

export const getRelatedCars = async (carId, transferId) => {
  if (!transferId) return [];

  // Fetch up to 3 other cars for the same transfer route
  const { data, error } = await supabase
    .from('cars')
    .select(`
      *,
      driver:drivers(*)
    `)
    .eq('transfer_id', transferId)
    .neq('id', carId) // Exclude current car
    .eq('active', true)
    .eq('verification_status', 'approved')
    .limit(3);

  if (error) {
    console.warn("Could not fetch related cars", error);
    return [];
  }
  return data;
};

// Admin / Management functions
export const getAllCars = async ({ status = 'all', activeState = 'all' } = {}) => {
  let query = supabase
    .from('cars')
    .select(`
      *,
      drivers!inner(id, first_name, last_name, email, phone)
    `)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('verification_status', status);
  }

  if (activeState === 'active') {
    query = query.eq('active', true);
  } else if (activeState === 'disabled') {
    query = query.eq('active', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateCarStatus = async (carId, isActive) => {
  const { data, error } = await supabase
    .from('cars')
    .update({ active: isActive })
    .eq('id', carId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCar = async (carId) => {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', carId);

  if (error) throw error;
};

// Image handling
export const addCarImage = async (carId, imageUrl, order = 0) => {
    const { data, error } = await supabase
        .from('car_images')
        .insert({ car_id: carId, image_url: imageUrl, display_order: order })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deleteCarImage = async (imageId) => {
    const { error } = await supabase.from('car_images').delete().eq('id', imageId);
    if (error) throw error;
};