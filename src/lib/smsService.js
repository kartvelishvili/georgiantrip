import { supabase } from '@/lib/customSupabaseClient';

// Using the endpoint specified in the requirements
const SMS_API_URL = 'https://smsoffice.ge/integration/';

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Ensure it starts with 995
  if (cleaned.startsWith('995')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('5')) {
    return `+995${cleaned}`;
  } else if (cleaned.startsWith('05')) {
    return `+995${cleaned.substring(1)}`;
  }
  
  return `+${cleaned}`; 
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Georgian numbers: 995 + 9 digits = 12 digits
  return cleaned.length === 12 && cleaned.startsWith('995');
};

// Send a single SMS
export const sendSMS = async (phoneNumber, message, apiKey) => {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  if (!validatePhoneNumber(formattedPhone)) {
    return { success: false, error: 'Invalid phone number format' };
  }

  try {
    // Using the specific POST format requested
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message,
        sender: 'Georgiantrip'
      })
    });
    
    const data = await response.json();
    
    // Check for success status as per requirements
    if (data.status === 'success') {
      return { success: true, messageId: data.message_id };
    } else {
      return { success: false, error: data.error || 'Unknown error from SMS provider' };
    }
  } catch (error) {
    console.error('SMS Send Error:', error);
    return { success: false, error: error.message };
  }
};

// Main function to handle booking notifications
export const sendBookingSMS = async (booking, driver, admins) => {
  try {
    // 1. Fetch Settings
    const { data: settings } = await supabase.from('sms_settings').select('*').single();
    if (!settings || !settings.api_key) {
      console.warn('SMS Settings not found or API Key missing');
      return { success: false, error: 'Settings missing' };
    }

    const { api_key, driver_sms_template, admin_sms_template } = settings;

    // 2. Prepare Template Variables
    const variables = {
      driverName: `${driver.first_name} ${driver.last_name}`,
      passengerName: `${booking.customer_first_name}`,
      passengerPhone: booking.customer_phone,
      fromLocation: booking.pickup_location?.name_en || 'Start Location',
      toLocation: booking.dropoff_location?.name_en || 'End Location',
      date: booking.date,
      time: booking.time,
      bookingId: booking.id.slice(0, 8),
      carModel: `${booking.car?.make} ${booking.car?.model}`,
      price: booking.total_price
    };

    const replaceVariables = (template) => {
      if (!template) return '';
      let msg = template;
      Object.entries(variables).forEach(([key, value]) => {
        msg = msg.replace(new RegExp(`{${key}}`, 'g'), value || '');
      });
      return msg;
    };

    const logs = [];
    let driverSent = false;
    let adminsSent = 0;

    // 3. Send to Driver
    if (driver && driver.phone) {
      const driverMsg = replaceVariables(driver_sms_template);
      const driverResult = await sendSMS(driver.phone, driverMsg, api_key);
      
      if (driverResult.success) driverSent = true;

      logs.push({
        booking_id: booking.id,
        recipient_phone: driver.phone,
        recipient_type: 'driver',
        message: driverMsg,
        status: driverResult.success ? 'sent' : 'failed',
        error_message: driverResult.error
      });
    }

    // 4. Send to Admins
    if (admins && admins.length > 0) {
      const adminMsg = replaceVariables(admin_sms_template);
      
      for (const adminPhone of admins) {
        if (!adminPhone.phone_number) continue;
        
        const adminResult = await sendSMS(adminPhone.phone_number, adminMsg, api_key);
        
        if (adminResult.success) adminsSent++;

        logs.push({
          booking_id: booking.id,
          recipient_phone: adminPhone.phone_number,
          recipient_type: 'admin',
          message: adminMsg,
          status: adminResult.success ? 'sent' : 'failed',
          error_message: adminResult.error
        });
      }
    }

    // 5. Send to Passenger
    let passengerSent = false;
    if (booking.customer_phone) {
      const passengerMsg = `GeorgianTrip: Your booking #${variables.bookingId} is confirmed! Route: ${variables.fromLocation} → ${variables.toLocation}, Date: ${variables.date}, Driver: ${variables.driverName}, Car: ${variables.carModel}. Have a great trip!`;
      const passengerResult = await sendSMS(booking.customer_phone, passengerMsg, api_key);
      
      if (passengerResult.success) passengerSent = true;

      logs.push({
        booking_id: booking.id,
        recipient_phone: booking.customer_phone,
        recipient_type: 'passenger',
        message: passengerMsg,
        status: passengerResult.success ? 'sent' : 'failed',
        error_message: passengerResult.error
      });
    }

    // 6. Save Logs
    if (logs.length > 0) {
      await supabase.from('sms_logs').insert(logs);
    }

    return { success: true, driverSent, adminsSent, passengerSent };

  } catch (error) {
    console.error('sendBookingSMS critical error:', error);
    return { success: false, error: error.message };
  }
};