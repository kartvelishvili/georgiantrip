const GOOGLE_MAPS_API_KEY = 'AIzaSyBkYNWfkADjyv4T-17o8TJx0LNMKsy0Tig';

export const calculateDistance = async (origin, destination, stops = []) => {
  try {
    const waypoints = stops.length > 0 ? stops.join('|') : '';
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&waypoints=${waypoints}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const distanceInMeters = data.rows[0].elements[0].distance.value;
      const distanceInKm = distanceInMeters / 1000;
      return distanceInKm;
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
};

export const calculatePrice = (distanceKm, pricingSettings) => {
  if (!distanceKm || !pricingSettings) return 0;
  
  let multiplier = 1.0;
  
  if (distanceKm <= 50) {
    multiplier = pricingSettings.distance_0_50_multiplier;
  } else if (distanceKm <= 100) {
    multiplier = pricingSettings.distance_50_100_multiplier;
  } else if (distanceKm <= 200) {
    multiplier = pricingSettings.distance_100_200_multiplier;
  } else {
    multiplier = pricingSettings.distance_200_plus_multiplier;
  }
  
  const pricePerKm = Math.min(
    pricingSettings.base_price_per_km * multiplier,
    pricingSettings.max_price_per_km
  );
  
  const totalPrice = distanceKm * pricePerKm;
  
  return Math.max(totalPrice, pricingSettings.min_fare);
};