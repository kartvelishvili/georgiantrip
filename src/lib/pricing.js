export const calculateDistance = async (startLoc, endLoc) => {
  if (!startLoc || !endLoc) return 0;
  
  // Use real coordinates if available
  if (startLoc.lat && startLoc.lng && endLoc.lat && endLoc.lng) {
    const { calculateDistance: haversine } = await import('@/lib/distanceCalculator');
    return haversine(startLoc.lat, startLoc.lng, endLoc.lat, endLoc.lng);
  }
  
  // Fallback: rough estimate based on location IDs
  return 100;
};

export const calculateTripDuration = (distanceKm) => {
    // Assuming avg speed 60km/h + 10 mins buffer
    const minutes = Math.round((distanceKm / 60) * 60) + 10;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return {
        minutes,
        text: `${hours > 0 ? `${hours} hr ` : ''}${mins} min`
    };
};

export const calculateTripPrice = (distanceKm, globalSettings, driverPricing = null) => {
  if (!distanceKm) return 0;

  // Default settings if not provided
  const settings = globalSettings || {
    base_rate_per_km: 1.5,
    multiplier_0_50km: 1.5,
    multiplier_50_100km: 1.3,
    multiplier_100_200km: 1.2,
    multiplier_200_plus_km: 1.0,
    min_fare: 50,
    driver_price_override_enabled: true,
    max_price_per_km: 5.0
  };

  let baseRate = Number(settings.base_rate_per_km || 1.5);
  let multiplier = 1.0;

  // Determine Multiplier based on distance brackets
  if (distanceKm <= 50) {
    multiplier = Number(settings.multiplier_0_50km || 1.5);
  } else if (distanceKm <= 100) {
    multiplier = Number(settings.multiplier_50_100km || 1.3);
  } else if (distanceKm <= 200) {
    multiplier = Number(settings.multiplier_100_200km || 1.2);
  } else {
    multiplier = Number(settings.multiplier_200_plus_km || 1.0);
  }

  // Override Logic
  if (settings.driver_price_override_enabled && driverPricing) {
    // driverPricing might be an array if coming from Supabase 1:many, take first
    const dp = Array.isArray(driverPricing) ? driverPricing[0] : driverPricing;
    
    if (dp) {
        if (dp.base_rate_per_km) {
          baseRate = Number(dp.base_rate_per_km);
        }
        
        if (distanceKm > 200 && dp.multiplier_200plus) {
            multiplier = Number(dp.multiplier_200plus);
        }
    }
  }
  
  // Safety cap
  if (settings.max_price_per_km) {
      baseRate = Math.min(baseRate, Number(settings.max_price_per_km));
  }

  let totalPrice = distanceKm * baseRate * multiplier;

  // Min Fare Check
  if (settings.min_fare) {
    totalPrice = Math.max(totalPrice, Number(settings.min_fare));
  }

  return Math.round(totalPrice);
};

// Alias for compatibility
export const calculatePrice = calculateTripPrice;

export const calculateDriverIncome = (totalPrice, driverCommissionPercent = 70) => {
    const adminCommissionPercent = 100 - driverCommissionPercent;
    const adminCommission = totalPrice * (adminCommissionPercent / 100);
    const driverEarnings = totalPrice - adminCommission;

    return {
        gross: totalPrice,
        adminCommission: Number(adminCommission.toFixed(2)),
        driverEarnings: Number(driverEarnings.toFixed(2)),
        driverPercent: driverCommissionPercent,
        adminPercent: adminCommissionPercent
    };
};