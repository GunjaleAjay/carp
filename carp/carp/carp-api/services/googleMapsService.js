const axios = require('axios');

/**
 * Google Maps service for route planning and geocoding
 */
class GoogleMapsService {
  static get BASE_URL() {
    return 'https://maps.googleapis.com/maps/api';
  }

  static get API_KEY() {
    return process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Get directions from Google Maps API
   * @param {string} origin - Starting location
   * @param {string} destination - Destination location
   * @param {string} travelMode - Travel mode
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of routes
   */
  static async getDirections(origin, destination, travelMode = 'driving', options = {}) {
    try {
      if (!this.API_KEY) {
        console.error('Google Maps API key not configured');
        throw new Error('Google Maps API key not configured');
      }

      console.log('Google Maps API Key present:', !!this.API_KEY);
      console.log('API Key length:', this.API_KEY ? this.API_KEY.length : 0);

      const params = new URLSearchParams({
        origin,
        destination,
        mode: travelMode,
        key: this.API_KEY,
        alternatives: options.alternatives ? 'true' : 'false'
      });

      if (options.avoidTolls) params.append('avoid', 'tolls');
      if (options.avoidHighways) params.append('avoid', 'highways');

      const url = `${this.BASE_URL}/directions/json?${params}`;
      console.log('Google Maps Directions API URL:', url.replace(this.API_KEY, '***API_KEY_MASKED***'));

      const response = await axios.get(url);

      console.log('Google Maps API Response Status:', response.data.status);
      if (response.data.status !== 'OK') {
        console.error('Google Maps API Error Details:', response.data);
      }

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.routes;
    } catch (error) {
      console.error('Google Maps Directions API error:', error);
      throw error;
    }
  }

  /**
   * Get distance matrix from Google Maps API
   * @param {Array} origins - Array of origin locations
   * @param {Array} destinations - Array of destination locations
   * @param {string} travelMode - Travel mode
   * @returns {Promise<Object>} Distance matrix data
   */
  static async getDistanceMatrix(origins, destinations, travelMode = 'driving') {
    try {
      if (!this.API_KEY) {
        throw new Error('Google Maps API key not configured');
      }

      const params = new URLSearchParams({
        origins: origins.join('|'),
        destinations: destinations.join('|'),
        mode: travelMode,
        key: this.API_KEY
      });

      const response = await axios.get(`${this.BASE_URL}/distancematrix/json?${params}`);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('Google Maps Distance Matrix API error:', error);
      throw error;
    }
  }

  /**
   * Get place details from Google Maps API
   * @param {string} placeId - Google Place ID
   * @returns {Promise<Object>} Place details
   */
  static async getPlaceDetails(placeId) {
    try {
      if (!this.API_KEY) {
        throw new Error('Google Maps API key not configured');
      }

      const params = new URLSearchParams({
        place_id: placeId,
        fields: 'name,formatted_address,geometry,place_id',
        key: this.API_KEY
      });

      const response = await axios.get(`${this.BASE_URL}/place/details/json?${params}`);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.result;
    } catch (error) {
      console.error('Google Maps Place Details API error:', error);
      throw error;
    }
  }

  /**
   * Geocode address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Coordinates and formatted address
   */
  static async geocodeAddress(address) {
    try {
      if (!this.API_KEY) {
        throw new Error('Google Maps API key not configured');
      }

      const params = new URLSearchParams({
        address,
        key: this.API_KEY
      });

      const response = await axios.get(`${this.BASE_URL}/geocode/json?${params}`);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address
      };
    } catch (error) {
      console.error('Google Maps Geocoding API error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string>} Formatted address
   */
  static async reverseGeocode(lat, lng) {
    try {
      if (!this.API_KEY) {
        throw new Error('Google Maps API key not configured');
      }

      const params = new URLSearchParams({
        latlng: `${lat},${lng}`,
        key: this.API_KEY
      });

      const response = await axios.get(`${this.BASE_URL}/geocode/json?${params}`);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.results[0].formatted_address;
    } catch (error) {
      console.error('Google Maps Reverse Geocoding API error:', error);
      throw error;
    }
  }

  /**
   * Get multiple route options for different travel modes
   * @param {string} origin - Starting location
   * @param {string} destination - Destination location
   * @param {Object} options - Route options
   * @returns {Promise<Array>} Array of route options
   */
  static async getMultipleRouteOptions(origin, destination, options = {}) {
    try {
      const travelModes = ['driving', 'transit', 'walking', 'cycling'];
      const routeOptions = [];

      // Get driving routes with alternatives
      const drivingRoutes = await this.getDirections(origin, destination, 'driving', {
        ...options,
        alternatives: true
      });

      for (const route of drivingRoutes) {
        const leg = route.legs[0];
        routeOptions.push({
          distance_km: leg.distance.value / 1000,
          duration_minutes: leg.duration.value / 60,
          co2_emissions_kg: 0, // Will be calculated later
          travel_mode: 'driving',
          route_data: route,
          eco_score: 0 // Will be calculated later
        });
      }

      // Get other travel modes
      for (const mode of ['transit', 'walking', 'cycling']) {
        try {
          const routes = await this.getDirections(origin, destination, mode, options);
          if (routes.length > 0) {
            const route = routes[0];
            const leg = route.legs[0];
            routeOptions.push({
              distance_km: leg.distance.value / 1000,
              duration_minutes: leg.duration.value / 60,
              co2_emissions_kg: 0, // Will be calculated later
              travel_mode: mode,
              route_data: route,
              eco_score: 0 // Will be calculated later
            });
          }
        } catch (error) {
          console.warn(`Failed to get ${mode} route:`, error);
        }
      }

      return routeOptions;
    } catch (error) {
      console.error('Error getting multiple route options:', error);
      throw error;
    }
  }

  /**
   * Generate eco-friendly suggestions
   * @param {string} origin - Starting location
   * @param {string} destination - Destination location
   * @param {Object} drivingRoute - Driving route data
   * @param {Object} userPreferences - User preferences
   * @returns {Promise<Array>} Array of eco suggestions
   */
  static async generateEcoSuggestions(origin, destination, drivingRoute, userPreferences) {
    try {
      const suggestions = [];

      // Get walking route if distance is reasonable
      if (drivingRoute.distance_km <= userPreferences.max_walking_distance_km) {
        try {
          const walkingRoutes = await this.getDirections(origin, destination, 'walking');
          if (walkingRoutes.length > 0) {
            const walkingRoute = walkingRoutes[0];
            const leg = walkingRoute.legs[0];
            const walkingDistance = leg.distance.value / 1000;
            const walkingDuration = leg.duration.value / 60;
            
            suggestions.push({
              type: 'walk',
              distance_km: walkingDistance,
              duration_minutes: walkingDuration,
              co2_savings_kg: drivingRoute.co2_emissions_kg,
              time_difference_minutes: walkingDuration - drivingRoute.duration_minutes,
              description: `Walk ${walkingDistance.toFixed(1)} km and save ${drivingRoute.co2_emissions_kg.toFixed(2)} kg CO₂`,
              feasibility_score: Math.max(1, 10 - Math.abs(walkingDuration - drivingRoute.duration_minutes) / 10)
            });
          }
        } catch (error) {
          console.warn('Failed to get walking route for suggestion:', error);
        }
      }

      // Get cycling route if distance is reasonable
      if (drivingRoute.distance_km <= userPreferences.max_cycling_distance_km) {
        try {
          const cyclingRoutes = await this.getDirections(origin, destination, 'cycling');
          if (cyclingRoutes.length > 0) {
            const cyclingRoute = cyclingRoutes[0];
            const leg = cyclingRoute.legs[0];
            const cyclingDistance = leg.distance.value / 1000;
            const cyclingDuration = leg.duration.value / 60;
            
            suggestions.push({
              type: 'cycle',
              distance_km: cyclingDistance,
              duration_minutes: cyclingDuration,
              co2_savings_kg: drivingRoute.co2_emissions_kg,
              time_difference_minutes: cyclingDuration - drivingRoute.duration_minutes,
              description: `Cycle ${cyclingDistance.toFixed(1)} km and save ${drivingRoute.co2_emissions_kg.toFixed(2)} kg CO₂`,
              feasibility_score: Math.max(1, 10 - Math.abs(cyclingDuration - drivingRoute.duration_minutes) / 15)
            });
          }
        } catch (error) {
          console.warn('Failed to get cycling route for suggestion:', error);
        }
      }

      // Get transit route
      try {
        const transitRoutes = await this.getDirections(origin, destination, 'transit');
        if (transitRoutes.length > 0) {
          const transitRoute = transitRoutes[0];
          const leg = transitRoute.legs[0];
          const transitDistance = leg.distance.value / 1000;
          const transitDuration = leg.duration.value / 60;
          const transitEmissions = transitDistance * 0.05; // 50g CO2 per km for transit
          const co2Savings = drivingRoute.co2_emissions_kg - transitEmissions;
          
          if (co2Savings > 0) {
            suggestions.push({
              type: 'transit',
              distance_km: transitDistance,
              duration_minutes: transitDuration,
              co2_savings_kg: co2Savings,
              time_difference_minutes: transitDuration - drivingRoute.duration_minutes,
              description: `Take public transit and save ${co2Savings.toFixed(2)} kg CO₂`,
              feasibility_score: Math.max(1, 10 - Math.abs(transitDuration - drivingRoute.duration_minutes) / 20)
            });
          }
        }
      } catch (error) {
        console.warn('Failed to get transit route for suggestion:', error);
      }

      // Carpool suggestion
      if (drivingRoute.distance_km > 5) { // Only suggest carpooling for longer distances
        const carpoolEmissions = drivingRoute.co2_emissions_kg * 0.5; // Assume 50% reduction
        const co2Savings = drivingRoute.co2_emissions_kg - carpoolEmissions;
        
        suggestions.push({
          type: 'carpool',
          distance_km: drivingRoute.distance_km,
          duration_minutes: drivingRoute.duration_minutes * 1.2, // Assume 20% longer due to coordination
          co2_savings_kg: co2Savings,
          time_difference_minutes: drivingRoute.duration_minutes * 0.2,
          description: `Carpool with others and save ${co2Savings.toFixed(2)} kg CO₂`,
          feasibility_score: 7 // Moderate feasibility
        });
      }

      // Sort suggestions by feasibility score
      return suggestions.sort((a, b) => b.feasibility_score - a.feasibility_score);
    } catch (error) {
      console.error('Error generating eco suggestions:', error);
      return [];
    }
  }
}

module.exports = { GoogleMapsService };
