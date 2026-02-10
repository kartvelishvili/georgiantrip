import { supabase } from '@/lib/customSupabaseClient';
import { calculateTripPrice } from './pricing';

export const calculateRoute = async (startLoc, endLoc, stops = []) => {
  // Calculate real distance using Haversine formula
  const { calculateDistance: haversine } = await import('@/lib/distanceCalculator');
  
  let totalDistance = 0;
  const routePoints = [startLoc, ...stops, endLoc].filter(Boolean);
  
  for (let i = 0; i < routePoints.length - 1; i++) {
    const a = routePoints[i];
    const b = routePoints[i + 1];
    if (a?.lat && a?.lng && b?.lat && b?.lng) {
      totalDistance += haversine(a.lat, a.lng, b.lat, b.lng);
    }
  }
  
  // Estimate duration: avg 60km/h + 10min buffer per stop
  const totalMinutes = Math.round((totalDistance / 60) * 60) + (stops.length * 10);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    distance: Math.round(totalDistance),
    duration: `${hours}h ${minutes}m`,
    start_address: startLoc?.name_en || startLoc,
    end_address: endLoc?.name_en || endLoc
  };
};

export const searchCars = async (params) => {
  const { date, distance, ...filters } = params;

  try {
    // Fetch cars with driver details and pricing
    let query = supabase
      .from('cars')
      .select(`
        *,
        driver:drivers (
          id,
          first_name,
          last_name,
          rating,
          reviews_count,
          languages_spoken,
          avatar_url,
          verification_status,
          driver_pricing(*)
        )
      `)
      .eq('active', true)
      .eq('verification_status', 'approved');

    const { data: cars, error } = await query;

    if (error) throw error;

    // Fetch global pricing settings from admin_settings
    const { data: adminSettings } = await supabase
      .from('admin_settings')
      .select('*')
      .maybeSingle();

    // CRITICAL FIX: Filter out cars where the driver relation returned null
    // This happens if a driver is deleted but their cars remain, or if RLS hides the driver
    const validCars = cars ? cars.filter(c => c.driver !== null) : [];

    // Process cars: calculate price with real pricing settings
    let processedCars = validCars.map(car => {
      let price = 0;
      try {
        const driverPricing = car.driver?.driver_pricing || null;
        price = calculateTripPrice(distance, adminSettings, driverPricing);
      } catch (e) {
        console.warn("Pricing calculation failed, using fallback", e);
        price = distance * 1.5;
      }

      return {
        ...car,
        price: Math.round(price),
        driver: car.driver
      };
    });

    // Apply the filtering logic
    return filterCars(processedCars, filters, distance);

  } catch (error) {
    console.error("Search cars error:", error);
    throw error;
  }
};

export const filterCars = (cars, filters, distance) => {
  if (!cars) return [];

  return cars.filter(item => {
    const { driver } = item;
    
    // Safety check inside filter loop as well
    if (!driver) return false;
    
    // 1. Class Filter
    let carClass = carClassMap(item);
    if (filters.class && filters.class !== carClass) return false;

    // 2. Car Type
    if (filters.carType && !item.description?.toLowerCase().includes(filters.carType.toLowerCase())) {
       // loose matching, or skip if strict
    }

    // 3. Language
    if (filters.language) {
      const driverLangs = driver.languages_spoken || [];
      const hasLang = driverLangs.some(l => l.toLowerCase().includes(filters.language.toLowerCase()));
      if (!hasLang) return false;
    }

    // 4. Fuel Type
    if (filters.fuelType && item.fuel_type?.toLowerCase() !== filters.fuelType.toLowerCase()) {
      return false;
    }

    // 5. Passengers
    if (filters.passengers) {
       const requiredSeats = parseInt(filters.passengers);
       if (item.seats < requiredSeats) return false;
    }

    // 6. Pets
    if (filters.petsAllowed) {
       const hasPets = item.features?.some(f => f.toLowerCase().includes('pet'));
       if (!hasPets) return false;
    }

    // 7. Text Search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchCar = `${item.make} ${item.model}`.toLowerCase().includes(query);
      const matchDriver = `${driver.first_name} ${driver.last_name}`.toLowerCase().includes(query);
      if (!matchCar && !matchDriver) return false;
    }

    return true;
  });
};

export const sortCars = (cars, sortOption) => {
  const sorted = [...cars];
  
  switch (sortOption) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating_desc':
      return sorted.sort((a, b) => (b.driver?.rating || 0) - (a.driver?.rating || 0));
    case 'reviews_desc':
      return sorted.sort((a, b) => (b.driver?.reviews_count || 0) - (a.driver?.reviews_count || 0));
    default:
      return sorted;
  }
};

export const carClassMap = (car) => {
    if (car.year >= 2020 && (car.make.includes('Mercedes') || car.make.includes('BMW'))) return 'Premium';
    if (car.year >= 2016) return 'Comfort';
    return 'Economy';
};