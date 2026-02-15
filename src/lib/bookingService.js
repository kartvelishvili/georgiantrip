import { supabase } from '@/lib/customSupabaseClient';
import { sendBookingSMS, sendSMS } from '@/lib/smsService';

export const createTransferBooking = async (bookingData) => {
  try {
    // 1. Insert Booking using RPC
    // We use the 'create_booking_v2' RPC function because it is SECURITY DEFINER.
    // This allows us to insert and immediately retrieve the booking details (including joins)
    // without hitting Row Level Security (RLS) "SELECT" policy violations for public/anonymous users.
    const { data: booking, error } = await supabase
      .rpc('create_booking_v2', { booking_data: bookingData });

    if (error) throw error;

    // 2. Fetch admin phones for SMS
    const { data: admins } = await supabase
      .from('admin_phone_numbers')
      .select('phone_number')
      .eq('is_primary', true);

    // 3. Send SMS Notifications (Async - Fire and Forget)
    // We do NOT await this, so the UI doesn't freeze waiting for the SMS API
    if (booking && booking.driver) {
       sendBookingSMS(booking, booking.driver, admins)
         .then(result => console.log('Background SMS Sent:', result))
         .catch(err => console.error('Background SMS Failed:', err));
    }

    return { success: true, ...booking };

  } catch (error) {
    console.error('Booking Creation Error:', error);
    throw error;
  }
};

export const createTourBooking = async (bookingData) => {
  try {
    // Use RPC to bypass RLS policies for public inserts that need to return data
    const { data, error } = await supabase
      .rpc('create_tour_booking', { booking_data: bookingData });

    if (error) throw error;

    // Send SMS notification to admin phones (fire and forget)
    try {
      const [{ data: admins }, { data: smsSettings }] = await Promise.all([
        supabase.from('admin_phone_numbers').select('phone_number').eq('is_primary', true),
        supabase.from('sms_settings').select('api_key, admin_sms_template').single()
      ]);

      if (smsSettings?.api_key) {
        const tourName = bookingData.tour_name || 'Tour';
        
        // Send SMS to admins
        if (admins?.length > 0) {
          const adminMessage = `New Tour Booking! Tour: ${tourName}, Passenger: ${bookingData.passenger_name}, Date: ${bookingData.tour_date}, Travelers: ${bookingData.passenger_count}, Price: ${bookingData.total_price} GEL`;
          for (const admin of admins) {
            if (admin.phone_number) {
              sendSMS(admin.phone_number, adminMessage, smsSettings.api_key)
                .then(r => console.log('Tour SMS to admin:', r))
                .catch(e => console.error('Tour SMS to admin failed:', e));
            }
          }
        }
        
        // Send SMS to tourist/passenger
        if (bookingData.passenger_phone) {
          const passengerMessage = `GeorgianTrip: შენს მიერ შერჩეული ტური წარმატებით დაიჯავშნა www.georgiantrip.com საიტზე. Tour: ${tourName}, Date: ${bookingData.tour_date}`;
          sendSMS(bookingData.passenger_phone, passengerMessage, smsSettings.api_key)
            .then(r => console.log('Tour SMS to passenger:', r))
            .catch(e => console.error('Tour SMS to passenger failed:', e));
        }
      }
    } catch (smsErr) {
      console.error('Tour booking SMS error (non-fatal):', smsErr);
    }

    return data;
  } catch (error) {
    console.error('Tour Booking Creation Error:', error);
    throw error;
  }
};

export const updateTourBookingPayment = async (bookingId, paymentData) => {
  try {
    const updatePayload = {
      payment_status: paymentData.status,
      updated_at: new Date().toISOString()
    };
    
    // Only set transaction fields if provided
    if (paymentData.transactionId !== undefined) {
      updatePayload.paypal_transaction_id = paymentData.transactionId;
    }
    if (paymentData.paypalOrderId) {
      updatePayload.paypal_order_id = paymentData.paypalOrderId;
    }
    if (paymentData.payerEmail) {
      updatePayload.paypal_payer_email = paymentData.payerEmail;
    }

    const { data, error } = await supabase
      .from('tour_bookings')
      .update(updatePayload)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Tour Booking Update Error:', error);
    throw error;
  }
};

export const getTourBooking = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('tour_bookings')
      .select(`
        *,
        tours:tour_id (*)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get Tour Booking Error:', error);
    throw error;
  }
};

export const getAllTourBookings = async () => {
  try {
    const { data, error } = await supabase
      .from('tour_bookings')
      .select(`
        *,
        tours:tour_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get All Tour Bookings Error:', error);
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  // First try to find in transfer bookings
  const { data: transferBooking, error: transferError } = await supabase
    .from('bookings')
    .select(`
      *,
      pickup_location:locations!bookings_pickup_location_id_fkey(*),
      dropoff_location:locations!bookings_dropoff_location_id_fkey(*),
      car:cars(*),
      driver:drivers(*)
    `)
    .eq('id', bookingId)
    .maybeSingle();

  if (transferBooking) {
    return { ...transferBooking, type: 'transfer' };
  }

  // If not found, try tour bookings
  const { data: tourBooking, error: tourError } = await supabase
    .from('tour_bookings')
    .select(`
      *,
      tour:tours(*)
    `)
    .eq('id', bookingId)
    .maybeSingle();

  if (tourBooking) {
    return { ...tourBooking, type: 'tour' };
  }

  // If neither found, throw error
  if (transferError) throw transferError;
  if (tourError) throw tourError;
  
  throw new Error('Booking not found');
};