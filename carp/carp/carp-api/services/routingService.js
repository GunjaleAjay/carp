const axios = require('axios');

/**
 * Free routing service using OSRM (Open Source Routing Machine)
 * No API key required - completely free and open source
 */
class RoutingService {
  // Use public OSRM server (you can also run your own)
  static get OSRM_BASE_URL() {
    return process.env.OSRM_BASE_URL || 'http://router.project-osrm.org';
  }

  // Use Nominatim for geocoding (free, no API key)
  static get NOMINATIM_BASE_URL() {
    return 'https://nominatim.openstreetmap.org';
  }

  /**
   * Geocode address to coordinates using Nominatim
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Coordinates and formatted address
   */
  static async geocodeAddress(address) {
    try {
      const params = new URLSearchParams({
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1
      });

      const response = await axios.get(`${this.NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'User-Agent': 'Carbon-Aware-Route-Planner/1.0' // Required by Nominatim
        }
      });

      if (!response.data || response.data.length === 0) {
        throw new Error(`Address not found: ${address}`);
      }

      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formatted_address: result.display_name
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Failed to geocode address: ${address}`);
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
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        addressdetails: 1
      });

      const response = await axios.get(`${this.NOMINATIM_BASE_URL}/reverse?${params}`, {
        headers: {
          'User-Agent': 'Carbon-Aware-Route-Planner/1.0'
        }
      });

      if (!response.data) {
        throw new Error('Reverse geocoding failed');
      }

