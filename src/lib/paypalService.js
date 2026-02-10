import { supabase } from '@/lib/customSupabaseClient';

// These functions invoke Supabase Edge Functions to handle PayPal server-side logic securely

export const createPayPalOrder = async (bookingData) => {
  const { data, error } = await supabase.functions.invoke('paypal-create-order', {
    body: {
      total_price_gel: bookingData.total_price_gel,
      description: `Tour Booking: ${bookingData.tour_name}`
    }
  });

  if (error) throw error;
  return data.orderID;
};

export const capturePayPalOrder = async (orderID) => {
  const { data, error } = await supabase.functions.invoke('paypal-capture-order', {
    body: { orderID }
  });

  if (error) throw error;
  return data;
};