import { supabase } from '@/lib/customSupabaseClient';

/**
 * Get all transfers with location details
 */
export async function getAllTransfers() {
  const { data, error } = await supabase
    .from('transfers')
    .select(`
      *,
      from_location:locations!transfers_from_location_id_fkey(*),
      to_location:locations!transfers_to_location_id_fkey(*)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Get popular transfers
 */
export async function getPopularTransfers() {
  const { data, error } = await supabase
    .from('transfers')
    .select(`
      *,
      from_location:locations!transfers_from_location_id_fkey(*),
      to_location:locations!transfers_to_location_id_fkey(*)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(8);

  if (error) throw error;
  return data;
}

/**
 * Get a specific transfer by ID
 */
export async function getTransferById(transferId) {
  if (!transferId) return null;
  const { data, error } = await supabase
    .from('transfers')
    .select(`
      *,
      from_location:locations!transfers_from_location_id_fkey(*),
      to_location:locations!transfers_to_location_id_fkey(*)
    `)
    .eq('id', transferId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a specific transfer by Slug
 */
export async function getTransferBySlug(slug) {
  const { data, error } = await supabase
    .from('transfers')
    .select(`
      *,
      from_location:locations!transfers_from_location_id_fkey(*),
      to_location:locations!transfers_to_location_id_fkey(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get location details by ID
 */
export async function getLocationById(locationId) {
  if (!locationId) return null;
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', locationId)
    .single();
    
  if (error) return null;
  return data;
}

/**
 * Get cars available for a specific transfer route
 * Fetches only ACTIVE and APPROVED cars
 */
export async function getTransferCars(transferId) {
  // First, try to get cars specifically assigned to this transfer
  const { data: assignedCars, error: assignedError } = await supabase
    .from('cars')
    .select(`
      *,
      driver:drivers(*)
    `)
    .eq('transfer_id', transferId)
    .eq('active', true) // Only active cars
    .eq('verification_status', 'approved');

  if (!assignedError && assignedCars && assignedCars.length > 0) {
    return assignedCars;
  }

  // Fallback: fetch all active approved cars if no specific ones assigned
  const { data: cars, error } = await supabase
    .from('cars')
    .select(`
      *,
      driver:drivers(*)
    `)
    .eq('active', true) // Only active cars
    .eq('verification_status', 'approved');

  if (error) throw error;
  return cars;
}

/**
 * Search cars for a transfer route (by location IDs)
 * Fetches only ACTIVE and APPROVED cars
 */
export async function searchCarsForTransfer(fromId, toId, date) {
  // 1. Try to find the transfer ID for this route
  const { data: transfer } = await supabase
    .from('transfers')
    .select('id')
    .eq('from_location_id', fromId)
    .eq('to_location_id', toId)
    .single();

  if (transfer) {
    return getTransferCars(transfer.id);
  }

  // If no explicit transfer route exists, return all active cars
  const { data: cars, error } = await supabase
    .from('cars')
    .select(`
      *,
      driver:drivers(*)
    `)
    .eq('active', true) // Only active cars
    .eq('verification_status', 'approved');

  if (error) throw error;
  return cars;
}

/**
 * Get transfer with its available cars
 */
export async function getTransferWithCars(transferId) {
  const { data: transfer, error } = await supabase
    .from('transfers')
    .select(`
      *,
      from_location:locations!transfers_from_location_id_fkey(*),
      to_location:locations!transfers_to_location_id_fkey(*)
    `)
    .eq('id', transferId)
    .single();

  if (error) throw error;

  const cars = await getTransferCars(transferId);
  return { ...transfer, cars };
}

/**
 * Update the display order of transfers
 * @param {Array} transfers - Array of transfer objects with updated order
 */
export async function updateTransferOrder(transfers) {
  // Prepare updates array with id and new display_order
  const updates = transfers.map((t, index) => ({
    id: t.id,
    display_order: index,
    updated_at: new Date().toISOString()
  }));

  // Use upsert to update multiple rows efficiently
  const { error } = await supabase
    .from('transfers')
    .upsert(updates, { onConflict: 'id' });

  if (error) throw error;
}

// Admin Functions

export async function addTransfer(transferData) {
    const { data, error } = await supabase
        .from('transfers')
        .insert(transferData)
        .select()
        .single();
        
    if (error) throw error;
    return data;
}

export async function updateTransfer(id, transferData) {
    const { data, error } = await supabase
        .from('transfers')
        .update(transferData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteTransfer(id) {
    const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', id);

    if (error) throw error;
}