      return response.data.display_name || 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error(`Failed to reverse geocode coordinates`);
    }
  }

  /**
   * Get route using OSRM
   * @param {string|Object} origin - Starting location (address string or {lat, lng})
   * @param {string|Object} destination - Destination location
   * @param {string} profile - OSRM profile (driving, walking, cycling)
   * @param {Object} options - Route options
   * @returns {Promise<Object>} Route data
   */
  static async getRoute(origin, destination, profile = 'driving', options = {}) {
    try {
      // Convert addresses to coordinates if needed
      let originCoords, destCoords;

      if (typeof origin === 'string') {
        const originGeo = await this.geocodeAddress(origin);
        originCoords = `${originGeo.lng},${originGeo.lat}`;
      } else {
        originCoords = `${origin.lng},${origin.lat}`;
      }

      if (typeof destination === 'string') {
        const destGeo = await this.geocodeAddress(destination);
        destCoords = `${destGeo.lng},${destGeo.lat}`;
      } else {
        destCoords = `${destination.lng},${destination.lat}`;
      }

      // Map travel modes to OSRM profiles
      const profileMap = {
        'driving': 'driving',
        'walking': 'foot',
        'cycling': 'cycling',
        'transit': 'driving' // OSRM doesn't support transit, use driving as fallback
      };

      const osrmProfile = profileMap[profile] || 'driving';
      const coordinates = `${originCoords};${destCoords}`;

      // Build OSRM request URL
      const params = new URLSearchParams({
        overview: 'full',
        geometries: 'geojson',
        steps: 'true'
      });

      if (options.alternatives) {
        params.append('alternatives', 'true');
      }

      const url = `${this.OSRM_BASE_URL}/route/v1/${osrmProfile}/${coordinates}?${params}`;
      const response = await axios.get(url);

      if (response.data.code !== 'Ok') {
        throw new Error(`OSRM routing failed: ${response.data.code}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs ? route.legs[0] : route;

      // Convert distance from meters to km, duration from seconds to minutes
      const distanceKm = (route.distance || 0) / 1000;
      const durationMinutes = (route.duration || 0) / 60;

      // Parse origin and destination coordinates
      const originParts = originCoords.split(',').map(parseFloat);
      const destParts = destCoords.split(',').map(parseFloat);

      // Extract steps from OSRM format and convert to Google Maps-like format
      let steps = [];
      if (leg.steps && Array.isArray(leg.steps)) {
        steps = leg.steps.map((step, index) => {
          const instruction = step.maneuver?.type 
            ? `${step.maneuver.type} ${step.maneuver.modifier || ''} onto ${step.name || 'road'}`.trim()
            : step.name || `Continue on ${step.name || 'road'}`;
          
          return {
            distance: step.distance,
            duration: step.duration,
            instruction: instruction,
            instructions: instruction,
            html_instructions: instruction,
            maneuver: step.maneuver,
            name: step.name || ''
          };
        });
      } else if (leg.steps && leg.steps.length > 0) {
        // Handle if steps is already in the right format
        steps = leg.steps;
      }

      return {
        distance_km: distanceKm,
        duration_minutes: durationMinutes,
        travel_mode: profile,
        route_data: {
          geometry: route.geometry || {
            type: 'LineString',
            coordinates: []
          },
          legs: [{
            distance: route.distance,
            duration: route.duration,
            steps: steps,
            start_address: origin,
            end_address: destination
          }],
          distance: route.distance,
          duration: route.duration
        },
        origin_coords: [originParts[0], originParts[1]], // [lng, lat]
        destination_coords: [destParts[0], destParts[1]] // [lng, lat]
      };
    } catch (error) {
      console.error('OSRM routing error:', error);
      throw new Error(`Failed to get route: ${error.message}`);
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
      const travelModes = options.travelMode ? [options.travelMode] : ['driving', 'walking', 'cycling', 'transit'];
      const routeOptions = [];

      // Get routes for each travel mode
      for (const mode of travelModes) {
        try {
          // Get route with alternatives if requested
          const routeData = await this.getRouteWithAlternatives(origin, destination, mode, {
            alternatives: options.alternatives && mode === 'driving'
          });

          // Add all routes (main + alternatives) to options
          routeData.forEach(route => {
            routeOptions.push({
              ...route,
              co2_emissions_kg: 0, // Will be calculated later
              eco_score: 0 // Will be calculated later
            });
          });
        } catch (error) {
          console.warn(`Failed to get ${mode} route:`, error.message);
          // Continue with other modes
        }
      }

      return routeOptions;
    } catch (error) {
      console.error('Error getting multiple route options:', error);
      throw error;
    }
  }

  /**
   * Get route with alternative options from OSRM
   * @param {string|Object} origin - Starting location
   * @param {string|Object} destination - Destination location
   * @param {string} profile - OSRM profile
   * @param {Object} options - Route options
   * @returns {Promise<Array>} Array of route options (main + alternatives)
   */
  static async getRouteWithAlternatives(origin, destination, profile = 'driving', options = {}) {
    try {
      // Convert addresses to coordinates if needed
      let originCoords, destCoords;

      if (typeof origin === 'string') {
        const originGeo = await this.geocodeAddress(origin);
        originCoords = `${originGeo.lng},${originGeo.lat}`;
      } else {
        originCoords = `${origin.lng},${origin.lat}`;
      }

      if (typeof destination === 'string') {
        const destGeo = await this.geocodeAddress(destination);
        destCoords = `${destGeo.lng},${destGeo.lat}`;
      } else {
        destCoords = `${destination.lng},${destination.lat}`;
      }

      // Map travel modes to OSRM profiles
      const profileMap = {
        'driving': 'driving',
        'walking': 'foot',
        'cycling': 'cycling',
        'transit': 'driving' // OSRM doesn't support transit, use driving as fallback
      };

      const osrmProfile = profileMap[profile] || 'driving';
      const coordinates = `${originCoords};${destCoords}`;

      // Build OSRM request URL with alternatives
      const params = new URLSearchParams({
        overview: 'full',
        geometries: 'geojson',
        steps: 'true'
      });

      if (options.alternatives && profile === 'driving') {
        params.append('alternatives', 'true');
        params.append('number', '3'); // Get up to 3 alternative routes
      }

      const url = `${this.OSRM_BASE_URL}/route/v1/${osrmProfile}/${coordinates}?${params}`;
      const response = await axios.get(url);

      if (response.data.code !== 'Ok') {
        throw new Error(`OSRM routing failed: ${response.data.code}`);
      }

      const routes = response.data.routes || [];
      const routeResults = [];

      // Process each route (main + alternatives)
      for (const route of routes) {
        const distanceKm = (route.distance || 0) / 1000;
        const durationMinutes = (route.duration || 0) / 60;

        // Parse origin and destination coordinates
        const originParts = originCoords.split(',').map(parseFloat);
        const destParts = destCoords.split(',').map(parseFloat);

        // Extract steps from OSRM format
        let steps = [];
        if (route.legs && route.legs[0] && route.legs[0].steps && Array.isArray(route.legs[0].steps)) {
          steps = route.legs[0].steps.map((step) => {
            const instruction = step.maneuver?.type 
              ? `${step.maneuver.type} ${step.maneuver.modifier || ''} onto ${step.name || 'road'}`.trim()
              : step.name || `Continue on ${step.name || 'road'}`;
            
            return {
              distance: step.distance,
              duration: step.duration,
              instruction: instruction,
              instructions: instruction,
              html_instructions: instruction,
              maneuver: step.maneuver,
              name: step.name || ''
            };
          });
        }

        routeResults.push({
          distance_km: distanceKm,
          duration_minutes: durationMinutes,
          travel_mode: profile,
          route_data: {
            geometry: route.geometry || {
              type: 'LineString',
              coordinates: []
            },
            legs: [{
              distance: route.distance,
              duration: route.duration,
              steps: steps,
              start_address: typeof origin === 'string' ? origin : '',
              end_address: typeof destination === 'string' ? destination : ''
            }],
            distance: route.distance,
            duration: route.duration
          },
          origin_coords: [originParts[0], originParts[1]], // [lng, lat]
          destination_coords: [destParts[0], destParts[1]] // [lng, lat]
        });
      }

      return routeResults;
    } catch (error) {
      console.error('OSRM routing error:', error);
      throw new Error(`Failed to get route: ${error.message}`);
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
          const walkingRoute = await this.getRoute(origin, destination, 'walking');
          suggestions.push({
            type: 'walk',
            distance_km: walkingRoute.distance_km,
            duration_minutes: walkingRoute.duration_minutes,
            co2_savings_kg: drivingRoute.co2_emissions_kg,
            time_difference_minutes: walkingRoute.duration_minutes - drivingRoute.duration_minutes,
            description: `Walk ${walkingRoute.distance_km.toFixed(1)} km and save ${drivingRoute.co2_emissions_kg.toFixed(2)} kg CO₂`,
            feasibility_score: Math.max(1, 10 - Math.abs(walkingRoute.duration_minutes - drivingRoute.duration_minutes) / 10)
          });
        } catch (error) {
          console.warn('Failed to get walking route for suggestion:', error);
        }
      }

      // Get cycling route if distance is reasonable
      if (drivingRoute.distance_km <= userPreferences.max_cycling_distance_km) {
        try {
          const cyclingRoute = await this.getRoute(origin, destination, 'cycling');
          suggestions.push({
            type: 'cycle',
            distance_km: cyclingRoute.distance_km,
            duration_minutes: cyclingRoute.duration_minutes,
            co2_savings_kg: drivingRoute.co2_emissions_kg,
            time_difference_minutes: cyclingRoute.duration_minutes - drivingRoute.duration_minutes,
            description: `Cycle ${cyclingRoute.distance_km.toFixed(1)} km and save ${drivingRoute.co2_emissions_kg.toFixed(2)} kg CO₂`,
            feasibility_score: Math.max(1, 10 - Math.abs(cyclingRoute.duration_minutes - drivingRoute.duration_minutes) / 15)
          });
        } catch (error) {
          console.warn('Failed to get cycling route for suggestion:', error);
        }
      }

      // Carpool suggestion
      if (drivingRoute.distance_km > 5) {
        const carpoolEmissions = drivingRoute.co2_emissions_kg * 0.5;
        const co2Savings = drivingRoute.co2_emissions_kg - carpoolEmissions;
        
        suggestions.push({
          type: 'carpool',
          distance_km: drivingRoute.distance_km,
          duration_minutes: drivingRoute.duration_minutes * 1.2,
          co2_savings_kg: co2Savings,
          time_difference_minutes: drivingRoute.duration_minutes * 0.2,
          description: `Carpool with others and save ${co2Savings.toFixed(2)} kg CO₂`,
          feasibility_score: 7
        });
      }

      return suggestions.sort((a, b) => b.feasibility_score - a.feasibility_score);
    } catch (error) {
      console.error('Error generating eco suggestions:', error);
      return [];
    }
  }
}

module.exports = { RoutingService };

