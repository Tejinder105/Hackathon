import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Cache for API responses (simple in-memory cache for MVP)
const cache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Get weather and environmental data
export const getThreatData = async (locationId) => {
  try {
    const cacheKey = `threat_data_${locationId}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Get location coordinates (mock for MVP)
    const coordinates = getLocationCoordinates(locationId);
    
    // Fetch weather data from OpenWeatherMap
    const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
    
    // Fetch tide data (mock for MVP)
    const tideData = await getTideData(coordinates.lat, coordinates.lon);
    
    // Fetch satellite data (mock for MVP)
    const satelliteData = await getSatelliteData(coordinates.lat, coordinates.lon);

    const threatData = {
      location_id: locationId,
      coordinates,
      weather: weatherData,
      tides: tideData,
      satellite: satelliteData,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    cache.set(cacheKey, {
      data: threatData,
      timestamp: Date.now()
    });

    return threatData;

  } catch (error) {
    console.error('Error fetching threat data:', error);
    throw new Error('Failed to fetch environmental data');
  }
};

// Get weather data from OpenWeatherMap API
const getWeatherData = async (lat, lon) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      // Return mock data if no API key
      return getMockWeatherData();
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    const forecast = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    return {
      current: {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        wind_speed: response.data.wind.speed,
        wind_direction: response.data.wind.deg,
        visibility: response.data.visibility,
        weather_condition: response.data.weather[0].main,
        description: response.data.weather[0].description
      },
      forecast: forecast.data.list.slice(0, 24).map(item => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        wind_speed: item.wind.speed,
        precipitation: item.rain?.['3h'] || 0,
        weather_condition: item.weather[0].main
      }))
    };

  } catch (error) {
    console.error('Weather API error:', error);
    return getMockWeatherData();
  }
};

// Get tide data (mock implementation for MVP)
const getTideData = async (lat, lon) => {
  try {
    // Mock tide data for MVP - in production would use NOAA or similar API
    const now = new Date();
    const tides = [];
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const height = 2 + Math.sin(i * Math.PI / 6) * 1.5; // Mock tidal pattern
      
      tides.push({
        datetime: time.toISOString(),
        height_meters: parseFloat(height.toFixed(2)),
        type: height > 2.5 ? 'high' : height < 1.5 ? 'low' : 'normal'
      });
    }

    return {
      current_tide: tides[0],
      forecast_24h: tides,
      high_tide_warning: tides.some(t => t.height_meters > 3.0),
      source: 'mock_data'
    };

  } catch (error) {
    console.error('Tide data error:', error);
    return { error: 'Failed to fetch tide data' };
  }
};

// Get satellite data (mock implementation for MVP)
const getSatelliteData = async (lat, lon) => {
  try {
    // Mock satellite data for MVP - in production would use NASA APIs
    return {
      sea_surface_temperature: 24.5 + Math.random() * 5,
      chlorophyll_concentration: 0.5 + Math.random() * 2,
      turbidity: 10 + Math.random() * 20,
      cloud_cover: Math.random() * 100,
      last_image_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'mock_satellite_data'
    };

  } catch (error) {
    console.error('Satellite data error:', error);
    return { error: 'Failed to fetch satellite data' };
  }
};

// Get location coordinates (mock for MVP)
const getLocationCoordinates = (locationId) => {
  // Mock coordinates for common coastal locations
  const locations = {
    '1': { lat: 14.5995, lon: 120.9842, name: 'Manila Bay' },
    '2': { lat: 10.3157, lon: 123.8854, name: 'Cebu' },
    '3': { lat: 7.0731, lon: 125.6128, name: 'Davao' },
    '4': { lat: 25.7617, lon: -80.1918, name: 'Miami' },
    '5': { lat: 40.7128, lon: -74.0060, name: 'New York' }
  };

  return locations[locationId] || { lat: 14.5995, lon: 120.9842, name: 'Default Location' };
};

// Mock weather data fallback
const getMockWeatherData = () => ({
  current: {
    temperature: 28 + Math.random() * 8,
    humidity: 60 + Math.random() * 30,
    pressure: 1010 + Math.random() * 20,
    wind_speed: 5 + Math.random() * 15,
    wind_direction: Math.random() * 360,
    visibility: 8000 + Math.random() * 2000,
    weather_condition: 'Clear',
    description: 'clear sky'
  },
  forecast: Array.from({ length: 24 }, (_, i) => ({
    datetime: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
    temperature: 26 + Math.random() * 6,
    wind_speed: 3 + Math.random() * 12,
    precipitation: Math.random() < 0.3 ? Math.random() * 5 : 0,
    weather_condition: Math.random() < 0.7 ? 'Clear' : 'Clouds'
  }))
});

// Clear cache (useful for testing)
export const clearCache = () => {
  cache.clear();
};

// Get cache statistics
export const getCacheStats = () => ({
  size: cache.size,
  keys: Array.from(cache.keys())
});
